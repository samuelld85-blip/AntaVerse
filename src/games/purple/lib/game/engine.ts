import { RANKS, createDeck, drawCards } from "./deck";
import type { Card, CreateGameInput, GameState, GuessOutcome, GuessType, Player, Rank } from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;
export const MIN_PROGRESS_TO_PASS = 3;

/** Numeric value of each rank for higher/lower comparisons. */
function getRankValue(rank: Rank): number {
  const index = RANKS.indexOf(rank);
  return index >= 0 ? index + 1 : 0;
}

/** How many cards each guess type draws — the single source of truth used by both the engine and the UI. */
export const GUESS_DRAW_COUNT: Record<GuessType, number> = {
  red: 1,
  black: 1,
  purple: 2,
  doublePurple: 4,
  skubrum: 3,
  sandwich: 3,
  higher: 1,
  lower: 1,
};

export function createGame(
  input: CreateGameInput,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const players = createPlayers(input.playerNames);
  if (players.length < MIN_PLAYERS) {
    throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour commencer.`);
  }
  if (players.length > MAX_PLAYERS) {
    throw new Error(`Impossible de dépasser ${MAX_PLAYERS} joueurs.`);
  }

  const timestamp = new Date(now).toISOString();
  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    players,
    currentPlayerIndex: Math.floor(random() * players.length),
    deck: createDeck(random),
    pile: 0,
    progress: 0,
    lastGuess: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Colors present among a set of drawn cards, e.g. `{ red: 1, black: 1 }`. */
function countColors(cards: readonly Card[]): { red: number; black: number } {
  let red = 0;
  let black = 0;
  for (const card of cards) {
    if (card.color === "red") red += 1;
    else black += 1;
  }
  return { red, black };
}

/** Pure rule evaluation for a drawn hand, given the guess that was made. */
export function evaluateGuess(
  guessType: GuessType,
  cards: readonly Card[],
  referenceCard?: Card,
): GuessOutcome {
  const { red, black } = countColors(cards);
  switch (guessType) {
    case "red":
      return red === 1 && black === 0 ? "success" : "failure";
    case "black":
      return black === 1 && red === 0 ? "success" : "failure";
    case "purple":
      return red === 1 && black === 1 ? "success" : "failure";
    case "doublePurple":
      return red === 2 && black === 2 ? "success" : "failure";
    case "skubrum":
      return red === 3 || black === 3 ? "success" : "failure";
    case "sandwich":
      return (red === 2 && black === 1) || (red === 1 && black === 2) ? "success" : "failure";
    case "higher":
      if (!referenceCard || cards.length === 0) return "failure";
      return getRankValue(cards[0]!.rank) > getRankValue(referenceCard.rank) ? "success" : "failure";
    case "lower":
      if (!referenceCard || cards.length === 0) return "failure";
      return getRankValue(cards[0]!.rank) < getRankValue(referenceCard.rank) ? "success" : "failure";
    default:
      return "failure";
  }
}

export function canPass(game: GameState): boolean {
  return game.progress >= MIN_PROGRESS_TO_PASS;
}

/** Higher/Lower is only available after at least one card has been drawn this turn. */
export function canPlayHigherLower(game: GameState): boolean {
  return game.lastCard !== undefined;
}

/**
 * Registers a guess: draws the required cards (reshuffling mid-draw if the
 * deck runs out), evaluates the result, and applies the pile/progress
 * consequences. Never rejected on account of deck size — `drawCards`
 * transparently spans a fresh deck when needed.
 */
export function submitGuess(
  game: GameState,
  guessType: GuessType,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer) throw new Error("Aucun joueur courant.");

  const drawCount = GUESS_DRAW_COUNT[guessType];
  const { drawn, deck, reshuffled } = drawCards(game.deck, drawCount, random);
  const outcome = evaluateGuess(
    guessType,
    drawn,
    guessType === "higher" || guessType === "lower" ? game.lastCard : undefined,
  );

  // The last drawn card becomes the reference for future higher/lower plays.
  const newLastCard = drawn[drawn.length - 1] ?? game.lastCard;

  if (outcome === "success") {
    return {
      ...game,
      deck,
      pile: game.pile + drawCount,
      progress: game.progress + drawCount,
      lastCard: newLastCard,
      lastGuess: {
        guessType,
        playerId: currentPlayer.id,
        cards: drawn,
        outcome,
        cardsGained: drawCount,
        sipsAdded: drawCount,
        sipsDrunk: 0,
        reshuffled,
      },
      updatedAt: new Date(now).toISOString(),
    };
  }

  const sipsDrunk = game.pile;
  return {
    ...game,
    deck,
    pile: 0,
    progress: 0,
    lastCard: undefined,
    lastGuess: {
      guessType,
      playerId: currentPlayer.id,
      cards: drawn,
      outcome,
      cardsGained: 0,
      sipsAdded: 0,
      sipsDrunk,
      reshuffled,
    },
    updatedAt: new Date(now).toISOString(),
  };
}

export function nextPlayerIndex(currentIndex: number, playerCount: number): number {
  if (playerCount <= 0) return 0;
  return (currentIndex + 1) % playerCount;
}

/** Voluntary pass: only legal once the current player has reached the 3-card threshold. */
export function passTurn(game: GameState, now = Date.now()): GameState {
  if (!canPass(game)) {
    throw new Error(`Il faut au moins ${MIN_PROGRESS_TO_PASS} cartes réussies pour passer.`);
  }
  return {
    ...game,
    currentPlayerIndex: nextPlayerIndex(game.currentPlayerIndex, game.players.length),
    progress: 0,
    lastGuess: null,
    lastCard: undefined,
    updatedAt: new Date(now).toISOString(),
  };
}

function createPlayers(rawNames: readonly string[]): Player[] {
  return rawNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name: cleanPlayerName(name, `Joueur ${index + 1}`),
  }));
}

export function cleanPlayerName(value: string, fallback: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24) || fallback;
}

function createGameId(now: number, random: () => number): string {
  return `game-${now.toString(36)}-${Math.floor(random() * 1_000_000).toString(36)}`;
}
