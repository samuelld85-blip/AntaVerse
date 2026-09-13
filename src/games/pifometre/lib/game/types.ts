import type { Question } from "../../data/questions";

export type GameStatus = "answering" | "question" | "revealed" | "finished";
export type AwardKind = "closest" | "exact";
export type PlayMode = "turns" | "quick";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface RevealGuess {
  playerId: string;
  value: number;
  distance: number;
}

export interface RevealState {
  answer: number;
  guesses?: RevealGuess[];
  sourceLabel: string;
  sourceUrl: string;
  note?: string;
}

export interface GameState {
  schemaVersion: 3;
  id: string;
  playMode: PlayMode;
  status: GameStatus;
  players: Player[];
  roundIndex: number;
  selectedQuestionIds: string[];
  currentPlayerIndex: number;
  answers: Record<string, number>;
  reveal: RevealState | null;
  awardedPlayerId: string | null;
  awardedKind: AwardKind | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
  playMode: PlayMode;
}

export type QuestionBank = readonly Question[];
