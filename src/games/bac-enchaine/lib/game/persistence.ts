import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { MAX_PLAYERS, MIN_PLAYERS, ROUNDS_PER_GAME } from "./engine";
import type { GameState, Player, Round } from "./types";

const STORAGE_KEY = "bac-enchaine:current-game";

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
    game.players.length <= MAX_PLAYERS &&
    game.players.every(isPlayer) &&
    Array.isArray(game.rounds) &&
    game.rounds.length === ROUNDS_PER_GAME &&
    game.rounds.every((round) => isRound(round, game.players!)) &&
    typeof game.currentRoundIndex === "number" &&
    Number.isInteger(game.currentRoundIndex) &&
    game.currentRoundIndex >= 0 &&
    game.currentRoundIndex < game.rounds.length &&
    (game.status === "active" || game.status === "finished") &&
    typeof game.createdAt === "string" &&
    typeof game.updatedAt === "string"
  );
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return (
    typeof player.id === "string" &&
    typeof player.name === "string" &&
    player.name.length > 0 &&
    typeof player.score === "number" &&
    Number.isInteger(player.score) &&
    player.score >= 0
  );
}

function isRound(value: unknown, players: Player[]): value is Round {
  if (!value || typeof value !== "object") return false;
  const round = value as Partial<Round>;
  const prompt = round.prompt as { category?: unknown; letter?: unknown; kind?: unknown } | undefined;
  return (
    !!prompt &&
    typeof prompt.category === "string" &&
    typeof prompt.letter === "string" &&
    (prompt.kind === "classic" || prompt.kind === "fun") &&
    typeof round.starterPlayerIndex === "number" &&
    Number.isInteger(round.starterPlayerIndex) &&
    round.starterPlayerIndex >= 0 &&
    round.starterPlayerIndex < players.length &&
    Array.isArray(round.validatedPlayerIds) &&
    round.validatedPlayerIds.every((id) =>
      typeof id === "string" && players.some((player) => player.id === id),
    )
  );
}
