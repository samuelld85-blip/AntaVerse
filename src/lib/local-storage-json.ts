// Tiny localStorage-as-JSON helpers shared by the games that keep their
// in-progress state in a single localStorage key (La Relance, Sans le dire).
// Quoi de 9 does NOT use this — it persists to IndexedDB with a legacy-schema
// migration path, which is a different problem, not a bigger version of this
// one, so it keeps its own persistence module.

export function readJson<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isValid(value)) {
      window.localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeJson(key: string): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(key);
}
