import { GAME_CONFIG, type DifficultyLevel } from "./config";

export function calculateFunSips(
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

  const effectiveCorrectAnswers = bombTriggered
    ? Math.max(0, correctAnswers - 2)
    : correctAnswers;

  if (difficultyLevel === 1) {
    if (effectiveCorrectAnswers === 9) return 3;
    if (effectiveCorrectAnswers >= 5) return 2;
    if (effectiveCorrectAnswers >= 3) return 1;
    return 0;
  }

  if (difficultyLevel === 2) {
    return Math.floor(effectiveCorrectAnswers / 2);
  }

  return effectiveCorrectAnswers;
}

export function formatSips(sips: number): string {
  return `${sips} gorgée${sips !== 1 ? "s" : ""}`;
}

export function formatSignedSips(sips: number): string {
  return `${sips > 0 ? "+" : ""}${formatSips(sips)}`;
}
