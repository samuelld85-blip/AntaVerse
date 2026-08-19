// Shared, ordered team-color palette for every team-based game (Quoi de 9,
// La Relance, Sans le dire). A team's position always maps to the same
// color across all three games — never hardcode a team color locally.
// Colors 1-3 are the existing AntaVerse magenta/cyan/orange; 4-5 reuse
// accents already defined in Roulette du Chaos so the palette stays within
// colors already established in the project.
export const TEAM_PALETTE = [
  "#E83DFF", // équipe 1 — magenta
  "#16C7E8", // équipe 2 — cyan
  "#FF5C2B", // équipe 3 — orange
  "#3DDC8A", // équipe 4 — vert
  "#9B5BFA", // équipe 5 — violet
] as const;

export const MAX_TEAMS = TEAM_PALETTE.length;

export function teamColor(index: number): string {
  return TEAM_PALETTE[index % TEAM_PALETTE.length]!;
}
