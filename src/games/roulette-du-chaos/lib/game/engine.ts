// Roulette du Chaos — the turn/phase state machine. `spinWheel` decides the
// category and event immediately (the wheel animation only ever plays
// catch-up to an already-decided result, per spec section 64); resolution
// then advances one explicit action at a time (submitTargets, submitChoice,
// completeMiniGame, ...) through the shared `runResolutionLoop`, which is
// the one place event.resolve() is called — see resolution-helpers.ts and
// data/events/*.ts for what it's calling into.
//
// `completeTurn` is the single, well-defined action that advances the
// active player — nothing else in this file touches `activePlayerIndex`.

import { createGameId } from "@/games/shared/lib/two-team-setup";
import { getEvent, EVENTS_BY_CATEGORY } from "../../data/events";
import { nextPlayerIndex } from "./players";
import { pickEvent, pickWeightedCategory, RECENT_EVENT_HISTORY_SIZE } from "./wheel";
import type {
  CreateGameInput,
  GameState,
  MiniGameOutcome,
  Player,
  ResolutionState,
  ResolveInput,
} from "./types";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

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
    throw new Error(`Impossible de dépasser ${MAX_PLAYERS} joueurs.`);
  }
  if (names.some((name) => name.length === 0)) {
    throw new Error("Chaque joueur doit avoir un nom.");
  }

  const players: Player[] = names.map((name, index) => ({ id: `player-${index}`, name }));
  const activePlayerIndex = Math.floor(random() * players.length);
  const timestamp = new Date(now).toISOString();

  return {
    schemaVersion: 1,
    id: createGameId(now, random),
    players,
    activePlayerIndex,
    phase: "idle",
    selectedCategory: null,
    selectedEventId: null,
    resolution: null,
    miniGame: null,
    activeRule: null,
    recentEventIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function replayGame(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  return createGame({ playerNames: game.players.map((player) => player.name) }, random, now);
}

export function getActivePlayer(game: GameState): Player {
  return game.players[game.activePlayerIndex]!;
}

/** Picks the category and event the wheel will land on. Never rejected by rapid double-taps: only fires from "idle". */
export function spinWheel(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  if (game.phase !== "idle") return game;
  const category = pickWeightedCategory(random());
  const events = EVENTS_BY_CATEGORY[category];
  const event = pickEvent(events, game.recentEventIds, random());
  return touch(
    { ...game, phase: "spinning", selectedCategory: category, selectedEventId: event.id },
    now,
  );
}

/** Wheel animation has finished landing — show the category badge. */
export function finishSpin(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "spinning") return game;
  return touch({ ...game, phase: "categoryReveal" }, now);
}

/** Category badge has been shown — reveal the event card and run its first resolution step. */
export function revealEvent(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  if (game.phase !== "categoryReveal" || !game.selectedEventId) return game;
  const resolution: ResolutionState = {
    eventId: game.selectedEventId,
    randomSlots: {},
    targetRounds: [],
    neighborSide: null,
    choiceKey: null,
    mysteryPickIndex: null,
    revealConfirmed: false,
    miniGameResult: null,
    pending: null,
    outcome: null,
  };
  return runResolutionLoop({ ...game, phase: "event" }, resolution, random, now);
}

function expectingPending(game: GameState, kind: string): ResolutionState | null {
  const resolution = game.resolution;
  if (game.phase !== "event" || !resolution || resolution.pending?.kind !== kind) return null;
  return resolution;
}

export function submitTargets(
  game: GameState,
  targetIds: string[],
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const resolution = expectingPending(game, "pickTargets");
  if (!resolution) return game;
  const next: ResolutionState = {
    ...resolution,
    targetRounds: [...resolution.targetRounds, targetIds],
  };
  return runResolutionLoop(game, next, random, now);
}

export function submitNeighbor(
  game: GameState,
  side: "left" | "right",
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const resolution = expectingPending(game, "pickNeighbor");
  if (!resolution) return game;
  return runResolutionLoop(game, { ...resolution, neighborSide: side }, random, now);
}

export function submitChoice(
  game: GameState,
  key: string,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const resolution = expectingPending(game, "choice");
  if (!resolution) return game;
  return runResolutionLoop(game, { ...resolution, choiceKey: key }, random, now);
}

export function submitMysteryPick(
  game: GameState,
  index: number,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const resolution = expectingPending(game, "mysteryPick");
  if (!resolution) return game;
  return runResolutionLoop(game, { ...resolution, mysteryPickIndex: index }, random, now);
}

export function submitReveal(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const resolution = expectingPending(game, "reveal");
  if (!resolution) return game;
  return runResolutionLoop(game, { ...resolution, revealConfirmed: true }, random, now);
}

/** A mini-game session finished — feed its outcome back into the event that requested it. */
export function completeMiniGame(
  game: GameState,
  outcome: MiniGameOutcome,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  if (game.phase !== "miniGame" || !game.resolution) return game;
  const next: ResolutionState = { ...game.resolution, miniGameResult: outcome };
  return runResolutionLoop({ ...game, phase: "event", miniGame: null }, next, random, now);
}

/** The one place `activePlayerIndex` advances. Only fires once the current event has a resolved outcome. */
export function completeTurn(game: GameState, now = Date.now()): GameState {
  if (game.phase !== "event" || !game.resolution?.outcome) return game;

  const recentEventIds = [...game.recentEventIds, game.resolution.eventId].slice(
    -RECENT_EVENT_HISTORY_SIZE,
  );
  const nextIndex = nextPlayerIndex(game.activePlayerIndex, game.players.length);

  let activeRule = game.activeRule;
  if (
    activeRule?.expiry === "ownerNextTurn" &&
    game.players[nextIndex]?.id === activeRule.ownerId
  ) {
    activeRule = null;
  }

  return touch(
    {
      ...game,
      phase: "idle",
      activePlayerIndex: nextIndex,
      selectedCategory: null,
      selectedEventId: null,
      resolution: null,
      miniGame: null,
      recentEventIds,
      activeRule,
    },
    now,
  );
}

/** Manually ends the active rule — used for firstViolation/timer rules once the group calls an infraction, or once a timer elapses. */
export function clearActiveRule(game: GameState, now = Date.now()): GameState {
  if (!game.activeRule) return game;
  return touch({ ...game, activeRule: null }, now);
}

// --- Internals ---------------------------------------------------------

function buildResolveInput(game: GameState, resolution: ResolutionState): ResolveInput {
  return {
    players: game.players,
    activePlayerId: getActivePlayer(game).id,
    recentEventIds: game.recentEventIds,
    randomSlots: resolution.randomSlots,
    targetRounds: resolution.targetRounds,
    neighborSide: resolution.neighborSide,
    choiceKey: resolution.choiceKey,
    mysteryPickIndex: resolution.mysteryPickIndex,
    revealConfirmed: resolution.revealConfirmed,
    miniGameResult: resolution.miniGameResult,
  };
}

/**
 * Calls `event.resolve()` with the current answers, auto-filling any
 * `engineRandom` slots it asks for (and looping until it stops asking for
 * more), then applies whatever it settles on: pause for human input, pause
 * for a mini-game, or finish with a `TurnOutcome` (and, for RÈGLE events,
 * activate the rule immediately).
 */
function runResolutionLoop(
  game: GameState,
  resolution: ResolutionState,
  random: () => number,
  now: number,
): GameState {
  let current = resolution;

  for (;;) {
    const event = getEvent(current.eventId);
    const result = event.resolve(buildResolveInput(game, current));

    if (result.status === "needsInput" && result.next.kind === "engineRandom") {
      const randomSlots = { ...current.randomSlots };
      for (const slot of result.next.slots) {
        if (!(slot in randomSlots)) randomSlots[slot] = random();
      }
      current = { ...current, randomSlots };
      continue;
    }

    if (result.status === "needsInput") {
      current = { ...current, pending: result.next, outcome: null };
      return touch({ ...game, resolution: current }, now);
    }

    if (result.status === "needsMiniGame") {
      current = { ...current, pending: null, miniGameResult: null };
      return touch(
        {
          ...game,
          phase: "miniGame",
          resolution: current,
          miniGame: {
            kind: result.request.kind,
            mode: result.request.mode,
            playerAId: result.request.playerAId,
            playerBId: result.request.playerBId,
          },
        },
        now,
      );
    }

    current = { ...current, pending: null, outcome: result.outcome };
    return touch(
      {
        ...game,
        resolution: current,
        activeRule: result.rule ?? game.activeRule,
      },
      now,
    );
  }
}

function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, " ").slice(0, 24);
}

function touch(game: GameState, now: number): GameState {
  return { ...game, updatedAt: new Date(now).toISOString() };
}
