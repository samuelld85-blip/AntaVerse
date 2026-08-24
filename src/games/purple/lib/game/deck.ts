import { shuffle } from "@/lib/random";
import type { Card, CardColor, Rank, Suit } from "./types";

// A real, simulated 52-card deck: no jokers, cards genuinely removed as they
// are drawn. Purple never generates independent per-guess random results —
// every draw comes from whatever remains of the current shuffled deck.

export const SUITS: readonly Suit[] = ["hearts", "diamonds", "clubs", "spades"];
export const RANKS: readonly Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export function cardColor(suit: Suit): CardColor {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}

/** Builds one complete, unshuffled 52-card deck (13 ranks x 4 suits, no jokers). */
export function buildFreshDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ id: `${rank}-${suit}`, suit, rank, color: cardColor(suit) });
    }
  }
  return cards;
}

/** A fresh, shuffled 52-card deck ready to draw from. */
export function createDeck(random: () => number = Math.random): Card[] {
  return shuffle(buildFreshDeck(), random);
}

export interface DrawResult {
  /** Cards drawn, in draw order, across as many decks as it took to fill the request. */
  drawn: Card[];
  /** The deck remaining after the draw (always freshly (re)shuffled if it was exhausted mid-draw). */
  deck: Card[];
  /** Whether the deck ran out and a new 52-card deck was created during this draw. */
  reshuffled: boolean;
}

/**
 * Draws `count` cards from `deck`, transparently reshuffling in a brand new
 * 52-card deck whenever the current one runs out — even mid-request, so a
 * single multi-card guess can legitimately span two decks. Never discards
 * the final cards of the exhausted deck: every card drawn is returned.
 */
export function drawCards(
  deck: readonly Card[],
  count: number,
  random: () => number = Math.random,
): DrawResult {
  const drawn: Card[] = [];
  let remaining = [...deck];
  let reshuffled = false;

  while (drawn.length < count) {
    if (remaining.length === 0) {
      remaining = createDeck(random);
      reshuffled = true;
    }
    const needed = count - drawn.length;
    const take = Math.min(needed, remaining.length);
    drawn.push(...remaining.slice(0, take));
    remaining = remaining.slice(take);
  }

  return { drawn, deck: remaining, reshuffled };
}
