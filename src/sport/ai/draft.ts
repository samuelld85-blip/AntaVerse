import { draftSchema, type Draft } from "../../../supabase/functions/_shared/sport-ai-contract";
import { storeSchema, type ExerciseConfig, type SessionTemplateExercise } from "../model";
import type { SessionKind } from "../catalog";

export type AssistantTemplate = {
  name: string;
  kind: SessionKind;
  exercises: SessionTemplateExercise[];
};

/** Nulls remain visible in the editor; never silently fill an imported unknown value. */
export function draftToTemplate(draft: Draft): AssistantTemplate | null {
  const parsed = draftSchema.safeParse(draft);
  if (!parsed.success) return null;
  const toConfig = (config: Draft["exercises"][number]): ExerciseConfig | null => {
    const { exerciseId, equipment, sets, reps, restSeconds, loadKg } = config;
    if (equipment === null || sets === null || restSeconds === null || loadKg === null) return null;
    return { exerciseId, equipment, sets, reps, restSeconds, loadKg };
  };
  const entries: SessionTemplateExercise[] = [];
  for (const exercise of parsed.data.exercises) {
    const config = toConfig(exercise);
    if (!config) return null;
    const superset = exercise.superset
      ? toConfig({ ...exercise.superset, superset: null })
      : undefined;
    if (superset === null) return null;
    entries.push({ config, ...(superset ? { superset } : {}) });
  }
  const template = storeSchema.shape.templates.element.safeParse({
    id: "assistant-draft",
    name: parsed.data.name.trim(),
    kind: parsed.data.kind,
    exercises: entries,
  });
  return template.success
    ? { name: template.data.name, kind: template.data.kind, exercises: template.data.exercises }
    : null;
}
