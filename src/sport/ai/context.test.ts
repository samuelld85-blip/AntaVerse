import { describe, expect, it } from "vitest";
import { buildAssistantContext } from "./context";
import { contextSchema } from "../../../supabase/functions/_shared/sport-ai-contract";
import { completeSet, createEntry, defaultConfig, type Session } from "../model";
import { exercises } from "../catalog";
import catalog from "../../../supabase/functions/_shared/sport-ai-catalog.json";

const now = new Date("2026-10-19T12:00:00Z");
function session(id: string, date: string): Session {
  return {
    id,
    kind: "full",
    name: "PRIVATE TITLE",
    startedAt: date,
    endedAt: date,
    feedback: { mood: "good", comment: "PRIVATE NOTE", photos: ["data:image/PRIVATE"] },
    exercises: [
      completeSet(createEntry({ ...defaultConfig("bench-press"), loadKg: 60, reps: 8 }), date),
    ],
  };
}
describe("Sport assistant context", () => {
  it("projects only approved fields and computes comparable complete period totals", () => {
    const history = [
      session("recent", "2026-10-18T12:00:00Z"),
      session("previous", "2026-09-01T12:00:00Z"),
      session("old", "2026-01-01T12:00:00Z"),
      { ...session("active", "2026-10-18T12:00:00Z"), endedAt: null },
    ];
    const context = buildAssistantContext(history, 30, null, now);
    expect(contextSchema.safeParse(context).success).toBe(true);
    expect(context.summary).toEqual({ sessions: 1, sets: 1, volumeKg: 480 });
    expect(context.previousSummary).toEqual({ sessions: 1, sets: 1, volumeKg: 480 });
    expect(JSON.stringify(context)).not.toMatch(/PRIVATE|feedback|photos|name|active/);
    expect(history[0]?.name).toBe("PRIVATE TITLE");
  });
  it("keeps a selected older session, bounds context and separates superset movements", () => {
    const history = Array.from({ length: 20 }, (_, index) =>
      session(`${index}`, `2026-10-${String(index + 1).padStart(2, "0")}T00:00:00Z`),
    );
    const focus = session("focus", "2026-01-01T00:00:00Z");
    focus.exercises = [
      completeSet(
        createEntry(
          { ...defaultConfig("bench-press"), loadKg: 60 },
          { ...defaultConfig("row"), loadKg: 20 },
        ),
        focus.startedAt,
      ),
    ];
    const context = buildAssistantContext([...history, focus], 30, "focus", now);
    expect(context.recentSessions).toHaveLength(12);
    expect(context.recentSessions[0]?.id).toBe("focus");
    expect(context.recentSessions[0]?.sets.map((set) => set.exerciseId)).toEqual([
      "bench-press",
      "row",
    ]);
    expect(context.recentSessions.some((entry) => entry.id === "19")).toBe(false); // future
  });
  it("caps set details but preserves whole-session and whole-period totals", () => {
    const big = session("big", "2026-10-18T00:00:00Z");
    big.exercises = Array.from({ length: 100 }, () => big.exercises[0]!);
    const context = buildAssistantContext([big], 30, null, now);
    expect(context.recentSessions[0]?.sets).toHaveLength(80);
    expect(context.summary.sets).toBe(100);
    expect(context.summary.volumeKg).toBe(48000);
  });
  it("keeps the generated backend catalogue aligned with the manual source", () => {
    expect(catalog).toEqual(
      exercises.map(({ id, name, equipment, primary, secondary, pattern }) => ({
        id,
        name,
        equipment,
        primary,
        secondary,
        pattern,
      })),
    );
  });
});
