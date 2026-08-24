export type Suit = "♠" | "♥" | "♦" | "♣";
export type CardValue =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K" | "A";

export interface Card {
  id: string;
  suit: Suit;
  value: CardValue;
}

export interface Player {
  id: string;
  name: string;
}

export type GamePhase = "ready" | "judging" | "handoff" | "end";
export type RoundOutcome = "master-won" | "master-failed";

export interface LastOutcome {
  outcome: RoundOutcome;
  cardId: string;
  targetId: string;
  masterId: string;
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  masterIndex: number;
  targetIndex: number;
  phase: GamePhase;
  remainingDeck: Card[];
  revealedCards: Card[];
  currentCard: Card | null;
  masterStreak: number;
  roundsPlayed: number;
  lastOutcome: LastOutcome | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
