import { beforeEach, describe, expect, it } from "vitest";
import { emptyStore, createSession, STORAGE_KEY } from "../model";
import { readSnapshot, writeSnapshot, syncDecision } from "./snapshot";

beforeEach(() => localStorage.clear());
describe("Sport cloud reconciliation", () => {
  const first = () => ({ ...emptyStore(), active: createSession("full", []) });
  it("restores remote data after site storage has been cleared", () => {
    expect(syncDecision(emptyStore(), first(), null)).toBe("download");
  });
  it("uploads a legacy local carnet into a new account", () => {
    expect(syncDecision(first(), emptyStore(), null)).toBe("upload");
  });
  it("keeps local edits when the cloud copy changed too, without any conflict", () => {
    const base = first();
    const local = { ...base, active: { ...base.active, name: "Téléphone" } };
    const remote = { ...base, active: { ...base.active, name: "Tablette" } };
    expect(syncDecision(local, remote, base)).toBe("upload");
    expect(syncDecision(local, base, base)).toBe("upload");
  });
  it("uploads an intentionally emptied carnet instead of restoring the cloud copy", () => {
    const base = first();
    expect(syncDecision(emptyStore(), base, base)).toBe("upload");
  });
  it("does not restore from the cloud on a device that already synced before", () => {
    expect(syncDecision(emptyStore(), first(), emptyStore())).toBe("upload");
  });
  it("validates restoration and preserves previous data and unrelated games", () => {
    const old = first();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    localStorage.setItem("pmu:current-game", "untouched");
    expect(() => writeSnapshot({ version: 400 } as never)).toThrow();
    expect(readSnapshot()).toEqual(old);
    writeSnapshot(emptyStore());
    expect(JSON.parse(localStorage.getItem("antaverse:sport:before-restore")!)).toEqual(old);
    expect(localStorage.getItem("pmu:current-game")).toBe("untouched");
  });
  it("fails closed on corrupted local data instead of uploading empty data", () => {
    localStorage.setItem(STORAGE_KEY, "broken");
    expect(() => readSnapshot()).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
  });
});
