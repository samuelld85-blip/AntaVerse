import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import type { GameState, RoundGuess, RoundOutcome, RoundPhase } from "./types";

const STORAGE_KEY = "ethnoguessr:current-game";

const PHASES: readonly RoundPhase[] = ["viewing", "guessing", "result"];
const STATUSES: readonly GameState["status"][] = ["playing", "completed"];

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
  if (typeof game.status !== "string" || !STATUSES.includes(game.status)) return false;
  if (!Array.isArray(game.duoIds) || !game.duoIds.every((id) => typeof id === "string")) {
    return false;
  }
  if (game.duoIds.length === 0) return false;
  if (
    typeof game.currentRoundIndex !== "number" ||
    !Number.isInteger(game.currentRoundIndex) ||
    game.currentRoundIndex < 0 ||
    game.currentRoundIndex >= game.duoIds.length
  ) {
    return false;
  }
  if (typeof game.phase !== "string" || !PHASES.includes(game.phase as RoundPhase)) return false;
  if (!Array.isArray(game.outcomes) || !game.outcomes.every(isRoundOutcome)) return false;
  if (typeof game.createdAt !== "string" || typeof game.updatedAt !== "string") return false;
  if (game.completedAt !== null && typeof game.completedAt !== "string") return false;
  return true;
}

function isRoundOutcome(value: unknown): value is RoundOutcome {
  if (!value || typeof value !== "object") return false;
  const outcome = value as Partial<RoundOutcome>;
  return (
    typeof outcome.duoId === "string" &&
    typeof outcome.countryId === "string" &&
    isRoundGuess(outcome.guess) &&
    typeof outcome.distanceKm === "number" &&
    typeof outcome.points === "number" &&
    outcome.points >= 0 &&
    outcome.points <= 5
  );
}

function isRoundGuess(value: unknown): value is RoundGuess {
  if (!value || typeof value !== "object") return false;
  const guess = value as Partial<RoundGuess>;
  if (typeof guess.lat !== "number" || typeof guess.lon !== "number") return false;
  return guess.countryId === undefined || typeof guess.countryId === "string";
}
