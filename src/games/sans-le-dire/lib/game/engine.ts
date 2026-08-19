import { shuffle } from "@/lib/random";
import { createGameId } from "@/games/shared/lib/two-team-setup";
import type { Card, CreateGameInput, GameState, PlayMode, Team } from "./types";

const COLORS = ["#e83dff", "#16c7e8", "#ff5c2b"];
export const STANDARD_ROUNDS = 4;
const STANDARD_DURATION_MS = 45_000;
const TIEBREAK_DURATION_MS = 30_000;
const STANDARD_PASSES = 2;
const TIEBREAK_PASSES = 1;

export function createGame(
  input: CreateGameInput,
  cards: readonly Card[],
  random = Math.random,
  now = Date.now(),
): GameState {
  validateCards(cards);
  const timestamp = new Date(now).toISOString();
  const teamCount = input.teamNames.length;
  const teamIds = ["team-1", "team-2", "team-3"] as const;
  const teams: Team[] = input.teamNames.map((name, i) => {
    const id = teamIds[i] as "team-1" | "team-2" | "team-3";
    return {
      id,
      name,
      color: COLORS[i]!,
      score: 0,
    };
  });

  return {
    schemaVersion: 3,
    id: createGameId(now, random),
    status: "preparation",
    roundMode: "standard",
    playMode: input.playMode,
    teams,
    roundIndex: 0,
    activeTeamIndex: 0,
    passesRemaining: STANDARD_PASSES,
    roundScore: 0,
    tiebreakScores: new Array(teamCount).fill(0),
    tiebreakCycle: 1,
    forbiddenViolations: 0,
    deck: shuffle(cards, random).map((card) => card.id),
    deckPosition: 0,
    roundEndsAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function startRound(game: GameState, now = Date.now()): GameState {
  assertStatus(game, "preparation");
  return touch(
    {
      ...game,
      status: "playing",
      passesRemaining: game.roundMode === "standard" ? STANDARD_PASSES : TIEBREAK_PASSES,
      roundScore: 0,
      forbiddenViolations: 0,
      roundEndsAt: now + (game.roundMode === "standard" ? STANDARD_DURATION_MS : TIEBREAK_DURATION_MS),
    },
    now,
  );
}

export function foundCard(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  const teams = game.teams.map((t, i) => (i === game.activeTeamIndex ? { ...t, score: t.score + 1 } : t));
  const tiebreakScores = game.tiebreakScores.map((s, i) =>
    i === game.activeTeamIndex ? s + 1 : s,
  );
  return touch(
    {
      ...game,
      teams,
      tiebreakScores: game.roundMode === "standard" ? game.tiebreakScores : tiebreakScores,
      roundScore: game.roundScore + 1,
      deckPosition: game.deckPosition + 1,
    },
    now,
  );
}

export function passCard(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  if (game.passesRemaining <= 0) throw new Error("Aucune passe restante.");
  return touch(
    { ...game, passesRemaining: game.passesRemaining - 1, deckPosition: game.deckPosition + 1 },
    now,
  );
}

export function faultCard(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  const teams = game.teams.map((t, i) => (i === game.activeTeamIndex ? { ...t, score: t.score - 1 } : t));
  const tiebreakScores = game.tiebreakScores.map((s, i) =>
    i === game.activeTeamIndex ? s - 1 : s,
  );
  return touch(
    {
      ...game,
      teams,
      tiebreakScores: game.roundMode === "standard" ? game.tiebreakScores : tiebreakScores,
      roundScore: game.roundScore - 1,
      deckPosition: game.deckPosition + 1,
    },
    now,
  );
}

export function recordForbiddenViolation(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  return touch(
    { ...game, forbiddenViolations: game.forbiddenViolations + 1, deckPosition: game.deckPosition + 1 },
    now,
  );
}

export function endRound(game: GameState, now = Date.now()): GameState {
  if (game.status !== "playing") return game;
  return touch({ ...game, status: "roundResult", roundEndsAt: null }, now);
}

export function continueGame(game: GameState, now = Date.now()): GameState {
  assertStatus(game, "roundResult");
  if (game.roundMode === "standard") {
    if (game.roundIndex < STANDARD_ROUNDS - 1) {
      const roundIndex = game.roundIndex + 1;
      const activeTeamIndex = roundIndex % game.teams.length;
      return prepare({ ...game, roundIndex, activeTeamIndex }, now);
    }
    const maxScore = Math.max(...game.teams.map((t) => t.score));
    const winnersCount = game.teams.filter((t) => t.score === maxScore).length;
    if (winnersCount === 1) return touch({ ...game, status: "finished" }, now);
    return prepare(
      {
        ...game,
        roundMode: "tiebreak",
        activeTeamIndex: 0,
        tiebreakScores: new Array(game.teams.length).fill(0),
        tiebreakCycle: 1,
      },
      now,
    );
  }
  const nextTeamIndex = (game.activeTeamIndex + 1) % game.teams.length;
  if (nextTeamIndex !== 0) return prepare({ ...game, activeTeamIndex: nextTeamIndex }, now);
  const maxTiebreakScore = Math.max(...game.tiebreakScores);
  const winnersCount = game.tiebreakScores.filter((s) => s === maxTiebreakScore).length;
  if (winnersCount === 1) return touch({ ...game, status: "finished" }, now);
  return prepare(
    {
      ...game,
      activeTeamIndex: 0,
      tiebreakScores: new Array(game.teams.length).fill(0),
      tiebreakCycle: game.tiebreakCycle + 1,
    },
    now,
  );
}

export function replayGame(
  game: GameState,
  cards: readonly Card[],
  random = Math.random,
  now = Date.now(),
): GameState {
  const teamNames = game.teams.map((t) => t.name) as [string, string] | [string, string, string];
  return createGame(
    { teamNames, playMode: game.playMode },
    cards,
    random,
    now,
  );
}
export function getCurrentCard(game: GameState, cards: readonly Card[]): Card {
  const id = game.deck[game.deckPosition];
  const card = cards.find((candidate) => candidate.id === id);
  if (!card) throw new Error("La carte courante est introuvable.");
  return card;
}
export function getWinnerIndex(game: GameState): number | null {
  const scores =
    game.roundMode === "tiebreak" ? game.tiebreakScores : game.teams.map((t) => t.score);
  const maxScore = Math.max(...scores);
  if (scores.filter((s) => s === maxScore).length > 1) return null;
  return scores.indexOf(maxScore);
}
function prepare(game: GameState, now: number): GameState {
  return touch(
    {
      ...game,
      status: "preparation",
      passesRemaining: game.roundMode === "standard" ? STANDARD_PASSES : TIEBREAK_PASSES,
      roundScore: 0,
      forbiddenViolations: 0,
      roundEndsAt: null,
    },
    now,
  );
}
function assertPlayableCard(game: GameState, cardId: string, now: number): void {
  assertStatus(game, "playing");
  if (game.roundEndsAt === null || now >= game.roundEndsAt) throw new Error("Le temps est écoulé.");
  if (game.deck[game.deckPosition] !== cardId) throw new Error("Cette carte a déjà été traitée.");
  if (game.deckPosition >= game.deck.length - 1)
    throw new Error("La banque de cartes est épuisée.");
}
function validateCards(cards: readonly Card[]): void {
  if (cards.length < 500) throw new Error("La banque doit contenir au moins 500 cartes.");
  if (new Set(cards.map((card) => card.id)).size !== cards.length)
    throw new Error("Chaque carte doit avoir un identifiant unique.");
  if (cards.some((card) => card.forbidden.length !== 3))
    throw new Error("Chaque carte doit contenir trois mots interdits.");
}
function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
function assertStatus(game: GameState, expected: GameState["status"]): void {
  if (game.status !== expected)
    throw new Error(`Action impossible pendant l’état « ${game.status} ».`);
}
