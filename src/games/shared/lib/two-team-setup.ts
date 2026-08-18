// La Relance and Sans le dire both start from the same shape: two teams,
// default names, two fixed brand colors, and a short random game id. Quoi de
// 9 does NOT use this — its teams take a user-chosen color and a
// form-validated name (no fallback), so it is a genuinely different setup
// flow and stays with its own team-creation code.

export interface TwoTeamSetupInput {
  teamOneName: string;
  teamTwoName: string;
}

export interface TwoTeamSetupTeam {
  id: "team-1" | "team-2";
  name: string;
  color: string;
  score: number;
}

const TEAM_COLORS = ["#E83DFF", "#16C7E8"] as const;
const DEFAULT_TEAM_NAMES = ["Les Antagonistes", "Les Sanglieeers"] as const;

export function cleanTeamName(value: string, fallback: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24) || fallback;
}

export function createGameId(now: number, random: () => number): string {
  return `game-${now.toString(36)}-${Math.floor(random() * 1_000_000).toString(36)}`;
}

export function createTwoTeams(input: TwoTeamSetupInput): [TwoTeamSetupTeam, TwoTeamSetupTeam] {
  return [
    {
      id: "team-1",
      name: cleanTeamName(input.teamOneName, DEFAULT_TEAM_NAMES[0]),
      color: TEAM_COLORS[0],
      score: 0,
    },
    {
      id: "team-2",
      name: cleanTeamName(input.teamTwoName, DEFAULT_TEAM_NAMES[1]),
      color: TEAM_COLORS[1],
      score: 0,
    },
  ];
}
