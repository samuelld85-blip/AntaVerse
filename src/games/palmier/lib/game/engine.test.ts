import { describe, expect, it } from "vitest";
import {
  completeCollapse,
  completeTurn,
  createGame,
  drawCard,
  getActivePlayer,
  MAX_PLAYERS,
  MIN_PLAYERS,
  palmStageForKings,
  replayGame,
} from "./engine";
import type { GameState } from "./types";

const NAMES = ["Amina", "Bilal", "Chloé"];

function seededRandom(seed = 42): () => number {
  let s = seed === 0 ? 1 : seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe("createGame", () => {
  it("rejects too few players", () => {
    expect(() => createGame({ playerNames: ["A", "B"] })).toThrow();
  });

  it("rejects too many players", () => {
    const names = Array.from({ length: MAX_PLAYERS + 1 }, (_, i) => `P${i}`);
    expect(() => createGame({ playerNames: names })).toThrow();
  });

  it("rejects a blank name", () => {
    expect(() => createGame({ playerNames: ["Amina", "  ", "Chloé"] })).toThrow();
  });

  it("MIN_PLAYERS is 3, MAX_PLAYERS is 10", () => {
    expect(MIN_PLAYERS).toBe(3);
    expect(MAX_PLAYERS).toBe(10);
  });

  it("creates a fresh game with 52 cards and idle phase", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    expect(game.phase).toBe("idle");
    expect(game.remainingDeck).toHaveLength(52);
    expect(game.currentCard).toBeNull();
    expect(game.kingsDrawn).toBe(0);
    expect(game.maitrePouce).toBeNull();
    expect(game.maitreQuestions).toBeNull();
    expect(game.schemaVersion).toBe(2);
  });

  it("deck contains exactly 52 unique cards", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const ids = game.remainingDeck.map((c) => `${c.value}${c.suit}`);
    expect(new Set(ids).size).toBe(52);
  });
});

describe("drawCard", () => {
  it("only fires from idle", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const drawn = drawCard(game);
    const redraw = drawCard(drawn); // phase is now "reveal", not idle
    expect(redraw).toBe(drawn);
  });

  it("draws one card and reduces the deck by 1", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const drawn = drawCard(game);
    expect(drawn.remainingDeck).toHaveLength(51);
    expect(drawn.currentCard).not.toBeNull();
    expect(drawn.phase).toBe("reveal");
  });

  it("sets maitrePouce when a 5 is drawn", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const fiveGame: GameState = {
      ...game,
      remainingDeck: [{ suit: "♥", value: "5" }, ...game.remainingDeck.slice(1)],
    };
    const drawn = drawCard(fiveGame);
    expect(drawn.maitrePouce).toBe(getActivePlayer(fiveGame).name);
  });

  it("sets maitreQuestions when a Q is drawn", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const qGame: GameState = {
      ...game,
      remainingDeck: [{ suit: "♣", value: "Q" }, ...game.remainingDeck.slice(1)],
    };
    const drawn = drawCard(qGame);
    expect(drawn.maitreQuestions).toBe(getActivePlayer(qGame).name);
  });

  it("increments kingsDrawn and stays in reveal for kings 1–3", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    for (let k = 1; k <= 3; k++) {
      const kGame: GameState = {
        ...game,
        kingsDrawn: k - 1,
        remainingDeck: [{ suit: "♠", value: "K" }, ...game.remainingDeck.slice(1)],
      };
      const drawn = drawCard(kGame);
      expect(drawn.kingsDrawn).toBe(k);
      expect(drawn.phase).toBe("reveal");
    }
  });

  it("triggers collapse phase when the 4th King is drawn", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const kGame: GameState = {
      ...game,
      kingsDrawn: 3,
      remainingDeck: [{ suit: "♦", value: "K" }, ...game.remainingDeck.slice(1)],
    };
    const drawn = drawCard(kGame);
    expect(drawn.kingsDrawn).toBe(4);
    expect(drawn.phase).toBe("collapse");
  });
});

describe("completeTurn", () => {
  it("only fires from reveal", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    expect(completeTurn(game)).toBe(game); // idle — no-op
  });

  it("advances to the next player and returns to idle", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const drawn = drawCard(game);
    const completed = completeTurn(drawn);
    expect(completed.phase).toBe("idle");
    expect(completed.currentCard).toBeNull();
    expect(completed.activePlayerIndex).toBe(
      (game.activePlayerIndex + 1) % NAMES.length,
    );
  });

  it("moves to end phase when the deck runs out", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const lastCardGame: GameState = {
      ...game,
      phase: "reveal",
      remainingDeck: [], // already empty after the draw
      currentCard: { suit: "♠", value: "2" },
    };
    const ended = completeTurn(lastCardGame);
    expect(ended.phase).toBe("end");
  });
});

describe("completeCollapse", () => {
  it("only fires from collapse phase", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    expect(completeCollapse(game)).toBe(game);
  });

  it("replants (back to idle), advances player, clears currentCard", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const collapseGame: GameState = {
      ...game,
      phase: "collapse",
      kingsDrawn: 4,
      currentCard: { suit: "♠", value: "K" },
      remainingDeck: [{ suit: "♣", value: "2" }], // still cards left
    };
    const replanted = completeCollapse(collapseGame);
    expect(replanted.phase).toBe("idle");
    expect(replanted.currentCard).toBeNull();
    expect(replanted.activePlayerIndex).toBe(
      (game.activePlayerIndex + 1) % NAMES.length,
    );
    expect(replanted.kingsDrawn).toBe(4); // stays at 4 — no more king collapses
  });

  it("moves to end when deck is also empty after collapse", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const collapseGame: GameState = {
      ...game,
      phase: "collapse",
      kingsDrawn: 4,
      currentCard: { suit: "♠", value: "K" },
      remainingDeck: [],
    };
    const ended = completeCollapse(collapseGame);
    expect(ended.phase).toBe("end");
  });
});

describe("palmStageForKings", () => {
  it("maps king counts to correct visual stages", () => {
    expect(palmStageForKings(0)).toBe("stable");
    expect(palmStageForKings(1)).toBe("shaky");
    expect(palmStageForKings(2)).toBe("unstable");
    expect(palmStageForKings(3)).toBe("critical");
    expect(palmStageForKings(4)).toBe("critical");
  });
});

describe("replayGame", () => {
  it("keeps the same roster but resets everything else", () => {
    const game = createGame({ playerNames: NAMES }, seededRandom());
    const drawn = drawCard(game);
    const restarted = replayGame(drawn, seededRandom(1));
    expect(restarted.players.map((p) => p.name)).toEqual(NAMES);
    expect(restarted.phase).toBe("idle");
    expect(restarted.remainingDeck).toHaveLength(52);
    expect(restarted.currentCard).toBeNull();
    expect(restarted.kingsDrawn).toBe(0);
    expect(restarted.id).not.toBe(game.id);
  });
});
