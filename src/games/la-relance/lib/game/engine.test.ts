import { describe, expect, it } from "vitest";
import { themes } from "@/games/la-relance/data/themes";
import {
  STANDARD_ROUNDS,
  awardPoint,
  continueGame,
  createGame,
  getCurrentTheme,
  replayGame,
} from "./engine";

describe("moteur de La Relance", () => {
  it("prépare cinq manches et un thème de réserve avec des thèmes uniques", () => {
    const game = createGame(
      { teamOneName: "Les Verts", teamTwoName: "Les Bleus" },
      themes,
      seededRandom(42),
      1_000,
    );

    expect(game.status).toBe("playing");
    expect(game.selectedThemeIds).toHaveLength(6);
    expect(new Set(game.selectedThemeIds)).toHaveLength(6);
    expect(getCurrentTheme(game, themes).id).toBe(game.selectedThemeIds[0]);
  });

  it("attribue un point par manche et termine une partie normale après cinq manches", () => {
    let game = createGame(
      { teamOneName: "Équipe 1", teamTwoName: "Équipe 2" },
      themes,
      seededRandom(1),
    );

    for (let round = 0; round < STANDARD_ROUNDS; round += 1) {
      game = awardPoint(game, round < 3 ? 0 : 1);
      game = continueGame(game);
    }

    expect(game.status).toBe("finished");
    expect(game.teams.map((team) => team.score)).toEqual([3, 2]);
  });

  it("conserve la gestion de la mort subite pour un état à égalité", () => {
    let game = createGame(
      { teamOneName: "Équipe 1", teamTwoName: "Équipe 2" },
      themes,
      seededRandom(2),
    );

    game = {
      ...game,
      roundIndex: STANDARD_ROUNDS - 1,
      teams: [{ ...game.teams[0], score: 2 }, { ...game.teams[1], score: 2 }],
    };
    game = awardPoint(game, 0);
    game = { ...game, teams: [{ ...game.teams[0], score: 2 }, { ...game.teams[1], score: 2 }] };
    game = continueGame(game);

    expect(game.status).toBe("playing");
    expect(game.suddenDeath).toBe(true);
    expect(game.roundIndex).toBe(5);
    expect(getCurrentTheme(game, themes).id).toBe(game.selectedThemeIds[5]);

    game = awardPoint(game, 1);
    expect(game.status).toBe("finished");
    expect(game.teams.map((team) => team.score)).toEqual([2, 3]);
  });

  it("rejoue avec les mêmes noms, les scores à zéro et une nouvelle sélection", () => {
    const first = createGame(
      { teamOneName: "Les Éclairs", teamTwoName: "Les Comètes" },
      themes,
      seededRandom(3),
      1_000,
    );
    const replay = replayGame(first, themes, seededRandom(9), 2_000);

    expect(replay.teams.map((team) => team.name)).toEqual(["Les Éclairs", "Les Comètes"]);
    expect(replay.teams.map((team) => team.score)).toEqual([0, 0]);
    expect(replay.selectedThemeIds).not.toEqual(first.selectedThemeIds);
    expect(replay.status).toBe("playing");
  });
});

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
