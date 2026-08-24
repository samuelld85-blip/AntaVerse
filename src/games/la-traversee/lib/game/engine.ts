import { createGameId } from "@/games/shared/lib/two-team-setup";
import { CARD_VALUES, shuffleDeck } from "../../data/deck";
import type { Board, Card, CreateGameInput, Direction, GameState, Guess, Lane, LastGuess, Player, Position } from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;
export const BOARD_CARD_COUNT = 13;
/** A full route can require the initial card plus four lane cards and the opposite endpoint. */
export const MAX_ROUND_GUESSES = 6;
export const LANE_LENGTHS: Record<Lane, number> = { top: 4, middle: 3, bottom: 4 };
export const LANES: readonly Lane[] = ["top", "middle", "bottom"];

export function createGame(input: CreateGameInput, random: () => number = Math.random, now = Date.now()): GameState {
  const names = input.playerNames.map(cleanPlayerName);
  if (names.length < MIN_PLAYERS) throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour commencer.`);
  if (names.length > MAX_PLAYERS) throw new Error(`Impossible de dépasser ${MAX_PLAYERS} joueurs.`);
  if (names.some((name) => name.length === 0)) throw new Error("Chaque joueur doit avoir un nom.");
  const players: Player[] = names.map((name, index) => ({ id: `player-${index + 1}`, name }));
  const { board, remainingDeck } = dealBoard(shuffleDeck(random));
  const timestamp = new Date(now).toISOString();
  return { schemaVersion: 1, id: createGameId(now, random), players, currentPlayerIndex: 0, remainingDeck, board, phase: "select-card", direction: null, selectedLane: null, currentPosition: null, revealedMiddle: [false, false, false], steps: 0, roundsPlayed: 1, lastGuess: null, createdAt: timestamp, updatedAt: timestamp };
}

/** Selects the initial endpoint, or the next card in the already chosen route. */
export function selectCard(game: GameState, position: Position, now = Date.now()): GameState {
  if (game.phase !== "select-card" || !isSelectablePosition(game, position)) return game;
  const direction = game.direction ?? directionFromStart(position);
  const selectedLane = position.zone === "lane" ? position.lane : game.selectedLane;
  return touch({ ...game, phase: "guessing", direction, selectedLane: selectedLane ?? null, currentPosition: position, lastGuess: null }, now);
}

export function resolveGuess(game: GameState, guess: Guess, now = Date.now()): GameState {
  if (game.phase !== "guessing" || !game.currentPosition) return game;
  const drawnCard = game.remainingDeck[0];
  if (!drawnCard) return touch({ ...game, phase: "end" }, now);
  const position = game.currentPosition;
  const referenceCard = getCardAtPosition(game.board, position);
  const outcome = compareCards(referenceCard, drawnCard, guess) ? "success" : "failure";
  const steps = game.steps + 1;
  const lastGuess: LastGuess = { guess, outcome, position, referenceCard, drawnCard, steps, sips: outcome === "failure" ? steps : 0 };
  const board = replaceCardAtPosition(game.board, position, drawnCard);
  const revealedMiddle = position.zone === "lane" && position.lane === "middle"
    ? game.revealedMiddle.map((revealed, index) => revealed || index === position.index)
    : game.revealedMiddle;
  return touch({ ...game, board, remainingDeck: game.remainingDeck.slice(1), revealedMiddle, phase: "feedback", steps, lastGuess }, now);
}

/** Ends the feedback animation and either advances to the next card or player. */
export function advanceAfterFeedback(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "feedback" || !game.lastGuess || !game.currentPosition) return game;
  const reachedOppositeEnd = (game.currentPosition.zone === "end" && game.direction === "left-to-right") || (game.currentPosition.zone === "start" && game.direction === "right-to-left");
  if (game.lastGuess.outcome === "failure" || reachedOppositeEnd || game.remainingDeck.length === 0) return advanceToNextPlayer(game, now);
  if ((game.currentPosition.zone === "start" || game.currentPosition.zone === "end") && game.selectedLane === null) {
    return touch({ ...game, phase: "select-card", lastGuess: null }, now);
  }
  const nextPosition = getFollowingPosition(game);
  return nextPosition
    ? touch({ ...game, phase: "guessing", currentPosition: nextPosition, lastGuess: null }, now)
    : advanceToNextPlayer(game, now);
}

export function getCurrentPlayer(game: GameState): Player { return game.players[game.currentPlayerIndex]!; }

export function getCardAtPosition(board: Board, position: Position): Card {
  if (position.zone === "start") return board.start;
  if (position.zone === "end") return board.end;
  return board.lanes[position.lane][position.index]!;
}

export function getSelectablePositions(game: GameState): Position[] {
  if (game.phase !== "select-card") return [];
  if (!game.currentPosition) return [{ zone: "start" }, { zone: "end" }];
  if (!game.direction) return [];
  if (game.currentPosition.zone === "start") return game.direction === "left-to-right" ? LANES.map((lane) => ({ zone: "lane", lane, index: 0 })) : [];
  if (game.currentPosition.zone === "end") return game.direction === "right-to-left" ? LANES.map((lane) => ({ zone: "lane", lane, index: LANE_LENGTHS[lane] - 1 })) : [];
  const { lane, index } = game.currentPosition;
  const nextIndex = game.direction === "left-to-right" ? index + 1 : index - 1;
  return nextIndex >= 0 && nextIndex < LANE_LENGTHS[lane] ? [{ zone: "lane", lane, index: nextIndex }] : [game.direction === "left-to-right" ? { zone: "end" } : { zone: "start" }];
}

export function getNextPosition(game: GameState): Position | null {
  const selectable = getSelectablePositions(game);
  return selectable[0] ?? null;
}

function getFollowingPosition(game: GameState): Position | null {
  if (!game.currentPosition || !game.direction || game.currentPosition.zone === "start" && game.direction === "right-to-left" || game.currentPosition.zone === "end" && game.direction === "left-to-right") return null;
  if (game.currentPosition.zone === "start") return null;
  if (game.currentPosition.zone === "end") return null;
  const { lane, index } = game.currentPosition;
  const nextIndex = game.direction === "left-to-right" ? index + 1 : index - 1;
  if (nextIndex >= 0 && nextIndex < LANE_LENGTHS[lane]) return { zone: "lane", lane, index: nextIndex };
  return game.direction === "left-to-right" ? { zone: "end" } : { zone: "start" };
}

export function cardValueLabel(value: Card["value"]): string {
  switch (value) {
    case "J": return "Valet";
    case "Q": return "Dame";
    case "K": return "Roi";
    case "A": return "As";
    default: return value;
  }
}

export function cleanPlayerName(value: string): string { return value.trim().replace(/\s+/gu, " ").slice(0, 24); }

function isSelectablePosition(game: GameState, position: Position): boolean { return getSelectablePositions(game).some((candidate) => positionKey(candidate) === positionKey(position)); }
function directionFromStart(position: Position): Direction { return position.zone === "end" ? "right-to-left" : "left-to-right"; }
function compareCards(reference: Card, drawn: Card, guess: Guess): boolean { const referenceValue = CARD_VALUES.indexOf(reference.value); const drawnValue = CARD_VALUES.indexOf(drawn.value); return guess === "higher" ? drawnValue > referenceValue : drawnValue < referenceValue; }

function replaceCardAtPosition(board: Board, position: Position, card: Card): Board {
  if (position.zone === "start") return { ...board, start: card };
  if (position.zone === "end") return { ...board, end: card };
  return { ...board, lanes: { ...board.lanes, [position.lane]: board.lanes[position.lane].map((item, index) => index === position.index ? card : item) } };
}

function dealBoard(deck: Card[]): { board: Board; remainingDeck: Card[] } {
  const cards = deck.slice(0, BOARD_CARD_COUNT);
  if (cards.length < BOARD_CARD_COUNT) throw new Error("Le paquet ne contient pas assez de cartes.");
  return { board: { start: cards[0]!, end: cards[1]!, lanes: { top: cards.slice(2, 6), middle: cards.slice(6, 9), bottom: cards.slice(9, 13) } }, remainingDeck: deck.slice(BOARD_CARD_COUNT) };
}

function advanceToNextPlayer(game: GameState, now: number): GameState {
  if (game.remainingDeck.length < MAX_ROUND_GUESSES) return touch({ ...game, phase: "end" }, now);
  return touch({
    ...game,
    currentPlayerIndex: (game.currentPlayerIndex + 1) % game.players.length,
    phase: "select-card",
    direction: null,
    selectedLane: null,
    currentPosition: null,
    steps: 0,
    roundsPlayed: game.roundsPlayed + 1,
    lastGuess: null,
  }, now);
}

function positionKey(position: Position): string { return position.zone === "lane" ? `${position.lane}-${position.index}` : position.zone; }
function touch(game: GameState, now: number): GameState { return { ...game, updatedAt: new Date(now).toISOString() }; }
