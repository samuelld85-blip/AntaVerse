import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSession, emptyStore, STORAGE_KEY } from "./model";
import { migrateInlinePhotos } from "./carnet-photos";
import { savePhotos } from "./photo-store";
import { writeSnapshot } from "./cloud/snapshot";

// An IndexedDB whose opening never settles (seen on some WebKit versions).
vi.mock("idb", () => ({ openDB: () => new Promise(() => {}) }));

const photo = "data:image/png;base64,AAAA";
const carnet = () => ({
  ...emptyStore(),
  history: [
    {
      ...createSession("full", []),
      id: "session-photo",
      startedAt: "2026-10-01T10:00:00.000Z",
      endedAt: "2026-10-01T11:00:00.000Z",
      feedback: { mood: "good" as const, comment: "", photos: [photo] },
    },
  ],
});

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("Sport photos without a working IndexedDB", () => {
  it("gives up instead of waiting forever", async () => {
    const saving = expect(savePhotos([photo])).rejects.toThrow("IndexedDB timeout");
    await vi.advanceTimersByTimeAsync(5000);
    await saving;
  });

  it("keeps photos inline in the carnet, as before", async () => {
    const raw = JSON.stringify(carnet());
    localStorage.setItem(STORAGE_KEY, raw);
    const migrating = migrateInlinePhotos();
    await vi.advanceTimersByTimeAsync(5000);
    await migrating;
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);

    const restoring = writeSnapshot(carnet());
    await vi.advanceTimersByTimeAsync(5000);
    expect(await restoring).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toContain(photo);
  });
});
