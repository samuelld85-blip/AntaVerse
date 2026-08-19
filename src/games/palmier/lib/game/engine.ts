// Palmier — 52-card deck engine. Tapping the palm draws one card from the
// pre-shuffled deck and immediately updates Kings/Maître state. The palm's
// visual stage is derived purely from `kingsDrawn`. No random instability,
// no categories, no event resolvers.

import { createGameId } from "@/games/shared/lib/two-team-setup";
import { createDeck, shuffleDeck } from "../../data/deck";
import { nextPlayerIndex } from "./players";
import type { CreateGameInput, GameState, PalmStage, Player } from "./types";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;

/** Maps the number of Kings drawn to the palm's visible stage. */
export function palmStageForKings(kingsDrawn: number): PalmStage {
  if (kingsDrawn >= 3) return "critical";
  if (kingsDrawn === 2) return "unstable";
  if (kingsDrawn === 1) return "shaky";
  return "stable";
}

export function createGame(
  input: CreateGameInput,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const names = input.playerNames.map(cleanPlayerName);

  if (names.length < MIN_PLAYERS) {
    throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour planter le palmier.`);
  }
  if (names.length > MAX_PLAYERS) {
    throw new Error(`Impossible de dépasser ${MAX_PLAYERS} joueurs.`);
  }
  if (names.some((name) => name.length === 0)) {
    throw new Error("Chaque joueur doit avoir un nom.");
  }

  const players: Player[] = names.map((name, index) => ({ id: `player-${index}`, name }));
  const activePlayerIndex = Math.floor(random() * players.length);
  const remainingDeck = shuffleDeck(createDeck(), random);
  const timestamp = new Date(now).toISOString();

  return {
    schemaVersion: 2,
    id: createGameId(now, random),
    players,
    activePlayerIndex,
    phase: "idle",
    remainingDeck,
    currentCard: null,
    kingsDrawn: 0,
    maitrePouce: null,
    maitreQuestions: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function replayGame(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  return createGame({ playerNames: game.players.map((player) => player.name) }, random, now);
}

export function getActivePlayer(game: GameState): Player {
  return game.players[game.activePlayerIndex]!;
}

/**
 * Draws the top card from the remaining deck and updates derived state
 * (kingsDrawn, maitrePouce, maitreQuestions). Only fires from "idle".
 *
 * If the draw produces the 4th King, phase becomes "collapse".
 * Otherwise phase becomes "reveal".
 */
export function drawCard(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "idle" || game.remainingDeck.length === 0) return game;

  const [card, ...rest] = game.remainingDeck;
  const drawn = card!;
  const activePlayer = getActivePlayer(game);

  let kingsDrawn = game.kingsDrawn;
  let maitrePouce = game.maitrePouce;
  let maitreQuestions = game.maitreQuestions;

  if (drawn.value === "K") kingsDrawn = game.kingsDrawn + 1;
  if (drawn.value === "5") maitrePouce = activePlayer.name;
  if (drawn.value === "Q") maitreQuestions = activePlayer.name;

  const phase = kingsDrawn === 4 ? "collapse" : "reveal";

  return touch({ ...game, remainingDeck: rest, currentCard: drawn, kingsDrawn, maitrePouce, maitreQuestions, phase }, now);
}

/**
 * Advances to the next player after the rule has been read.
 * If the deck is now empty, moves to "end" instead of "idle".
 * Only fires from "reveal".
 */
export function completeTurn(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "reveal") return game;

  const nextIndex = nextPlayerIndex(game.activePlayerIndex, game.players.length);
  const phase = game.remainingDeck.length === 0 ? "end" : "idle";

  return touch({ ...game, phase, activePlayerIndex: nextIndex, currentCard: null }, now);
}

/**
 * Ends the collapse sequence, replants the palm (visual only — deck continues
 * as-is), advances to the next player. Only fires from "collapse".
 */
export function completeCollapse(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "collapse") return game;

  const nextIndex = nextPlayerIndex(game.activePlayerIndex, game.players.length);
  const phase = game.remainingDeck.length === 0 ? "end" : "idle";

  return touch({ ...game, phase, activePlayerIndex: nextIndex, currentCard: null }, now);
}

// --- Internals ---------------------------------------------------------------

function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
