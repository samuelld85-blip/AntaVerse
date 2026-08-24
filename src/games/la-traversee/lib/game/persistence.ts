import { readJson, removeJson, writeJson } from "@/lib/local-storage-json";
import { CARD_VALUES, SUITS } from "../../data/deck";
import { BOARD_CARD_COUNT, LANE_LENGTHS, MIN_PLAYERS } from "./engine";
import type { Board, Card, CardValue, GamePhase, GameState, Lane, LastGuess, Player, Position, Suit } from "./types";

const STORAGE_KEY = "la-traversee:current-game";
const PHASES: readonly GamePhase[] = ["select-card", "guessing", "feedback", "end"];
const LANES: readonly Lane[] = ["top", "middle", "bottom"];

export function loadCurrentGame(): GameState | null {
  return readJson(STORAGE_KEY, isGameState);
}

export function saveCurrentGame(game: GameState): void {
  writeJson(STORAGE_KEY, game);
}

export function clearCurrentGame(): void {
  removeJson(STORAGE_KEY);
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<GameState>;
  return (
    game.schemaVersion === 1 && typeof game.id === "string" &&
    Array.isArray(game.players) && game.players.length >= MIN_PLAYERS && game.players.every(isPlayer) &&
    isIndex(game.currentPlayerIndex, game.players.length) && Array.isArray(game.remainingDeck) &&
    game.remainingDeck.length <= 52 - BOARD_CARD_COUNT && game.remainingDeck.every(isCard) &&
    isBoard(game.board) && PHASES.includes(game.phase as GamePhase) &&
    (game.direction === null || game.direction === "left-to-right" || game.direction === "right-to-left") &&
    (game.selectedLane === null || LANES.includes(game.selectedLane as Lane)) &&
    (game.currentPosition === null || isPosition(game.currentPosition)) && Array.isArray(game.revealedMiddle) &&
    game.revealedMiddle.length === LANE_LENGTHS.middle && game.revealedMiddle.every((item) => typeof item === "boolean") &&
    Number.isInteger(game.steps) && typeof game.steps === "number" && game.steps >= 0 &&
    Number.isInteger(game.roundsPlayed) && typeof game.roundsPlayed === "number" && game.roundsPlayed >= 1 &&
    (game.lastGuess === null || isLastGuess(game.lastGuess))
  );
}

function isBoard(value: unknown): value is Board {
  if (!value || typeof value !== "object") return false;
  const board = value as Partial<Board>;
  return isCard(board.start) && isCard(board.end) && !!board.lanes &&
    LANES.every((lane) => Array.isArray(board.lanes?.[lane]) && board.lanes[lane]!.length === LANE_LENGTHS[lane] && board.lanes[lane]!.every(isCard));
}

function isPosition(value: unknown): value is Position {
  if (!value || typeof value !== "object") return false;
  const position = value as Partial<Position>;
  if (position.zone === "start" || position.zone === "end") return true;
  return position.zone === "lane" && LANES.includes(position.lane as Lane) && typeof position.index === "number" && Number.isInteger(position.index) && position.index >= 0 && position.index < LANE_LENGTHS[position.lane as Lane];
}

function isLastGuess(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const guess = value as Partial<LastGuess>;
  return (guess.guess === "higher" || guess.guess === "lower") &&
    (guess.outcome === "success" || guess.outcome === "failure") && isPosition(guess.position) && isCard(guess.referenceCard) && isCard(guess.drawnCard) &&
    Number.isInteger(guess.steps) && Number.isInteger(guess.sips);
}

function isCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<Card>;
  return typeof card.id === "string" && typeof card.suit === "string" && SUITS.includes(card.suit as Suit) && typeof card.value === "string" && CARD_VALUES.includes(card.value as CardValue);
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string" && typeof player.name === "string" && player.name.length > 0;
}

function isIndex(value: unknown, length: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < length;
}
