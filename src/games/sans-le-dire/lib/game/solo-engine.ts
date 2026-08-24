import { shuffle } from "@/lib/random";
import { createGameId } from "@/games/shared/lib/two-team-setup";
import type { Card, CreateSoloGameInput, SoloGameState, SoloPlayer } from "./types";

export const SOLO_WORDS_PER_MASTER = 8;
export const MIN_SOLO_PLAYERS = 3;
export const MAX_SOLO_PLAYERS = 10;

export function createSoloGame(
  input: CreateSoloGameInput,
  cards: readonly Card[],
  random: () => number = Math.random,
  now = Date.now(),
): SoloGameState {
  const playerCount = input.playerNames.length;
  if (playerCount < MIN_SOLO_PLAYERS || playerCount > MAX_SOLO_PLAYERS) {
    throw new Error(`Il faut entre ${MIN_SOLO_PLAYERS} et ${MAX_SOLO_PLAYERS} joueurs.`);
  }
  const wordsNeeded = playerCount * SOLO_WORDS_PER_MASTER;
  if (cards.length < wordsNeeded) {
    throw new Error("La banque de mots est trop petite pour cette partie.");
  }

  const timestamp = new Date(now).toISOString();
  const players: SoloPlayer[] = input.playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    score: 0,
  }));

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    mode: "solo",
    status: "handoff",
    players,
    masterIndex: 0,
    wordIndex: 0,
    deck: shuffle(cards, random)
      .slice(0, wordsNeeded)
      .map((card) => card.id),
    deckPosition: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function startSoloTurn(game: SoloGameState, now = Date.now()): SoloGameState {
  assertStatus(game, "handoff");
  return touch({ ...game, status: "playing" }, now);
}

export function awardSoloPoint(
  game: SoloGameState,
  winnerId: string,
  cardId: string,
  now = Date.now(),
): SoloGameState {
  assertStatus(game, "playing");
  if (game.deck[game.deckPosition] !== cardId) throw new Error("Ce mot a déjà été traité.");
  const master = game.players[game.masterIndex];
  if (winnerId === master?.id) throw new Error("Le maître du jeu ne peut pas marquer de point.");
  if (!game.players.some((player) => player.id === winnerId))
    throw new Error("Ce joueur est introuvable.");

  const players = game.players.map((player) =>
    player.id === winnerId ? { ...player, score: player.score + 1 } : player,
  );
  const wordIndex = game.wordIndex + 1;
  const deckPosition = game.deckPosition + 1;

  if (wordIndex < SOLO_WORDS_PER_MASTER) {
    return touch({ ...game, players, wordIndex, deckPosition }, now);
  }

  const nextMasterIndex = game.masterIndex + 1;
  if (nextMasterIndex >= game.players.length) {
    return touch({ ...game, players, wordIndex, deckPosition, status: "finished" }, now);
  }
  return touch(
    { ...game, players, wordIndex: 0, deckPosition, masterIndex: nextMasterIndex, status: "handoff" },
    now,
  );
}

export function replaySoloGame(
  game: SoloGameState,
  cards: readonly Card[],
  random: () => number = Math.random,
  now = Date.now(),
): SoloGameState {
  return createSoloGame({ playerNames: game.players.map((player) => player.name) }, cards, random, now);
}

export function getCurrentSoloCard(game: SoloGameState, cards: readonly Card[]): Card {
  const id = game.deck[game.deckPosition];
  const card = cards.find((candidate) => candidate.id === id);
  if (!card) throw new Error("Le mot courant est introuvable.");
  return card;
}

/** Ranking sorted by score, highest first. Ties keep their relative player order. */
export function getSoloRanking(game: SoloGameState): SoloPlayer[] {
  return [...game.players].sort((a, b) => b.score - a.score);
}

/** Competition ranking (1-2-2-4): a rank is 1 + the count of strictly better players. */
export function getSoloRank(ranking: readonly SoloPlayer[], player: SoloPlayer): number {
  return 1 + ranking.filter((candidate) => candidate.score > player.score).length;
}

function touch(game: SoloGameState, now: number): SoloGameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
function assertStatus(game: SoloGameState, expected: SoloGameState["status"]): void {
  if (game.status !== expected)
    throw new Error(`Action impossible pendant l’état « ${game.status} ».`);
}
