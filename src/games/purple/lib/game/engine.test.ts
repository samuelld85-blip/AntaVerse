import { describe, expect, it } from "vitest";
import type { Card, GameState } from "./types";
import {
  MIN_PROGRESS_TO_PASS,
  canPass,
  canPlayHigherLower,
  createGame,
  evaluateGuess,
  nextPlayerIndex,
  passTurn,
  submitGuess,
} from "./engine";

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

function card(rank: Card["rank"], suit: Card["suit"]): Card {
  const color = suit === "hearts" || suit === "diamonds" ? "red" : "black";
  return { id: `${rank}-${suit}`, rank, suit, color };
}

const RED_1 = card("7", "hearts");
const RED_2 = card("K", "diamonds");
const BLACK_1 = card("8", "spades");
const BLACK_2 = card("4", "clubs");

describe("createGame", () => {
  it("preserves entered player order and starts pile/progress at zero", () => {
    const game = createGame({ playerNames: ["Samuel", "Emma", "Lucas"] }, seededRandom(1), 1_000);
    expect(game.players.map((p) => p.name)).toEqual(["Samuel", "Emma", "Lucas"]);
    expect(game.pile).toBe(0);
    expect(game.progress).toBe(0);
    expect(game.deck).toHaveLength(52);
  });

  it("selects a random current player within range", () => {
    const game = createGame({ playerNames: ["A", "B", "C", "D"] }, seededRandom(2), 1_000);
    expect(game.currentPlayerIndex).toBeGreaterThanOrEqual(0);
    expect(game.currentPlayerIndex).toBeLessThan(4);
  });

  it("rejects fewer than two players", () => {
    expect(() => createGame({ playerNames: ["Solo"] })).toThrow();
  });

  it("falls back to a default name for a blank entry", () => {
    const game = createGame({ playerNames: ["Samuel", "   "] }, seededRandom(3));
    expect(game.players[1]?.name).toBe("Joueur 2");
  });
});

describe("evaluateGuess", () => {
  it("RED succeeds on a single red card and fails on black", () => {
    expect(evaluateGuess("red", [RED_1])).toBe("success");
    expect(evaluateGuess("red", [BLACK_1])).toBe("failure");
  });

  it("BLACK succeeds on a single black card and fails on red", () => {
    expect(evaluateGuess("black", [BLACK_1])).toBe("success");
    expect(evaluateGuess("black", [RED_1])).toBe("failure");
  });

  it("PURPLE succeeds with red+black in either order", () => {
    expect(evaluateGuess("purple", [RED_1, BLACK_1])).toBe("success");
    expect(evaluateGuess("purple", [BLACK_1, RED_1])).toBe("success");
  });

  it("PURPLE fails on red+red or black+black", () => {
    expect(evaluateGuess("purple", [RED_1, RED_2])).toBe("failure");
    expect(evaluateGuess("purple", [BLACK_1, BLACK_2])).toBe("failure");
  });

  it("DOUBLE PURPLE succeeds with exactly 2 red + 2 black regardless of order", () => {
    expect(evaluateGuess("doublePurple", [RED_1, BLACK_1, RED_2, BLACK_2])).toBe("success");
    expect(evaluateGuess("doublePurple", [BLACK_1, BLACK_2, RED_1, RED_2])).toBe("success");
  });

  it("DOUBLE PURPLE fails for any other color distribution", () => {
    expect(evaluateGuess("doublePurple", [RED_1, RED_2, card("2", "hearts"), BLACK_1])).toBe(
      "failure",
    );
    expect(evaluateGuess("doublePurple", [RED_1, BLACK_1, BLACK_2, card("9", "clubs")])).toBe(
      "failure",
    );
  });

  it("SKUBRUM succeeds with 3 red or 3 black", () => {
    expect(evaluateGuess("skubrum", [RED_1, RED_2, card("2", "hearts")])).toBe("success");
    expect(evaluateGuess("skubrum", [BLACK_1, BLACK_2, card("9", "clubs")])).toBe("success");
  });

  it("SKUBRUM fails with mixed colors", () => {
    expect(evaluateGuess("skubrum", [RED_1, RED_2, BLACK_1])).toBe("failure");
    expect(evaluateGuess("skubrum", [RED_1, BLACK_1, BLACK_2])).toBe("failure");
  });

  it("SANDWICH succeeds only with alternating colors", () => {
    expect(evaluateGuess("sandwich", [RED_1, BLACK_1, RED_2])).toBe("success");
    expect(evaluateGuess("sandwich", [BLACK_1, RED_1, BLACK_2])).toBe("success");
  });

  it("SANDWICH fails when the colors are not alternating", () => {
    expect(evaluateGuess("sandwich", [RED_1, RED_2, BLACK_1])).toBe("failure");
    expect(evaluateGuess("sandwich", [BLACK_1, BLACK_2, RED_1])).toBe("failure");
    expect(evaluateGuess("sandwich", [RED_1, BLACK_1, BLACK_2])).toBe("failure");
    expect(evaluateGuess("sandwich", [BLACK_1, RED_1, RED_2])).toBe("failure");
    expect(evaluateGuess("sandwich", [RED_1, RED_2, card("2", "hearts")])).toBe("failure");
    expect(evaluateGuess("sandwich", [BLACK_1, BLACK_2, card("9", "clubs")])).toBe("failure");
  });

  it("HIGHER succeeds when drawn card > reference card", () => {
    const ref = card("9", "hearts");
    expect(evaluateGuess("higher", [card("10", "diamonds")], ref)).toBe("success");
    expect(evaluateGuess("higher", [card("K", "spades")], ref)).toBe("success");
  });

  it("HIGHER fails when drawn card <= reference card", () => {
    const ref = card("9", "hearts");
    expect(evaluateGuess("higher", [card("8", "clubs")], ref)).toBe("failure");
    expect(evaluateGuess("higher", [card("9", "diamonds")], ref)).toBe("failure");
  });

  it("LOWER succeeds when drawn card < reference card", () => {
    const ref = card("9", "hearts");
    expect(evaluateGuess("lower", [card("8", "diamonds")], ref)).toBe("success");
    expect(evaluateGuess("lower", [card("A", "spades")], ref)).toBe("success");
  });

  it("LOWER fails when drawn card >= reference card", () => {
    const ref = card("9", "hearts");
    expect(evaluateGuess("lower", [card("10", "clubs")], ref)).toBe("failure");
    expect(evaluateGuess("lower", [card("9", "diamonds")], ref)).toBe("failure");
  });
});

describe("submitGuess", () => {
  function makeGame(deck: Card[], overrides: Partial<GameState> = {}): GameState {
    const base = createGame({ playerNames: ["Samuel", "Emma"] }, seededRandom(1), 1_000);
    return { ...base, deck, currentPlayerIndex: 0, ...overrides };
  }

  it("a successful single-color guess adds 1 to pile and progress", () => {
    const game = makeGame([RED_1, BLACK_1]);
    const next = submitGuess(game, "red", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(1);
    expect(next.progress).toBe(1);
    expect(next.deck).toHaveLength(1);
  });

  it("a successful PURPLE adds 2 to pile and progress", () => {
    const game = makeGame([RED_1, BLACK_1], { pile: 5, progress: 1 });
    const next = submitGuess(game, "purple", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(7);
    expect(next.progress).toBe(3);
  });

  it("a successful DOUBLE PURPLE adds 4 to pile and progress", () => {
    const game = makeGame([RED_1, BLACK_1, RED_2, BLACK_2]);
    const next = submitGuess(game, "doublePurple", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(4);
    expect(next.progress).toBe(4);
  });

  it("a successful SKUBRUM adds 3 to pile and progress", () => {
    const game = makeGame([RED_1, RED_2, card("2", "hearts")]);
    const next = submitGuess(game, "skubrum", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(3);
    expect(next.progress).toBe(3);
  });

  it("a successful SANDWICH adds 3 to pile and progress", () => {
    const game = makeGame([RED_1, BLACK_1, RED_2]);
    const next = submitGuess(game, "sandwich", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(3);
    expect(next.progress).toBe(3);
  });

  it("consumes drawn cards from the deck even on failure", () => {
    const game = makeGame([RED_1, RED_2], { pile: 12 });
    const next = submitGuess(game, "purple", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("failure");
    expect(next.deck).toHaveLength(0);
    expect(next.lastGuess?.cards).toHaveLength(2);
  });

  it("failure makes the current player drink the full pre-failure pile plus the cards they played", () => {
    const game = makeGame([RED_1, RED_2], { pile: 12, progress: 2 });
    const next = submitGuess(game, "purple", seededRandom(1));
    expect(next.lastGuess?.sipsDrunk).toBe(14); // 12 (pre-pile) + 2 (purple cards)
    expect(next.pile).toBe(0);
    expect(next.progress).toBe(0);
  });

  it("failure does NOT advance to the next player", () => {
    const game = makeGame([RED_1, RED_2], { pile: 10, currentPlayerIndex: 0 });
    const next = submitGuess(game, "purple", seededRandom(1));
    expect(next.currentPlayerIndex).toBe(0);
  });

  it("the same player can immediately continue after a failure", () => {
    const game = makeGame([RED_1, RED_2, BLACK_1], { pile: 10 });
    const afterFailure = submitGuess(game, "purple", seededRandom(1));
    expect(afterFailure.currentPlayerIndex).toBe(0);
    const afterNextGuess = submitGuess(afterFailure, "red", seededRandom(1));
    expect(afterNextGuess.lastGuess?.playerId).toBe(game.players[0]?.id);
  });

  it("crosses a deck boundary mid-guess: PURPLE with only 1 card left", () => {
    const game = makeGame([RED_1]);
    const next = submitGuess(game, "purple", seededRandom(1));
    expect(next.lastGuess?.reshuffled).toBe(true);
    expect(next.lastGuess?.cards).toHaveLength(2);
    expect(next.deck).toHaveLength(51);
  });

  it("crosses a deck boundary mid-guess: SKUBRUM with only 2 cards left", () => {
    const game = makeGame([RED_1, RED_2]);
    const next = submitGuess(game, "skubrum", seededRandom(1));
    expect(next.lastGuess?.reshuffled).toBe(true);
    expect(next.lastGuess?.cards).toHaveLength(3);
    expect(next.deck).toHaveLength(51);
  });

  it("crosses a deck boundary mid-guess: DOUBLE PURPLE with only 2 cards left leaves exactly 50", () => {
    const game = makeGame([RED_1, BLACK_1]);
    const next = submitGuess(game, "doublePurple", seededRandom(1));
    expect(next.lastGuess?.reshuffled).toBe(true);
    expect(next.lastGuess?.cards).toHaveLength(4);
    expect(next.deck).toHaveLength(50);
  });
});

describe("pass eligibility", () => {
  function makeGame(progress: number): GameState {
    const base = createGame({ playerNames: ["Samuel", "Emma", "Lucas"] }, seededRandom(1));
    return { ...base, progress, currentPlayerIndex: 0 };
  }

  it("cannot pass below the 3-card threshold", () => {
    expect(canPass(makeGame(0))).toBe(false);
    expect(canPass(makeGame(2))).toBe(false);
    expect(() => passTurn(makeGame(2))).toThrow();
  });

  it("can pass at exactly the threshold", () => {
    expect(canPass(makeGame(MIN_PROGRESS_TO_PASS))).toBe(true);
  });

  it("can pass above the threshold", () => {
    expect(canPass(makeGame(4))).toBe(true);
  });

  it("voluntary pass preserves the global pile and resets personal progress", () => {
    const game = { ...makeGame(4), pile: 14 };
    const next = passTurn(game);
    expect(next.pile).toBe(14);
    expect(next.progress).toBe(0);
  });

  it("voluntary pass advances to the next player in circular order", () => {
    const game = makeGame(3);
    const next = passTurn(game);
    expect(next.currentPlayerIndex).toBe(nextPlayerIndex(0, 3));
  });
});

describe("nextPlayerIndex", () => {
  it("wraps around circularly", () => {
    expect(nextPlayerIndex(0, 4)).toBe(1);
    expect(nextPlayerIndex(3, 4)).toBe(0);
    expect(nextPlayerIndex(0, 1)).toBe(0);
  });
});

describe("higher/lower mechanics", () => {
  function makeGame(deck: Card[], overrides: Partial<GameState> = {}): GameState {
    const base = createGame({ playerNames: ["Samuel", "Emma"] }, seededRandom(1), 1_000);
    return { ...base, deck, currentPlayerIndex: 0, ...overrides };
  }

  it("higher/lower is unavailable at the start of a turn", () => {
    const game = makeGame([RED_1]);
    expect(canPlayHigherLower(game)).toBe(false);
  });

  it("higher becomes available after the first card is drawn", () => {
    const game = makeGame([card("9", "hearts"), card("10", "diamonds")]);
    const after9 = submitGuess(game, "red", seededRandom(1));
    expect(canPlayHigherLower(after9)).toBe(true);
    expect(after9.lastCard?.rank).toBe("9");
  });

  it("HIGHER succeeds when new card > reference (9 → 10)", () => {
    const ref9 = card("9", "hearts");
    const draw10 = card("10", "diamonds");
    const game = makeGame([draw10], { lastCard: ref9 });
    const next = submitGuess(game, "higher", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(1);
    expect(next.progress).toBe(1);
  });

  it("HIGHER fails when new card <= reference (9 → 8)", () => {
    const ref9 = card("9", "hearts");
    const draw8 = card("8", "diamonds");
    const game = makeGame([draw8], { lastCard: ref9, pile: 10, progress: 2 });
    const next = submitGuess(game, "higher", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("failure");
    expect(next.lastGuess?.sipsDrunk).toBe(11); // 10 (pre-pile) + 1 (higher card)
    expect(next.pile).toBe(0);
    expect(next.progress).toBe(0);
    expect(next.lastCard).toBeUndefined();
  });

  it("HIGHER fails on equal cards (9 → 9)", () => {
    const ref9 = card("9", "hearts");
    const draw9 = card("9", "diamonds");
    const game = makeGame([draw9], { lastCard: ref9, pile: 5, progress: 2 });
    const next = submitGuess(game, "higher", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("failure");
    expect(next.lastGuess?.sipsDrunk).toBe(6); // 5 (pre-pile) + 1 (higher card)
    expect(next.pile).toBe(0);
    expect(next.progress).toBe(0);
  });

  it("LOWER succeeds when new card < reference (9 → 8)", () => {
    const ref9 = card("9", "hearts");
    const draw8 = card("8", "diamonds");
    const game = makeGame([draw8], { lastCard: ref9 });
    const next = submitGuess(game, "lower", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("success");
    expect(next.pile).toBe(1);
    expect(next.progress).toBe(1);
  });

  it("LOWER fails when new card >= reference (9 → 10)", () => {
    const ref9 = card("9", "hearts");
    const draw10 = card("10", "diamonds");
    const game = makeGame([draw10], { lastCard: ref9, pile: 8, progress: 2 });
    const next = submitGuess(game, "lower", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("failure");
    expect(next.lastGuess?.sipsDrunk).toBe(9); // 8 (pre-pile) + 1 (lower card)
    expect(next.pile).toBe(0);
    expect(next.progress).toBe(0);
    expect(next.lastCard).toBeUndefined();
  });

  it("LOWER fails on equal cards (9 → 9)", () => {
    const ref9 = card("9", "hearts");
    const draw9 = card("9", "diamonds");
    const game = makeGame([draw9], { lastCard: ref9, pile: 3, progress: 2 });
    const next = submitGuess(game, "lower", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("failure");
    expect(next.lastGuess?.sipsDrunk).toBe(4); // 3 (pre-pile) + 1 (lower card)
    expect(next.pile).toBe(0);
    expect(next.progress).toBe(0);
  });

  it("successful higher/lower updates lastCard for chaining", () => {
    const ref9 = card("9", "hearts");
    const draw10 = card("10", "diamonds");
    const draw8 = card("8", "clubs");
    const game = makeGame([draw10, draw8], { lastCard: ref9 });
    const after10 = submitGuess(game, "higher", seededRandom(1));
    expect(after10.lastCard?.rank).toBe("10");
    expect(after10.lastGuess?.outcome).toBe("success");
    const after8 = submitGuess(after10, "lower", seededRandom(1));
    expect(after8.lastCard?.rank).toBe("8");
    expect(after8.lastGuess?.outcome).toBe("success");
    expect(after8.pile).toBe(2);
    expect(after8.progress).toBe(2);
  });

  it("passing the turn clears lastCard", () => {
    const game = makeGame([card("9", "hearts")], { progress: 3, lastCard: card("8", "hearts") });
    const after = passTurn(game);
    expect(canPlayHigherLower(after)).toBe(false);
    expect(after.lastCard).toBeUndefined();
  });

  it("failed higher/lower clears lastCard", () => {
    const ref9 = card("9", "hearts");
    const draw7 = card("7", "clubs");
    const game = makeGame([draw7], { lastCard: ref9, pile: 5, progress: 2 });
    const next = submitGuess(game, "higher", seededRandom(1));
    expect(next.lastGuess?.outcome).toBe("failure");
    expect(canPlayHigherLower(next)).toBe(false);
  });

  it("normal guess action sets lastCard", () => {
    const card9 = card("9", "hearts");
    const card8 = card("8", "clubs");
    const game = makeGame([card9, card8]);
    const after9 = submitGuess(game, "red", seededRandom(1));
    expect(after9.lastCard?.rank).toBe("9");
    expect(after9.lastGuess?.outcome).toBe("success");
    const after8 = submitGuess(after9, "black", seededRandom(1));
    expect(after8.lastCard?.rank).toBe("8");
    expect(after8.lastGuess?.outcome).toBe("success");
  });

  it("multiple cards in a single guess uses the last drawn card", () => {
    const game = makeGame([RED_1, BLACK_1, RED_2]);
    const afterPurple = submitGuess(game, "purple", seededRandom(1));
    expect(afterPurple.lastGuess?.cards).toHaveLength(2);
    expect(afterPurple.lastCard?.rank).toBe(afterPurple.lastGuess?.cards[1]?.rank);
  });
});
