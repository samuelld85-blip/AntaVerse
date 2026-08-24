import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import type { GameState, SoloGameState } from "./types";
const STORAGE_KEY = "sans-le-dire:current-game";
const TEAM_NAMES_KEY = "sans-le-dire:team-names";
const SOLO_STORAGE_KEY = "sans-le-dire:solo-current-game";

export function loadCurrentGame(): GameState | null {
  return readJson(STORAGE_KEY, isGameState);
}

export function saveCurrentGame(game: GameState): void {
  writeJson(STORAGE_KEY, game);
}

export function clearCurrentGame(): void {
  removeJson(STORAGE_KEY);
}

export function saveTeamNames(names: readonly [string, string] | readonly [string, string, string]): void {
  writeJson(TEAM_NAMES_KEY, names);
}

export function loadTeamNames(): [string, string] | [string, string, string] {
  if (typeof window === "undefined") return ["Les Antagonistes", "Les Sanglieeers"];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(TEAM_NAMES_KEY) ?? "null");
    if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3) || !value.every((name) => typeof name === "string"))
      return ["Les Antagonistes", "Les Sanglieeers"];
    const names = value as [string, string] | [string, string, string];
    if (names[0] === "Équipe 1" && names[1] === "Équipe 2")
      return ["Les Antagonistes", "Les Sanglieeers"];
    return names;
  } catch {
    return ["Les Antagonistes", "Les Sanglieeers"];
  }
}

export function loadSoloGame(): SoloGameState | null {
  return readJson(SOLO_STORAGE_KEY, isSoloGameState);
}

export function saveSoloGame(game: SoloGameState): void {
  writeJson(SOLO_STORAGE_KEY, game);
}

export function clearSoloGame(): void {
  removeJson(SOLO_STORAGE_KEY);
}

function isSoloGameState(value: unknown): value is SoloGameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<SoloGameState>;
  return (
    game.schemaVersion === 1 &&
    game.mode === "solo" &&
    ["handoff", "playing", "finished"].includes(game.status ?? "") &&
    Array.isArray(game.players) &&
    game.players.length >= 3 &&
    Array.isArray(game.deck) &&
    game.deck.length >= game.players.length * 8 &&
    new Set(game.deck).size === game.deck.length &&
    typeof game.deckPosition === "number" &&
    game.deckPosition >= 0 &&
    game.deckPosition <= game.deck.length &&
    typeof game.masterIndex === "number" &&
    game.masterIndex >= 0 &&
    game.masterIndex < game.players.length &&
    typeof game.wordIndex === "number" &&
    game.wordIndex >= 0
  );
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;
  return (
    game.schemaVersion === 3 &&
    ["preparation", "playing", "roundResult", "finished"].includes(game.status ?? "") &&
    Array.isArray(game.teams) &&
    (game.teams.length === 2 || game.teams.length === 3) &&
    Array.isArray(game.deck) &&
    game.deck.length >= 500 &&
    new Set(game.deck).size === game.deck.length &&
    typeof game.deckPosition === "number" &&
    game.deckPosition >= 0 &&
    game.deckPosition < game.deck.length &&
    typeof game.activeTeamIndex === "number" &&
    game.activeTeamIndex >= 0 &&
    game.activeTeamIndex < game.teams.length &&
    (game.roundMode === "standard" || game.roundMode === "tiebreak") &&
    (game.playMode === "competition" || game.playMode === "fun") &&
    typeof game.forbiddenViolations === "number" &&
    game.forbiddenViolations >= 0
  );
}
