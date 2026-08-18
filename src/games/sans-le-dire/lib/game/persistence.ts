import type { GameState } from "./types";
const STORAGE_KEY = "sans-le-dire:current-game";
const TEAM_NAMES_KEY = "sans-le-dire:team-names";
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
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}
export function clearCurrentGame(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}
export function saveTeamNames(names: readonly [string, string]): void {
  if (typeof window !== "undefined")
    window.localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(names));
}
export function loadTeamNames(): [string, string] {
  if (typeof window === "undefined") return ["Les Antagonistes", "Les Sanglieeers"];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(TEAM_NAMES_KEY) ?? "null");
    if (
      !Array.isArray(value) ||
      value.length !== 2 ||
      !value.every((name) => typeof name === "string")
    )
      return ["Les Antagonistes", "Les Sanglieeers"];
    const names = [value[0] as string, value[1] as string] as [string, string];
    if (names[0] === "Équipe 1" && names[1] === "Équipe 2")
      return ["Les Antagonistes", "Les Sanglieeers"];
    return names;
  } catch {
    return ["Les Antagonistes", "Les Sanglieeers"];
  }
}
function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;
  return (
    game.schemaVersion === 2 &&
    ["preparation", "playing", "roundResult", "finished"].includes(game.status ?? "") &&
    Array.isArray(game.teams) &&
    game.teams.length === 2 &&
    Array.isArray(game.deck) &&
    game.deck.length >= 500 &&
    new Set(game.deck).size === game.deck.length &&
    typeof game.deckPosition === "number" &&
    game.deckPosition >= 0 &&
    game.deckPosition < game.deck.length &&
    (game.activeTeam === 0 || game.activeTeam === 1) &&
    (game.mode === "standard" || game.mode === "tiebreak")
  );
}
