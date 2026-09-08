import { describe, expect, it } from "vitest";
import { completeSet, createEntry, createSession, defaultConfig, type Session } from "./model";
import {
  EXERCISE_LEVEL_THRESHOLDS,
  exerciseIdsInSession,
  exerciseLevelForCount,
  getExercisePracticeCounts,
  getGlobalProgression,
  statusForSessions,
} from "./progression";

function performedSession(date: string, exerciseIds: string[]): Session {
  const session = createSession("push", []);
  session.startedAt = date;
  session.endedAt = date;
  session.exercises = exerciseIds.map((exerciseId) => completeSet(createEntry(defaultConfig(exerciseId)), date));
  return session;
}

describe("sport progression", () => {
  it("uses the hybrid status curve and linear session XP", () => {
    expect(statusForSessions(0).label).toBe("Rookie");
    expect(statusForSessions(1).label).toBe("Explorateur");
    expect(statusForSessions(10).label).toBe("Assidu");
    expect(statusForSessions(130).label).toBe("Machine de guerre");
    expect(getGlobalProgression([performedSession("2026-09-01T10:00:00.000Z", ["bench-press"])]))
      .toMatchObject({ sessions: 1, xp: 100, status: { label: "Explorateur" }, target: 3 });
  });

  it("counts an exercise once per qualified session", () => {
    const first = performedSession("2026-09-01T10:00:00.000Z", ["bench-press", "row"]);
    const second = performedSession("2026-09-02T10:00:00.000Z", ["bench-press"]);
    expect(exerciseIdsInSession(first)).toEqual(["bench-press", "row"]);
    expect(getExercisePracticeCounts([first, second]).get("bench-press")).toBe(2);
    expect(exerciseLevelForCount(3)).toBe(2);
  });

  it("keeps the exercise thresholds explicit", () => {
    expect(EXERCISE_LEVEL_THRESHOLDS).toEqual([0, 1, 3, 6, 10, 15, 25, 40, 60]);
    expect(exerciseLevelForCount(0)).toBe(0);
    expect(exerciseLevelForCount(60)).toBe(8);
  });
});
