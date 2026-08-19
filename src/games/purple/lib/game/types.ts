export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type CardColor = "red" | "black";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  color: CardColor;
}

export type GuessType = "red" | "black" | "purple" | "doublePurple" | "skubrum" | "higher" | "lower";

export interface Player {
  id: string;
  name: string;
}

export type GuessOutcome = "success" | "failure";

export interface LastGuess {
  guessType: GuessType;
  playerId: string;
  cards: Card[];
  outcome: GuessOutcome;
  cardsGained: number;
  sipsAdded: number;
  sipsDrunk: number;
  reshuffled: boolean;
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  pile: number;
  progress: number;
  lastGuess: LastGuess | null;
  lastCard?: Card;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
