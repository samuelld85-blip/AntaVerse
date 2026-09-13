import { describe, expect, it } from "vitest";
import { questions } from "@/games/pifometre/data/questions";
import { awardPoints, createGame, getCurrentQuestion, revealAnswer, submitEstimate } from "./engine";

const bank = questions.slice(0, 8);
const random = () => 0.1;

describe("Le Pifomètre engine", () => {
  it("creates a persisted-friendly game with unique questions", () => {
    const game = createGame({ playerNames: ["Alice", "Bob", "Chloé"], playMode: "turns" }, bank, random, 1_000);
    expect(game.status).toBe("answering");
    expect(game.selectedQuestionIds).toHaveLength(8);
    expect(new Set(game.selectedQuestionIds).size).toBe(8);
    expect(game.players.map((player) => player.name)).toEqual(["Alice", "Bob", "Chloé"]);
  });

  it("hides the reveal until every player has submitted", () => {
    let game = createGame({ playerNames: ["Alice", "Bob"], playMode: "turns" }, bank, random, 1_000);
    const question = getCurrentQuestion(game, bank);
    game = submitEstimate(game, "player-1", question.answer - 1, bank, 2_000);
    expect(game.status).toBe("answering");
    expect(game.reveal).toBeNull();
    game = submitEstimate(game, "player-2", question.answer, bank, 3_000);
    expect(game.status).toBe("revealed");
    expect(game.reveal?.answer).toBe(question.answer);
    expect(game.reveal?.guesses?.[1]?.distance).toBe(0);
  });

  it("awards one point for the chosen closest player and two for an exact answer", () => {
    let game = createGame({ playerNames: ["Alice", "Bob"], playMode: "turns" }, bank, random, 1_000);
    const question = getCurrentQuestion(game, bank);
    game = submitEstimate(game, "player-1", question.answer - 1, bank);
    game = submitEstimate(game, "player-2", question.answer, bank);
    game = awardPoints(game, "player-1", "closest");
    expect(game.players[0]?.score).toBe(1);
    expect(game.status).toBe("answering");

    const nextQuestion = getCurrentQuestion(game, bank);
    game = submitEstimate(game, "player-1", nextQuestion.answer, bank);
    game = submitEstimate(game, "player-2", nextQuestion.answer, bank);
    game = awardPoints(game, "player-2", "exact");
    expect(game.players[1]?.score).toBe(2);
  });

  it("supports the quick mode with oral answers and manual award", () => {
    let game = createGame({ playerNames: ["Alice", "Bob"], playMode: "quick" }, bank, random, 1_000);
    expect(game.status).toBe("question");
    game = revealAnswer(game, bank, 2_000);
    expect(game.status).toBe("revealed");
    expect(game.reveal?.guesses).toBeUndefined();
    game = awardPoints(game, "player-2", "exact", 3_000);
    expect(game.players[1]?.score).toBe(2);
    expect(game.status).toBe("question");
  });
});
