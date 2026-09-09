import { describe, expect, it } from "vitest";
import { completeSet, createEntry, createSession, defaultConfig } from "./model";
import { getExerciseProgress, getRhythmBuckets, getSportStats, percentageChange } from "./stats";

function session(date: string, kind: "push" | "legs", loadKg: number, reps = 8) {
  const workout = createSession(kind, [
    { ...defaultConfig(kind === "push" ? "bench-press" : "squat"), loadKg, reps },
  ]);
  workout.startedAt = date;
  workout.endedAt = date;
  const entry = createEntry({ ...workout.exercises[0]!.config, sets: 2 });
  entry.completedSets = [
    { completedAt: date, equipment: "barbell", loadKg, reps },
    { completedAt: date, equipment: "barbell", loadKg, reps },
  ];
  entry.finished = true;
  workout.exercises = [entry];
  return workout;
}

describe("sport statistics", () => {
  const now = new Date("2026-09-06T12:00:00.000Z");
  const history = [
    session("2026-06-01T10:00:00.000Z", "push", 50),
    session("2026-08-25T10:00:00.000Z", "push", 60, 10),
    session("2026-09-02T10:00:00.000Z", "legs", 80),
  ];

  it("keeps the dashboard range focused and derives useful volume totals", () => {
    const stats = getSportStats(history, "30d", now);
    expect(stats.sessions).toHaveLength(2);
    expect(stats.setCount).toBe(4);
    expect(stats.volume).toBe(2480);
    expect(stats.topExercises.map((item) => item.name)).toEqual(["Développé couché", "Squat"]);
    expect(stats.muscles[0]).toEqual({ muscle: "chest", sets: 2 });
    expect(stats.sessionsByKind).toEqual([
      { kind: "legs", count: 1 },
      { kind: "push", count: 1 },
    ]);
  });

  it("builds an exercise timeline and exposes a meaningful relative change", () => {
    const points = getExerciseProgress(history, "bench-press");
    expect(points.map((point) => point.load)).toEqual([50, 60]);
    expect(points[1]!.estimated1Rm).toBe(80);
    expect(percentageChange(points[0]!.load, points[1]!.load)).toBe(20);
  });

  it("groups the rhythm by days, weeks, or months", () => {
    expect(getRhythmBuckets(history, "day", now)).toHaveLength(7);
    expect(getRhythmBuckets(history, "week", now).map((bucket) => bucket.count)).toEqual([
      0, 0, 0, 0, 1, 1,
    ]);
    expect(getRhythmBuckets(history, "month", now).at(-1)?.count).toBe(1);
  });

  it("splits superset sets by movement while keeping one session entry", () => {
    const workout = createSession("legs", []);
    let entry = createEntry(
      { ...defaultConfig("leg-curl"), sets: 2, loadKg: 30, reps: 10 },
      { ...defaultConfig("leg-extension"), sets: 2, loadKg: 25, reps: 12 },
    );
    entry = completeSet(entry, "2026-09-02T10:00:00.000Z");
    entry = completeSet(entry, "2026-09-02T10:03:00.000Z");
    workout.startedAt = "2026-09-02T10:00:00.000Z";
    workout.endedAt = workout.startedAt;
    workout.exercises = [entry];
    const stats = getSportStats([workout], "all");
    expect(stats.exerciseCount).toBe(2);
    expect(stats.setCount).toBe(4);
    expect(stats.topExercises.map((item) => [item.exerciseId, item.sets])).toEqual([
      ["leg-curl", 2],
      ["leg-extension", 2],
    ]);
    expect(getExerciseProgress([workout], "leg-extension")[0]?.volume).toBe(600);
  });

  it("includes the overhead triceps extension in exercise and muscle statistics", () => {
    const workout = createSession("push", []);
    let entry = createEntry({
      ...defaultConfig("overhead-triceps-extension"),
      sets: 2,
      loadKg: 12,
      reps: 10,
    });
    entry = completeSet(entry, "2026-09-03T10:00:00.000Z");
    entry = completeSet(entry, "2026-09-03T10:03:00.000Z");
    workout.startedAt = "2026-09-03T10:00:00.000Z";
    workout.endedAt = workout.startedAt;
    workout.exercises = [entry];

    const stats = getSportStats([workout], "all");
    expect(stats.topExercises[0]).toMatchObject({
      exerciseId: "overhead-triceps-extension",
      name: "Extension triceps overhead",
      sets: 2,
      volume: 240,
    });
    expect(stats.muscles).toContainEqual({ muscle: "triceps", sets: 2 });
  });
});
