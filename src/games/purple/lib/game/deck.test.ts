import { describe, expect, it } from "vitest";
import { buildFreshDeck, cardColor, createDeck, drawCards, RANKS, SUITS } from "./deck";

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b_79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

describe("buildFreshDeck", () => {
  it("contains exactly 52 unique cards, no jokers", () => {
    const deck = buildFreshDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => card.id)).size).toBe(52);
  });

  it("contains exactly 13 cards of each suit", () => {
    const deck = buildFreshDeck();
    for (const suit of SUITS) {
      expect(deck.filter((card) => card.suit === suit)).toHaveLength(13);
    }
  });

  it("contains all 13 ranks for each suit", () => {
    const deck = buildFreshDeck();
    for (const suit of SUITS) {
      const ranks = deck.filter((card) => card.suit === suit).map((card) => card.rank);
      expect(new Set(ranks)).toEqual(new Set(RANKS));
    }
  });

  it("contains 26 red and 26 black cards", () => {
    const deck = buildFreshDeck();
    expect(deck.filter((card) => card.color === "red")).toHaveLength(26);
    expect(deck.filter((card) => card.color === "black")).toHaveLength(26);
  });
});

describe("cardColor", () => {
  it("classifies hearts and diamonds as red", () => {
    expect(cardColor("hearts")).toBe("red");
    expect(cardColor("diamonds")).toBe("red");
  });
  it("classifies clubs and spades as black", () => {
    expect(cardColor("clubs")).toBe("black");
    expect(cardColor("spades")).toBe("black");
  });
});

describe("createDeck", () => {
  it("shuffles a valid 52-card deck", () => {
    const deck = createDeck(seededRandom(1));
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => card.id)).size).toBe(52);
  });
});

describe("drawCards", () => {
  it("draws the requested count without touching untouched cards", () => {
    const deck = createDeck(seededRandom(2));
    const { drawn, deck: remaining, reshuffled } = drawCards(deck, 5, seededRandom(3));
    expect(drawn).toHaveLength(5);
    expect(remaining).toHaveLength(47);
    expect(reshuffled).toBe(false);
    // The 5 drawn cards are exactly the first 5 of the original deck, in order.
    expect(drawn.map((c) => c.id)).toEqual(deck.slice(0, 5).map((c) => c.id));
    // No card appears both in the drawn hand and the remaining deck.
    const remainingIds = new Set(remaining.map((c) => c.id));
    for (const card of drawn) expect(remainingIds.has(card.id)).toBe(false);
  });

  it("never duplicates or loses cards within a single deck", () => {
    let deck = createDeck(seededRandom(4));
    const seen = new Set<string>();
    while (deck.length > 0) {
      const { drawn, deck: remaining, reshuffled } = drawCards(deck, 1, seededRandom(5));
      expect(reshuffled).toBe(false);
      for (const card of drawn) {
        expect(seen.has(card.id)).toBe(false);
        seen.add(card.id);
      }
      deck = remaining;
    }
    expect(seen.size).toBe(52);
  });

  it("reshuffles a brand new deck once the current one is exhausted", () => {
    const deck = createDeck(seededRandom(6)).slice(0, 2); // only 2 cards left
    const { drawn, deck: remaining, reshuffled } = drawCards(deck, 4, seededRandom(7));
    expect(drawn).toHaveLength(4);
    expect(reshuffled).toBe(true);
    // 2 cards came from the old (2-card) deck, 2 from a fresh 52-card deck,
    // leaving exactly 50 cards remaining.
    expect(remaining).toHaveLength(50);
    expect(new Set(remaining.map((c) => c.id)).size).toBe(50);
  });

  it("keeps the final cards of the old deck rather than discarding them", () => {
    const deck = createDeck(seededRandom(8)).slice(0, 2);
    const originalIds = deck.map((c) => c.id);
    const { drawn } = drawCards(deck, 4, seededRandom(9));
    expect(drawn.slice(0, 2).map((c) => c.id)).toEqual(originalIds);
  });

  it("can draw more than one full deck's worth across repeated reshuffles", () => {
    const deck: ReturnType<typeof createDeck> = [];
    const { drawn, deck: remaining, reshuffled } = drawCards(deck, 60, seededRandom(10));
    expect(drawn).toHaveLength(60);
    expect(reshuffled).toBe(true);
    expect(remaining).toHaveLength(52 - (60 - 52));
    expect(new Set(drawn.map((c) => c.id)).size).toBeLessThanOrEqual(52);
  });

  it("draws all of an empty deck by immediately reshuffling", () => {
    const { drawn, deck: remaining, reshuffled } = drawCards([], 3, seededRandom(11));
    expect(drawn).toHaveLength(3);
    expect(reshuffled).toBe(true);
    expect(remaining).toHaveLength(49);
  });
});
