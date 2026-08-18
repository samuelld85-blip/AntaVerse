import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { createGame } from "./engine";
import type { TurnResult } from "./types";
import {
  clearCurrentGame,
  loadCurrentGame,
  resetPersistenceConnectionForTests,
  saveCurrentGame,
} from "./persistence";

describe("IndexedDB game recovery", () => {
  beforeEach(async () => {
    resetPersistenceConnectionForTests();
    await clearCurrentGame();
  });

  it("recovers the current game after reopening the persistence connection", async () => {
    const game = createGame({
      teamAName: "Équipe A",
      teamBName: "Équipe B",
      teamAColor: "#ff6f5d",
      teamBColor: "#687dff",
      startingTeamIndex: 1,
      roundsPerTeam: 5,
      turnDurationSeconds: 90,
    });
    await saveCurrentGame(game);
    resetPersistenceConnectionForTests();
    const recovered = await loadCurrentGame();
    expect(recovered).toEqual(game);
  });

  it("deliberately clears an abandoned game", async () => {
    const game = createGame({
      teamAName: "Équipe A",
      teamBName: "Équipe B",
      teamAColor: "#ff6f5d",
      teamBColor: "#687dff",
      startingTeamIndex: 0,
      roundsPerTeam: 5,
      turnDurationSeconds: 90,
    });
    await saveCurrentGame(game);
    await clearCurrentGame();
    expect(await loadCurrentGame()).toBeNull();
  });

  it("migrates a pre-joker saved game without losing the turn", async () => {
    const game = createGame({
      teamAName: "Équipe A",
      teamBName: "Équipe B",
      teamAColor: "#ff6f5d",
      teamBColor: "#687dff",
      startingTeamIndex: 0,
      roundsPerTeam: 5,
      turnDurationSeconds: 90,
    });
    const legacy: Record<string, unknown> = { ...game };
    delete legacy.teamJokers;
    delete legacy.jokerUsages;
    delete legacy.jokerOpportunityStage;
    delete legacy.turnThemeSelection;
    await saveCurrentGame({ ...legacy, schemaVersion: 2, status: "theme_selection" } as never);
    resetPersistenceConnectionForTests();
    const recovered = await loadCurrentGame();

    expect(recovered?.schemaVersion).toBe(4);
    expect(recovered?.status).toBe("joker_opportunity");
    expect(recovered?.teamJokers[recovered.teams[0].id]).toEqual({
      themeChoiceAvailable: true,
      opponentThemeAvailable: true,
    });
  });

  it("persists the complete French question and answer snapshots after a refresh", async () => {
    const game = createGame({
      teamAName: "Équipe Écarlate",
      teamBName: "Équipe Bleue",
      teamAColor: "#ff6f5d",
      teamBColor: "#687dff",
      startingTeamIndex: 0,
      roundsPerTeam: 5,
      turnDurationSeconds: 90,
    });
    const turn: TurnResult = {
      id: "turn_utf8",
      answeringTeamId: game.teams[0].id,
      questionId: "question-utf8",
      questionText: "Quels sont les neuf pays concernés par l’accord européen ?",
      themeId: "geographie",
      themeLabel: "Géographie",
      themeSelection: {
        selectionMode: "random_imposed",
        proposedThemeIds: ["geographie"],
        selectedThemeId: "geographie",
      },
      turnNumber: 1,
      roundNumber: 1,
      difficultyLevel: 2,
      difficultyLabel: "Moyen",
      foundAnswerIds: ["france"],
      missedAnswerIds: ["cote-divoire"],
      foundAnswers: [{ id: "france", display: "France" }],
      missedAnswers: [{ id: "cote-divoire", display: "Côte d’Ivoire" }],
      baseScore: 100,
      coefficient: 1.35,
      bombTriggered: false,
      bombPenalty: 0,
      pointsEarned: 135,
      startedAt: "2026-07-13T18:00:00.000Z",
      endedAt: "2026-07-13T18:01:30.000Z",
    };
    const completed = { ...game, status: "turn_results" as const, history: [turn] };

    await saveCurrentGame(completed);
    resetPersistenceConnectionForTests();
    const recovered = await loadCurrentGame();

    expect(recovered?.history[0]).toEqual(turn);
    expect(recovered?.history[0]?.questionText).toContain("l’accord européen");
    expect(recovered?.history[0]?.missedAnswers[0]?.display).toBe("Côte d’Ivoire");
  });
});
