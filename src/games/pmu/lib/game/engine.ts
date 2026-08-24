import { createGameId } from "@/games/shared/lib/two-team-setup";
import { CARD_VALUES, SUITS, shuffleDeck } from "../../data/deck";
import type { Bet, CardValue, CheckpointReveal, CreateGameInput, GameState, LastDraw, Player, Settlement, Suit } from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;
export const BET_UNITS = 5;
export const CHECKPOINT_COUNT = 6;
export const FINISH_POSITION = CHECKPOINT_COUNT + 1;
export const SUIT_ORDER: readonly Suit[] = ["♥", "♦", "♣", "♠"];

export const HORSE_LABELS: Record<Suit, string> = {
  "♥": "Cœur",
  "♦": "Carreau",
  "♣": "Trèfle",
  "♠": "Pique",
};

export function createGame(input: CreateGameInput, random: () => number = Math.random, now = Date.now): GameState {
  const names = input.playerNames.map(cleanPlayerName);
  if (names.length < MIN_PLAYERS) throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour commencer.`);
  if (names.length > MAX_PLAYERS) throw new Error(`Impossible de dépasser ${MAX_PLAYERS} joueurs.`);
  if (names.some((name) => name.length === 0)) throw new Error("Chaque joueur doit avoir un nom.");

  const players: Player[] = names.map((name, index) => ({ id: `player-${index + 1}`, name }));
  const deck = shuffleDeck(random);
  const timestamp = new Date(now()).toISOString();
  return {
    schemaVersion: 1,
    id: createGameId(now(), random),
    players,
    currentPlayerIndex: 0,
    bets: Object.fromEntries(players.map((player) => [player.id, null])),
    phase: "betting",
    checkpointCards: deck.slice(0, CHECKPOINT_COUNT),
    revealedCheckpoints: Array.from({ length: CHECKPOINT_COUNT }, () => false),
    remainingDeck: deck.slice(CHECKPOINT_COUNT),
    horsePositions: emptyPositions(),
    lastDraw: null,
    winnerSuit: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function submitBet(game: GameState, playerId: string, bet: Bet, now = Date.now()): GameState {
  if (game.phase !== "betting" || game.players[game.currentPlayerIndex]?.id !== playerId) return game;
  validateBet(bet);
  const bets = { ...game.bets, [playerId]: { ...bet } };
  const nextPlayerIndex = game.currentPlayerIndex + 1;
  return touch({
    ...game,
    bets,
    currentPlayerIndex: nextPlayerIndex < game.players.length ? nextPlayerIndex : 0,
    phase: nextPlayerIndex < game.players.length ? "betting" : "race",
  }, now);
}

export function drawCard(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "race") return game;
  const card = game.remainingDeck[0];
  if (!card) return touch({ ...game, phase: "end" }, now);

  const positions = { ...game.horsePositions, [card.suit]: game.horsePositions[card.suit] + 1 };
  const revealedCheckpoints = [...game.revealedCheckpoints];
  const reveals: CheckpointReveal[] = [];
  let nextCheckpoint = revealedCheckpoints.findIndex((revealed) => !revealed);
  while (nextCheckpoint >= 0 && allHorsesAtOrPast(positions, nextCheckpoint + 1)) {
    const checkpointCard = game.checkpointCards[nextCheckpoint];
    if (!checkpointCard) break;
    revealedCheckpoints[nextCheckpoint] = true;
    const penalizedSuit = checkpointCard.suit;
    positions[penalizedSuit] = Math.max(0, positions[penalizedSuit] - 1);
    reveals.push({ index: nextCheckpoint, card: checkpointCard, penalizedSuit });
    nextCheckpoint = revealedCheckpoints.findIndex((revealed) => !revealed);
  }

  const winnerSuit = SUIT_ORDER.find((suit) => positions[suit] >= FINISH_POSITION) ?? null;
  const lastDraw: LastDraw = { card, movedSuit: card.suit, revealedCheckpoints: reveals };
  return touch({
    ...game,
    phase: winnerSuit ? "end" : "race",
    remainingDeck: game.remainingDeck.slice(1),
    horsePositions: positions,
    revealedCheckpoints,
    lastDraw,
    winnerSuit,
  }, now);
}

export function getCurrentPlayer(game: GameState): Player {
  return game.players[game.currentPlayerIndex]!;
}

export function getSettlement(game: GameState): Settlement[] {
  if (!game.winnerSuit) return game.players.map((player) => ({ playerId: player.id, winningUnits: 0, losingUnits: game.bets[player.id]?.amount ?? 0 }));
  return game.players.map((player) => {
    const bet = game.bets[player.id];
    const winningUnits = bet?.suit === game.winnerSuit ? bet.amount : 0;
    return { playerId: player.id, winningUnits, losingUnits: winningUnits > 0 ? 0 : bet?.amount ?? 0 };
  });
}

export function cardValueLabel(value: CardValue): string {
  switch (value) {
    case "J": return "Valet";
    case "Q": return "Dame";
    case "K": return "Roi";
    default: return value;
  }
}

export function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function validateBet(bet: Bet): void {
  if (!Number.isInteger(bet.amount) || bet.amount < 1 || bet.amount > BET_UNITS || !SUIT_ORDER.includes(bet.suit)) {
    throw new Error(`La mise doit être comprise entre 1 et ${BET_UNITS} gorgées, sur une seule couleur.`);
  }
}

function emptyPositions(): Record<Suit, number> {
  return { "♥": 0, "♦": 0, "♣": 0, "♠": 0 };
}

function allHorsesAtOrPast(positions: Record<Suit, number>, position: number): boolean {
  return SUIT_ORDER.every((suit) => positions[suit] >= position);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}

export { CARD_VALUES, SUITS };
