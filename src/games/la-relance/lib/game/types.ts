export type TeamIndex = 0 | 1;

export interface Team {
  id: "team-1" | "team-2";
  name: string;
  color: string;
  score: number;
}

export type GameStatus = "playing" | "pointAwarded" | "finished";

export interface GameState {
  schemaVersion: 1;
  id: string;
  status: GameStatus;
  teams: [Team, Team];
  roundIndex: number;
  selectedThemeIds: string[];
  suddenDeath: boolean;
  lastPointWinner: TeamIndex | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  teamOneName: string;
  teamTwoName: string;
}

export interface Theme {
  id: string;
  label: string;
}
