import { describe, expect, it } from "vitest";
import { questions, themes } from "@/games/quoi-de-9/data/questions";
import type { DifficultyLevel } from "./config";
import {
  acknowledgeInstructions,
  advanceAfterResults,
  cancelJokerTheme,
  chooseDifficulty,
  confirmChoice,
  confirmJokerTheme,
  confirmPhonePass,
  continueFromScoreboard,
  continueFromThemeReveal,
  createGame,
  drawEligibleThemes,
  expireTurn,
  finalizeExpiredTurn,
  finalizeTurn,
  getDifficultyAvailability,
  getRemainingSeconds,
  getThemeAvailability,
  getWinner,
  imposeRandomTheme,
  isBombTurn,
  recoverTimer,
  replayGame,
  selectJokerTheme,
  skipOpponentThemeJoker,
  startTimer,
  toggleAnswer,
  toggleBomb,
  toggleTurnResultAnswer,
  undoLastAnswer,
  activateOpponentThemeJoker,
  activateThemeChoiceJoker,
} from "./engine";
import { calculateBombPenalty, calculateTurnScore } from "./scoring";
import type { GameState } from "./types";

const input = {
  teamAName: "Équipe A",
  teamBName: "Équipe B",
  teamAColor: "#ff6f5d",
  teamBColor: "#687dff",
  startingTeamIndex: 0 as const,
  roundsPerTeam: 5,
  turnDurationSeconds: 90,
  mode: "competition" as const,
};

function reachDifficultySelection(game = createGame(input)): GameState {
  const jokerOpportunity =
    game.status === "instructions"
      ? confirmPhonePass(acknowledgeInstructions(game))
      : game.status === "pass_phone"
        ? confirmPhonePass(game)
        : (() => {
            throw new Error("Le test attend une partie prête à passer le téléphone");
          })();
  const activeChoice = skipOpponentThemeJoker(jokerOpportunity);
  const revealed = imposeRandomTheme(activeChoice, themes, questions, () => 0);
  return continueFromThemeReveal(revealed, questions);
}

function prepareQuestion(game: GameState, themeId: string, difficultyLevel: DifficultyLevel = 1) {
  const atDifficulty =
    game.status === "difficulty_selection" ? game : reachDifficultySelection(game);
  const selectedDifficulty = chooseDifficulty(atDifficulty, difficultyLevel, questions);
  const ready = confirmChoice(selectedDifficulty, questions, () => 0);
  const question = questions.find((candidate) => candidate.id === ready.currentQuestionId);
  if (!question) throw new Error("Question de test introuvable");
  return { ready, question };
}

function completeTurn(game: GameState, themeId: string, difficultyLevel: DifficultyLevel = 1) {
  const { ready, question } = prepareQuestion(game, themeId, difficultyLevel);
  const startedAt = Date.UTC(2026, 0, 1, 12, game.currentTurn, 0);
  let active = startTimer(ready, startedAt);
  active = toggleAnswer(active, question.answers[0]!.id, question, startedAt + 1000);
  const expired = expireTurn(active, startedAt + input.turnDurationSeconds * 1000);
  return advanceAfterResults(finalizeTurn(expired, question, themeId, startedAt + 91_000));
}

describe("scoring", () => {
  it("uses the configured coefficients", () => {
    expect(calculateTurnScore(5, 1)).toBe(500);
    expect(calculateTurnScore(5, 2)).toBe(750);
    expect(calculateTurnScore(5, 3)).toBe(1500);
    expect(calculateTurnScore(9, 3)).toBe(2700);
  });

  it("deducts two correct answers when a bomb is triggered", () => {
    expect(calculateBombPenalty(1)).toBe(200);
    expect(calculateBombPenalty(2)).toBe(300);
    expect(calculateBombPenalty(3)).toBe(600);
    expect(calculateTurnScore(0, 2, true)).toBe(-300);
    expect(calculateTurnScore(1, 2, true)).toBe(-150);
  });
});

describe("theme and question availability", () => {
  it("distributes eligible themes according to their editorial weights", () => {
    const trials = 10_000;
    const game = createGame(input);
    const eligibleThemes = getThemeAvailability(themes, questions, game.usedQuestionIds)
      .filter((entry) => entry.available)
      .map((entry) => entry.theme);
    const counts = new Map(eligibleThemes.map((theme) => [theme.id, 0]));
    const random = seededRandom(0x9d5f_41a7);

    for (let trial = 0; trial < trials; trial += 1) {
      const selectedTheme = drawEligibleThemes(game, themes, questions, 1, random)[0];
      if (!selectedTheme) throw new Error("Aucun thème tiré");
      counts.set(selectedTheme.id, (counts.get(selectedTheme.id) ?? 0) + 1);
    }

    const totalWeight = eligibleThemes.reduce((sum, theme) => sum + theme.weight, 0);
    const maximumRelativeDeviation = Math.max(
      ...eligibleThemes.map((theme) => {
        const expected = (trials * theme.weight) / totalWeight;
        return Math.abs((counts.get(theme.id) ?? 0) - expected) / expected;
      }),
    );
    expect(maximumRelativeDeviation).toBeLessThan(0.3);
  });

  it("ignores previously played themes when drawing", () => {
    const game = createGame(input);
    const firstDraw = drawEligibleThemes(game, themes, questions, 1, () => 0)[0];
    if (!firstDraw) throw new Error("Aucun thème tiré");
    const gameWithPreviousTheme = {
      ...game,
      history: [{ themeId: firstDraw.id } as GameState["history"][number]],
    };

    expect(drawEligibleThemes(gameWithPreviousTheme, themes, questions, 1, () => 0)[0]?.id).toBe(
      firstDraw.id,
    );
  });

  it("only enables themes with an unused question in all three difficulties", () => {
    const game = reachDifficultySelection();
    const cinema = getThemeAvailability(themes, questions, game.usedQuestionIds).find(
      (entry) => entry.theme.id === "cinema",
    );
    expect(cinema?.available).toBe(true);
    expect(cinema?.byDifficulty[1]).toBeGreaterThan(0);
    expect(cinema?.byDifficulty[2]).toBeGreaterThan(0);
    expect(cinema?.byDifficulty[3]).toBeGreaterThan(0);
  });

  it("disables an exhausted difficulty and never selects a used question", () => {
    const easyIds = questions
      .filter((question) => question.themeId === "work-office" && question.difficultyLevel === 1)
      .map((question) => question.id);
    expect(easyIds.length).toBeGreaterThan(0);
    const availability = getDifficultyAvailability(questions, "work-office", easyIds);
    expect(availability[1]).toBe(0);
    expect(availability[2]).toBeGreaterThan(0);
    expect(availability[3]).toBeGreaterThan(0);
  });

  it("selects randomly only among published eligible questions", () => {
    const atDifficulty = reachDifficultySelection();
    const awaitingConfirmation = chooseDifficulty(atDifficulty, 2, questions);
    const chosen = confirmChoice(awaitingConfirmation, questions, () => 0.999999);
    const question = questions.find((candidate) => candidate.id === chosen.currentQuestionId);
    expect(question?.themeId).toBe(atDifficulty.selectedThemeId);
    expect(question?.difficultyLevel).toBe(2);
    expect(chosen.usedQuestionIds).toContain(chosen.currentQuestionId);
    expect(() => confirmChoice(chosen, questions)).toThrow();
  });

  it("imposes a random eligible theme before difficulty selection", () => {
    const opportunity = confirmPhonePass(acknowledgeInstructions(createGame(input)));
    const afterOpponentPass = skipOpponentThemeJoker(opportunity);
    const revealed = imposeRandomTheme(afterOpponentPass, themes, questions, () => 0);
    expect(revealed.status).toBe("theme_reveal");
    expect(revealed.turnThemeSelection?.selectionMode).toBe("random_imposed");
    expect(revealed.turnThemeSelection?.selectedThemeId).toBeTruthy();
    expect(continueFromThemeReveal(revealed, questions).status).toBe("difficulty_selection");
  });

  it("offers three distinct themes and consumes Theme Choice only on confirmation", () => {
    const opportunity = skipOpponentThemeJoker(
      confirmPhonePass(acknowledgeInstructions(createGame(input))),
    );
    const choosing = activateThemeChoiceJoker(opportunity, themes, questions, () => 0.42);
    const proposals = choosing.turnThemeSelection?.proposedThemeIds ?? [];
    expect(choosing.status).toBe("joker_theme_selection");
    expect(proposals).toHaveLength(3);
    expect(new Set(proposals).size).toBe(3);
    expect(choosing.teamJokers[choosing.teams[0]!.id]?.themeChoiceAvailable).toBe(true);
    const pending = selectJokerTheme(choosing, proposals[0]!);
    expect(pending.status).toBe("joker_confirmation");
    const confirmed = confirmJokerTheme(pending, 1_000);
    expect(confirmed.status).toBe("theme_reveal");
    expect(confirmed.teamJokers[confirmed.teams[0]!.id]?.themeChoiceAvailable).toBe(false);
    expect(confirmed.jokerUsages).toHaveLength(1);
  });

  it("keeps a joker available when its confirmation is cancelled", () => {
    const opportunity = skipOpponentThemeJoker(
      confirmPhonePass(acknowledgeInstructions(createGame(input))),
    );
    const choosing = activateThemeChoiceJoker(opportunity, themes, questions, () => 0.2);
    const pending = selectJokerTheme(choosing, choosing.turnThemeSelection!.proposedThemeIds[0]!);
    const cancelled = cancelJokerTheme(pending);
    expect(cancelled.status).toBe("joker_opportunity");
    expect(cancelled.teamJokers[cancelled.teams[0]!.id]?.themeChoiceAvailable).toBe(true);
  });

  it("lets the opposing team impose a distinct proposed theme once", () => {
    const opportunity = confirmPhonePass(acknowledgeInstructions(createGame(input)));
    const choosing = activateOpponentThemeJoker(opportunity, themes, questions, () => 0.5);
    const proposals = choosing.turnThemeSelection?.proposedThemeIds ?? [];
    expect(proposals).toHaveLength(3);
    const confirmed = confirmJokerTheme(selectJokerTheme(choosing, proposals[1]!), 1_000);
    const opponent = confirmed.teams[1]!;
    expect(confirmed.turnThemeSelection?.selectionMode).toBe("opponent_imposed");
    expect(confirmed.teamJokers[opponent.id]?.opponentThemeAvailable).toBe(false);
    expect(() => activateThemeChoiceJoker(confirmed as GameState, themes, questions)).toThrow();
  });
});

describe("timer and answer locking", () => {
  it("only enables bombs on the second and fourth turn of each team", () => {
    const expectedBombTurns = [false, false, true, true, false, false, true, true];
    const playableThemes = getThemeAvailability(themes, questions, []).filter(
      (entry) => entry.available,
    );
    let game = reachDifficultySelection();

    for (const [index, expected] of expectedBombTurns.entries()) {
      expect(isBombTurn(game), `tour global ${index + 1}`).toBe(expected);
      const theme = playableThemes[index % playableThemes.length]?.theme;
      if (!theme) throw new Error("Thème de test manquant");
      game = completeTurn(
        game,
        theme.id,
        DIFFICULTIES_FOR_TEST[index % DIFFICULTIES_FOR_TEST.length]!,
      );
      if (game.status === "scoreboard") game = continueFromScoreboard(game);
      if (game.status === "pass_phone" && index < expectedBombTurns.length - 1) {
        game = reachDifficultySelection(game);
      }
    }
  });

  it("applies a bomb as a negative score and stores it in the turn result", () => {
    let game = completeTurn(reachDifficultySelection(), "science");
    game = completeTurn(reachDifficultySelection(game), "cinema");
    if (game.status !== "scoreboard") throw new Error("La première manche doit être terminée");
    const { ready, question } = prepareQuestion(
      reachDifficultySelection(continueFromScoreboard(game)),
      "science",
      2,
    );
    expect(isBombTurn(ready)).toBe(true);

    const started = startTimer(ready, 1_000);
    const bombed = toggleBomb(started, question, 2_000);
    expect(bombed.bombTriggered).toBe(true);
    expect(bombed.turnScore).toBe(-300);

    const withAnswer = toggleAnswer(bombed, question.answers[0]!.id, question, 3_000);
    expect(withAnswer.turnScore).toBe(-150);
    const result = finalizeTurn(expireTurn(withAnswer, 91_000), question, "Science", 92_000);
    expect(result.teams[0]!.score).toBe(-50);
    expect(result.history.at(-1)?.pointsEarned).toBe(-150);
    expect(result.history.at(-1)).toMatchObject({ bombTriggered: true, bombPenalty: 300 });
  });

  it("recovers an expired timer from timestamps", () => {
    const { ready } = prepareQuestion(reachDifficultySelection(), "science");
    const started = startTimer(ready, 1_000);
    expect(getRemainingSeconds(started, 31_000)).toBe(60);
    expect(recoverTimer(started, 90_999).status).toBe("question_active");
    expect(recoverTimer(started, 91_000).status).toBe("turn_expired");
  });

  it("opens the results as soon as the timer expires", () => {
    const { ready, question } = prepareQuestion(reachDifficultySelection(), "science");
    const started = startTimer(ready, 1_000);
    const results = finalizeExpiredTurn(started, question, "Science", 91_000);

    expect(results.status).toBe("turn_results");
    expect(results.history).toHaveLength(1);
  });

  it("allows validation and undo before expiry", () => {
    const { ready, question } = prepareQuestion(reachDifficultySelection(), "science");
    const active = startTimer(ready, 1_000);
    const found = toggleAnswer(active, question.answers[0]!.id, question, 2_000);
    expect(found.revealedAnswerIds).toHaveLength(1);
    expect(undoLastAnswer(found, question, 3_000).revealedAnswerIds).toHaveLength(0);
  });

  it("locks validation and undo after expiry", () => {
    const { ready, question } = prepareQuestion(reachDifficultySelection(), "science");
    const active = startTimer(ready, 1_000);
    expect(() => toggleAnswer(active, question.answers[0]!.id, question, 91_000)).toThrow(
      "Le temps est écoulé",
    );
    const expired = expireTurn(active, 91_000);
    expect(() => toggleAnswer(expired, question.answers[0]!.id, question, 91_000)).toThrow();
    expect(() => undoLastAnswer(expired, question, 91_000)).toThrow();
  });

  it("does not score the same answer twice", () => {
    const { ready, question } = prepareQuestion(reachDifficultySelection(), "science");
    const active = startTimer(ready, 1_000);
    const found = toggleAnswer(active, question.answers[0]!.id, question, 2_000);
    const undone = toggleAnswer(found, question.answers[0]!.id, question, 3_000);
    expect(found.turnScore).toBe(100);
    expect(undone.turnScore).toBe(0);
    expect(new Set(found.revealedAnswerIds).size).toBe(found.revealedAnswerIds.length);
  });

  it("recalculates the score when several answers are toggled repeatedly", () => {
    const { ready, question } = prepareQuestion(reachDifficultySelection(), "science");
    const active = startTimer(ready, 1_000);
    const one = toggleAnswer(active, question.answers[0]!.id, question, 2_000);
    const two = toggleAnswer(one, question.answers[1]!.id, question, 3_000);
    const oneAgain = toggleAnswer(two, question.answers[0]!.id, question, 4_000);
    const twoAgain = toggleAnswer(oneAgain, question.answers[0]!.id, question, 5_000);
    expect(two.turnScore).toBe(calculateTurnScore(2, question.difficultyLevel));
    expect(oneAgain.revealedAnswerIds).toEqual([question.answers[1]!.id]);
    expect(twoAgain.revealedAnswerIds).toHaveLength(2);
    expect(new Set(twoAgain.revealedAnswerIds).size).toBe(2);
  });

  it("corrects a completed turn's answers in place without double counting the score", () => {
    const { ready, question } = prepareQuestion(reachDifficultySelection(), "science");
    const startedAt = 1_000;
    const active = startTimer(ready, startedAt);
    const oneAnswer = toggleAnswer(active, question.answers[0]!.id, question, 2_000);
    const expired = expireTurn(oneAnswer, 91_000);
    const firstResult = finalizeTurn(expired, question, "Science", 92_000);

    expect(firstResult.status).toBe("turn_results");
    expect(firstResult.teams[0]!.score).toBe(100);
    expect(firstResult.history).toHaveLength(1);

    const corrected = toggleTurnResultAnswer(firstResult, question.answers[1]!.id, 93_000);
    expect(corrected.status).toBe("turn_results");
    expect(corrected.teams[0]!.score).toBe(200);
    expect(corrected.history).toHaveLength(1);
    expect(corrected.history[0]?.foundAnswerIds).toHaveLength(2);

    const reverted = toggleTurnResultAnswer(corrected, question.answers[1]!.id, 94_000);
    expect(reverted.teams[0]!.score).toBe(100);
    expect(reverted.history[0]?.foundAnswerIds).toHaveLength(1);
  });
});

describe("rounds and teams", () => {
  it("alternates teams and increments the round only after both teams played", () => {
    let game = completeTurn(reachDifficultySelection(), "science");
    expect(game.currentTeamIndex).toBe(1);
    expect(game.currentRound).toBe(1);
    expect(game.status).toBe("pass_phone");

    game = completeTurn(reachDifficultySelection(game), "cinema");
    expect(game.currentTeamIndex).toBe(0);
    expect(game.currentRound).toBe(2);
    expect(game.status).toBe("scoreboard");
  });

  it("completes exactly five rounds and ten turns", () => {
    let game = reachDifficultySelection();
    const playableThemes = getThemeAvailability(themes, questions, []).filter(
      (entry) => entry.available,
    );
    for (let turn = 0; turn < 10; turn += 1) {
      const theme = playableThemes[turn % playableThemes.length]?.theme;
      if (!theme) throw new Error("Thème de test manquant");
      game = completeTurn(game, theme.id, DIFFICULTIES_FOR_TEST[turn % 3]!);
      if (game.status === "scoreboard") game = continueFromScoreboard(game);
      if (game.status === "pass_phone" && turn < 9) game = reachDifficultySelection(game);
    }
    expect(game.status).toBe("completed");
    expect(game.history).toHaveLength(10);
    expect(game.history.filter((turn) => turn.answeringTeamId === game.teams[0]!.id)).toHaveLength(
      5,
    );
    expect(game.history.filter((turn) => turn.answeringTeamId === game.teams[1]!.id)).toHaveLength(
      5,
    );
  });

  it("prevents skipping required states", () => {
    const game = confirmPhonePass(acknowledgeInstructions(createGame(input)));
    expect(() => chooseDifficulty(game, 1, questions)).toThrow();
    expect(() => advanceAfterResults(game)).toThrow();
  });
});

describe("winner calculation", () => {
  it("returns a winner and the score difference", () => {
    const game = createGame(input);
    game.teams[0]!.score = 1200;
    game.teams[1]!.score = 900;
    expect(getWinner(game)).toMatchObject({ kind: "winner", difference: 300 });
    expect(getWinner(game).winner?.id).toBe(game.teams[0]!.id);
  });

  it("returns an explicit draw", () => {
    const game = createGame(input);
    game.teams[0]!.score = 900;
    game.teams[1]!.score = 900;
    expect(getWinner(game)).toEqual({ kind: "draw", winner: null, difference: 0 });
  });
});

describe("three teams support", () => {
  const input3Teams = {
    teamAName: "Équipe A",
    teamBName: "Équipe B",
    teamCName: "Équipe C",
    teamAColor: "#ff6f5d",
    teamBColor: "#687dff",
    teamCColor: "#FF5C2B",
    startingTeamIndex: 0 as const,
    roundsPerTeam: 2,
    turnDurationSeconds: 90,
    mode: "competition" as const,
  };

  it("creates a game with 3 teams", () => {
    const game = createGame(input3Teams);
    expect(game.teams).toHaveLength(3);
    expect(game.teams[0]?.name).toBe("Équipe A");
    expect(game.teams[1]?.name).toBe("Équipe B");
    expect(game.teams[2]?.name).toBe("Équipe C");
  });

  it("rotates through 3 teams sequentially (A→B→C→A)", () => {
    const playableThemes = getThemeAvailability(themes, questions, []).filter(
      (entry) => entry.available,
    );
    let game = reachDifficultySelection(createGame(input3Teams));

    // Team A plays (turn 1)
    expect(game.currentTeamIndex).toBe(0);
    const theme1 = playableThemes[0]?.theme;
    if (!theme1) throw new Error("Thème de test manquant");
    game = completeTurn(game, theme1.id, 1);
    expect(game.currentTeamIndex).toBe(1);
    expect(game.status).toBe("pass_phone");

    // Team B plays (turn 2)
    game = reachDifficultySelection(game);
    const theme2 = playableThemes[1]?.theme;
    if (!theme2) throw new Error("Thème de test manquant");
    game = completeTurn(game, theme2.id, 1);
    expect(game.currentTeamIndex).toBe(2);
    expect(game.status).toBe("pass_phone");

    // Team C plays (turn 3)
    game = reachDifficultySelection(game);
    const theme3 = playableThemes[2]?.theme;
    if (!theme3) throw new Error("Thème de test manquant");
    game = completeTurn(game, theme3.id, 1);
    expect(game.currentTeamIndex).toBe(0); // Back to Team A
    expect(game.status).toBe("scoreboard"); // Completing round 1
  });

  it("finds winner among 3 teams with highest score", () => {
    const game = createGame(input3Teams);
    game.teams[0]!.score = 800;
    game.teams[1]!.score = 1000;
    game.teams[2]!.score = 600;
    const result = getWinner(game);
    expect(result.kind).toBe("winner");
    expect(result.winner?.name).toBe("Équipe B");
    expect(result.difference).toBe(200); // 1000 - 800
  });

  it("detects draw when 2 or more teams tie for highest score (3 teams)", () => {
    const game = createGame(input3Teams);
    game.teams[0]!.score = 1000;
    game.teams[1]!.score = 1000;
    game.teams[2]!.score = 500;
    const result = getWinner(game);
    expect(result.kind).toBe("draw");
    expect(result.winner).toBe(null);
    expect(result.difference).toBe(0);
  });

  it("supports replaying a 3-team game", () => {
    const game = createGame(input3Teams);
    game.teams[0]!.score = 100;
    game.teams[1]!.score = 200;
    game.teams[2]!.score = 150;
    const replayed = replayGame(game);
    expect(replayed.teams).toHaveLength(3);
    expect(replayed.teams[0]?.name).toBe("Équipe A");
    expect(replayed.teams[2]?.name).toBe("Équipe C");
    expect(replayed.schemaVersion).toBe(5);
  });
});

const DIFFICULTIES_FOR_TEST: DifficultyLevel[] = [1, 2, 3];

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
