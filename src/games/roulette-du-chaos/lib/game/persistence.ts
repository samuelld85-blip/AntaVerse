import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MIN_PLAYERS } from "./engine";
import type { GamePhase, GameState, Player, ResolutionState } from "./types";

const STORAGE_KEY = "roulette-du-chaos:current-game";

export function loadCurrentGame(): GameState | null {
  return readJson(STORAGE_KEY, isGameState);
}

export function saveCurrentGame(game: GameState): void {
  writeJson(STORAGE_KEY, game);
}

export function clearCurrentGame(): void {
  removeJson(STORAGE_KEY);
}

const PHASES: readonly GamePhase[] = ["idle", "spinning", "categoryReveal", "event", "miniGame"];
const CATEGORIES = new Set([
  "DISTRIBUE",
  "SUBIS",
  "DUEL",
  "TOUS",
  "CHOISIS",
  "DESTIN",
  "REGLE",
  "JACKPOT",
]);

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;

  if (game.schemaVersion !== 1) return false;
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
  if (typeof game.phase !== "string" || !PHASES.includes(game.phase)) return false;
  if (
    game.selectedCategory !== null &&
    (typeof game.selectedCategory !== "string" || !CATEGORIES.has(game.selectedCategory))
  ) {
    return false;
  }
  if (game.selectedEventId !== null && typeof game.selectedEventId !== "string") return false;
  if (game.resolution !== null && !isResolutionState(game.resolution)) return false;
  if (game.miniGame !== null && !isMiniGameSession(game.miniGame)) return false;
  if (game.activeRule !== null && !isActiveRule(game.activeRule)) return false;
  if (
    !Array.isArray(game.recentEventIds) ||
    !game.recentEventIds.every((id) => typeof id === "string")
  ) {
    return false;
  }
  return true;
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string" && typeof player.name === "string" && player.name.length > 0;
}

function isResolutionState(value: unknown): value is ResolutionState {
  if (!value || typeof value !== "object") return false;
  const resolution = value as Record<string, unknown>;
  return (
    typeof resolution.eventId === "string" &&
    !!resolution.randomSlots &&
    typeof resolution.randomSlots === "object" &&
    Array.isArray(resolution.targetRounds) &&
    resolution.targetRounds.every(
      (round) => Array.isArray(round) && round.every((id) => typeof id === "string"),
    ) &&
    (resolution.neighborSide === null ||
      resolution.neighborSide === "left" ||
      resolution.neighborSide === "right") &&
    (resolution.choiceKey === null || typeof resolution.choiceKey === "string") &&
    (resolution.mysteryPickIndex === null || typeof resolution.mysteryPickIndex === "number")
  );
}

function isMiniGameSession(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.kind === "string" &&
    (session.mode === "duel" || session.mode === "solo") &&
    typeof session.playerAId === "string" &&
    (session.playerBId === null || typeof session.playerBId === "string")
  );
}

function isActiveRule(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const rule = value as Record<string, unknown>;
  return (
    typeof rule.ruleId === "string" &&
    typeof rule.title === "string" &&
    typeof rule.description === "string" &&
    typeof rule.ownerId === "string" &&
    (rule.expiry === "ownerNextTurn" || rule.expiry === "firstViolation" || rule.expiry === "timer")
  );
}
