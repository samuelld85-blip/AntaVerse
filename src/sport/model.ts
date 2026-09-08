import { z } from "zod";
import { notifySaveChanged } from "./cloud/changed";
import { defaultFreeRestSeconds, exercises, type SessionKind } from "./catalog";

const configSchema = z
  .object({
    exerciseId: z.string().refine((id) => exercises.some((ex) => ex.id === id)),
    equipment: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight"]),
    sets: z.number().int().min(1).max(30),
    restSeconds: z.number().int().min(5).max(1800),
    loadKg: z.number().min(0).max(2000),
    reps: z.number().int().min(1).max(200).nullable(),
  })
  .refine(
    (c) => exercises.find((ex) => ex.id === c.exerciseId)?.equipment.includes(c.equipment) ?? false,
  );
export type ExerciseConfig = z.infer<typeof configSchema>;
const setSchema = z.object({
  completedAt: z.string().datetime(),
  exerciseId: z
    .string()
    .refine((id) => exercises.some((ex) => ex.id === id))
    .optional(),
  equipment: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight"]),
  loadKg: z.number().min(0).max(2000),
  reps: z.number().int().min(1).max(200).nullable(),
});
const exerciseFeedbackSchema = z.object({
  mood: z.enum(["good", "okay", "bad"]),
  comment: z.string().max(1000),
});
export type ExerciseFeedback = z.infer<typeof exerciseFeedbackSchema>;
const sessionFeedbackSchema = exerciseFeedbackSchema.extend({
  photos: z.array(z.string().startsWith("data:image/").max(1_500_000)).max(3).optional(),
});
export type SessionFeedback = z.infer<typeof sessionFeedbackSchema>;
const entrySchema = z
  .object({
    id: z.string(),
    config: configSchema,
    superset: configSchema.optional(),
    pyramid: z.boolean().default(false),
    completedSets: z.array(setSchema),
    completedRounds: z.number().int().min(0).max(30).default(0),
    finished: z.boolean(),
    feedback: exerciseFeedbackSchema.optional(),
  })
  .refine((e) => e.completedRounds <= e.config.sets)
  .refine((e) => e.completedSets.length <= e.config.sets * (e.superset ? 2 : 1))
  .refine((e) => !e.superset || e.completedSets.length === e.completedRounds * 2)
  .refine((e) => !e.superset || !e.pyramid);
export type ExerciseEntry = z.infer<typeof entrySchema>;
export type SessionTemplateExercise = {
  config: ExerciseConfig;
  superset?: ExerciseConfig;
};
const templateExerciseSchema = z.union([
  configSchema.transform((config): SessionTemplateExercise => ({ config })),
  z.object({ config: configSchema, superset: configSchema.optional() }),
]);
const kindSchema = z.enum(["full", "half", "ppl", "upper", "lower", "push", "pull", "legs"]);
const sessionSchema = z.object({
  id: z.string(),
  name: z.string().max(100).optional(),
  source: z.enum(["free", "recommended"]).optional(),
  kind: kindSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  exercises: z.array(entrySchema),
  feedback: sessionFeedbackSchema.optional(),
});
export type Session = z.infer<typeof sessionSchema>;
export const storeSchema = z.object({
  version: z.literal(1),
  active: sessionSchema.nullable(),
  history: z.array(sessionSchema),
  favorites: z.array(configSchema),
  templates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: kindSchema,
      exercises: z.array(templateExerciseSchema),
    }),
  ),
});
export type SportStore = z.infer<typeof storeSchema>;
export const STORAGE_KEY = "antaverse:sport:v1";
export const emptyStore = (): SportStore => ({
  version: 1,
  active: null,
  history: [],
  favorites: [],
  templates: [],
});
export const configKey = (c: ExerciseConfig) =>
  JSON.stringify([c.exerciseId, c.equipment, c.sets, c.restSeconds, c.loadKg, c.reps]);
export function lastConfigForExercise(
  history: Session[],
  exerciseId: string,
): ExerciseConfig | null {
  let latest: { config: ExerciseConfig; timestamp: number } | null = null;
  for (const session of history) {
    const timestamp = Date.parse(session.endedAt ?? session.startedAt);
    for (const entry of session.exercises) {
      if (!entry.completedSets.length) continue;
      const config =
        entry.config.exerciseId === exerciseId
          ? entry.config
          : entry.superset?.exerciseId === exerciseId
            ? entry.superset
            : null;
      if (config && (!latest || timestamp >= latest.timestamp)) {
        latest = { config: { ...config }, timestamp };
      }
    }
  }
  return latest?.config ?? null;
}
export const defaultConfig = (id: string): ExerciseConfig => ({
  exerciseId: id,
  equipment: exercises.find((ex) => ex.id === id)!.equipment[0]!,
  sets: 3,
  restSeconds: 120,
  loadKg: 0,
  reps: null,
});
export const defaultFreeConfig = (id: string): ExerciseConfig => ({
  ...defaultConfig(id),
  sets: 10,
  restSeconds: defaultFreeRestSeconds(id),
});
export const createEntry = (config: ExerciseConfig, superset?: ExerciseConfig): ExerciseEntry => ({
  id: crypto.randomUUID(),
  config: { ...config },
  ...(superset ? { superset: { ...superset } } : {}),
  pyramid: false,
  completedSets: [],
  completedRounds: 0,
  finished: false,
});
export const createSession = (
  kind: SessionKind,
  configs: ExerciseConfig[] = [],
  name?: string,
  source?: "free" | "recommended",
): Session => ({
  id: crypto.randomUUID(),
  ...(name ? { name } : {}),
  ...(source ? { source } : {}),
  kind,
  startedAt: new Date().toISOString(),
  endedAt: null,
  exercises: configs.map((config) => createEntry(config)),
});
export function completeSet(entry: ExerciseEntry, now = new Date().toISOString()): ExerciseEntry {
  const completedRounds = entry.superset ? entry.completedRounds : entry.completedSets.length;
  if (entry.finished || completedRounds >= entry.config.sets) return entry;
  const snapshot = (config: ExerciseConfig) => ({
    completedAt: now,
    exerciseId: config.exerciseId,
    equipment: config.equipment,
    loadKg: config.loadKg,
    reps: config.reps,
  });
  const completedSets = [
    ...entry.completedSets,
    snapshot(entry.config),
    ...(entry.superset ? [snapshot(entry.superset)] : []),
  ];
  const nextRounds = completedRounds + 1;
  return {
    ...entry,
    completedSets,
    completedRounds: nextRounds,
    finished: nextRounds === entry.config.sets,
  };
}
export const completedRoundCount = (entry: ExerciseEntry) =>
  entry.superset ? entry.completedRounds : entry.completedSets.length;
export const setExerciseId = (entry: ExerciseEntry, set: ExerciseEntry["completedSets"][number]) =>
  set.exerciseId ?? entry.config.exerciseId;
export function finishSession(session: Session): Session {
  return {
    ...session,
    endedAt: new Date().toISOString(),
    exercises: session.exercises
      .filter((e) => e.completedSets.length > 0)
      .map((e) => ({ ...e, finished: true })),
  };
}
export function loadStore(): { store: SportStore; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { store: emptyStore(), error: "" };
    const result = storeSchema.safeParse(JSON.parse(raw));
    if (!result.success) throw new Error("invalid");
    return { store: result.data, error: "" };
  } catch {
    return {
      store: emptyStore(),
      error:
        "Impossible de lire le carnet local. Les données existantes n’ont pas été modifiées. Rechargez la page ou libérez le stockage du navigateur.",
    };
  }
}
export function saveStore(store: SportStore): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    notifySaveChanged();
    return true;
  } catch {
    return false;
  }
}
export const timeLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
