import { createGameId } from "@/games/shared/lib/two-team-setup";
import { BAC_PROMPTS, type BacPrompt } from "../../data/prompts";
import type { CreateGameInput, GameState, Player, Round } from "./types";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;
export const ROUNDS_PER_GAME = 8;

export function createGame(
  input: CreateGameInput,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const names = input.playerNames.map(cleanPlayerName);

  if (names.length < MIN_PLAYERS) {
    throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs pour lancer une partie.`);
  }
  if (names.length > MAX_PLAYERS) {
    throw new Error(`Il ne peut pas y avoir plus de ${MAX_PLAYERS} joueurs.`);
  }
  if (names.some((name) => name.length === 0)) {
    throw new Error("Chaque joueur doit avoir un nom.");
  }

  const players: Player[] = names.map((name, index) => ({
    id: `player-${index}`,
    name,
    score: 0,
  }));
  const timestamp = new Date(now).toISOString();

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    players,
    rounds: pickPrompts(random),
    currentRoundIndex: 0,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function togglePlayerValidation(
  game: GameState,
  playerId: string,
  now = Date.now(),
): GameState {
  if (game.status !== "active") return game;

  const playerIndex = game.players.findIndex((player) => player.id === playerId);
  if (playerIndex < 0) return game;

  const round = game.rounds[game.currentRoundIndex];
  if (!round) return game;

  const validated = new Set(round.validatedPlayerIds);
  const wasValidated = validated.has(playerId);
  if (wasValidated) validated.delete(playerId);
  else validated.add(playerId);

  return touch(
    {
      ...game,
      players: game.players.map((player, index) =>
        index === playerIndex
          ? { ...player, score: Math.max(0, player.score + (wasValidated ? -1 : 1)) }
          : player,
      ),
      rounds: game.rounds.map((candidate, index) =>
        index === game.currentRoundIndex
          ? { ...candidate, validatedPlayerIds: [...validated] }
          : candidate,
      ),
    },
    now,
  );
}

export function finishRound(game: GameState, now = Date.now()): GameState {
  if (game.status !== "active") return game;

  const isLastRound = game.currentRoundIndex === game.rounds.length - 1;
  if (isLastRound) return touch({ ...game, status: "finished" }, now);

  const currentRound = game.rounds[game.currentRoundIndex];
  if (!currentRound) return game;

  const nextStarter = nextPlayerIndex(currentRound.starterPlayerIndex, game.players.length);
  return touch(
    {
      ...game,
      currentRoundIndex: game.currentRoundIndex + 1,
      rounds: game.rounds.map((round, index) =>
        index === game.currentRoundIndex + 1
          ? { ...round, starterPlayerIndex: nextStarter, validatedPlayerIds: [] }
          : round,
      ),
    },
    now,
  );
}

export function replayGame(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  return createGame({ playerNames: game.players.map((player) => player.name) }, random, now);
}

export function getCurrentRound(game: GameState): Round | null {
  return game.rounds[game.currentRoundIndex] ?? null;
}

export function isPlayerValidated(game: GameState, playerId: string): boolean {
  return getCurrentRound(game)?.validatedPlayerIds.includes(playerId) ?? false;
}

function pickPrompts(random: () => number): Round[] {
  const prompts: BacPrompt[] = [];
  const usedCategories = new Set<string>();
  const pool = shuffle([...BAC_PROMPTS], random);

  // One category per round keeps the eight-round format varied. The bank has
  // far more categories than a party needs, so this does not constrain play.
  for (const prompt of pool) {
    if (usedCategories.has(prompt.category)) continue;
    prompts.push(prompt);
    usedCategories.add(prompt.category);
    if (prompts.length === ROUNDS_PER_GAME) break;
  }

  return prompts.map((prompt) => ({
    prompt,
    // The first player changes once per round. The modulo also keeps the
    // starter fair when the table has a different number of players.
    starterPlayerIndex: 0,
    validatedPlayerIds: [],
  }));
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex]!, items[index]!];
  }
  return items;
}

function nextPlayerIndex(index: number, playerCount: number): number {
  return (index + 1) % playerCount;
}

function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
