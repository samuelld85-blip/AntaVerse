export type Suit = "♠" | "♥" | "♦" | "♣";
export type CardValue =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K";

export interface Card {
  id: string;
  suit: Suit;
  value: CardValue;
}

export interface Bet {
  amount: number;
  suit: Suit;
}

export interface Player {
  id: string;
  name: string;
}

export interface CheckpointReveal {
  index: number;
  card: Card;
  penalizedSuit: Suit;
}

export interface LastDraw {
  card: Card;
  movedSuit: Suit;
  revealedCheckpoints: CheckpointReveal[];
}

export type GamePhase = "betting" | "race" | "end";

export interface Settlement {
  playerId: string;
  winningUnits: number;
  losingUnits: number;
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  bets: Record<string, Bet | null>;
  phase: GamePhase;
  checkpointCards: Card[];
  revealedCheckpoints: boolean[];
  remainingDeck: Card[];
  horsePositions: Record<Suit, number>;
  lastDraw: LastDraw | null;
  winnerSuit: Suit | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
