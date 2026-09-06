import { beforeEach, describe, expect, it, vi } from "vitest";
import { exercises, searchExercises } from "./catalog";
import {
  completeSet,
  configKey,
  createEntry,
  createSession,
  defaultConfig,
  emptyStore,
  finishSession,
  loadStore,
  saveStore,
  STORAGE_KEY,
  storeSchema,
} from "./model";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("sport training log", () => {
  it("snapshots each performed set and never counts beyond the target", () => {
    let entry = createEntry({ ...defaultConfig("bench-press"), sets: 2, loadKg: 40 });
    entry = completeSet(entry);
    entry = { ...entry, config: { ...entry.config, loadKg: 20, reps: 10, equipment: "dumbbell" } };
    entry = completeSet(entry);
    expect(entry.finished).toBe(true);
    expect(entry.completedSets.map((s) => [s.loadKg, s.reps, s.equipment])).toEqual([
      [40, null, "barbell"],
      [20, 10, "dumbbell"],
    ]);
    expect(completeSet(entry)).toBe(entry);
  });
  it("finishes a partial session with only performed work and leaves the source untouched", () => {
    const session = createSession("push", [
      defaultConfig("bench-press"),
      defaultConfig("incline-press"),
    ]);
    session.exercises[0] = completeSet(session.exercises[0]!);
    const finished = finishSession(session);
    expect(finished.exercises).toHaveLength(1);
    expect(finished.exercises[0]!.completedSets).toHaveLength(1);
    expect(finished.endedAt).not.toBeNull();
    expect(session.endedAt).toBeNull();
    expect(session.exercises).toHaveLength(2);
  });
  it("roundtrips the active session, history and separate configurations without timers", () => {
    const a = defaultConfig("bench-press"),
      b = { ...a, loadKg: 60 };
    expect(configKey(a)).not.toBe(configKey(b));
    const store = { ...emptyStore(), active: createSession("push", [a]), favorites: [a, b] };
    expect(saveStore(store)).toBe(true);
    expect(loadStore()).toEqual({ store, error: "" });
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain("deadline");
    expect(storeSchema.safeParse(store).success).toBe(true);
  });
  it("preserves invalid data and reports read/write failures", () => {
    localStorage.setItem(STORAGE_KEY, "{bad");
    expect(loadStore().error).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{bad");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(saveStore(emptyStore())).toBe(false);
  });
  it("rejects unknown exercise IDs, unsupported equipment and invalid numeric values", () => {
    for (const patch of [
      { exerciseId: "unknown" },
      { equipment: "bodyweight" },
      { sets: 0 },
      { loadKg: -1 },
      { restSeconds: 0 },
    ]) {
      expect(
        storeSchema.safeParse({
          ...emptyStore(),
          favorites: [{ ...defaultConfig("bench-press"), ...patch }],
        }).success,
      ).toBe(false);
    }
  });
  it("replaying a template resets dates, identities and progress without mutating it", () => {
    const config = defaultConfig("bench-press");
    const first = createSession("push", [config]);
    first.exercises[0] = completeSet(first.exercises[0]!);
    const next = createSession(
      "push",
      first.exercises.map((e) => e.config),
    );
    expect(next.id).not.toBe(first.id);
    expect(next.exercises[0]!.id).not.toBe(first.exercises[0]!.id);
    expect(next.exercises[0]!.completedSets).toEqual([]);
    expect(first.exercises[0]!.completedSets).toHaveLength(1);
  });
});
describe("exercise discovery", () => {
  it("finds common exercises without accents, by aliases, region and equipment", () => {
    expect(searchExercises("push", "developpe couche").map((e) => e.id)).toEqual(["bench-press"]);
    expect(searchExercises("push", "bench")[0]!.id).toBe("bench-press");
    expect(
      searchExercises("push", "", "chest", "Pectoraux · haut", "barbell").map((e) => e.id),
    ).toEqual(["incline-press"]);
    expect(searchExercises("pull", "developpe couche")).toEqual([]);
    expect(searchExercises("upper", "squat")).toEqual([]);
    expect(searchExercises("legs", "squat").length).toBeGreaterThan(0);
    expect(searchExercises("pull", "", "shoulders").some((e) => e.id === "reverse-fly")).toBe(true);
  });
  it("has unique stable IDs and valid defaults for every exercise", () => {
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    for (const exercise of exercises)
      expect(
        storeSchema.safeParse({ ...emptyStore(), favorites: [defaultConfig(exercise.id)] }).success,
      ).toBe(true);
  });
});
