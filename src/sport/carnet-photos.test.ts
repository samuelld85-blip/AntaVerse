import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSession,
  emptyStore,
  loadStore,
  saveStore,
  STORAGE_KEY,
  type SportStore,
} from "./model";
import { inlinePhotos, migrateInlinePhotos, withPhotoRefs } from "./carnet-photos";
import { isPhotoRef, loadPhotos, photoRef, prunePhotos, savePhotos } from "./photo-store";

const photo = (fill: string) => `data:image/jpeg;base64,${fill.repeat(100_000)}`;
const carnet = (...photosBySession: string[][]): SportStore => ({
  ...emptyStore(),
  history: photosBySession.map((photos, index) => ({
    ...createSession("full", []),
    id: `session-${index}`,
    startedAt: "2026-10-01T10:00:00.000Z",
    endedAt: "2026-10-01T11:00:00.000Z",
    feedback: { mood: "good", comment: "", photos },
  })),
});
const storedPhotos = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY)!).history.flatMap(
    (session: { feedback: { photos: string[] } }) => session.feedback.photos,
  ) as string[];

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("Sport photos outside the localStorage carnet", () => {
  it("moves inline photos of an older carnet to IndexedDB without losing any", async () => {
    const original = carnet([photo("A"), photo("B"), photo("C")], [photo("D")]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(original));
    localStorage.setItem("pmu:current-game", "untouched");

    await migrateInlinePhotos();

    const raw = localStorage.getItem(STORAGE_KEY)!;
    expect(raw).not.toContain("data:image/");
    expect(raw.length).toBeLessThan(5_000);
    expect(storedPhotos().every(isPhotoRef)).toBe(true);
    const migrated = loadStore();
    expect(migrated.error).toBe("");
    expect(await inlinePhotos(migrated.store)).toEqual(original);
    expect(localStorage.getItem("pmu:current-game")).toBe("untouched");
  });

  it("migrates every Sport carnet copy and is idempotent", async () => {
    const accountCopy = carnet([photo("E")]);
    localStorage.setItem("antaverse:sport:account:alice", JSON.stringify(accountCopy));
    localStorage.setItem("antaverse:sport:rest-timer", JSON.stringify({ endsAt: 1 }));

    await migrateInlinePhotos();
    const once = localStorage.getItem("antaverse:sport:account:alice");
    await migrateInlinePhotos();

    expect(once).not.toContain("data:image/");
    expect(localStorage.getItem("antaverse:sport:account:alice")).toBe(once);
    expect(localStorage.getItem("antaverse:sport:rest-timer")).toBe(JSON.stringify({ endsAt: 1 }));
    expect(await inlinePhotos(JSON.parse(once!))).toEqual(accountCopy);
  });

  it("leaves an unreadable carnet untouched", async () => {
    localStorage.setItem(STORAGE_KEY, `{"version":1,"broken":"data:image/png"`);
    await migrateInlinePhotos();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(`{"version":1,"broken":"data:image/png"`);
  });

  it("keeps saving and loading carnets that hold references", async () => {
    const [ref] = await savePhotos([photo("F")]);
    const store = carnet([ref!]);
    expect(saveStore(store)).toBe(true);
    expect(loadStore()).toEqual({ store, error: "" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carnet(["sport-photo:../../etc"])));
    expect(loadStore().error).toBeTruthy();
  });

  it("compares carnets the same way whether photos are inline or references", async () => {
    const inline = carnet([photo("G")]);
    const [ref] = await savePhotos([photo("G")]);
    expect(withPhotoRefs(inline)).toEqual(carnet([ref!]));
    expect(photoRef(photo("G"))).toBe(ref);
    expect(photoRef(photo("H"))).not.toBe(ref);
  });

  it("rebuilds the cloud form from the online copy when this device lost a photo", async () => {
    const missing = photoRef(photo("I"));
    const local = carnet([missing, photoRef(photo("J"))]);
    expect(await inlinePhotos(local, carnet([photo("I")]))).toEqual(carnet([photo("I")]));
  });

  it("deletes only photos no carnet refers to, after a grace period", async () => {
    const [kept, inAccountCopy, orphan, recentOrphan] = await savePhotos([
      photo("K"),
      photo("L"),
      photo("M"),
      photo("N"),
    ]);
    saveStore(carnet([kept!]));
    localStorage.setItem("antaverse:sport:account:bob", JSON.stringify(carnet([inAccountCopy!])));
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 2 * 24 * 60 * 60 * 1000);
    await savePhotos([photo("N")]);

    await prunePhotos();

    const left = await loadPhotos([kept!, inAccountCopy!, orphan!, recentOrphan!]);
    expect([...left.keys()].sort()).toEqual([kept!, inAccountCopy!, recentOrphan!].sort());
  });
});
