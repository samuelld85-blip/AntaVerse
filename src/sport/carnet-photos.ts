import { storeSchema, type Session, type SportStore } from "./model";
import { isPhotoRef, loadPhotos, photoRef, prunePhotos, savePhotos } from "./photo-store";

function mapPhotos(store: SportStore, map: (photos: string[]) => string[]): SportStore {
  const mapSession = (session: Session): Session =>
    session.feedback?.photos?.length
      ? { ...session, feedback: { ...session.feedback, photos: map(session.feedback.photos) } }
      : session;
  return {
    ...store,
    active: store.active && mapSession(store.active),
    history: store.history.map(mapSession),
  };
}

const allPhotos = (store: SportStore) =>
  [store.active, ...store.history].flatMap((session) => session?.feedback?.photos ?? []);

/** Same carnet with each inline photo replaced by its reference. Stores nothing: used to compare carnets. */
export const withPhotoRefs = (store: SportStore) =>
  allPhotos(store).some((photo) => !isPhotoRef(photo))
    ? mapPhotos(store, (photos) =>
        photos.map((photo) => (isPhotoRef(photo) ? photo : photoRef(photo))),
      )
    : store;

/** Moves inline photos to the device photo store and returns the carnet holding their references. */
export async function externalizePhotos(store: SportStore): Promise<SportStore> {
  const inline = allPhotos(store).filter((photo) => !isPhotoRef(photo));
  if (!inline.length) return store;
  await savePhotos(inline);
  return withPhotoRefs(store);
}

/**
 * Cloud form of a carnet: every reference replaced by its photo, as friends and
 * other devices read it. A photo missing on this device is taken from `fallback`
 * (the copy already online) or left out rather than sent as a dead reference.
 */
export async function inlinePhotos(store: SportStore, fallback?: SportStore): Promise<SportStore> {
  const refs = allPhotos(store).filter(isPhotoRef);
  if (!refs.length) return store;
  const found = await loadPhotos(refs);
  if (fallback && refs.some((ref) => !found.has(ref))) {
    for (const photo of allPhotos(fallback)) {
      if (!isPhotoRef(photo) && !found.has(photoRef(photo))) found.set(photoRef(photo), photo);
    }
  }
  return mapPhotos(store, (photos) =>
    photos.flatMap((photo) =>
      !isPhotoRef(photo) ? [photo] : found.has(photo) ? [found.get(photo)!] : [],
    ),
  );
}

/**
 * Carnets saved before photos moved to IndexedDB hold them inline. Rewrites
 * every Sport carnet in localStorage (current one, per-account copies, restore
 * copy) with references. A carnet changed meanwhile is read again; one that
 * cannot be read or whose photos cannot be stored is left untouched.
 */
export async function migrateInlinePhotos() {
  const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(
    (key): key is string => Boolean(key?.startsWith("antaverse:sport:")),
  );
  for (const key of keys) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw?.includes('"data:image/')) break;
        const parsed = storeSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) break;
        const migrated = await externalizePhotos(parsed.data);
        if (localStorage.getItem(key) !== raw) continue;
        localStorage.setItem(key, JSON.stringify(migrated));
        break;
      } catch {
        break;
      }
    }
  }
}

let pruneStarted = false;
/**
 * Runs before the carnet is read: migration first, then (once per page) cleanup
 * of orphan photos. Never rejects: the carnet stays readable as it is.
 */
export async function preparePhotoStorage() {
  try {
    await migrateInlinePhotos();
  } catch {
    // localStorage unreadable: loadStore reports it.
  }
  if (pruneStarted) return;
  pruneStarted = true;
  void prunePhotos().catch(() => {});
}
