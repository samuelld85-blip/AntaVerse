import { shuffle } from "@/lib/random";
import { createGameId } from "@/games/shared/lib/two-team-setup";
import { NOTICES } from "../../data/notices";
import type { CreateGameInput, GameState, Notice, Player } from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;
export const TOTAL_ROUNDS = 10;

export function createGame(
  input: CreateGameInput,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const names = input.playerNames.map((name) => cleanPlayerName(name));
  if (names.length < MIN_PLAYERS) {
    throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour commencer.`);
  }
  if (names.length > MAX_PLAYERS) {
    throw new Error(`Impossible de dépasser ${MAX_PLAYERS} joueurs.`);
  }
  if (names.some((name) => name.length === 0)) {
    throw new Error("Chaque joueur doit avoir un nom.");
  }

  const players: Player[] = names.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    wins: 0,
  }));
  const timestamp = new Date(now).toISOString();

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    players,
    masterIndex: 0,
    deck: buildDeck(TOTAL_ROUNDS, random),
    currentNotice: null,
    roundNumber: 1,
    totalRounds: TOTAL_ROUNDS,
    phase: "handoff",
    lastWinnerId: null,
    status: "in_progress",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Cycles the notice pool with fresh shuffles until there are enough rounds. */
function buildDeck(totalRounds: number, random: () => number): Notice[] {
  if (NOTICES.length === 0) return [];
  const deck: Notice[] = [];
  while (deck.length < totalRounds) {
    deck.push(...shuffle(NOTICES, random));
  }
  return deck.slice(0, totalRounds);
}

/** The master draws the round's notice and moves to their private briefing. */
export function revealToMaster(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "handoff") return game;
  const [notice, ...deck] = game.deck;
  if (!notice) return touch({ ...game, phase: "end", status: "finished" }, now);
  return touch({ ...game, phase: "briefing", currentNotice: notice, deck }, now);
}

/** The master has memorized the charge — the portrait can now go public. */
export function confirmBriefing(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "briefing") return game;
  return touch({ ...game, phase: "guessing" }, now);
}

/** The master picks who found the charge out loud. */
export function resolveRound(game: GameState, winnerId: string, now = Date.now()): GameState {
  if (game.phase !== "guessing") return game;
  const winner = game.players.find((player) => player.id === winnerId);
  if (!winner || winner.id === getMaster(game).id) return game;

  const players = game.players.map((player) =>
    player.id === winnerId ? { ...player, wins: player.wins + 1 } : player,
  );

  return touch({ ...game, players, phase: "result", lastWinnerId: winnerId }, now);
}

export function nextRound(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "result" || !game.lastWinnerId) return game;
  if (game.roundNumber >= game.totalRounds) {
    return touch({ ...game, phase: "end", status: "finished", currentNotice: null }, now);
  }
  const nextMasterIndex = game.players.findIndex((player) => player.id === game.lastWinnerId);

  return touch(
    {
      ...game,
      phase: "handoff",
      masterIndex: nextMasterIndex,
      currentNotice: null,
      roundNumber: game.roundNumber + 1,
      lastWinnerId: null,
    },
    now,
  );
}

export function getMaster(game: GameState): Player {
  return game.players[game.masterIndex]!;
}

export function getGuessers(game: GameState): Player[] {
  return game.players.filter((_, index) => index !== game.masterIndex);
}

/** Players sorted best score first; ties keep entry order. */
export function ranking(game: GameState): Player[] {
  return game.players
    .map((player, index) => ({ player, index }))
    .sort((a, b) => b.player.wins - a.player.wins || a.index - b.index)
    .map(({ player }) => player);
}

export function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
