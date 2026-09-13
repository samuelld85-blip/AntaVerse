import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MIN_PLAYERS } from "./engine";
import type { GamePhase, GameState, Notice, Player } from "./types";

const STORAGE_KEY = "interpol:current-game";
const PHASES: readonly GamePhase[] = ["handoff", "briefing", "guessing", "result", "end"];

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
    Array.isArray(game.deck) &&
    game.deck.every(isNotice) &&
    (game.currentNotice === null || isNotice(game.currentNotice)) &&
    Number.isInteger(game.roundNumber) &&
    Number.isInteger(game.totalRounds) &&
    typeof game.phase === "string" &&
    PHASES.includes(game.phase as GamePhase) &&
    (game.lastWinnerId === null || typeof game.lastWinnerId === "string") &&
    (game.status === "in_progress" || game.status === "finished")
  );
}

function isIndex(value: unknown, length: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < length;
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return (
    typeof player.id === "string" &&
    typeof player.name === "string" &&
    player.name.length > 0 &&
    typeof player.wins === "number"
  );
}

function isNotice(value: unknown): value is Notice {
  if (!value || typeof value !== "object") return false;
  const notice = value as Partial<Notice>;
  return (
    typeof notice.id === "string" &&
    typeof notice.imageUrl === "string" &&
    typeof notice.fullName === "string" &&
    typeof notice.nationality === "string" &&
    typeof notice.charge === "string" &&
    typeof notice.sourceUrl === "string"
  );
}
