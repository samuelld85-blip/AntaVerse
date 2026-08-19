// Rouge ou noir — le joueur actif devine seul. S'il a juste, l'adversaire
// désigné boit ; s'il se trompe, c'est lui qui boit.

export type BinaryOption = "rouge" | "noir";

export function drawBinaryResult(slotValue: number): BinaryOption {
  return slotValue < 0.5 ? "rouge" : "noir";
}

export function resolveBinaryPrediction(
  result: BinaryOption,
  guess: BinaryOption,
): "correct" | "wrong" {
  return guess === result ? "correct" : "wrong";
}
