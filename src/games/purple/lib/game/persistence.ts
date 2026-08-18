import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import type { Card, GameState } from "./types";

const STORAGE_KEY = "purple:current-game";

export function loadCurrentGame(): GameState | null {
  return readJson(STORAGE_KEY, isGameState);
}

export function saveCurrentGame(game: GameState): void {
  writeJson(STORAGE_KEY, game);
}

export function clearCurrentGame(): void {
  removeJson(STORAGE_KEY);
}

function isCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<Card>;
  return (
    typeof card.id === "string" &&
    typeof card.suit === "string" &&
    typeof card.rank === "string" &&
    (card.color === "red" || card.color === "black")
  );
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;
  return (
    game.schemaVersion === 1 &&
    typeof game.id === "string" &&
    Array.isArray(game.players) &&
    game.players.length >= 2 &&
    game.players.every(
      (player) => player && typeof player.id === "string" && typeof player.name === "string",
    ) &&
    typeof game.currentPlayerIndex === "number" &&
    Number.isInteger(game.currentPlayerIndex) &&
    game.currentPlayerIndex >= 0 &&
    game.currentPlayerIndex < game.players.length &&
    Array.isArray(game.deck) &&
    game.deck.every(isCard) &&
    typeof game.pile === "number" &&
    Number.isInteger(game.pile) &&
    game.pile >= 0 &&
    typeof game.progress === "number" &&
    Number.isInteger(game.progress) &&
    game.progress >= 0 &&
    (game.lastGuess === null || isLastGuess(game.lastGuess))
  );
}

function isLastGuess(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const guess = value as Record<string, unknown>;
  return (
    typeof guess.guessType === "string" &&
    typeof guess.playerId === "string" &&
    Array.isArray(guess.cards) &&
    guess.cards.every(isCard) &&
    (guess.outcome === "success" || guess.outcome === "failure") &&
    typeof guess.cardsGained === "number" &&
    typeof guess.sipsAdded === "number" &&
    typeof guess.sipsDrunk === "number" &&
    typeof guess.reshuffled === "boolean"
  );
}
