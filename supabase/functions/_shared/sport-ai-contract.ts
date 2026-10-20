import { z } from "zod";
import catalogData from "./sport-ai-catalog.json" with { type: "json" };

export const catalog = catalogData;
const equipmentSchema = z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight"]);
const kindSchema = z.enum(["full", "half", "ppl", "upper", "lower", "push", "pull", "legs"]);
export const modeSchema = z.enum(["prepare", "import", "review", "progress"]);
export type AssistantMode = z.infer<typeof modeSchema>;
const configFields = {
  exerciseId: z.string().max(80),
  equipment: equipmentSchema.nullable(),
  sets: z.number().int().min(1).max(30).nullable(),
  reps: z.number().int().min(1).max(200).nullable(),
  restSeconds: z.number().int().min(5).max(1800).nullable(),
  loadKg: z.number().min(0).max(2000).nullable(),
};
const draftConfigSchema = z.object(configFields).strict();
export const draftSchema = z
  .object({
    name: z.string().min(1).max(100),
    kind: kindSchema,
    exercises: z
      .array(z.object({ ...configFields, superset: draftConfigSchema.nullable() }).strict())
      .min(1)
      .max(12),
    questions: z.array(z.string().min(1).max(300)).max(8),
  })
  .strict()
  .superRefine((draft, ctx) => {
    draft.exercises.forEach((entry, index) => {
      for (const [key, config] of [
        ["", entry],
        ["superset", entry.superset],
      ] as const) {
        if (!config) continue;
        const exercise = catalog.find((item) => item.id === config.exerciseId);
        if (!exercise || (config.equipment && !exercise.equipment.includes(config.equipment))) {
          ctx.addIssue({
            code: "custom",
            message: "Exercice ou matériel incompatible.",
            path: ["exercises", index, ...(key ? [key] : [])],
          });
        }
      }
      if (
        entry.superset &&
        entry.sets !== null &&
        entry.superset.sets !== null &&
        entry.sets !== entry.superset.sets
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Un superset doit avoir le même nombre de tours.",
          path: ["exercises", index, "superset", "sets"],
        });
      }
    });
  });
export type Draft = z.infer<typeof draftSchema>;
const summarySchema = z
  .object({
    sessions: z.number().int().min(0),
    sets: z.number().int().min(0),
    volumeKg: z.number().min(0).max(1e13),
  })
  .strict();
const setSchema = z
  .object({
    exerciseId: z
      .string()
      .max(80)
      .refine((id) => catalog.some((ex) => ex.id === id)),
    equipment: equipmentSchema,
    loadKg: z.number().min(0).max(2000),
    reps: z.number().int().min(1).max(200).nullable(),
  })
  .strict()
  .refine((set) =>
    catalog.find((ex) => ex.id === set.exerciseId)!.equipment.includes(set.equipment),
  );
export const contextSchema = z
  .object({
    generatedAt: z.string().datetime(),
    summary: summarySchema,
    recentSessions: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            date: z.string().datetime(),
            kind: kindSchema,
            volumeKg: z.number().min(0).max(1e13),
            sets: z.array(setSchema),
          })
          .strict(),
      ),
    focusSessionId: z.string().min(1).max(100).nullable(),
  })
  .strict();
export type AssistantContext = z.infer<typeof contextSchema>;
export const requestSchema = z
  .object({
    mode: modeSchema,
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(4000),
          })
          .strict(),
      )
      .min(1)
      .max(8),
    context: contextSchema,
    draft: draftSchema.nullable(),
  })
  .strict()
  .superRefine((request, ctx) => {
    if (request.messages.at(-1)?.role !== "user")
      ctx.addIssue({
        code: "custom",
        message: "Une demande utilisateur est nécessaire.",
        path: ["messages"],
      });
    if (request.messages.reduce((sum, item) => sum + item.content.length, 0) > 24000)
      ctx.addIssue({ code: "custom", message: "Conversation trop longue.", path: ["messages"] });
    if (
      request.mode === "review" &&
      (!request.context.focusSessionId ||
        !request.context.recentSessions.some(
          (session) => session.id === request.context.focusSessionId,
        ))
    )
      ctx.addIssue({
        code: "custom",
        message: "Séance à analyser absente.",
        path: ["context", "focusSessionId"],
      });
  });
export type AssistantRequest = z.infer<typeof requestSchema>;
export const responseSchema = z
  .object({
    message: z.string().min(1).max(4000),
    observations: z
      .array(
        z
          .object({
            text: z.string().min(1).max(600),
            sessionIds: z.array(z.string().min(1).max(100)).max(12),
          })
          .strict(),
      )
      .max(6),
    draft: draftSchema.nullable(),
  })
  .strict();
export type AssistantResponse = z.infer<typeof responseSchema>;
export const responseJsonSchema = z.toJSONSchema(responseSchema, { target: "draft-7" });
