import type { GameState } from "./types";
import { STANDARD_ROUNDS } from "./engine";

const STORAGE_KEY = "la-relance:current-game";
const MAX_ROUND_INDEX = STANDARD_ROUNDS;

export function loadCurrentGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isGameState(value)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function saveCurrentGame(game: GameState): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  }
}

export function clearCurrentGame(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;
  return (
    game.schemaVersion === 1 &&
    (game.status === "playing" || game.status === "pointAwarded" || game.status === "finished") &&
    Array.isArray(game.teams) &&
    game.teams.length === 2 &&
    game.teams.every(
      (team) =>
        team &&
        typeof team.name === "string" &&
        typeof team.score === "number" &&
        Number.isInteger(team.score),
    ) &&
    typeof game.roundIndex === "number" &&
    Number.isInteger(game.roundIndex) &&
    game.roundIndex >= 0 &&
    game.roundIndex <= MAX_ROUND_INDEX &&
    Array.isArray(game.selectedThemeIds) &&
    game.selectedThemeIds.length >= MAX_ROUND_INDEX + 1 &&
    new Set(game.selectedThemeIds).size === game.selectedThemeIds.length &&
    typeof game.suddenDeath === "boolean"
  );
}
