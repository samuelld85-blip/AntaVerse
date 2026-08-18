export type TeamIndex = 0 | 1;
export interface Team {
  id: "team-1" | "team-2";
  name: string;
  color: string;
  score: number;
}
export interface Card {
  id: string;
  word: string;
  forbidden: readonly [string, string, string];
}
export type GameStatus = "preparation" | "playing" | "roundResult" | "finished";
export type GameMode = "standard" | "tiebreak";
export interface GameState {
  schemaVersion: 2;
  id: string;
  status: GameStatus;
  mode: GameMode;
  teams: [Team, Team];
  roundIndex: number;
  activeTeam: TeamIndex;
  passesRemaining: number;
  roundScore: number;
  tiebreakScores: [number, number];
  tiebreakCycle: number;
  deck: string[];
  deckPosition: number;
  roundEndsAt: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface CreateGameInput {
  teamOneName: string;
  teamTwoName: string;
}
