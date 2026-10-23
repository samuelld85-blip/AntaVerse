import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MIN_PLAYERS } from "./engine";
import type { ActiveRule, GamePhase, GameState, Player, ResolutionState } from "./types";

const STORAGE_KEY = "roulette-du-chaos:current-game";

export function loadCurrentGame(): GameState | null {
  const value = readJson(STORAGE_KEY, (item): item is Record<string, unknown> =>
    Boolean(item && typeof item === "object" && !Array.isArray(item)),
  );
  if (!value) return null;
  if (isGameState(value)) return value;
  if (isLegacyGameState(value)) {
    const migrated = migrateLegacyGame(value);
    saveCurrentGame(migrated);
    return migrated;
  }
  removeJson(STORAGE_KEY);
  return null;
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
  if (typeof game.turnNumber !== "number" || !Number.isInteger(game.turnNumber) || game.turnNumber < 0) return false;
  if (!Array.isArray(game.activeRules) || !game.activeRules.every(isActiveRule)) return false;
  if (!Array.isArray(game.secretChallenges) || !game.secretChallenges.every(isSecretChallenge)) return false;
  if (game.secretReveal !== null && !isSecretReveal(game.secretReveal)) return false;
  if (!Array.isArray(game.cursedObjects) || !game.cursedObjects.every(isCursedObject)) return false;
  if (game.cursedReveal !== null && !isCursedReveal(game.cursedReveal)) return false;
  if (
    !Array.isArray(game.recentEventIds) ||
    !game.recentEventIds.every((id) => typeof id === "string")
  ) {
    return false;
  }
  return true;
}

interface LegacyGameState extends Omit<GameState, "schemaVersion" | "activeRules" | "turnNumber" | "secretChallenges" | "secretReveal" | "cursedObjects" | "cursedReveal"> {
  schemaVersion: 1;
  activeRule: Omit<ActiveRule, "instanceId" | "expiresAtTurn"> | null;
}

function isLegacyGameState(value: unknown): value is LegacyGameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<LegacyGameState>;
  return game.schemaVersion === 1 &&
    Array.isArray(game.players) &&
    game.players.length >= MIN_PLAYERS &&
    game.players.every(isPlayer) &&
    typeof game.activePlayerIndex === "number" &&
    game.activePlayerIndex >= 0 &&
    game.activePlayerIndex < game.players.length &&
    typeof game.phase === "string" &&
    PHASES.includes(game.phase) &&
    (game.activeRule === null || isLegacyRule(game.activeRule));
}

function migrateLegacyGame(game: LegacyGameState): GameState {
  const rule = game.activeRule;
  const { activeRule: _oldRule, ...rest } = game;
  void _oldRule;
  return {
    ...rest,
    schemaVersion: 2,
    turnNumber: 0,
    activeRules: rule ? [{
      ...rule,
      instanceId: "legacy-rule",
      expiresAtTurn: game.players.length,
      durationTurns: game.players.length,
    }] : [],
    secretChallenges: [],
    secretReveal: null,
    cursedObjects: [],
    cursedReveal: null,
    resolution: game.resolution ? { ...game.resolution, secretAccepted: false } : null,
  };
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
    && typeof resolution.secretAccepted === "boolean"
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
    typeof rule.instanceId === "string" &&
    typeof rule.expiresAtTurn === "number" &&
    (rule.expiry === "ownerNextTurn" || rule.expiry === "firstViolation" || rule.expiry === "timer" || rule.expiry === "turns")
  );
}

function isLegacyRule(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const rule = value as Record<string, unknown>;
  return typeof rule.ruleId === "string" &&
    typeof rule.title === "string" &&
    typeof rule.description === "string" &&
    typeof rule.ownerId === "string";
}

function isSecretChallenge(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const challenge = value as Record<string, unknown>;
  return typeof challenge.instanceId === "string" &&
    typeof challenge.challengeId === "string" &&
    typeof challenge.ownerId === "string" &&
    typeof challenge.task === "string" &&
    typeof challenge.rewardSips === "number";
}

function isSecretReveal(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const reveal = value as Record<string, unknown>;
  return typeof reveal.ownerId === "string" &&
    typeof reveal.task === "string" &&
    typeof reveal.success === "boolean" &&
    typeof reveal.sips === "number";
}

function isCursedObject(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.instanceId === "string" &&
    typeof item.objectLabel === "string" &&
    typeof item.startingHolderId === "string" &&
    typeof item.dueTurn === "number" &&
    typeof item.durationTurns === "number";
}

function isCursedReveal(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.objectLabel === "string" &&
    typeof item.startingHolderId === "string" &&
    typeof item.holderId === "string" &&
    typeof item.sips === "number";
}
