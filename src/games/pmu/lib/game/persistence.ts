import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { BET_UNITS, CHECKPOINT_COUNT, MAX_PLAYERS, MIN_PLAYERS, SUIT_ORDER } from "./engine";
import type { Bet, Card, CardValue, GamePhase, GameState, LastDraw, Player, Suit } from "./types";
import { CARD_VALUES, SUITS } from "../../data/deck";

const STORAGE_KEY = "pmu:current-game";
const PHASES: readonly GamePhase[] = ["betting", "race", "end"];

export function loadCurrentGame(): GameState | null {
  return readJson(STORAGE_KEY, isGameState);
}

export function saveCurrentGame(game: GameState): void {
  writeJson(STORAGE_KEY, game);
}

export function clearCurrentGame(): void {
  removeJson(STORAGE_KEY);
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;
  return game.schemaVersion === 1 && typeof game.id === "string" &&
    Array.isArray(game.players) && game.players.length >= MIN_PLAYERS && game.players.length <= MAX_PLAYERS && game.players.every(isPlayer) &&
    isIndex(game.currentPlayerIndex, game.players.length) && isBets(game.bets, game.players) && PHASES.includes(game.phase as GamePhase) &&
    Array.isArray(game.checkpointCards) && game.checkpointCards.length === CHECKPOINT_COUNT && game.checkpointCards.every(isCard) &&
    Array.isArray(game.revealedCheckpoints) && game.revealedCheckpoints.length === CHECKPOINT_COUNT && game.revealedCheckpoints.every((item) => typeof item === "boolean") &&
    Array.isArray(game.remainingDeck) && game.remainingDeck.every(isCard) && isPositions(game.horsePositions) &&
    (game.lastDraw === null || isLastDraw(game.lastDraw)) && (game.winnerSuit === null || SUITS.includes(game.winnerSuit as Suit));
}

function isBets(value: unknown, players: Player[]): value is Record<string, Bet | null> {
  if (!value || typeof value !== "object") return false;
  const bets = value as Record<string, unknown>;
  return players.every((player) => bets[player.id] === null || isBet(bets[player.id]));
}

function isBet(value: unknown): value is Bet {
  if (!value || typeof value !== "object") return false;
  const bet = value as Partial<Bet>;
  return typeof bet.amount === "number" && Number.isInteger(bet.amount) && bet.amount >= 1 && bet.amount <= BET_UNITS && SUIT_ORDER.includes(bet.suit as Suit);
}

function isPositions(value: unknown): value is Record<Suit, number> {
  if (!value || typeof value !== "object") return false;
  const positions = value as Partial<Record<Suit, unknown>>;
  return SUIT_ORDER.every((suit) => typeof positions[suit] === "number" && Number.isInteger(positions[suit]) && positions[suit]! >= 0);
}

function isLastDraw(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const draw = value as Partial<LastDraw>;
  return !!draw.card && isCard(draw.card) && SUITS.includes(draw.movedSuit as Suit) && Array.isArray(draw.revealedCheckpoints) && draw.revealedCheckpoints.every((reveal) => {
    if (!reveal || typeof reveal !== "object") return false;
    const item = reveal as { index?: unknown; card?: unknown; penalizedSuit?: unknown };
    return typeof item.index === "number" && Number.isInteger(item.index) && item.index >= 0 && item.index < CHECKPOINT_COUNT && isCard(item.card) && SUITS.includes(item.penalizedSuit as Suit);
  });
}

function isCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<Card>;
  return typeof card.id === "string" && SUITS.includes(card.suit as Suit) && CARD_VALUES.includes(card.value as CardValue);
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string" && typeof player.name === "string" && player.name.length > 0;
}

function isIndex(value: unknown, length: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < length;
}
