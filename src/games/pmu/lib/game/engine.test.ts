import { describe, expect, it } from "vitest";
import { CHECKPOINT_COUNT, FINISH_POSITION, createGame, drawCard, getSettlement, submitBet } from "./engine";
import type { Card, GameState } from "./types";

const card = (id: string, suit: Card["suit"], value: Card["value"] = "2"): Card => ({ id, suit, value });

function raceGame(overrides: Partial<GameState> = {}): GameState {
  const game = createGame({ playerNames: ["Ada", "Bob"] }, () => 0.5, () => 1_000);
  return { ...game, phase: "race", ...overrides };
}

describe("PMU engine", () => {
  it("requires every player to allocate exactly five units", () => {
    const game = createGame({ playerNames: ["Ada", "Bob"] }, () => 0.5, () => 1_000);
    expect(() => submitBet(game, "player-1", { amount: 0, suit: "♥" })).toThrow("entre 1 et 5");
    const next = submitBet(game, "player-1", { amount: 2, suit: "♥" }, 2_000);
    expect(next.bets["player-1"]).toEqual({ amount: 2, suit: "♥" });
    expect(next.currentPlayerIndex).toBe(1);
  });

  it("reveals a checkpoint when all horses pass it and applies its penalty", () => {
    const game = raceGame({
      checkpointCards: [card("checkpoint-1", "♥"), ...Array.from({ length: CHECKPOINT_COUNT - 1 }, (_, index) => card(`checkpoint-${index + 2}`, "♠"))],
      remainingDeck: [card("draw-heart", "♥"), card("draw-diamond", "♦"), card("draw-club", "♣"), card("draw-spade", "♠")],
    });
    const afterHeart = drawCard(game);
    const afterDiamond = drawCard(afterHeart);
    const afterClub = drawCard(afterDiamond);
    const afterAll = drawCard(afterClub);
    expect(afterAll.revealedCheckpoints[0]).toBe(true);
    expect(afterAll.lastDraw?.revealedCheckpoints[0]?.penalizedSuit).toBe("♥");
    expect(afterAll.horsePositions["♥"]).toBe(0);
    expect(afterAll.horsePositions["♠"]).toBe(1);
  });

  it("ends as soon as a horse reaches the finish", () => {
    const game = raceGame({ horsePositions: { "♥": FINISH_POSITION - 1, "♦": 2, "♣": 2, "♠": 2 }, revealedCheckpoints: Array.from({ length: CHECKPOINT_COUNT }, () => true), remainingDeck: [card("finish", "♥")] });
    const next = drawCard(game);
    expect(next.phase).toBe("end");
    expect(next.winnerSuit).toBe("♥");
  });

  it("does not wait for every palier to be revealed before declaring a winner", () => {
    const game = raceGame({ horsePositions: { "♥": FINISH_POSITION - 1, "♦": 0, "♣": 0, "♠": 0 }, remainingDeck: [card("finish-early", "♥")] });
    const next = drawCard(game);
    expect(next.phase).toBe("end");
    expect(next.winnerSuit).toBe("♥");
    expect(next.revealedCheckpoints.every((revealed) => !revealed)).toBe(true);
  });

  it("splits winning and losing units for the final settlement", () => {
    const game = raceGame({ phase: "end", winnerSuit: "♥", bets: { "player-1": { amount: 3, suit: "♥" }, "player-2": { amount: 5, suit: "♣" } } });
    expect(getSettlement(game)).toEqual([
      { playerId: "player-1", winningUnits: 3, losingUnits: 0 },
      { playerId: "player-2", winningUnits: 0, losingUnits: 5 },
    ]);
  });
});
