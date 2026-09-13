import type { BacPrompt } from "../../data/prompts";

export type GameStatus = "active" | "finished";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Round {
  prompt: BacPrompt;
  starterPlayerIndex: number;
  validatedPlayerIds: string[];
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  rounds: Round[];
  currentRoundIndex: number;
  status: GameStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
