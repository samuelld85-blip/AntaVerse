import { shuffle } from "@/lib/random";
import { cleanTeamName, createGameId } from "@/games/shared/lib/two-team-setup";
import type { Question } from "../../data/questions";
import type { CreateGameInput, GameState, RoundOutcome } from "./types";

export const ROUND_COUNT = 10;
export const TIMER_SECONDS = 15;

export function createGame(
  input: CreateGameInput,
  bank: readonly Question[],
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const duoTeam = cleanTeamName(input.duoTeam, "Dos à dos");
  const questionTeam = cleanTeamName(input.questionTeam, "Poseurs");
  const normalized = [duoTeam, questionTeam].map((name) => name.toLocaleLowerCase("fr-FR"));
  if (new Set(normalized).size !== normalized.length) throw new Error("Les noms doivent être différents.");
  if (bank.length < ROUND_COUNT) throw new Error("La banque de questions est trop courte.");

  const timestamp = new Date(now).toISOString();
  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    duo: { name: duoTeam, score: 0 },
    questionTeam: { name: questionTeam, score: 0 },
    questionIds: shuffle(bank, random).slice(0, ROUND_COUNT).map((question) => question.id),
    roundIndex: 0,
    phase: "question",
    timerSeconds: TIMER_SECONDS,
    secondsLeft: TIMER_SECONDS,
    lastResult: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getCurrentQuestion(game: GameState, bank: readonly Question[]): Question {
  const question = bank.find((candidate) => candidate.id === game.questionIds[game.roundIndex]);
  if (!question) throw new Error("La question de cette manche est introuvable.");
  return question;
}

export function tick(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "question" || game.secondsLeft <= 0) return game;
  return { ...game, secondsLeft: Math.max(0, game.secondsLeft - 1), updatedAt: new Date(now).toISOString() };
}

export function revealRound(game: GameState, outcome: RoundOutcome, now = Date.now()): GameState {
  if (game.phase !== "question") throw new Error("Cette manche a déjà été tranchée.");
  const pointsTo = outcome === "same" ? "duo" : "questioners";
  return {
    ...game,
    phase: "reveal",
    lastResult: { outcome, pointsTo },
    duo: outcome === "same" ? { ...game.duo, score: game.duo.score + 1 } : game.duo,
    questionTeam: outcome === "different" ? { ...game.questionTeam, score: game.questionTeam.score + 1 } : game.questionTeam,
    updatedAt: new Date(now).toISOString(),
  };
}

export function nextRound(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "reveal") throw new Error("Révélez le résultat avant de continuer.");
  const lastRound = game.roundIndex >= game.questionIds.length - 1;
  if (lastRound) return { ...game, phase: "finished", updatedAt: new Date(now).toISOString() };
  return {
    ...game,
    phase: "question",
    roundIndex: game.roundIndex + 1,
    secondsLeft: game.timerSeconds,
    lastResult: null,
    updatedAt: new Date(now).toISOString(),
  };
}

export function getWinner(game: GameState): "duo" | "questioners" | "tie" {
  if (game.duo.score === game.questionTeam.score) return "tie";
  return game.duo.score > game.questionTeam.score ? "duo" : "questioners";
}
