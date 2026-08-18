import { shuffle } from "@/lib/random";
import { createGameId, createTwoTeams } from "@/games/shared/lib/two-team-setup";
import type { CreateGameInput, GameState, TeamIndex, Theme } from "./types";

export const STANDARD_ROUNDS = 5;
const REQUIRED_THEME_COUNT = STANDARD_ROUNDS + 1;

export function createGame(
  input: CreateGameInput,
  themes: readonly Theme[],
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const selectedThemeIds = shuffle(themes, random)
    .slice(0, REQUIRED_THEME_COUNT)
    .map((theme) => theme.id);

  if (selectedThemeIds.length < REQUIRED_THEME_COUNT) {
    throw new Error(`La banque doit contenir au moins ${REQUIRED_THEME_COUNT} thèmes.`);
  }

  const timestamp = new Date(now).toISOString();
  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    status: "playing",
    teams: createTwoTeams({
      teamOneName: input.teamOneName,
      teamTwoName: input.teamTwoName,
    }),
    roundIndex: 0,
    selectedThemeIds,
    suddenDeath: false,
    lastPointWinner: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function awardPoint(game: GameState, winnerIndex: TeamIndex, now = Date.now()): GameState {
  assertStatus(game, "playing");
  const teams: GameState["teams"] = [{ ...game.teams[0] }, { ...game.teams[1] }];
  teams[winnerIndex].score += 1;

  return {
    ...game,
    teams,
    status: game.suddenDeath ? "finished" : "pointAwarded",
    lastPointWinner: winnerIndex,
    updatedAt: new Date(now).toISOString(),
  };
}

export function continueGame(game: GameState, now = Date.now()): GameState {
  assertStatus(game, "pointAwarded");

  if (game.roundIndex < STANDARD_ROUNDS - 1) {
    return {
      ...game,
      status: "playing",
      roundIndex: game.roundIndex + 1,
      lastPointWinner: null,
      updatedAt: new Date(now).toISOString(),
    };
  }

  if (game.teams[0].score === game.teams[1].score) {
    return {
      ...game,
      status: "playing",
      roundIndex: STANDARD_ROUNDS,
      suddenDeath: true,
      lastPointWinner: null,
      updatedAt: new Date(now).toISOString(),
    };
  }

  return { ...game, status: "finished", updatedAt: new Date(now).toISOString() };
}

export function replayGame(
  game: GameState,
  themes: readonly Theme[],
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  return createGame(
    { teamOneName: game.teams[0].name, teamTwoName: game.teams[1].name },
    themes,
    random,
    now,
  );
}

export function getCurrentTheme(game: GameState, themes: readonly Theme[]): Theme {
  const themeId = game.selectedThemeIds[game.roundIndex];
  const theme = themes.find((candidate) => candidate.id === themeId);
  if (!theme) throw new Error("Le thème de cette manche est introuvable.");
  return theme;
}

export function getWinnerIndex(game: GameState): TeamIndex | null {
  if (game.teams[0].score === game.teams[1].score) return null;
  return game.teams[0].score > game.teams[1].score ? 0 : 1;
}

function assertStatus(game: GameState, expected: GameState["status"]): void {
  if (game.status !== expected) {
    throw new Error(`Action impossible pendant l’état « ${game.status} ».`);
  }
}
