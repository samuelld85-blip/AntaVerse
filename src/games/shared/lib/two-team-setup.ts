// La Relance and Sans le dire both build their own (2- or 3-team) team
// arrays locally in their engines, using TEAM_PALETTE for color-by-index.
// What's still genuinely shared between them is these two small helpers.
// Quoi de 9 does NOT use this — its teams take a user-chosen color and a
// form-validated name (no fallback), so it is a genuinely different setup
// flow and stays with its own team-creation code.

export function cleanTeamName(value: string, fallback: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24) || fallback;
}

export function createGameId(now: number, random: () => number): string {
  return `game-${now.toString(36)}-${Math.floor(random() * 1_000_000).toString(36)}`;
}
