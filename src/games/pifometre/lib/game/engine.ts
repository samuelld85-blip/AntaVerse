import { shuffle } from "@/lib/random";
import { cleanTeamName, createGameId } from "@/games/shared/lib/two-team-setup";
import type { AwardKind, CreateGameInput, GameState, PlayMode, QuestionBank, RevealState } from "./types";

export const ROUND_COUNT = 8;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

export function createGame(input: CreateGameInput, bank: QuestionBank, random: () => number = Math.random, now = Date.now()): GameState {
  if (input.playerNames.length < MIN_PLAYERS || input.playerNames.length > MAX_PLAYERS) {
    throw new Error(`Il faut entre ${MIN_PLAYERS} et ${MAX_PLAYERS} joueurs.`);
  }
  if (bank.length < ROUND_COUNT) throw new Error(`La banque doit contenir au moins ${ROUND_COUNT} questions.`);
  assertPlayMode(input.playMode);

  const names = input.playerNames.map((name, index) => cleanTeamName(name, `Joueur ${index + 1}`));
  const normalized = names.map((name) => name.toLocaleLowerCase("fr-FR"));
  if (new Set(normalized).size !== names.length) throw new Error("Les noms doivent être différents.");
  const timestamp = new Date(now).toISOString();
  return {
    schemaVersion: 3,
    id: createGameId(now, random),
    playMode: input.playMode,
    status: input.playMode === "quick" ? "question" : "answering",
    players: names.map((name, index) => ({ id: `player-${index + 1}`, name, score: 0 })),
    roundIndex: 0,
    selectedQuestionIds: shuffle(bank, random).slice(0, ROUND_COUNT).map((question) => question.id),
    currentPlayerIndex: 0,
    answers: {},
    reveal: null,
    awardedPlayerId: null,
    awardedKind: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getCurrentQuestion(game: GameState, bank: QuestionBank) {
  const question = bank.find((candidate) => candidate.id === game.selectedQuestionIds[game.roundIndex]);
  if (!question) throw new Error("La question de cette manche est introuvable.");
  return question;
}

export function submitEstimate(game: GameState, playerId: string, value: number, bank: QuestionBank, now = Date.now()): GameState {
  assertStatus(game, "answering");
  if (!Number.isFinite(value)) throw new Error("L’estimation doit être un nombre.");
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) throw new Error("Ce n’est pas le tour de ce joueur.");
  const answers = { ...game.answers, [playerId]: value };
  if (game.currentPlayerIndex < game.players.length - 1) {
    return { ...game, answers, currentPlayerIndex: game.currentPlayerIndex + 1, updatedAt: new Date(now).toISOString() };
  }
  const question = getCurrentQuestion(game, bank);
  const reveal: RevealState = {
    answer: question.answer,
    guesses: game.players.map((player) => ({ playerId: player.id, value: answers[player.id]!, distance: Math.abs(answers[player.id]! - question.answer) })),
    sourceLabel: question.sourceLabel,
    sourceUrl: question.sourceUrl,
    note: question.note,
  };
  return { ...game, status: "revealed", answers, reveal, updatedAt: new Date(now).toISOString() };
}

export function revealAnswer(game: GameState, bank: QuestionBank, now = Date.now()): GameState {
  assertStatus(game, "question");
  const question = getCurrentQuestion(game, bank);
  const reveal: RevealState = { answer: question.answer, sourceLabel: question.sourceLabel, sourceUrl: question.sourceUrl, note: question.note };
  return { ...game, status: "revealed", reveal, updatedAt: new Date(now).toISOString() };
}

export function awardPoints(game: GameState, playerId: string, kind: AwardKind, now = Date.now()): GameState {
  assertStatus(game, "revealed");
  if (!game.players.some((player) => player.id === playerId)) throw new Error("Joueur introuvable.");
  const points = kind === "exact" ? 2 : 1;
  const players = game.players.map((player) => player.id === playerId ? { ...player, score: player.score + points } : player);
  const isLastRound = game.roundIndex === game.selectedQuestionIds.length - 1;
  if (isLastRound) return { ...game, status: "finished", players, awardedPlayerId: playerId, awardedKind: kind, updatedAt: new Date(now).toISOString() };
  return {
    ...game,
    status: game.playMode === "quick" ? "question" : "answering",
    players,
    roundIndex: game.roundIndex + 1,
    currentPlayerIndex: 0,
    answers: {},
    reveal: null,
    awardedPlayerId: playerId,
    awardedKind: kind,
    updatedAt: new Date(now).toISOString(),
  };
}

export function replayGame(game: GameState, bank: QuestionBank, random: () => number = Math.random, now = Date.now()): GameState {
  return createGame({ playerNames: game.players.map((player) => player.name), playMode: game.playMode }, bank, random, now);
}

export function getWinner(game: GameState) {
  const maxScore = Math.max(...game.players.map((player) => player.score));
  return game.players.filter((player) => player.score === maxScore);
}

function assertPlayMode(value: PlayMode): void {
  if (value !== "turns" && value !== "quick") throw new Error("Mode de jeu inconnu.");
}

function assertStatus(game: GameState, expected: GameState["status"]): void {
  if (game.status !== expected) throw new Error(`Action impossible pendant l’état « ${game.status} ».`);
}
