import { shuffle } from "@/lib/random";
import { DUO_ROUNDS, getDuo } from "@/games/ethnoguessr/data/duos";
import { getCountry } from "@/games/ethnoguessr/lib/geo/countries";
import { distanceKm, pointsForDistance } from "@/games/ethnoguessr/lib/geo/distance";
import type { GameState, RoundGuess, RoundOutcome } from "./types";

export const ROUND_COUNT = Math.min(5, DUO_ROUNDS.length);
export const MAX_ROUND_POINTS = 5;
export const MAX_TOTAL_SCORE = ROUND_COUNT * MAX_ROUND_POINTS;

export function createGame(random: () => number = Math.random): GameState {
  const duoIds = shuffle(
    DUO_ROUNDS.map((duo) => duo.id),
    random,
  ).slice(0, ROUND_COUNT);
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    status: "playing",
    duoIds,
    currentRoundIndex: 0,
    phase: "viewing",
    outcomes: [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export function currentDuoId(game: GameState): string {
  const id = game.duoIds[game.currentRoundIndex];
  if (!id) throw new Error("EthnoGuessr: no duo for the current round index");
  return id;
}

export function startGuessing(game: GameState): GameState {
  if (game.phase !== "viewing") return game;
  return touch({ ...game, phase: "guessing" });
}

/** Scores the placed guess against the current round's duo and moves to the result phase. */
export function submitGuess(game: GameState, guess: RoundGuess): GameState {
  if (game.phase !== "guessing") return game;
  const duo = getDuo(currentDuoId(game));
  const target = duo ? getCountry(duo.countryId) : undefined;
  if (!duo || !target) return game;

  const distance = distanceKm(guess, target);
  const outcome: RoundOutcome = {
    duoId: duo.id,
    countryId: duo.countryId,
    guess,
    distanceKm: distance,
    points: pointsForDistance(distance),
  };
  return touch({ ...game, phase: "result", outcomes: [...game.outcomes, outcome] });
}

export function nextRound(game: GameState): GameState {
  if (game.phase !== "result") return game;
  const nextIndex = game.currentRoundIndex + 1;
  if (nextIndex >= game.duoIds.length) {
    return touch({ ...game, status: "completed", completedAt: new Date().toISOString() });
  }
  return touch({ ...game, currentRoundIndex: nextIndex, phase: "viewing" });
}

export function totalScore(game: GameState): number {
  return game.outcomes.reduce((sum, outcome) => sum + outcome.points, 0);
}

function touch(game: GameState): GameState {
  return { ...game, updatedAt: new Date().toISOString() };
}
