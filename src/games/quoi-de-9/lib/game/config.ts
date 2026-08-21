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
      label: "Classique",
      abbr: "Cl",
      key: "classique",
      coefficient: 1,
      eyebrow: "Le classique du jeu",
      accent: "lime",
    },
    2: {
      label: "Challenge",
      abbr: "Ch",
      key: "challenge",
      coefficient: 1.35,
      eyebrow: "Plus corsé, plus payant",
      accent: "coral",
    },
  },
} as const;

export type DifficultyLevel = 1 | 2;

export const DIFFICULTY_LABELS = {
  1: "Classique",
  2: "Challenge",
} as const satisfies Record<DifficultyLevel, string>;

export type DifficultyLabel = (typeof DIFFICULTY_LABELS)[DifficultyLevel];

export const DIFFICULTY_LEVELS = [1, 2] as const satisfies readonly DifficultyLevel[];

// Points per correct answer, indexed by difficulty level.
export const POINTS_PER_ANSWER: Record<DifficultyLevel, number> = {
  1: 100,
  2: 135,
};

// Sip rewards per correct-answer count for Fun mode, indexed by difficulty level.
// Indexed as SIP_REWARDS[level][correctAnswers] (correctAnswers: 0–9).
export const SIP_REWARDS: Record<DifficultyLevel, readonly number[]> = {
  1: [0, 0, 0, 1, 1, 2, 2, 2, 3, 3],
  2: [0, 0, 1, 1, 2, 2, 3, 3, 4, 5],
};
