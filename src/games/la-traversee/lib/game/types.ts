export type Suit = "♠" | "♥" | "♦" | "♣";
export type CardValue =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K" | "A";

export interface Card {
  id: string;
  suit: Suit;
  value: CardValue;
}

export type Lane = "top" | "middle" | "bottom";
export type Direction = "left-to-right" | "right-to-left";
export type Position =
  | { zone: "start" }
  | { zone: "lane"; lane: Lane; index: number }
  | { zone: "end" };

export interface Board {
  start: Card;
  end: Card;
  lanes: Record<Lane, Card[]>;
}

export type GamePhase = "select-card" | "guessing" | "feedback" | "end";
export type Guess = "higher" | "lower";
export type GuessOutcome = "success" | "failure";

export interface LastGuess {
  guess: Guess;
  outcome: GuessOutcome;
  position: Position;
  referenceCard: Card;
  drawnCard: Card;
  steps: number;
  sips: number;
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  remainingDeck: Card[];
  board: Board;
  phase: GamePhase;
  direction: Direction | null;
  selectedLane: Lane | null;
  currentPosition: Position | null;
  revealedMiddle: boolean[];
  steps: number;
  roundsPlayed: number;
  lastGuess: LastGuess | null;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
