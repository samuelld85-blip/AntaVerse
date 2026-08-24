import { shuffle } from "@/lib/random";
import type { Card, CardValue, Suit } from "../lib/game/types";

export const SUITS: readonly Suit[] = ["♠", "♥", "♦", "♣"];
export const CARD_VALUES: readonly CardValue[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    CARD_VALUES.map((value) => ({
      id: `${value}-${suit}`,
      suit,
      value,
    })),
  );
}

export function shuffleDeck(random: () => number = Math.random): Card[] {
  return shuffle(createDeck(), random);
}
