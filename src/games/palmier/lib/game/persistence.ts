import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MIN_PLAYERS } from "./engine";
import type { Card, CardValue, GamePhase, GameState, Player, Suit } from "./types";

const STORAGE_KEY = "palmier:current-game";

const SUITS: readonly string[] = ["♠", "♥", "♦", "♣"];
const VALUES: readonly string[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];
const PHASES: readonly GamePhase[] = ["idle", "reveal", "collapse", "end"];

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

  if (game.schemaVersion !== 2) return false;
  if (!Array.isArray(game.players) || game.players.length < MIN_PLAYERS) return false;
  if (!game.players.every(isPlayer)) return false;
  if (
    typeof game.activePlayerIndex !== "number" ||
    !Number.isInteger(game.activePlayerIndex) ||
    game.activePlayerIndex < 0 ||
    game.activePlayerIndex >= game.players.length
  ) {
    return false;
  }
  if (typeof game.phase !== "string" || !PHASES.includes(game.phase as GamePhase)) return false;
  if (!Array.isArray(game.remainingDeck) || !game.remainingDeck.every(isCard)) return false;
  if (game.currentCard !== null && game.currentCard !== undefined && !isCard(game.currentCard)) {
    return false;
  }
  if (
    typeof game.kingsDrawn !== "number" ||
    !Number.isInteger(game.kingsDrawn) ||
    game.kingsDrawn < 0 ||
    game.kingsDrawn > 4
  ) {
    return false;
  }
  if (game.maitrePouce !== null && game.maitrePouce !== undefined && typeof game.maitrePouce !== "string") {
    return false;
  }
  if (game.maitreQuestions !== null && game.maitreQuestions !== undefined && typeof game.maitreQuestions !== "string") {
    return false;
  }
  return true;
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string" && typeof player.name === "string" && player.name.length > 0;
}

function isCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.suit === "string" &&
    SUITS.includes(card.suit as Suit) &&
    typeof card.value === "string" &&
    VALUES.includes(card.value as CardValue)
  );
}
