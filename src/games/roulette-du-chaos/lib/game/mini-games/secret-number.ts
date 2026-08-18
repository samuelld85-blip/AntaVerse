// Nombre secret — each player secretly picks a number between 1 and 10, the
// app draws a target, closest wins (tie → redraw, handled by the caller).

export const SECRET_NUMBER_MIN = 1;
export const SECRET_NUMBER_MAX = 10;

export function drawSecretTarget(
  slotValue: number,
  min: number = SECRET_NUMBER_MIN,
  max: number = SECRET_NUMBER_MAX,
): number {
  return min + Math.floor(slotValue * (max - min + 1));
}

export function resolveSecretNumber(
  target: number,
  guessA: number,
  guessB: number,
): "a" | "b" | "tie" {
  const distanceA = Math.abs(guessA - target);
  const distanceB = Math.abs(guessB - target);
  if (distanceA === distanceB) return "tie";
  return distanceA < distanceB ? "a" : "b";
}
