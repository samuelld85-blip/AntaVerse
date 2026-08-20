export type TeamIndex = number;

/** "teams" plays 2-3 teams against each other; "solo" plays 2-7 individual
 * players, each modeled as a one-person team so the rest of the engine
 * (scoring, rounds, sudden death) stays unchanged. */
export type ParticipantMode = "teams" | "solo";

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export type GameStatus = "playing" | "pointAwarded" | "finished";

export interface GameState {
  schemaVersion: 2;
  id: string;
  status: GameStatus;
  mode: ParticipantMode;
  teams: Team[];
  roundIndex: number;
  selectedThemeIds: string[];
  suddenDeath: boolean;
  lastPointWinner: TeamIndex | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  mode: ParticipantMode;
  teamNames: string[];
}

export interface Theme {
  id: string;
  label: string;
}
