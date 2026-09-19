import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import type { GameState } from "./types";

const STORAGE_KEY = "qui-de-nous-deux:current-game";

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
  const roundIndex = game.roundIndex;
  const secondsLeft = game.secondsLeft;
  return (
    game.schemaVersion === 1 &&
    !!game.id &&
    !!game.duo && typeof game.duo.name === "string" && Number.isInteger(game.duo.score) &&
    !!game.questionTeam && typeof game.questionTeam.name === "string" && Number.isInteger(game.questionTeam.score) &&
    Array.isArray(game.questionIds) && game.questionIds.length >= 5 && new Set(game.questionIds).size === game.questionIds.length &&
    typeof roundIndex === "number" && Number.isInteger(roundIndex) && roundIndex >= 0 && roundIndex < game.questionIds.length &&
    (game.phase === "question" || game.phase === "reveal" || game.phase === "finished") &&
    Number.isInteger(game.timerSeconds) && typeof secondsLeft === "number" && Number.isInteger(secondsLeft) && secondsLeft >= 0 &&
    (game.lastResult === null || (typeof game.lastResult === "object" && (game.lastResult.outcome === "same" || game.lastResult.outcome === "different") && (game.lastResult.pointsTo === "duo" || game.lastResult.pointsTo === "questioners")))
  );
}
