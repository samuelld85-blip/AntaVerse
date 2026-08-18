import type { DiceRoll } from "./types";

/** Rolls 2d6. Accepts an injectable `random` so callers can seed it deterministically in tests. */
export function rollDice(random: () => number = Math.random): DiceRoll {
  return { a: rollDie(random), b: rollDie(random) };
}

function rollDie(random: () => number): number {
  return Math.floor(random() * 6) + 1;
}
