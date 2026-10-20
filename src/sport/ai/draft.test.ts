import { describe, expect, it } from "vitest";
import { draftToTemplate } from "./draft";
import {
  draftSchema,
  requestSchema,
  type Draft,
} from "../../../supabase/functions/_shared/sport-ai-contract";
import { buildAssistantContext } from "./context";

const draft: Draft = {
  name: "Haut du corps",
  kind: "upper",
  questions: [],
  exercises: [
    {
      exerciseId: "bench-press",
      equipment: "barbell",
      sets: 4,
      reps: 8,
      restSeconds: 120,
      loadKg: 60,
      superset: null,
    },
  ],
};
describe("Sport AI draft validation", () => {
  it("converts only explicit valid configs into a template without history or performed sets", () => {
    const template = draftToTemplate(draft);
    expect(template?.exercises[0]?.config.loadKg).toBe(60);
    expect(JSON.stringify(template)).not.toMatch(/completed|started|ended/);
    expect(
      draftToTemplate({ ...draft, exercises: [{ ...draft.exercises[0]!, loadKg: null }] }),
    ).toBeNull();
  });
  it("rejects invented exercises, incompatible equipment and mismatched superset rounds", () => {
    for (const patch of [
      { exerciseId: "invented" },
      { equipment: "bodyweight" as const },
      { sets: 0 },
      { loadKg: -1 },
    ])
      expect(
        draftSchema.safeParse({ ...draft, exercises: [{ ...draft.exercises[0], ...patch }] })
          .success,
      ).toBe(false);
    expect(
      draftToTemplate({
        ...draft,
        exercises: [
          {
            ...draft.exercises[0]!,
            superset: {
              exerciseId: "row",
              equipment: "dumbbell",
              sets: 3,
              reps: 10,
              restSeconds: 120,
              loadKg: 12,
            },
          },
        ],
      }),
    ).toBeNull();
  });
  it("permits explicitly optional repetitions and per-dumbbell loads without conversion", () => {
    const template = draftToTemplate({
      ...draft,
      exercises: [{ ...draft.exercises[0]!, equipment: "dumbbell", loadKg: 12, reps: null }],
    });
    expect(template?.exercises[0]?.config).toMatchObject({ loadKg: 12, reps: null });
  });
  it("rejects profile fields, large conversations and reviews of absent sessions", () => {
    const request = {
      mode: "prepare",
      messages: [{ role: "user", content: "Prépare une séance" }],
      context: buildAssistantContext([]),
      draft: null,
    };
    expect(requestSchema.safeParse(request).success).toBe(true);
    expect(requestSchema.safeParse({ ...request, userId: "other-user" }).success).toBe(false);
    expect(requestSchema.safeParse({ ...request, mode: "review" }).success).toBe(false);
    expect(
      requestSchema.safeParse({
        ...request,
        messages: Array.from({ length: 8 }, () => ({ role: "user", content: "x".repeat(4000) })),
      }).success,
    ).toBe(false);
    expect(
      requestSchema.safeParse({ ...request, context: { ...request.context, photos: ["private"] } })
        .success,
    ).toBe(false);
  });
});
