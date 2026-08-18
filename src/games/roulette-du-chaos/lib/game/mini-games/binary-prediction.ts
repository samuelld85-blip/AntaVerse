// Face-à-face — both players privately guess ROUGE/NOIR, the app draws one
// result. Exactly one correct guess wins; if both or neither guessed right,
// the caller redraws with a new result until there's a single winner.

export type BinaryOption = "rouge" | "noir";

export function drawBinaryResult(slotValue: number): BinaryOption {
  return slotValue < 0.5 ? "rouge" : "noir";
}

export function resolveBinaryPrediction(
  result: BinaryOption,
  guessA: BinaryOption,
  guessB: BinaryOption,
): "a" | "b" | "replay" {
  const aCorrect = guessA === result;
  const bCorrect = guessB === result;
  if (aCorrect && !bCorrect) return "a";
  if (bCorrect && !aCorrect) return "b";
  return "replay";
}
