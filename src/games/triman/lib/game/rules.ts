// The Triman rule engine. Pure and deterministic: given dice, the player
// list, whose turn it is, and who the Triman is, it returns every triggered
// effect. Rules never suppress one another — a roll can (and often does)
// trigger several at once, and the caller is responsible for turn
// continuation (see engine.ts), not this module.

import { nextPlayerIndex, previousPlayerIndex } from "./players";
import type { DiceRoll, Player, RollEffect } from "./types";

/** At least one die is 3, or the dice are 1+2 in either order. */
export function isTrimanRoll(dice: DiceRoll): boolean {
  return dice.a === 3 || dice.b === 3 || dice.a + dice.b === 3;
}

export interface EvaluateActiveRollInput {
  dice: DiceRoll;
  players: readonly Player[];
  currentPlayerIndex: number;
  trimanPlayerId: string;
}

/** Evaluates a roll during ACTIVE_TRIMAN against the full rule set. */
export function evaluateActiveRoll({
  dice,
  players,
  currentPlayerIndex,
  trimanPlayerId,
}: EvaluateActiveRollInput): RollEffect[] {
  const effects: RollEffect[] = [];
  const current = players[currentPlayerIndex]!;
  const sum = dice.a + dice.b;
  const isDouble = dice.a === dice.b;
  const hasSix = dice.a === 6 || dice.b === 6;
  // When exactly one die is 6, the other die is the non-six value.
  const otherValue = dice.a === 6 ? dice.b : dice.a;

  if (isTrimanRoll(dice)) {
    const triman = players.find((player) => player.id === trimanPlayerId);
    if (triman) {
      effects.push({
        kind: "triman",
        headline: "Triman",
        detail: `${triman.name} boit 1 gorgée`,
        isReflex: false,
      });
    }
  }

  // 6+1 and 6+3 coincidentally also sum to 7 and 9, but the spec treats the
  // 6+X reflex family as its own category: its worked example for 3+6 lists
  // only the Triman and FIST effects, not a coincidental "9". Only the exact
  // 6+1 / 6+3 combination is excluded — an ordinary 7 or 9 (e.g. 3+4, 4+5)
  // still triggers its sum rule normally.
  const isSixOne = hasSix && !isDouble && otherValue === 1;
  const isSixThree = hasSix && !isDouble && otherValue === 3;

  if (sum === 7 && !isSixOne) {
    const previous = players[previousPlayerIndex(currentPlayerIndex, players.length)]!;
    effects.push({
      kind: "sum-seven",
      headline: "7 : Le joueur précédent boit",
      detail: `${previous.name} boit 1 gorgée`,
      isReflex: false,
    });
  }

  if (sum === 9 && !isSixThree) {
    effects.push({
      kind: "sum-nine",
      headline: "9 : Le joueur actuel boit",
      detail: `${current.name} boit 1 gorgée`,
      isReflex: false,
    });
  }

  if (sum === 11) {
    const next = players[nextPlayerIndex(currentPlayerIndex, players.length)]!;
    effects.push({
      kind: "sum-eleven",
      headline: "11 : Le joueur suivant boit",
      detail: `${next.name} boit 1 gorgée`,
      isReflex: false,
    });
  }

  if (isSixOne) {
    effects.push({
      kind: "reflex-finger-1",
      headline: "1 doigt !",
      detail: "Tout le monde pose un doigt sur la table. Le dernier boit 1 gorgée.",
      isReflex: true,
    });
  }

  if (hasSix && !isDouble && otherValue === 2) {
    effects.push({
      kind: "reflex-finger-2",
      headline: "2 doigts !",
      detail: "Tout le monde pose deux doigts sur la table. Le dernier boit 2 gorgées.",
      isReflex: true,
    });
  }

  if (isSixThree) {
    effects.push({
      kind: "reflex-fist",
      headline: "Poing !",
      detail: "Tout le monde pose le poing sur la table. Le dernier boit 3 gorgées.",
      isReflex: true,
    });
  }

  if (isDouble) {
    effects.push({
      kind: "double",
      headline: `Double ${dice.a}`,
      detail: `${current.name} boit ${dice.a} gorgée${dice.a > 1 ? "s" : ""} et en distribue ${dice.a}`,
      isReflex: false,
    });
  }

  return effects;
}
