import { GAME_CONFIG, SIP_REWARDS, type DifficultyLevel } from "./config";

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

  return SIP_REWARDS[difficultyLevel][effectiveCorrectAnswers] ?? 0;
}

export function formatSips(sips: number): string {
  return `${sips} gorgée${sips !== 1 ? "s" : ""}`;
}

export function formatSignedSips(sips: number): string {
  return `${sips > 0 ? "+" : ""}${formatSips(sips)}`;
}
