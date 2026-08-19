import type { Card, CardValue, Suit } from "../lib/game/types";

export const SUITS: readonly Suit[] = ["♠", "♥", "♦", "♣"];
export const VALUES: readonly CardValue[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];

/** Creates a complete ordered 52-card deck (no Jokers). */
export function createDeck(): Card[] {
  return SUITS.flatMap((suit) => VALUES.map((value) => ({ suit, value })));
}

/** Fisher-Yates shuffle — mutates a copy, leaving the original intact. */
export function shuffleDeck(deck: Card[], random: () => number = Math.random): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = d[i]!;
    d[i] = d[j]!;
    d[j] = tmp;
  }
  return d;
}
