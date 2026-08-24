export type TeamIndex = 0 | 1 | 2;
export interface Team {
  id: "team-1" | "team-2" | "team-3";
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
export type GameRoundMode = "standard" | "tiebreak";
export type PlayMode = "competition" | "fun";
export interface GameState {
  schemaVersion: 3;
  id: string;
  status: GameStatus;
  roundMode: GameRoundMode;
  playMode: PlayMode;
  teams: Team[];
  roundIndex: number;
  activeTeamIndex: number;
  passesRemaining: number;
  roundScore: number;
  tiebreakScores: number[];
  tiebreakCycle: number;
  forbiddenViolations: number;
  deck: string[];
  deckPosition: number;
  roundEndsAt: number | null;
  lastCardId?: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateGameInput {
  teamNames: [string, string] | [string, string, string];
  playMode: PlayMode;
}

export interface SoloPlayer {
  id: string;
  name: string;
  score: number;
}
export type SoloStatus = "handoff" | "playing" | "finished";
export interface SoloGameState {
  schemaVersion: 1;
  id: string;
  mode: "solo";
  status: SoloStatus;
  players: SoloPlayer[];
  /** Index into `players` of the current game master — advances once per full turn, never resets or repeats. */
  masterIndex: number;
  /** Words already resolved during the current master's turn (0..SOLO_WORDS_PER_MASTER). */
  wordIndex: number;
  deck: string[];
  deckPosition: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateSoloGameInput {
  playerNames: string[];
}
