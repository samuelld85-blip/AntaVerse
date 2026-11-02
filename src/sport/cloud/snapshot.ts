import { emptyStore, storeSchema, STORAGE_KEY, type SportStore } from "../model";
export type Snapshot = SportStore;
export const snapshotSchema = storeSchema;
export const emptySnapshot = emptyStore;
export function readSnapshot(): Snapshot {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? storeSchema.parse(JSON.parse(raw)) : emptyStore();
}
export function writeSnapshot(input: Snapshot) {
  const snapshot = snapshotSchema.parse(input);
  const before = localStorage.getItem(STORAGE_KEY);
  if (before) localStorage.setItem("antaverse:sport:before-restore", before);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
export const equalSnapshot = (a: Snapshot, b: Snapshot) => JSON.stringify(a) === JSON.stringify(b);
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
