export type RoundOutcome = "same" | "different";
export type GamePhase = "question" | "reveal" | "finished";

export interface Duo {
  name: string;
  score: number;
}

export interface QuestionTeam {
  name: string;
  score: number;
}

export interface RoundResult {
  outcome: RoundOutcome;
  pointsTo: "duo" | "questioners";
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  duo: Duo;
  questionTeam: QuestionTeam;
  questionIds: string[];
  roundIndex: number;
  phase: GamePhase;
  timerSeconds: number;
  secondsLeft: number;
  lastResult: RoundResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  duoTeam: string;
  questionTeam: string;
}
