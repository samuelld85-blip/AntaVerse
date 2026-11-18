import {
  emptyStore,
  RESTORE_BACKUP_KEY,
  storeSchema,
  STORAGE_KEY,
  type SportStore,
} from "../model";
import { externalizePhotos, inlinePhotos, withPhotoRefs } from "../carnet-photos";
export type Snapshot = SportStore;
export const snapshotSchema = storeSchema;
export const emptySnapshot = emptyStore;
/** The carnet as stored on this device: its photos are usually references to the device photo store. */
export function readSnapshot(): Snapshot {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? storeSchema.parse(JSON.parse(raw)) : emptyStore();
}
/**
 * Backup payload of a device carnet: photos inline, the shape friends and other
 * devices read. `online` supplies photos this device no longer has.
 */
export const cloudSnapshot = (local: Snapshot, online?: Snapshot) => inlinePhotos(local, online);
/**
 * Replaces the device carnet. Photos go to the device photo store first (inline
 * as before where IndexedDB is unavailable). With `expected`, nothing is written
 * if the device carnet no longer matches it; returns whether it was written.
 */
export async function writeSnapshot(input: Snapshot, expected?: string | null) {
  const parsed = snapshotSchema.parse(input);
  const snapshot = await externalizePhotos(parsed).catch(() => parsed);
  const before = localStorage.getItem(STORAGE_KEY);
  if (expected !== undefined && before !== expected) return false;
  // The replaced carnet is kept for export only while the browser quota allows it.
  try {
    if (before) localStorage.setItem(RESTORE_BACKUP_KEY, before);
  } catch {
    localStorage.removeItem(RESTORE_BACKUP_KEY);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  return true;
}
/** Same carnet, whether each photo is inline or a reference. */
export const equalSnapshot = (a: Snapshot, b: Snapshot) =>
  JSON.stringify(withPhotoRefs(a)) === JSON.stringify(withPhotoRefs(b));
export function hasData(s: Snapshot) {
  return Boolean(s.active || s.history.length || s.favorites.length || s.templates.length);
}
// A device left without Sport data always takes the cloud copy, so it can never
// send an empty carnet. A difference of at least one finished session is a
// conflict the user decides on. Any other difference: the local carnet wins.
export function syncDecision(local: Snapshot, remote: Snapshot) {
  if (equalSnapshot(local, remote)) return "equal";
  if (!hasData(local) && hasData(remote)) return "download";
  return local.history.length !== remote.history.length ? "conflict" : "upload";
}
