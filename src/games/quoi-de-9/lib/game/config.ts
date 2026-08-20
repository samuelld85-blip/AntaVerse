export const GAME_CONFIG = {
  defaultRoundsPerTeam: 5,
  minRoundsPerTeam: 1,
  maxRoundsPerTeam: 10,
  defaultTurnDurationSeconds: 60,
  minTurnDurationSeconds: 30,
  maxTurnDurationSeconds: 180,
  warningSeconds: 15,
  criticalSeconds: 5,
  answerCount: 9,
  basePointsPerAnswer: 100,
  difficulties: {
    1: {
      label: "Facile",
      key: "easy",
      coefficient: 1,
      eyebrow: "Pour se chauffer",
      accent: "lime",
    },
    2: {
      label: "Moyen",
      key: "medium",
      coefficient: 1.5,
      eyebrow: "Le bon équilibre",
      accent: "violet",
    },
    3: {
      label: "Difficile",
      key: "hard",
      coefficient: 3,
      eyebrow: "Tout peut basculer",
      accent: "coral",
    },
  },
} as const;

export type DifficultyLevel = 1 | 2 | 3;

export const DIFFICULTY_LABELS = {
  1: "Facile",
  2: "Moyen",
  3: "Difficile",
} as const satisfies Record<DifficultyLevel, string>;

export type DifficultyLabel = (typeof DIFFICULTY_LABELS)[DifficultyLevel];

export const DIFFICULTY_LEVELS = [1, 2, 3] as const satisfies readonly DifficultyLevel[];
