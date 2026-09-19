import { describe, expect, it } from "vitest";
import { questions } from "../../data/questions";
import { createGame, nextRound, revealRound, tick } from "./engine";

const input = { duoTeam: "Les dos à dos", questionTeam: "Les arbitres" };

describe("Qui de nous deux engine", () => {
  it("creates a namespaced round set with the requested timer", () => {
    const game = createGame(input, questions, () => 0.2, 1_700_000_000_000);
    expect(game.questionIds).toHaveLength(10);
    expect(game.secondsLeft).toBe(15);
    expect(game.duo.score).toBe(0);
  });

  it("uses simple team defaults when names are left empty", () => {
    const game = createGame({ duoTeam: "", questionTeam: "" }, questions, () => 0.2, 1_700_000_000_000);
    expect(game.duo.name).toBe("Dos à dos");
    expect(game.questionTeam.name).toBe("Poseurs");
  });

  it("gives the point to the duo when both point to the same person", () => {
    const game = createGame(input, questions, () => 0.2, 1_700_000_000_000);
    const revealed = revealRound(game, "same");
    expect(revealed.duo.score).toBe(1);
    expect(revealed.questionTeam.score).toBe(0);
    expect(revealed.lastResult).toEqual({ outcome: "same", pointsTo: "duo" });
  });

  it("gives the point to the questioners when answers differ", () => {
    const game = createGame(input, questions, () => 0.2, 1_700_000_000_000);
    const revealed = revealRound(game, "different");
    expect(revealed.duo.score).toBe(0);
    expect(revealed.questionTeam.score).toBe(1);
  });

  it("counts down without going negative and starts the next round fresh", () => {
    const game = createGame(input, questions, () => 0.2, 1_700_000_000_000);
    let current = game;
    for (let index = 0; index < 20; index += 1) current = tick(current);
    expect(current.secondsLeft).toBe(0);
    const next = nextRound(revealRound(current, "same"));
    expect(next.roundIndex).toBe(1);
    expect(next.secondsLeft).toBe(15);
    expect(next.phase).toBe("question");
  });
});
