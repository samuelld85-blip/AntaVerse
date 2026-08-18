import { GAME_CONFIG, type DifficultyLevel } from "./config";

export function calculateTurnScore(
  correctAnswers: number,
  difficultyLevel: DifficultyLevel,
  bombTriggered = false,
): number {
  if (
    !Number.isInteger(correctAnswers) ||
    correctAnswers < 0 ||
    correctAnswers > GAME_CONFIG.answerCount
  ) {
    throw new RangeError(
      `correctAnswers must be an integer between 0 and ${GAME_CONFIG.answerCount}`,
    );
  }

  const coefficient = GAME_CONFIG.difficulties[difficultyLevel].coefficient;
  const correctAnswerPoints = Math.round(
    correctAnswers * GAME_CONFIG.basePointsPerAnswer * coefficient,
  );
  return correctAnswerPoints - (bombTriggered ? calculateBombPenalty(difficultyLevel) : 0);
}

export function calculateBombPenalty(difficultyLevel: DifficultyLevel): number {
  const coefficient = GAME_CONFIG.difficulties[difficultyLevel].coefficient;
  return Math.round(2 * GAME_CONFIG.basePointsPerAnswer * coefficient);
}

export function formatScore(score: number): string {
  return new Intl.NumberFormat("fr-FR").format(score);
}

export function formatSignedScore(score: number): string {
  return `${score > 0 ? "+" : ""}${formatScore(score)}`;
}
