export const equipmentLabels = {
  barbell: "Barre",
  dumbbell: "Haltères",
  machine: "Machine",
  cable: "Poulie",
  bodyweight: "Poids du corps",
} as const;
export type Equipment = keyof typeof equipmentLabels;
export const muscleLabels = {
  chest: "Pectoraux",
  shoulders: "Épaules",
  triceps: "Triceps",
  back: "Dos",
  biceps: "Biceps",
  quads: "Quadriceps",
  hamstrings: "Ischio-jambiers",
  glutes: "Fessiers",
  calves: "Mollets",
  abs: "Abdominaux",
} as const;
export type Muscle = keyof typeof muscleLabels;
export const sessionLabels = {
  full: "Full body",
  half: "Half body",
  ppl: "Push Pull Legs",
  upper: "Haut du corps",
  lower: "Bas du corps",
  push: "Push",
  pull: "Pull",
  legs: "Legs",
} as const;
export type SessionKind = keyof typeof sessionLabels;
export type Split = "full" | "half" | "ppl";
export type Exercise = {
  id: string;
  name: string;
  primary: Muscle;
  secondary: Muscle[];
  region: string;
  equipment: Equipment[];
  pattern: "push" | "pull" | "legs" | "core";
  aliases?: string;
};

// Hand-authored source of truth. IDs are permanent: history refers to them.
export const exercises: Exercise[] = [
  {
    id: "bench-press",
    name: "Développé couché",
    primary: "chest",
    secondary: ["triceps", "shoulders"],
    region: "Pectoraux · ensemble",
    equipment: ["barbell", "dumbbell", "machine"],
    pattern: "push",
    aliases: "bench press pecs",
  },
  {
    id: "incline-press",
    name: "Développé incliné",
    primary: "chest",
    secondary: ["triceps", "shoulders"],
    region: "Pectoraux · haut",
    equipment: ["barbell", "dumbbell", "machine"],
    pattern: "push",
  },
  {
    id: "decline-press",
    name: "Développé décliné",
    primary: "chest",
    secondary: ["triceps", "shoulders"],
    region: "Pectoraux · bas",
    equipment: ["barbell", "dumbbell"],
    pattern: "push",
  },
  {
    id: "chest-fly",
    name: "Écartés pectoraux",
    primary: "chest",
    secondary: ["shoulders"],
    region: "Pectoraux · ensemble",
    equipment: ["cable", "dumbbell", "machine"],
    pattern: "push",
    aliases: "pec deck butterfly",
  },
  {
    id: "push-up",
    name: "Pompes",
    primary: "chest",
    secondary: ["triceps", "shoulders"],
    region: "Pectoraux · ensemble",
    equipment: ["bodyweight"],
    pattern: "push",
  },
  {
    id: "dips",
    name: "Dips",
    primary: "triceps",
    secondary: ["chest", "shoulders"],
    region: "Triceps · ensemble",
    equipment: ["bodyweight", "machine"],
    pattern: "push",
  },
  {
    id: "shoulder-press",
    name: "Développé épaules",
    primary: "shoulders",
    secondary: ["triceps"],
    region: "Épaules · avant",
    equipment: ["dumbbell", "barbell", "machine"],
    pattern: "push",
    aliases: "militaire overhead press",
  },
  {
    id: "lateral-raise",
    name: "Élévations latérales",
    primary: "shoulders",
    secondary: [],
    region: "Épaules · latéral",
    equipment: ["dumbbell", "cable", "machine"],
    pattern: "push",
  },
  {
    id: "reverse-fly",
    name: "Oiseau",
    primary: "shoulders",
    secondary: ["back"],
    region: "Épaules · arrière",
    equipment: ["dumbbell", "machine", "cable"],
    pattern: "pull",
    aliases: "reverse fly",
  },
  {
    id: "face-pull",
    name: "Face pull",
    primary: "shoulders",
    secondary: ["back"],
    region: "Épaules · arrière",
    equipment: ["cable"],
    pattern: "pull",
  },
  {
    id: "triceps-extension",
    name: "Extension triceps",
    primary: "triceps",
    secondary: [],
    region: "Triceps · ensemble",
    equipment: ["cable", "dumbbell"],
    pattern: "push",
    aliases: "pushdown",
  },
  {
    id: "skull-crusher",
    name: "Barre au front",
    primary: "triceps",
    secondary: [],
    region: "Triceps · ensemble",
    equipment: ["barbell", "dumbbell"],
    pattern: "push",
  },
  {
    id: "pull-up",
    name: "Tractions",
    primary: "back",
    secondary: ["biceps"],
    region: "Dos · grand dorsal",
    equipment: ["bodyweight", "machine"],
    pattern: "pull",
  },
  {
    id: "lat-pulldown",
    name: "Tirage vertical",
    primary: "back",
    secondary: ["biceps"],
    region: "Dos · grand dorsal",
    equipment: ["cable", "machine"],
    pattern: "pull",
  },
  {
    id: "row",
    name: "Rowing",
    primary: "back",
    secondary: ["biceps", "shoulders"],
    region: "Dos · milieu",
    equipment: ["barbell", "dumbbell", "machine"],
    pattern: "pull",
  },
  {
    id: "cable-row",
    name: "Tirage horizontal",
    primary: "back",
    secondary: ["biceps", "shoulders"],
    region: "Dos · milieu",
    equipment: ["cable", "machine"],
    pattern: "pull",
  },
  {
    id: "shrug",
    name: "Shrugs",
    primary: "back",
    secondary: [],
    region: "Dos · trapèzes",
    equipment: ["dumbbell", "barbell"],
    pattern: "pull",
  },
  {
    id: "curl",
    name: "Curl biceps",
    primary: "biceps",
    secondary: [],
    region: "Biceps · ensemble",
    equipment: ["dumbbell", "barbell", "cable", "machine"],
    pattern: "pull",
  },
  {
    id: "hammer-curl",
    name: "Curl marteau",
    primary: "biceps",
    secondary: [],
    region: "Bras · brachial",
    equipment: ["dumbbell", "cable"],
    pattern: "pull",
  },
  {
    id: "squat",
    name: "Squat",
    primary: "quads",
    secondary: ["glutes"],
    region: "Cuisses · avant",
    equipment: ["barbell", "dumbbell", "bodyweight", "machine"],
    pattern: "legs",
  },
  {
    id: "leg-press",
    name: "Presse à cuisses",
    primary: "quads",
    secondary: ["glutes"],
    region: "Cuisses · avant",
    equipment: ["machine"],
    pattern: "legs",
  },
  {
    id: "lunge",
    name: "Fentes",
    primary: "quads",
    secondary: ["glutes"],
    region: "Cuisses · avant",
    equipment: ["dumbbell", "barbell", "bodyweight"],
    pattern: "legs",
  },
  {
    id: "bulgarian-squat",
    name: "Squat bulgare",
    primary: "quads",
    secondary: ["glutes"],
    region: "Cuisses · avant",
    equipment: ["dumbbell", "bodyweight"],
    pattern: "legs",
  },
  {
    id: "leg-extension",
    name: "Leg extension",
    primary: "quads",
    secondary: [],
    region: "Cuisses · avant",
    equipment: ["machine"],
    pattern: "legs",
  },
  {
    id: "romanian-deadlift",
    name: "Soulevé de terre roumain",
    primary: "hamstrings",
    secondary: ["glutes", "back"],
    region: "Cuisses · arrière",
    equipment: ["barbell", "dumbbell"],
    pattern: "legs",
    aliases: "rdl jambes tendues",
  },
  {
    id: "leg-curl",
    name: "Leg curl",
    primary: "hamstrings",
    secondary: ["calves"],
    region: "Cuisses · arrière",
    equipment: ["machine"],
    pattern: "legs",
  },
  {
    id: "hip-thrust",
    name: "Hip thrust",
    primary: "glutes",
    secondary: ["hamstrings"],
    region: "Fessiers · ensemble",
    equipment: ["barbell", "machine", "bodyweight"],
    pattern: "legs",
  },
  {
    id: "hip-abduction",
    name: "Abduction de hanches",
    primary: "glutes",
    secondary: [],
    region: "Fessiers · côté",
    equipment: ["machine", "cable"],
    pattern: "legs",
  },
  {
    id: "calf-raise",
    name: "Extensions mollets",
    primary: "calves",
    secondary: [],
    region: "Mollets · ensemble",
    equipment: ["machine", "dumbbell", "bodyweight"],
    pattern: "legs",
  },
  {
    id: "crunch",
    name: "Crunch",
    primary: "abs",
    secondary: [],
    region: "Abdominaux · grand droit",
    equipment: ["bodyweight", "cable", "machine"],
    pattern: "core",
  },
  {
    id: "leg-raise",
    name: "Relevés de jambes",
    primary: "abs",
    secondary: [],
    region: "Abdominaux · grand droit",
    equipment: ["bodyweight"],
    pattern: "core",
  },
  {
    id: "russian-twist",
    name: "Russian twist",
    primary: "abs",
    secondary: [],
    region: "Abdominaux · obliques",
    equipment: ["bodyweight", "dumbbell"],
    pattern: "core",
  },
];

export function matchesSession(exercise: Exercise, kind: SessionKind): boolean {
  if (kind === "full" || kind === "half" || kind === "ppl" || exercise.pattern === "core")
    return true;
  if (kind === "upper") return exercise.pattern !== "legs";
  if (kind === "lower") return exercise.pattern === "legs";
  return exercise.pattern === kind;
}
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function searchExercises(
  kind: SessionKind,
  query = "",
  muscle = "",
  region = "",
  equipment = "",
) {
  const words = normalize(query).split(/\s+/);
  return exercises.filter(
    (ex) =>
      matchesSession(ex, kind) &&
      (!muscle || ex.primary === muscle || ex.secondary.includes(muscle as Muscle)) &&
      (!region || ex.region === region) &&
      (!equipment || ex.equipment.includes(equipment as Equipment)) &&
      words.every((word) =>
        normalize(
          `${ex.name} ${ex.aliases ?? ""} ${ex.region} ${muscleLabels[ex.primary]} ${ex.secondary.map((m) => muscleLabels[m]).join(" ")} ${ex.equipment.map((e) => equipmentLabels[e]).join(" ")}`,
        ).includes(word),
      ),
  );
}
