import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { CARD_VALUES, SUITS } from "../../data/deck";
import { MIN_PLAYERS } from "./engine";
import type { Card, CardValue, GamePhase, GameState, Player, Suit } from "./types";

const STORAGE_KEY = "fuck:current-game";
const PHASES: readonly GamePhase[] = ["ready", "judging", "handoff", "end"];

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
  return (
    game.schemaVersion === 1 &&
    typeof game.id === "string" &&
    Array.isArray(game.players) &&
    game.players.length >= MIN_PLAYERS &&
    game.players.every(isPlayer) &&
    isIndex(game.masterIndex, game.players.length) &&
    isIndex(game.targetIndex, game.players.length) &&
    typeof game.phase === "string" &&
    PHASES.includes(game.phase as GamePhase) &&
    Array.isArray(game.remainingDeck) &&
    game.remainingDeck.every(isCard) &&
    Array.isArray(game.revealedCards) &&
    game.revealedCards.every(isCard) &&
    (game.currentCard === null || isCard(game.currentCard)) &&
    Number.isInteger(game.masterStreak) &&
    typeof game.masterStreak === "number" &&
    game.masterStreak >= 0 &&
    Number.isInteger(game.roundsPlayed) &&
    typeof game.roundsPlayed === "number" &&
    game.roundsPlayed >= 0 &&
    (game.lastOutcome === null || isLastOutcome(game.lastOutcome))
  );
}

function isIndex(value: unknown, length: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < length;
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string" && typeof player.name === "string" && player.name.length > 0;
}

function isCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<Card>;
  return (
    typeof card.id === "string" &&
    typeof card.suit === "string" &&
    SUITS.includes(card.suit as Suit) &&
    typeof card.value === "string" &&
    CARD_VALUES.includes(card.value as CardValue)
  );
}

function isLastOutcome(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const outcome = value as Record<string, unknown>;
  return (
    (outcome.outcome === "master-won" || outcome.outcome === "master-failed") &&
    typeof outcome.cardId === "string" &&
    typeof outcome.targetId === "string" &&
    typeof outcome.masterId === "string"
  );
}
