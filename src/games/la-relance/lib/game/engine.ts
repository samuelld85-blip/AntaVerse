import { shuffle } from "@/lib/random";
import { cleanTeamName, createGameId } from "@/games/shared/lib/two-team-setup";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";
import type { CreateGameInput, GameState, Team, TeamIndex, Theme } from "./types";

export const STANDARD_ROUNDS = 5;
const REQUIRED_THEME_COUNT = STANDARD_ROUNDS + 1;
const DEFAULT_TEAM_NAMES = ["Les Antagonistes", "Les Sanglieeers", "Les Ouragans"] as const;
const TEAM_IDS = ["team-1", "team-2", "team-3"] as const;

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
  const teams: Team[] = input.teamNames.map((name, index) => ({
    id: TEAM_IDS[index]!,
    name: cleanTeamName(name, DEFAULT_TEAM_NAMES[index]!),
    color: TEAM_PALETTE[index]!,
    score: 0,
  }));

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    status: "playing",
    teams,
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
  const teams = game.teams.map((team, index) =>
    index === winnerIndex ? { ...team, score: team.score + 1 } : team,
  );

  return {
    ...game,
    teams,
    status: game.suddenDeath ? "finished" : "pointAwarded",
    lastPointWinner: winnerIndex,
    updatedAt: new Date(now).toISOString(),
  };
}

/** True when two or more teams share the lead — the case a decider round must resolve. */
export function hasTiedLeaders(game: GameState): boolean {
  const maxScore = Math.max(...game.teams.map((team) => team.score));
  return game.teams.filter((team) => team.score === maxScore).length > 1;
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

  if (hasTiedLeaders(game)) {
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
  const teamNames = game.teams.map((team) => team.name) as
    | [string, string]
    | [string, string, string];
  return createGame({ teamNames }, themes, random, now);
}

export function getCurrentTheme(game: GameState, themes: readonly Theme[]): Theme {
  const themeId = game.selectedThemeIds[game.roundIndex];
  const theme = themes.find((candidate) => candidate.id === themeId);
  if (!theme) throw new Error("Le thème de cette manche est introuvable.");
  return theme;
}

export function getWinnerIndex(game: GameState): TeamIndex | null {
  const maxScore = Math.max(...game.teams.map((team) => team.score));
  const leaders = game.teams.filter((team) => team.score === maxScore);
  if (leaders.length > 1) return null;
  return game.teams.findIndex((team) => team.score === maxScore);
}

function assertStatus(game: GameState, expected: GameState["status"]): void {
  if (game.status !== expected) {
    throw new Error(`Action impossible pendant l’état « ${game.status} ».`);
  }
}
