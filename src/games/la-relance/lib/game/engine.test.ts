import { describe, expect, it } from "vitest";
import { themes } from "@/games/la-relance/data/themes";
import {
  STANDARD_ROUNDS,
  awardPoint,
  continueGame,
  createGame,
  getCurrentTheme,
  getWinnerIndex,
  hasTiedLeaders,
  replayGame,
} from "./engine";

describe("moteur de La Relance", () => {
  it("prépare sept manches et un thème de réserve avec des thèmes uniques", () => {
    const game = createGame(
      { teamNames: ["Les Verts", "Les Bleus"], mode: "teams" },
      themes,
      seededRandom(42),
      1_000,
    );

    expect(game.status).toBe("playing");
    expect(game.selectedThemeIds).toHaveLength(8);
    expect(new Set(game.selectedThemeIds)).toHaveLength(8);
    expect(getCurrentTheme(game, themes).id).toBe(game.selectedThemeIds[0]);
  });

  it("attribue un point par manche et termine une partie normale après sept manches", () => {
    let game = createGame({ teamNames: ["Équipe 1", "Équipe 2"], mode: "teams" }, themes, seededRandom(1));

    for (let round = 0; round < STANDARD_ROUNDS; round += 1) {
      game = awardPoint(game, round < 4 ? 0 : 1);
      game = continueGame(game);
    }

    expect(game.status).toBe("finished");
    expect(game.teams.map((team) => team.score)).toEqual([4, 3]);
  });

  it("conserve la gestion de la mort subite pour un état à égalité", () => {
    let game = createGame({ teamNames: ["Équipe 1", "Équipe 2"], mode: "teams" }, themes, seededRandom(2));

    game = {
      ...game,
      roundIndex: STANDARD_ROUNDS - 1,
      teams: [
        { ...game.teams[0]!, score: 2 },
        { ...game.teams[1]!, score: 2 },
      ],
    };
    game = awardPoint(game, 0);
    game = {
      ...game,
      teams: [
        { ...game.teams[0]!, score: 2 },
        { ...game.teams[1]!, score: 2 },
      ],
    };
    game = continueGame(game);

    expect(game.status).toBe("playing");
    expect(game.suddenDeath).toBe(true);
    expect(game.roundIndex).toBe(7);
    expect(getCurrentTheme(game, themes).id).toBe(game.selectedThemeIds[7]);

    game = awardPoint(game, 1);
    expect(game.status).toBe("finished");
    expect(game.teams.map((team) => team.score)).toEqual([2, 3]);
  });

  it("rejoue avec les mêmes noms, les scores à zéro et une nouvelle sélection", () => {
    const first = createGame(
      { teamNames: ["Les Éclairs", "Les Comètes"], mode: "teams" },
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

  it("crée une partie à 3 équipes avec la palette et des scores à zéro", () => {
    const game = createGame(
      { teamNames: ["A", "B", "C"], mode: "teams" },
      themes,
      seededRandom(5),
      1_000,
    );

    expect(game.teams).toHaveLength(3);
    expect(game.teams.map((team) => team.name)).toEqual(["A", "B", "C"]);
    expect(game.teams.map((team) => team.score)).toEqual([0, 0, 0]);
    expect(new Set(game.teams.map((team) => team.color)).size).toBe(3);
  });

  it("attribue un point à la 3e équipe et termine la partie sur son avance", () => {
    let game = createGame({ teamNames: ["A", "B", "C"], mode: "teams" }, themes, seededRandom(6));

    for (let round = 0; round < STANDARD_ROUNDS; round += 1) {
      game = awardPoint(game, 2);
      game = continueGame(game);
    }

    expect(game.status).toBe("finished");
    expect(game.teams.map((team) => team.score)).toEqual([0, 0, 7]);
    expect(getWinnerIndex(game)).toBe(2);
  });

  it("déclenche la mort subite pour une égalité à 3 équipes, même si une équipe est derrière", () => {
    let game = createGame({ teamNames: ["A", "B", "C"], mode: "teams" }, themes, seededRandom(7));
    game = {
      ...game,
      roundIndex: STANDARD_ROUNDS - 1,
      status: "pointAwarded",
      teams: [
        { ...game.teams[0]!, score: 3 },
        { ...game.teams[1]!, score: 3 },
        { ...game.teams[2]!, score: 1 },
      ],
    };

    expect(hasTiedLeaders(game)).toBe(true);
    game = continueGame(game);
    expect(game.status).toBe("playing");
    expect(game.suddenDeath).toBe(true);

    game = awardPoint(game, 1);
    expect(game.status).toBe("finished");
    expect(getWinnerIndex(game)).toBe(1);
  });

  it("rejoue une partie à 3 équipes en conservant les trois noms", () => {
    const game = createGame({ teamNames: ["A", "B", "C"], mode: "teams" }, themes, seededRandom(8), 1_000);
    const replay = replayGame(game, themes, seededRandom(11), 2_000);

    expect(replay.teams).toHaveLength(3);
    expect(replay.teams.map((team) => team.name)).toEqual(["A", "B", "C"]);
    expect(replay.teams.map((team) => team.score)).toEqual([0, 0, 0]);
  });

  it("crée une partie solo avec la même couleur pour tous les joueurs", () => {
    const game = createGame(
      { teamNames: ["Ana", "Théo", "Sam", "Iris", "Léo", "Nina", "Max"], mode: "solo" },
      themes,
      seededRandom(12),
      1_000,
    );

    expect(game.mode).toBe("solo");
    expect(game.teams).toHaveLength(7);
    expect(new Set(game.teams.map((team) => team.color)).size).toBe(1);
  });

  it("refuse une partie solo hors des bornes de joueurs", () => {
    expect(() => createGame({ teamNames: ["Solo"], mode: "solo" }, themes, seededRandom(13))).toThrow();
    expect(() =>
      createGame(
        { teamNames: ["A", "B", "C", "D", "E", "F", "G", "H"], mode: "solo" },
        themes,
        seededRandom(14),
      ),
    ).toThrow();
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
