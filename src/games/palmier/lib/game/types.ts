export type Suit = "♠" | "♥" | "♦" | "♣";
export type CardValue =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K" | "A";

export interface Card {
  suit: Suit;
  value: CardValue;
}

export type PalmStage = "stable" | "shaky" | "unstable" | "critical";

/**
 * idle    — waiting for the active player to shake the palm
 * reveal  — a card has been drawn and its rule is displayed
 * collapse — the 4th King was drawn; collapse animation then CUL SEC card
 * end     — all 52 cards have been drawn
 */
export type GamePhase = "idle" | "reveal" | "collapse" | "end";

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  schemaVersion: 2;
  id: string;
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  /** Cards not yet drawn, in draw order. Top of deck is index 0. */
  remainingDeck: Card[];
  /** The card drawn this turn; null when idle or end. */
  currentCard: Card | null;
  /** Number of Kings drawn so far (0–4). Drives palm stage and King rule text. */
  kingsDrawn: number;
  /** Display name of the current Maître du pouce (null if no 5 drawn yet). */
  maitrePouce: string | null;
  /** Display name of the current Maître des questions (null if no Q drawn yet). */
  maitreQuestions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
