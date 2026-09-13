import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MAX_PLAYERS, MIN_PLAYERS, ROUND_COUNT } from "./engine";
import type { GameState } from "./types";

const STORAGE_KEY = "pifometre:current-game";

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
    game.schemaVersion === 3 &&
    (game.playMode === "turns" || game.playMode === "quick") &&
    (game.status === "answering" || game.status === "question" || game.status === "revealed" || game.status === "finished") &&
    Array.isArray(game.players) &&
    game.players.length >= MIN_PLAYERS &&
    game.players.length <= MAX_PLAYERS &&
    game.players.every((player) => player && typeof player.id === "string" && typeof player.name === "string" && Number.isInteger(player.score)) &&
    typeof game.roundIndex === "number" &&
    Number.isInteger(game.roundIndex) &&
    game.roundIndex >= 0 &&
    Array.isArray(game.selectedQuestionIds) &&
    game.selectedQuestionIds.length === ROUND_COUNT &&
    new Set(game.selectedQuestionIds).size === ROUND_COUNT &&
    typeof game.currentPlayerIndex === "number" &&
    Number.isInteger(game.currentPlayerIndex) &&
    game.currentPlayerIndex >= 0 &&
    game.currentPlayerIndex < game.players.length &&
    !!game.answers &&
    typeof game.answers === "object" &&
    (game.reveal === null || typeof game.reveal === "object") &&
    (game.awardedPlayerId === null || typeof game.awardedPlayerId === "string") &&
    (game.awardedKind === null || game.awardedKind === "closest" || game.awardedKind === "exact") &&
    (game.reveal === null || (typeof game.reveal === "object" && typeof game.reveal.answer === "number" && typeof game.reveal.sourceLabel === "string" && typeof game.reveal.sourceUrl === "string"))
  );
}
