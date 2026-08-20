import { shuffle } from "@/lib/random";
import { cleanTeamName, createGameId } from "@/games/shared/lib/two-team-setup";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";
import type { CreateGameInput, GameState, Team, TeamIndex, Theme } from "./types";

export const STANDARD_ROUNDS = 7;
const REQUIRED_THEME_COUNT = STANDARD_ROUNDS + 1;
const DEFAULT_TEAM_NAMES = ["Les Antagonistes", "Les Sanglieeers", "Les Ouragans"] as const;

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 3;
export const MIN_SOLO_PLAYERS = 2;
export const MAX_SOLO_PLAYERS = 7;

/** Every solo player shares the game's own accent instead of a per-index
 * team color — resolved via the `--game-accent` custom property so it
 * always matches this game's identity. */
const SOLO_COLOR = "var(--game-accent)";

export function createGame(
  input: CreateGameInput,
  themes: readonly Theme[],
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const participantCount = input.teamNames.length;
  const [min, max] = input.mode === "solo" ? [MIN_SOLO_PLAYERS, MAX_SOLO_PLAYERS] : [MIN_TEAMS, MAX_TEAMS];
  if (participantCount < min || participantCount > max) {
    throw new Error(
      input.mode === "solo"
        ? `Il faut entre ${MIN_SOLO_PLAYERS} et ${MAX_SOLO_PLAYERS} joueurs.`
        : `Il faut entre ${MIN_TEAMS} et ${MAX_TEAMS} équipes.`,
    );
  }

  const selectedThemeIds = shuffle(themes, random)
    .slice(0, REQUIRED_THEME_COUNT)
    .map((theme) => theme.id);

  if (selectedThemeIds.length < REQUIRED_THEME_COUNT) {
    throw new Error(`La banque doit contenir au moins ${REQUIRED_THEME_COUNT} thèmes.`);
  }

  const timestamp = new Date(now).toISOString();
  const teams: Team[] = input.teamNames.map((name, index) => ({
    id: `team-${index + 1}`,
    name: cleanTeamName(
      name,
      input.mode === "solo" ? `Joueur ${index + 1}` : (DEFAULT_TEAM_NAMES[index] ?? `Équipe ${index + 1}`),
    ),
    color: input.mode === "solo" ? SOLO_COLOR : TEAM_PALETTE[index]!,
    score: 0,
  }));

  return {
    schemaVersion: 2,
    id: createGameId(now, random),
    status: "playing",
    mode: input.mode,
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
  const teamNames = game.teams.map((team) => team.name);
  return createGame({ teamNames, mode: game.mode }, themes, random, now);
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
