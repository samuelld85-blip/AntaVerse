// Estimation éclair — both players estimate the answer to a numerical
// question; closest to the real answer wins (tie → a new question).

export function pickQuestionIndex(slotValue: number, count: number): number {
  return Math.min(count - 1, Math.floor(slotValue * count));
}

export function resolveEstimation(
  correctAnswer: number,
  guessA: number,
  guessB: number,
): "a" | "b" | "tie" {
  const distanceA = Math.abs(guessA - correctAnswer);
  const distanceB = Math.abs(guessB - correctAnswer);
  if (distanceA === distanceB) return "tie";
  return distanceA < distanceB ? "a" : "b";
}
