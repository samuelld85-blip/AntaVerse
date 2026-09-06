import { z } from "zod";
import { notifySaveChanged } from "./cloud/changed";
import { exercises, type SessionKind } from "./catalog";

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
  equipment: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight"]),
  loadKg: z.number().min(0).max(2000),
  reps: z.number().int().min(1).max(200).nullable(),
});
const entrySchema = z
  .object({
    id: z.string(),
    config: configSchema,
    completedSets: z.array(setSchema),
    finished: z.boolean(),
  })
  .refine((e) => e.completedSets.length <= e.config.sets);
export type ExerciseEntry = z.infer<typeof entrySchema>;
const kindSchema = z.enum(["full", "half", "ppl", "upper", "lower", "push", "pull", "legs"]);
const sessionSchema = z.object({
  id: z.string(),
  name: z.string().max(100).optional(),
  kind: kindSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  exercises: z.array(entrySchema),
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
      exercises: z.array(configSchema),
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
export const defaultConfig = (id: string): ExerciseConfig => ({
  exerciseId: id,
  equipment: exercises.find((ex) => ex.id === id)!.equipment[0]!,
  sets: 3,
  restSeconds: 120,
  loadKg: 0,
  reps: null,
});
export const createEntry = (config: ExerciseConfig): ExerciseEntry => ({
  id: crypto.randomUUID(),
  config: { ...config },
  completedSets: [],
  finished: false,
});
export const createSession = (kind: SessionKind, configs: ExerciseConfig[] = []): Session => ({
  id: crypto.randomUUID(),
  kind,
  startedAt: new Date().toISOString(),
  endedAt: null,
  exercises: configs.map(createEntry),
});
export function completeSet(entry: ExerciseEntry, now = new Date().toISOString()): ExerciseEntry {
  if (entry.finished || entry.completedSets.length >= entry.config.sets) return entry;
  const completedSets = [
    ...entry.completedSets,
    {
      completedAt: now,
      equipment: entry.config.equipment,
      loadKg: entry.config.loadKg,
      reps: entry.config.reps,
    },
  ];
  return { ...entry, completedSets, finished: completedSets.length === entry.config.sets };
}
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
