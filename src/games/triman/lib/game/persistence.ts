import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MIN_PLAYERS } from "./engine";
import type { GamePhase, GameState, Player, RollEffect } from "./types";

const STORAGE_KEY = "triman:current-game";

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

  if (game.schemaVersion !== 1) return false;
  if (!Array.isArray(game.players) || game.players.length < MIN_PLAYERS) return false;
  if (!game.players.every(isPlayer)) return false;
  if (
    typeof game.currentPlayerIndex !== "number" ||
    !Number.isInteger(game.currentPlayerIndex) ||
    game.currentPlayerIndex < 0 ||
    game.currentPlayerIndex >= game.players.length
  ) {
    return false;
  }
  if (!isPhase(game.phase)) return false;
  if (game.phase === "SEARCHING_TRIMAN" && game.trimanPlayerId !== null) return false;
  if (game.phase === "ACTIVE_TRIMAN" && typeof game.trimanPlayerId !== "string") return false;
  if (game.lastRoll !== null && !isLastRoll(game.lastRoll)) return false;

  return true;
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string" && typeof player.name === "string" && player.name.length > 0;
}

function isPhase(value: unknown): value is GamePhase {
  return value === "SEARCHING_TRIMAN" || value === "ACTIVE_TRIMAN";
}

function isEffect(value: unknown): value is RollEffect {
  if (!value || typeof value !== "object") return false;
  const effect = value as Partial<RollEffect>;
  return (
    typeof effect.kind === "string" &&
    typeof effect.headline === "string" &&
    typeof effect.detail === "string" &&
    typeof effect.isReflex === "boolean"
  );
}

function isLastRoll(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const lastRoll = value as Record<string, unknown>;
  const dice = lastRoll.dice as { a?: unknown; b?: unknown } | undefined;
  return (
    !!dice &&
    typeof dice.a === "number" &&
    typeof dice.b === "number" &&
    Array.isArray(lastRoll.effects) &&
    lastRoll.effects.every(isEffect) &&
    typeof lastRoll.rollAgain === "boolean" &&
    typeof lastRoll.trimanFound === "boolean" &&
    typeof lastRoll.playerId === "string" &&
    isPhase(lastRoll.phaseAtRoll)
  );
}
