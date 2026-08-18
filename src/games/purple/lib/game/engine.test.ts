import { describe, expect, it } from "vitest";
import type { Card, GameState } from "./types";
import {
  MIN_PROGRESS_TO_PASS,
  canPass,
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

  it("SKUBRUM succeeds with 2 red + 1 black or 1 red + 2 black", () => {
    expect(evaluateGuess("skubrum", [RED_1, RED_2, BLACK_1])).toBe("success");
    expect(evaluateGuess("skubrum", [RED_1, BLACK_1, BLACK_2])).toBe("success");
  });

  it("SKUBRUM fails with 3 red or 3 black", () => {
    expect(evaluateGuess("skubrum", [RED_1, RED_2, card("2", "hearts")])).toBe("failure");
    expect(evaluateGuess("skubrum", [BLACK_1, BLACK_2, card("9", "clubs")])).toBe("failure");
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
    const game = makeGame([RED_1, RED_2, BLACK_1]);
    const next = submitGuess(game, "skubrum", seededRandom(1));
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

  it("failure makes the current player drink the full pre-failure pile and resets it", () => {
    const game = makeGame([RED_1, RED_2], { pile: 12, progress: 2 });
    const next = submitGuess(game, "purple", seededRandom(1));
    expect(next.lastGuess?.sipsDrunk).toBe(12);
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
    const game = makeGame([RED_1, BLACK_1]);
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
