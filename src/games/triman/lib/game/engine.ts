// Triman's game-state machine. Two phases alternate forever (there is no
// win condition): SEARCHING_TRIMAN, where players roll once each in
// circular order until someone qualifies, and ACTIVE_TRIMAN, where the
// full rule engine (see rules.ts) applies and a player keeps rolling for
// as long as their rolls keep triggering effects.
//
// `rollForCurrentPlayer` is the single entry point for advancing the game:
// roll -> evaluate -> collect effects -> decide whether the same player
// rolls again or play passes on, exactly as laid out in the spec.

import { createGameId } from "@/games/shared/lib/two-team-setup";
import { rollDice } from "./dice";
import { nextPlayerIndex } from "./players";
import { evaluateActiveRoll, isTrimanRoll } from "./rules";
import type { CreateGameInput, DiceRoll, GamePhase, GameState, Player } from "./types";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;

export function createGame(
  input: CreateGameInput,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const names = input.playerNames.map((name) => cleanPlayerName(name));

  if (names.length < MIN_PLAYERS) {
    throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour lancer une partie.`);
  }
  if (names.some((name) => name.length === 0)) {
    throw new Error("Chaque joueur doit avoir un nom.");
  }

  const players: Player[] = names.map((name, index) => ({ id: `player-${index}`, name }));
  const currentPlayerIndex = Math.floor(random() * players.length);
  const timestamp = new Date(now).toISOString();

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    players,
    currentPlayerIndex,
    phase: "SEARCHING_TRIMAN",
    trimanPlayerId: null,
    lastRoll: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function rollForCurrentPlayer(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const dice = rollDice(random);
  const roller = game.players[game.currentPlayerIndex]!;
  const phaseAtRoll: GamePhase = game.phase;

  if (game.phase === "SEARCHING_TRIMAN") {
    return applySearchRoll(game, dice, roller, phaseAtRoll, now);
  }
  return applyActiveRoll(game, dice, roller, phaseAtRoll, now);
}

function applySearchRoll(
  game: GameState,
  dice: DiceRoll,
  roller: Player,
  phaseAtRoll: GamePhase,
  now: number,
): GameState {
  const found = isTrimanRoll(dice);
  const advancedIndex = nextPlayerIndex(game.currentPlayerIndex, game.players.length);

  if (!found) {
    return touch(
      {
        ...game,
        currentPlayerIndex: advancedIndex,
        lastRoll: {
          dice,
          effects: [],
          rollAgain: false,
          trimanFound: false,
          playerId: roller.id,
          phaseAtRoll,
        },
      },
      now,
    );
  }

  // The Triman is found: normal play begins with the player after them.
  return touch(
    {
      ...game,
      phase: "ACTIVE_TRIMAN",
      trimanPlayerId: roller.id,
      currentPlayerIndex: advancedIndex,
      lastRoll: {
        dice,
        effects: [],
        rollAgain: false,
        trimanFound: true,
        playerId: roller.id,
        phaseAtRoll,
      },
    },
    now,
  );
}

function applyActiveRoll(
  game: GameState,
  dice: DiceRoll,
  roller: Player,
  phaseAtRoll: GamePhase,
  now: number,
): GameState {
  const effects = evaluateActiveRoll({
    dice,
    players: game.players,
    currentPlayerIndex: game.currentPlayerIndex,
    trimanPlayerId: game.trimanPlayerId!,
  });

  if (effects.length > 0) {
    // Any triggered rule means the same player rolls again.
    return touch(
      {
        ...game,
        lastRoll: {
          dice,
          effects,
          rollAgain: true,
          trimanFound: false,
          playerId: roller.id,
          phaseAtRoll,
        },
      },
      now,
    );
  }

  // Zero effects: this player's turn ends.
  const advancedIndex = nextPlayerIndex(game.currentPlayerIndex, game.players.length);
  const rollerWasTriman = roller.id === game.trimanPlayerId;

  if (rollerWasTriman) {
    // The Triman just completed their own full normal turn: their cycle is
    // over, and the next player starts a fresh search.
    return touch(
      {
        ...game,
        phase: "SEARCHING_TRIMAN",
        trimanPlayerId: null,
        currentPlayerIndex: advancedIndex,
        lastRoll: {
          dice,
          effects: [],
          rollAgain: false,
          trimanFound: false,
          playerId: roller.id,
          phaseAtRoll,
        },
      },
      now,
    );
  }

  return touch(
    {
      ...game,
      currentPlayerIndex: advancedIndex,
      lastRoll: {
        dice,
        effects: [],
        rollAgain: false,
        trimanFound: false,
        playerId: roller.id,
        phaseAtRoll,
      },
    },
    now,
  );
}

export function replayGame(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  return createGame({ playerNames: game.players.map((player) => player.name) }, random, now);
}

export function getCurrentPlayer(game: GameState): Player {
  return game.players[game.currentPlayerIndex]!;
}

export function getTrimanPlayer(game: GameState): Player | null {
  if (!game.trimanPlayerId) return null;
  return game.players.find((player) => player.id === game.trimanPlayerId) ?? null;
}

function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
