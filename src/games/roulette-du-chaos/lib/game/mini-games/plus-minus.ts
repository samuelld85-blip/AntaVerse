// Plus ou Moins — a starting number is shown; each player secretly guesses
// whether the next draw will be higher or lower. Same guess: both play
// together against the app (right → nobody loses, wrong → both lose).
// Different guesses: whoever guessed right wins.

export type PlusMinusGuess = "plus" | "moins";
export type PlusMinusOutcome = "aWins" | "bWins" | "bothCorrect" | "bothWrong";

export const PLUS_MINUS_MIN = 1;
export const PLUS_MINUS_MAX = 13;

/** Draws a value in [min,max], redrawing (deterministically, from the same slot) if it would equal `start`. */
export function drawPlusMinusValue(
  start: number,
  slotValue: number,
  min: number = PLUS_MINUS_MIN,
  max: number = PLUS_MINUS_MAX,
): number {
  const range = max - min + 1;
  const value = min + Math.floor(slotValue * range);
  if (value !== start) return value;
  return value === max ? min : value + 1;
}

export function resolvePlusMinus(
  start: number,
  drawn: number,
  guessA: PlusMinusGuess,
  guessB: PlusMinusGuess,
): PlusMinusOutcome {
  const actual: PlusMinusGuess = drawn > start ? "plus" : "moins";
  const aCorrect = guessA === actual;

  if (guessA === guessB) return aCorrect ? "bothCorrect" : "bothWrong";
  return aCorrect ? "aWins" : "bWins";
}
