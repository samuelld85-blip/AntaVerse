import { describe, expect, it } from "vitest";
import { BAC_PROMPTS } from "../../data/prompts";
import { createGame, finishRound, getCurrentRound, togglePlayerValidation } from "./engine";

describe("Bac Enchaîné engine", () => {
  it("keeps a large, varied prompt bank", () => {
    expect(BAC_PROMPTS.length).toBeGreaterThan(400);
    expect(new Set(BAC_PROMPTS.map((prompt) => prompt.category)).size).toBeGreaterThanOrEqual(25);
  });

  it("creates eight rounds with different categories", () => {
    const game = createGame(
      { playerNames: ["Alice", "Bob", "Chloé"] },
      () => 0.25,
      1_700_000_000_000,
    );

    expect(game.rounds).toHaveLength(8);
    expect(new Set(game.rounds.map((round) => round.prompt.category)).size).toBe(8);
    expect(game.rounds[0]?.starterPlayerIndex).toBe(0);
  });

  it("adds and removes one point when a response is toggled", () => {
    const game = createGame({ playerNames: ["Alice", "Bob", "Chloé"] }, () => 0.25, 100);

    const validated = togglePlayerValidation(game, "player-1", 200);
    expect(validated.players[1]?.score).toBe(1);
    expect(getCurrentRound(validated)?.validatedPlayerIds).toEqual(["player-1"]);

    const unvalidated = togglePlayerValidation(validated, "player-1", 300);
    expect(unvalidated.players[1]?.score).toBe(0);
    expect(getCurrentRound(unvalidated)?.validatedPlayerIds).toEqual([]);
  });

  it("rotates the starting player and finishes after the eighth round", () => {
    let game = createGame({ playerNames: ["Alice", "Bob", "Chloé", "Dan"] }, () => 0.25, 100);

    for (let round = 0; round < 7; round += 1) {
      game = finishRound(game, 200 + round);
      expect(game.currentRoundIndex).toBe(round + 1);
      expect(getCurrentRound(game)?.starterPlayerIndex).toBe((round + 1) % 4);
    }

    expect(finishRound(game, 300).status).toBe("finished");
  });
});
