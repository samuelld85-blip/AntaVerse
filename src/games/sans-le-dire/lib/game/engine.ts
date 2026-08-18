import type { Card, CreateGameInput, GameState, TeamIndex } from "./types";
export const STANDARD_ROUNDS = 4;
export const STANDARD_DURATION_MS = 45_000;
export const TIEBREAK_DURATION_MS = 30_000;
export const STANDARD_PASSES = 2;
export const TIEBREAK_PASSES = 1;
const TEAM_COLORS = ["#E83DFF", "#16C7E8"] as const;

export function createGame(input: CreateGameInput, cards: readonly Card[], random = Math.random, now = Date.now()): GameState {
  validateCards(cards);
  const timestamp = new Date(now).toISOString();
  return { schemaVersion: 2, id: createId(now, random), status: "preparation", mode: "standard",
    teams: [
      { id: "team-1", name: cleanTeamName(input.teamOneName, "Les Antagonistes"), color: TEAM_COLORS[0], score: 0 },
      { id: "team-2", name: cleanTeamName(input.teamTwoName, "Les Sanglieeers"), color: TEAM_COLORS[1], score: 0 },
    ], roundIndex: 0, activeTeam: 0, passesRemaining: STANDARD_PASSES, roundScore: 0,
    tiebreakScores: [0, 0], tiebreakCycle: 1, deck: shuffle(cards, random).map((card) => card.id),
    deckPosition: 0, roundEndsAt: null, createdAt: timestamp, updatedAt: timestamp };
}

export function startRound(game: GameState, now = Date.now()): GameState {
  assertStatus(game, "preparation");
  return touch({ ...game, status: "playing", passesRemaining: game.mode === "standard" ? STANDARD_PASSES : TIEBREAK_PASSES,
    roundScore: 0, roundEndsAt: now + (game.mode === "standard" ? STANDARD_DURATION_MS : TIEBREAK_DURATION_MS) }, now);
}

export function foundCard(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  const teams: GameState["teams"] = [{ ...game.teams[0] }, { ...game.teams[1] }];
  const tiebreakScores: GameState["tiebreakScores"] = [...game.tiebreakScores];
  if (game.mode === "standard") teams[game.activeTeam].score += 1; else tiebreakScores[game.activeTeam] += 1;
  return touch({ ...game, teams, tiebreakScores, roundScore: game.roundScore + 1, deckPosition: game.deckPosition + 1 }, now);
}

export function passCard(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  if (game.passesRemaining <= 0) throw new Error("Aucune passe restante.");
  return touch({ ...game, passesRemaining: game.passesRemaining - 1, deckPosition: game.deckPosition + 1 }, now);
}

export function faultCard(game: GameState, cardId: string, now = Date.now()): GameState {
  assertPlayableCard(game, cardId, now);
  const teams: GameState["teams"] = [{ ...game.teams[0] }, { ...game.teams[1] }];
  const tiebreakScores: GameState["tiebreakScores"] = [...game.tiebreakScores];
  if (game.mode === "standard") teams[game.activeTeam].score -= 1;
  else tiebreakScores[game.activeTeam] -= 1;
  return touch({ ...game, teams, tiebreakScores, roundScore: game.roundScore - 1, deckPosition: game.deckPosition + 1 }, now);
}

export function endRound(game: GameState, now = Date.now()): GameState {
  if (game.status !== "playing") return game;
  return touch({ ...game, status: "roundResult", roundEndsAt: null }, now);
}

export function continueGame(game: GameState, now = Date.now()): GameState {
  assertStatus(game, "roundResult");
  if (game.mode === "standard") {
    if (game.roundIndex < STANDARD_ROUNDS - 1) {
      const roundIndex = game.roundIndex + 1;
      return prepare({ ...game, roundIndex, activeTeam: (roundIndex % 2) as TeamIndex }, now);
    }
    if (game.teams[0].score !== game.teams[1].score) return touch({ ...game, status: "finished" }, now);
    return prepare({ ...game, mode: "tiebreak", activeTeam: 0, tiebreakScores: [0, 0], tiebreakCycle: 1 }, now);
  }
  if (game.activeTeam === 0) return prepare({ ...game, activeTeam: 1 }, now);
  if (game.tiebreakScores[0] !== game.tiebreakScores[1]) return touch({ ...game, status: "finished" }, now);
  return prepare({ ...game, activeTeam: 0, tiebreakScores: [0, 0], tiebreakCycle: game.tiebreakCycle + 1 }, now);
}

export function replayGame(game: GameState, cards: readonly Card[], random = Math.random, now = Date.now()): GameState {
  return createGame({ teamOneName: game.teams[0].name, teamTwoName: game.teams[1].name }, cards, random, now);
}
export function getCurrentCard(game: GameState, cards: readonly Card[]): Card {
  const id = game.deck[game.deckPosition]; const card = cards.find((candidate) => candidate.id === id);
  if (!card) throw new Error("La carte courante est introuvable."); return card;
}
export function getWinnerIndex(game: GameState): TeamIndex | null {
  const scores = game.mode === "tiebreak" ? game.tiebreakScores : [game.teams[0].score, game.teams[1].score];
  if (scores[0] === scores[1]) return null; return scores[0]! > scores[1]! ? 0 : 1;
}
export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const result = [...values]; for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1)); [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  } return result;
}
function prepare(game: GameState, now: number): GameState { return touch({ ...game, status: "preparation", passesRemaining: game.mode === "standard" ? STANDARD_PASSES : TIEBREAK_PASSES, roundScore: 0, roundEndsAt: null }, now); }
function assertPlayableCard(game: GameState, cardId: string, now: number): void {
  assertStatus(game, "playing");
  if (game.roundEndsAt === null || now >= game.roundEndsAt) throw new Error("Le temps est écoulé.");
  if (game.deck[game.deckPosition] !== cardId) throw new Error("Cette carte a déjà été traitée.");
  if (game.deckPosition >= game.deck.length - 1) throw new Error("La banque de cartes est épuisée.");
}
function validateCards(cards: readonly Card[]): void {
  if (cards.length < 500) throw new Error("La banque doit contenir au moins 500 cartes.");
  if (new Set(cards.map((card) => card.id)).size !== cards.length) throw new Error("Chaque carte doit avoir un identifiant unique.");
  if (cards.some((card) => card.forbidden.length !== 3)) throw new Error("Chaque carte doit contenir trois mots interdits.");
}
function cleanTeamName(value: string, fallback: string): string { return value.trim().replace(/\s+/gu, " ").slice(0, 24) || fallback; }
function createId(now: number, random: () => number): string { return `game-${now.toString(36)}-${Math.floor(random() * 1_000_000).toString(36)}`; }
function touch(game: GameState, now: number): GameState { return { ...game, updatedAt: new Date(now).toISOString() }; }
function assertStatus(game: GameState, expected: GameState["status"]): void { if (game.status !== expected) throw new Error(`Action impossible pendant l’état « ${game.status} ».`); }
