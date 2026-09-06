import { exercises, type Equipment, type SessionKind } from "./catalog";
import type { ExerciseConfig } from "./model";

export type WorkoutDuration = "short" | "medium" | "long";

export const workoutDurations: Record<
  WorkoutDuration,
  { label: string; minutes: number; description: string }
> = {
  short: { label: "Court", minutes: 45, description: "Environ 45 min" },
  medium: { label: "Moyen", minutes: 60, description: "Environ 1 h" },
  long: { label: "Long", minutes: 75, description: "Environ 1 h 15" },
};

type WorkoutExercise = Omit<ExerciseConfig, "loadKg"> & { loadKg?: number };

export type RecommendedWorkout = {
  id: string;
  kind: Extract<SessionKind, "full" | "half" | "ppl">;
  duration: WorkoutDuration;
  name: string;
  description: string;
  exercises: readonly WorkoutExercise[];
};

function exercise(
  exerciseId: string,
  sets: number,
  reps: number,
  restSeconds: number,
  equipment?: Equipment,
): WorkoutExercise {
  const source = exercises.find((item) => item.id === exerciseId);
  if (!source) throw new Error(`Unknown recommended exercise: ${exerciseId}`);
  return {
    exerciseId,
    equipment: equipment ?? source.equipment[0]!,
    sets,
    reps,
    restSeconds,
  };
}

const e = exercise;

// These are deliberately editable starting points, not prescribed training plans.
// Every exercise opens with its full configuration before its first set.
export const recommendedWorkouts: readonly RecommendedWorkout[] = [
  {
    id: "full-short-a",
    kind: "full",
    duration: "short",
    name: "Full body express A",
    description: "Les grands mouvements, sans détour.",
    exercises: [
      e("squat", 3, 8, 120, "barbell"),
      e("bench-press", 3, 8, 120, "barbell"),
      e("row", 3, 10, 90, "dumbbell"),
      e("leg-curl", 2, 12, 75),
      e("lateral-raise", 2, 15, 60),
    ],
  },
  {
    id: "full-short-b",
    kind: "full",
    duration: "short",
    name: "Full body express B",
    description: "Machines et haltères pour aller droit au but.",
    exercises: [
      e("leg-press", 3, 10, 105),
      e("shoulder-press", 3, 10, 90, "dumbbell"),
      e("lat-pulldown", 3, 10, 90),
      e("hip-thrust", 3, 10, 105, "barbell"),
      e("crunch", 2, 15, 60),
    ],
  },
  {
    id: "full-medium-a",
    kind: "full",
    duration: "medium",
    name: "Full body équilibré A",
    description: "Une base complète pour progresser régulièrement.",
    exercises: [
      e("squat", 3, 8, 120, "barbell"),
      e("bench-press", 3, 8, 120, "barbell"),
      e("lat-pulldown", 3, 10, 90),
      e("romanian-deadlift", 3, 10, 120, "barbell"),
      e("lateral-raise", 3, 15, 60),
      e("curl", 2, 12, 60, "dumbbell"),
      e("triceps-extension", 2, 12, 60),
    ],
  },
  {
    id: "full-medium-b",
    kind: "full",
    duration: "medium",
    name: "Full body équilibré B",
    description: "Variante axée machines et contrôle.",
    exercises: [
      e("leg-press", 3, 10, 105),
      e("incline-press", 3, 10, 105, "dumbbell"),
      e("cable-row", 3, 10, 90),
      e("hip-thrust", 3, 10, 105, "barbell"),
      e("face-pull", 3, 15, 60),
      e("leg-curl", 2, 12, 75),
      e("leg-raise", 2, 12, 60),
    ],
  },
  {
    id: "full-long-a",
    kind: "full",
    duration: "long",
    name: "Full body complet A",
    description: "Plus de volume sur les mouvements fondamentaux.",
    exercises: [
      e("squat", 4, 8, 135, "barbell"),
      e("bench-press", 4, 8, 135, "barbell"),
      e("row", 4, 10, 105, "barbell"),
      e("romanian-deadlift", 3, 10, 120, "barbell"),
      e("lateral-raise", 3, 15, 60),
      e("curl", 3, 12, 60, "dumbbell"),
      e("triceps-extension", 3, 12, 60),
      e("calf-raise", 3, 15, 60),
    ],
  },
  {
    id: "full-long-b",
    kind: "full",
    duration: "long",
    name: "Full body complet B",
    description: "Une alternative complète pour varier la semaine.",
    exercises: [
      e("front-squat", 4, 8, 135),
      e("shoulder-press", 4, 8, 120, "barbell"),
      e("lat-pulldown", 4, 10, 105),
      e("hip-thrust", 4, 10, 120, "barbell"),
      e("chest-fly", 3, 12, 75, "cable"),
      e("face-pull", 3, 15, 60),
      e("leg-curl", 3, 12, 75),
      e("russian-twist", 3, 16, 60),
    ],
  },
  {
    id: "half-short-upper",
    kind: "half",
    duration: "short",
    name: "Haut du corps express",
    description: "Pousser, tirer, épaules et bras en 45 minutes.",
    exercises: [
      e("bench-press", 3, 8, 105, "barbell"),
      e("lat-pulldown", 3, 10, 90),
      e("shoulder-press", 2, 10, 75, "dumbbell"),
      e("cable-row", 2, 12, 75),
      e("curl", 2, 12, 60, "dumbbell"),
      e("triceps-extension", 2, 12, 60),
    ],
  },
  {
    id: "half-short-lower",
    kind: "half",
    duration: "short",
    name: "Bas du corps express",
    description: "Jambes, chaîne postérieure et gainage sans rallonger la séance.",
    exercises: [
      e("squat", 3, 8, 120, "barbell"),
      e("romanian-deadlift", 3, 10, 105, "barbell"),
      e("leg-press", 2, 12, 90),
      e("leg-curl", 2, 12, 75),
      e("calf-raise", 2, 15, 60),
      e("crunch", 2, 15, 60),
    ],
  },
  {
    id: "half-medium-upper",
    kind: "half",
    duration: "medium",
    name: "Haut du corps complet",
    description: "Une séance haut équilibrée, à alterner avec le bas.",
    exercises: [
      e("incline-press", 4, 8, 120, "barbell"),
      e("row", 4, 10, 105, "barbell"),
      e("shoulder-press", 3, 10, 90, "dumbbell"),
      e("lat-pulldown", 3, 10, 90),
      e("lateral-raise", 3, 15, 60),
      e("curl", 3, 12, 60, "dumbbell"),
      e("triceps-extension", 3, 12, 60),
    ],
  },
  {
    id: "half-medium-lower",
    kind: "half",
    duration: "medium",
    name: "Bas du corps complet",
    description: "Quadriceps, ischios et fessiers avec du volume régulier.",
    exercises: [
      e("squat", 4, 8, 135, "barbell"),
      e("hip-thrust", 3, 10, 120, "barbell"),
      e("leg-press", 3, 12, 105),
      e("leg-curl", 3, 12, 75),
      e("leg-extension", 2, 15, 60),
      e("calf-raise", 3, 15, 60),
      e("leg-raise", 2, 12, 60),
    ],
  },
  {
    id: "half-long-upper",
    kind: "half",
    duration: "long",
    name: "Haut du corps volume",
    description: "Le format long pour développer chaque groupe du haut.",
    exercises: [
      e("bench-press", 4, 8, 135, "barbell"),
      e("row", 4, 8, 120, "barbell"),
      e("shoulder-press", 3, 10, 90, "dumbbell"),
      e("lat-pulldown", 3, 10, 90),
      e("chest-fly", 3, 12, 75, "cable"),
      e("face-pull", 3, 15, 60),
      e("hammer-curl", 3, 12, 60),
      e("skull-crusher", 3, 12, 60, "dumbbell"),
    ],
  },
  {
    id: "half-long-lower",
    kind: "half",
    duration: "long",
    name: "Bas du corps volume",
    description: "Une séance jambes complète, en gardant des repos réalistes.",
    exercises: [
      e("front-squat", 4, 8, 135),
      e("romanian-deadlift", 4, 8, 135, "barbell"),
      e("leg-press", 3, 12, 105),
      e("bulgarian-squat", 3, 10, 90, "dumbbell"),
      e("leg-curl", 3, 12, 75),
      e("hip-abduction", 3, 15, 60),
      e("calf-raise", 3, 15, 60),
      e("crunch", 3, 15, 60),
    ],
  },
  {
    id: "ppl-short-push",
    kind: "ppl",
    duration: "short",
    name: "Push express",
    description: "Pectoraux, épaules et triceps sans dépasser 45 minutes.",
    exercises: [
      e("bench-press", 3, 8, 105, "barbell"),
      e("shoulder-press", 3, 10, 90, "dumbbell"),
      e("lateral-raise", 3, 15, 60),
      e("triceps-extension", 3, 12, 60),
    ],
  },
  {
    id: "ppl-short-pull",
    kind: "ppl",
    duration: "short",
    name: "Pull express",
    description: "Dos, arrière d’épaule et biceps en format court.",
    exercises: [
      e("lat-pulldown", 3, 10, 90),
      e("cable-row", 3, 10, 90),
      e("face-pull", 3, 15, 60),
      e("curl", 3, 12, 60, "dumbbell"),
    ],
  },
  {
    id: "ppl-short-legs",
    kind: "ppl",
    duration: "short",
    name: "Legs express",
    description: "Quadriceps, ischios et mollets en format court.",
    exercises: [
      e("squat", 3, 8, 120, "barbell"),
      e("leg-press", 3, 12, 90),
      e("leg-curl", 3, 12, 75),
      e("calf-raise", 3, 15, 60),
    ],
  },
  {
    id: "ppl-medium-legs",
    kind: "ppl",
    duration: "medium",
    name: "Legs régulier",
    description: "Une séance jambes solide et efficace.",
    exercises: [
      e("squat", 4, 8, 135, "barbell"),
      e("romanian-deadlift", 3, 10, 120, "barbell"),
      e("leg-press", 3, 12, 105),
      e("leg-curl", 3, 12, 75),
      e("calf-raise", 3, 15, 60),
      e("leg-raise", 2, 12, 60),
    ],
  },
  {
    id: "ppl-medium-push",
    kind: "ppl",
    duration: "medium",
    name: "Push régulier",
    description: "Une base PPL avec un peu plus de volume.",
    exercises: [
      e("incline-press", 4, 8, 120, "barbell"),
      e("shoulder-press", 3, 10, 90, "dumbbell"),
      e("chest-fly", 3, 12, 75, "cable"),
      e("lateral-raise", 3, 15, 60),
      e("triceps-extension", 3, 12, 60),
      e("dips", 2, 10, 75),
    ],
  },
  {
    id: "ppl-medium-pull",
    kind: "ppl",
    duration: "medium",
    name: "Pull régulier",
    description: "Dos, biceps et arrière d’épaule avec un volume régulier.",
    exercises: [
      e("lat-pulldown", 4, 8, 105),
      e("row", 3, 10, 90, "barbell"),
      e("cable-row", 3, 12, 75),
      e("face-pull", 3, 15, 60),
      e("curl", 3, 12, 60, "dumbbell"),
      e("hammer-curl", 2, 12, 60),
    ],
  },
  {
    id: "ppl-long-pull",
    kind: "ppl",
    duration: "long",
    name: "Pull volume",
    description: "Un tirage complet avec du travail de bras.",
    exercises: [
      e("pull-up", 4, 8, 135),
      e("row", 4, 8, 120, "barbell"),
      e("lat-pulldown", 3, 10, 90),
      e("cable-row", 3, 12, 75),
      e("face-pull", 3, 15, 60),
      e("reverse-fly", 3, 15, 60, "dumbbell"),
      e("incline-curl", 3, 12, 60),
      e("hammer-curl", 3, 12, 60),
    ],
  },
  {
    id: "ppl-long-legs",
    kind: "ppl",
    duration: "long",
    name: "Legs volume",
    description: "Le format long pour une séance jambes PPL complète.",
    exercises: [
      e("squat", 4, 8, 135, "barbell"),
      e("hip-thrust", 4, 10, 120, "barbell"),
      e("leg-press", 3, 12, 105),
      e("bulgarian-squat", 3, 10, 90, "dumbbell"),
      e("leg-curl", 3, 12, 75),
      e("leg-extension", 3, 15, 60),
      e("calf-raise", 3, 15, 60),
      e("crunch", 3, 15, 60),
    ],
  },
  {
    id: "ppl-long-push",
    kind: "ppl",
    duration: "long",
    name: "Push volume",
    description: "Le format long pour développer pectoraux, épaules et triceps.",
    exercises: [
      e("bench-press", 4, 8, 135, "barbell"),
      e("incline-press", 3, 10, 105, "dumbbell"),
      e("shoulder-press", 4, 8, 120, "barbell"),
      e("chest-fly", 3, 12, 75, "cable"),
      e("lateral-raise", 4, 15, 60),
      e("dips", 3, 10, 75),
      e("triceps-extension", 3, 12, 60),
    ],
  },
] as const;

export function configsForRecommendedWorkout(workout: RecommendedWorkout): ExerciseConfig[] {
  return workout.exercises.map(({ loadKg = 0, ...config }) => ({ ...config, loadKg }));
}

export function recommendedWorkoutsFor(
  kind: RecommendedWorkout["kind"],
  duration: WorkoutDuration,
): readonly RecommendedWorkout[] {
  return recommendedWorkouts.filter(
    (workout) => workout.kind === kind && workout.duration === duration,
  );
}
