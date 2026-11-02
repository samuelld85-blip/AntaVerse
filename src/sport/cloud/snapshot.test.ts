import { beforeEach, describe, expect, it } from "vitest";
import { emptyStore, createSession, STORAGE_KEY } from "../model";
import { readSnapshot, writeSnapshot, syncDecision } from "./snapshot";

beforeEach(() => localStorage.clear());
describe("Sport cloud reconciliation", () => {
  const first = () => ({ ...emptyStore(), active: createSession("full", []) });
  const finished = (count: number) => ({
    ...emptyStore(),
    history: Array.from({ length: count }, (_, index) => ({
      ...createSession("full", []),
      id: `session-${index}`,
      startedAt: "2026-10-01T10:00:00.000Z",
      endedAt: "2026-10-01T11:00:00.000Z",
    })),
  });
  it("restores remote data after site storage has been cleared", () => {
    expect(syncDecision(emptyStore(), first())).toBe("download");
  });
  it("uploads a legacy local carnet into a new account", () => {
    expect(syncDecision(first(), emptyStore())).toBe("upload");
  });
  it("never sends an emptied carnet over cloud data", () => {
    expect(syncDecision(emptyStore(), finished(3))).toBe("download");
  });
  it("asks the user when one or more finished sessions differ", () => {
    expect(syncDecision(finished(10), finished(8))).toBe("conflict");
    expect(syncDecision(finished(8), finished(9))).toBe("conflict");
  });
  it("keeps local edits silently when the finished session counts match", () => {
    expect(syncDecision({ ...finished(2), active: createSession("full", []) }, finished(2))).toBe(
      "upload",
    );
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
