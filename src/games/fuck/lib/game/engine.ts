import { createGameId } from "@/games/shared/lib/two-team-setup";
import { CARD_VALUES, shuffleDeck } from "../../data/deck";
import type {
  CreateGameInput,
  GameState,
  Player,
  RoundOutcome,
} from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;

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

  const players: Player[] = names.map((name, index) => ({ id: `player-${index + 1}`, name }));
  const timestamp = new Date(now).toISOString();

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    players,
    masterIndex: 0,
    targetIndex: nextTargetIndex(0, players.length, 0),
    phase: "ready",
    remainingDeck: shuffleDeck(random),
    revealedCards: [],
    currentCard: null,
    masterStreak: 0,
    roundsPlayed: 0,
    lastOutcome: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** The next player in entry order, skipping whoever currently holds the role. */
export function nextTargetIndex(fromIndex: number, playerCount: number, masterIndex: number): number {
  if (playerCount <= 1) return masterIndex;
  for (let offset = 1; offset <= playerCount; offset += 1) {
    const candidate = (fromIndex + offset) % playerCount;
    if (candidate !== masterIndex) return candidate;
  }
  return masterIndex;
}

export function startRound(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "ready" || game.remainingDeck.length === 0) return game;
  const [card, ...remainingDeck] = game.remainingDeck;
  if (!card) return game;
  return touch(
    {
      ...game,
      phase: "judging",
      remainingDeck,
      revealedCards: [...game.revealedCards, card],
      currentCard: card,
      roundsPlayed: game.roundsPlayed + 1,
    },
    now,
  );
}

export function resolveRound(
  game: GameState,
  outcome: RoundOutcome,
  now = Date.now(),
): GameState {
  if (game.phase !== "judging" || !game.currentCard) return game;

  const masterStreak = outcome === "master-won" ? game.masterStreak + 1 : 0;
  const lastOutcome = {
    outcome,
    cardId: game.currentCard.id,
    targetId: game.players[game.targetIndex]!.id,
    masterId: game.players[game.masterIndex]!.id,
  };

  if (game.remainingDeck.length === 0) {
    return touch({ ...game, phase: "end", currentCard: null, masterStreak, lastOutcome }, now);
  }

  if (masterStreak >= 3) {
    return touch({ ...game, phase: "handoff", currentCard: null, masterStreak, lastOutcome }, now);
  }

  return touch(
    {
      ...game,
      phase: "ready",
      currentCard: null,
      targetIndex: nextTargetIndex(game.targetIndex, game.players.length, game.masterIndex),
      masterStreak,
      lastOutcome,
    },
    now,
  );
}

/** The current master chooses any other player to take the role. */
export function chooseNewMaster(game: GameState, playerId: string, now = Date.now()): GameState {
  if (game.phase !== "handoff") return game;
  const newMasterIndex = game.players.findIndex((player) => player.id === playerId);
  if (newMasterIndex < 0 || newMasterIndex === game.masterIndex) return game;

  return touch(
    {
      ...game,
      phase: "ready",
      masterIndex: newMasterIndex,
      targetIndex: nextTargetIndex(game.targetIndex, game.players.length, newMasterIndex),
      masterStreak: 0,
    },
    now,
  );
}

export function getMaster(game: GameState): Player {
  return game.players[game.masterIndex]!;
}

export function getTarget(game: GameState): Player {
  return game.players[game.targetIndex]!;
}

export function cardValueLabel(value: (typeof CARD_VALUES)[number]): string {
  switch (value) {
    case "J": return "Valet";
    case "Q": return "Dame";
    case "K": return "Roi";
    case "A": return "As";
    default: return value;
  }
}

export function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
