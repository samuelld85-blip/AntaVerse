import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * Session photos live in IndexedDB on the device. The localStorage carnet only
 * keeps a short reference to each one: browsers cap localStorage per site
 * (about 5 MB on iOS) whatever the free disk space, and a few photos used to
 * fill that budget. A reference is derived from the photo's content, so storing
 * the same photo twice (migration retried, carnet restored from the cloud)
 * reuses the same entry.
 */
export const PHOTO_DB_NAME = "antaverse:sport:photos";
export const PHOTO_REF_PREFIX = "sport-photo:";
export const PHOTO_REF_PATTERN = /^sport-photo:[0-9a-z]+-[0-9a-z]+-[0-9a-z]+$/;
const PHOTO_REFS_IN_TEXT = /sport-photo:[0-9a-z]+-[0-9a-z]+-[0-9a-z]+/g;
/** Unreferenced photos younger than this are kept: a form may still be holding them. */
const PRUNE_GRACE_MS = 24 * 60 * 60 * 1000;

type PhotoRecord = { data: string; savedAt: number };
interface PhotoDb extends DBSchema {
  photos: { key: string; value: PhotoRecord };
}

export const isPhotoRef = (photo: string) => photo.startsWith(PHOTO_REF_PREFIX);

function hash53(text: string, seed: number) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** Reference of an inline photo (`data:image/…`), computed without storing anything. */
export function photoRef(dataUrl: string) {
  return `${PHOTO_REF_PREFIX}${dataUrl.length.toString(36)}-${hash53(dataUrl, 1)}-${hash53(dataUrl, 2)}`;
}

const cache = new Map<string, string>();
/** An opening that never settles must not freeze the carnet: callers fall back to inline photos. */
const OPEN_TIMEOUT_MS = 5000;
let database: Promise<IDBPDatabase<PhotoDb>> | null = null;
function openPhotoDb() {
  database ??= new Promise<IDBPDatabase<PhotoDb>>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("IndexedDB timeout")), OPEN_TIMEOUT_MS);
    openDB<PhotoDb>(PHOTO_DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore("photos");
      },
      // Let "clear local data" delete the base while Sport is still loaded.
      blocking(_current, _next, event) {
        (event.target as IDBDatabase).close();
        database = null;
      },
      terminated() {
        database = null;
      },
    })
      .then(resolve, reject)
      .finally(() => clearTimeout(timer));
  }).catch((error: unknown) => {
    database = null;
    throw error;
  });
  return database;
}

/** Stores inline photos on the device and returns their references, in order. */
export async function savePhotos(dataUrls: string[]): Promise<string[]> {
  const refs = dataUrls.map(photoRef);
  if (!dataUrls.length) return refs;
  const db = await openPhotoDb();
  const tx = db.transaction("photos", "readwrite");
  const savedAt = Date.now();
  await Promise.all([
    ...dataUrls.map((data, i) => tx.store.put({ data, savedAt }, refs[i]!)),
    tx.done,
  ]);
  dataUrls.forEach((data, i) => cache.set(refs[i]!, data));
  return refs;
}

/** Displayable source if already known without IndexedDB: inline photos, or references read before. */
export const knownPhoto = (photo: string) => (isPhotoRef(photo) ? cache.get(photo) : photo);

/** Inline data of each reference found on this device. Missing references are absent from the map. */
export async function loadPhotos(refs: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  const missing = [...new Set(refs)].filter((ref) => {
    const data = cache.get(ref);
    if (data) found.set(ref, data);
    return !data;
  });
  if (!missing.length) return found;
  const db = await openPhotoDb();
  const tx = db.transaction("photos");
  const records = await Promise.all(missing.map((ref) => tx.store.get(ref)));
  records.forEach((record, i) => {
    if (!record?.data) return;
    cache.set(missing[i]!, record.data);
    found.set(missing[i]!, record.data);
  });
  return found;
}

/** Every photo reference still held by a Sport carnet in localStorage (current, account copies, restore copy). */
function referencedPhotos() {
  const refs = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("antaverse:sport:")) continue;
    for (const match of localStorage.getItem(key)?.matchAll(PHOTO_REFS_IN_TEXT) ?? []) {
      refs.add(match[0]);
    }
  }
  return refs;
}

/** Deletes photos no carnet refers to any more (removed photo, deleted session or account). */
export async function prunePhotos(graceMs = PRUNE_GRACE_MS): Promise<number> {
  // Read the references first: if localStorage cannot be read, nothing is deleted.
  const keep = referencedPhotos();
  const db = await openPhotoDb();
  const tx = db.transaction("photos", "readwrite");
  const now = Date.now();
  let removed = 0;
  for (let cursor = await tx.store.openCursor(); cursor; cursor = await cursor.continue()) {
    if (keep.has(cursor.key) || now - cursor.value.savedAt < graceMs) continue;
    await cursor.delete();
    cache.delete(cursor.key);
    removed++;
  }
  await tx.done;
  return removed;
}
