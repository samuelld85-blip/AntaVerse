import { beforeEach, describe, expect, it, vi } from "vitest";
import { exercises, searchExercises } from "./catalog";
import {
  configsForRecommendedWorkout,
  recommendedWorkouts,
  recommendedWorkoutsFor,
  workoutDurations,
} from "./recommended-workouts";
import {
  completeSet,
  configKey,
  createEntry,
  createSession,
  defaultConfig,
  defaultFreeConfig,
  emptyStore,
  finishSession,
  lastConfigForExercise,
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
      [40, 10, "barbell"],
      [20, 10, "dumbbell"],
    ]);
    expect(completeSet(entry)).toBe(entry);
  });
  it("records a superset as one entry with two sets per completed round", () => {
    let entry = createEntry(
      { ...defaultConfig("leg-curl"), sets: 2, loadKg: 30, reps: 10 },
      { ...defaultConfig("leg-extension"), sets: 2, loadKg: 25, reps: 12 },
    );
    entry = completeSet(entry, "2026-09-07T10:00:00.000Z");
    expect(entry.completedRounds).toBe(1);
    expect(entry.completedSets.map((set) => [set.exerciseId, set.loadKg])).toEqual([
      ["leg-curl", 30],
      ["leg-extension", 25],
    ]);
    entry = completeSet(entry, "2026-09-07T10:03:00.000Z");
    expect(entry.completedRounds).toBe(2);
    expect(entry.completedSets).toHaveLength(4);
    expect(entry.finished).toBe(true);
  });
  it("keeps pyramid load and repetition changes on each completed set", () => {
    let entry = createEntry({
      ...defaultConfig("bench-press"),
      sets: 4,
      loadKg: 50,
      reps: 12,
    });
    entry = completeSet(entry, "2026-09-07T10:00:00.000Z");
    entry = {
      ...entry,
      pyramid: true,
      config: { ...entry.config, loadKg: 55, reps: 10 },
    };
    entry = completeSet(entry, "2026-09-07T10:03:00.000Z");
    expect(entry.completedSets.map((set) => [set.loadKg, set.reps])).toEqual([
      [50, 12],
      [55, 10],
    ]);
    expect(entry.completedRounds).toBe(2);
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
  it("returns the latest performed configuration and ignores unperformed exercises", () => {
    const older = createSession("push", []);
    older.startedAt = "2026-09-01T10:00:00.000Z";
    const olderEntry = createEntry({
      ...defaultConfig("bench-press"),
      loadKg: 50,
      reps: 10,
    });
    older.exercises = [completeSet(olderEntry, "2026-09-01T10:05:00.000Z")];
    const olderFinished = { ...finishSession(older), endedAt: "2026-09-01T10:10:00.000Z" };

    const latest = createSession("push", []);
    latest.startedAt = "2026-09-08T10:00:00.000Z";
    const latestEntry = createEntry({
      ...defaultConfig("bench-press"),
      loadKg: 60,
      reps: 12,
    });
    latest.exercises = [completeSet(latestEntry, "2026-09-08T10:05:00.000Z")];
    const latestFinished = { ...finishSession(latest), endedAt: "2026-09-08T10:10:00.000Z" };

    expect(lastConfigForExercise([olderFinished, latestFinished], "bench-press")).toMatchObject({
      equipment: "barbell",
      sets: 3,
      loadKg: 60,
      reps: 12,
    });
    const unperformed = createSession("push", [defaultConfig("bench-press")]);
    expect(lastConfigForExercise([unperformed], "bench-press")).toBeNull();
  });
  it("provides useful defaults for a new free-session exercise", () => {
    expect(defaultFreeConfig("bench-press")).toMatchObject({
      sets: 3,
      restSeconds: 120,
      loadKg: 0,
      reps: 10,
    });
    expect(defaultFreeConfig("row").restSeconds).toBe(120);
    expect(defaultFreeConfig("chest-fly")).toMatchObject({
      sets: 3,
      restSeconds: 90,
      loadKg: 0,
      reps: 10,
    });
    expect(defaultFreeConfig("curl").restSeconds).toBe(90);
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
  it("includes vertical chest press in the relevant session types", () => {
    expect(searchExercises("push", "vertical chest press").map((e) => e.id)).toEqual([
      "vertical-chest-press",
    ]);
    expect(searchExercises("upper", "chest press").map((e) => e.id)).toContain(
      "vertical-chest-press",
    );
    expect(searchExercises("full", "chest press").map((e) => e.id)).toContain(
      "vertical-chest-press",
    );
  });
  it("finds the unilateral overhead triceps extension by its movement aliases", () => {
    const exercise = exercises.find((item) => item.id === "overhead-triceps-extension");
    expect(exercise).toMatchObject({
      name: "Extension triceps overhead",
      primary: "triceps",
      secondary: [],
      equipment: ["dumbbell"],
      pattern: "push",
    });
    expect(searchExercises("push", "extension derriere la nuque").map((e) => e.id)).toEqual([
      "overhead-triceps-extension",
    ]);
  });
  it("has unique stable IDs and valid defaults for every exercise", () => {
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    for (const exercise of exercises)
      expect(
        storeSchema.safeParse({ ...emptyStore(), favorites: [defaultConfig(exercise.id)] }).success,
      ).toBe(true);
  });
});

describe("recommended workouts", () => {
  it("covers every format and duration with the right editable workout options", () => {
    expect(recommendedWorkouts).toHaveLength(21);
    for (const kind of ["full", "half", "ppl"] as const) {
      for (const duration of Object.keys(workoutDurations) as Array<
        keyof typeof workoutDurations
      >) {
        expect(recommendedWorkoutsFor(kind, duration)).toHaveLength(kind === "ppl" ? 3 : 2);
      }
    }
  });
  it("builds valid independent configurations for every recommended workout", () => {
    for (const workout of recommendedWorkouts) {
      const configs = configsForRecommendedWorkout(workout);
      expect(configs).toHaveLength(workout.exercises.length);
      expect(storeSchema.safeParse({ ...emptyStore(), favorites: configs }).success).toBe(true);
      expect(configs.every((config) => config.loadKg === 0)).toBe(true);
    }
  });
});
