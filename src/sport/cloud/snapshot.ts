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
export function syncDecision(local: Snapshot, remote: Snapshot, base: Snapshot | null) {
  if (equalSnapshot(local, remote)) return "equal";
  if (!base) return !hasData(local) ? "download" : !hasData(remote) ? "upload" : "conflict";
  if (equalSnapshot(local, base)) return "download";
  if (equalSnapshot(remote, base)) return "upload";
  return "conflict";
}
