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
  CursedObject,
  GameState,
  MiniGameOutcome,
  Player,
  ResolutionState,
  ResolveInput,
  SecretChallenge,
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
    schemaVersion: 2,
    id: createGameId(now, random),
    players,
    activePlayerIndex,
    phase: "idle",
    selectedCategory: null,
    selectedEventId: null,
    resolution: null,
    miniGame: null,
    turnNumber: 0,
    activeRules: [],
    secretChallenges: [],
    secretReveal: null,
    cursedObjects: [],
    cursedReveal: null,
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

/** Display aliases may change; player IDs and saved names never do. */
export function getDisplayPlayers(game: GameState): Player[] {
  const swap = [...game.activeRules].reverse().find((rule) => rule.identitySwap)?.identitySwap;
  if (!swap) return game.players;
  const first = game.players.find((player) => player.id === swap[0]);
  const second = game.players.find((player) => player.id === swap[1]);
  if (!first || !second) return game.players;
  return game.players.map((player) => ({
    ...player,
    name: player.id === first.id ? second.name : player.id === second.id ? first.name : player.name,
  }));
}

/** Picks the category and event the wheel will land on. Never rejected by rapid double-taps: only fires from "idle". */
export function spinWheel(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  if (
    game.phase !== "idle" ||
    game.secretReveal ||
    game.cursedReveal ||
    game.cursedObjects.some((object) => object.dueTurn <= game.turnNumber)
  )
    return game;
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
    secretAccepted: false,
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
  const pending = resolution.pending;
  if (pending?.kind !== "pickTargets") return game;
  if (
    targetIds.length < pending.min ||
    targetIds.length > pending.max ||
    new Set(targetIds).size !== targetIds.length ||
    targetIds.some(
      (id) => !game.players.some((player) => player.id === id) || pending.excludeIds.includes(id),
    )
  )
    return game;
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
  const resolution =
    game.phase === "event" &&
    (game.resolution?.pending?.kind === "choice" || game.resolution?.pending?.kind === "wordDuel")
      ? game.resolution
      : null;
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

export function submitSecretAccepted(
  game: GameState,
  random: () => number = Math.random,
  now = Date.now(),
): GameState {
  const resolution = expectingPending(game, "secretChallenge");
  if (!resolution) return game;
  return runResolutionLoop(game, { ...resolution, secretAccepted: true }, random, now);
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

  const turnNumber = game.turnNumber + 1;
  const activeRules = game.activeRules.filter((rule) => rule.expiresAtTurn > turnNumber);

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
      turnNumber,
      activeRules,
    },
    now,
  );
}

/** The table can report a one-shot violation or clear one specific rule. */
export function clearActiveRule(game: GameState, instanceId?: string, now = Date.now()): GameState {
  if (game.activeRules.length === 0) return game;
  const activeRules = instanceId
    ? game.activeRules.filter((rule) => rule.instanceId !== instanceId)
    : [];
  return touch({ ...game, activeRules }, now);
}

export function resolveSecretChallenge(
  game: GameState,
  instanceId: string,
  success: boolean,
  now = Date.now(),
): GameState {
  if (game.phase !== "idle" || game.secretReveal) return game;
  const challenge = game.secretChallenges.find((item) => item.instanceId === instanceId);
  if (!challenge) return game;
  return touch(
    {
      ...game,
      secretChallenges: game.secretChallenges.filter((item) => item.instanceId !== instanceId),
      secretReveal: {
        ownerId: challenge.ownerId,
        task: challenge.task,
        success,
        sips: success ? challenge.rewardSips : 1,
      },
    },
    now,
  );
}

export function dismissSecretReveal(game: GameState, now = Date.now()): GameState {
  if (!game.secretReveal) return game;
  return touch({ ...game, secretReveal: null }, now);
}

export function resolveCursedObject(
  game: GameState,
  instanceId: string,
  holderId: string,
  now = Date.now(),
): GameState {
  if (game.phase !== "idle" || game.cursedReveal || game.secretReveal) return game;
  const object = game.cursedObjects.find((item) => item.instanceId === instanceId);
  if (
    !object ||
    object.dueTurn > game.turnNumber ||
    !game.players.some((player) => player.id === holderId)
  )
    return game;
  return touch(
    {
      ...game,
      cursedObjects: game.cursedObjects.filter((item) => item.instanceId !== instanceId),
      cursedReveal: {
        objectLabel: object.objectLabel,
        startingHolderId: object.startingHolderId,
        holderId,
        sips: 2,
      },
    },
    now,
  );
}

export function dismissCursedReveal(game: GameState, now = Date.now()): GameState {
  if (!game.cursedReveal) return game;
  return touch({ ...game, cursedReveal: null }, now);
}

// --- Internals ---------------------------------------------------------

function buildResolveInput(game: GameState, resolution: ResolutionState): ResolveInput {
  return {
    players: getDisplayPlayers(game),
    activePlayerId: getActivePlayer(game).id,
    recentEventIds: game.recentEventIds,
    randomSlots: resolution.randomSlots,
    targetRounds: resolution.targetRounds,
    neighborSide: resolution.neighborSide,
    choiceKey: resolution.choiceKey,
    mysteryPickIndex: resolution.mysteryPickIndex,
    revealConfirmed: resolution.revealConfirmed,
    secretAccepted: resolution.secretAccepted,
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
    const newRules = [result.rule, ...(result.rules ?? [])].filter(
      (rule): rule is NonNullable<typeof rule> => Boolean(rule),
    );
    const incomingConflictGroups = new Set(
      newRules.map((rule) => rule.conflictGroup).filter(Boolean),
    );
    const activeRules = [
      ...game.activeRules.filter(
        (rule) =>
          !newRules.some((incoming) => incoming.ruleId === rule.ruleId) &&
          (!rule.conflictGroup || !incomingConflictGroups.has(rule.conflictGroup)),
      ),
      ...newRules.map((rule, index) => ({
        ...rule,
        instanceId: `${game.turnNumber}:${current.eventId}:${rule.ruleId}:${index}`,
        expiresAtTurn:
          game.turnNumber +
          (rule.durationTurns ?? game.players.length) +
          (rule.expiry === "ownerNextTurn" ? 0 : 1),
      })),
    ].slice(-4);
    const secretChallenge: SecretChallenge | null = result.secretChallenge
      ? {
          ...result.secretChallenge,
          instanceId: `${game.turnNumber}:${current.eventId}:${result.secretChallenge.challengeId}`,
        }
      : null;
    const cursedObject: CursedObject | null = result.cursedObject
      ? {
          ...result.cursedObject,
          instanceId: `${game.turnNumber}:${current.eventId}:cursed`,
          dueTurn: game.turnNumber + result.cursedObject.durationTurns + 1,
        }
      : null;
    return touch(
      {
        ...game,
        resolution: current,
        activeRules,
        secretChallenges: secretChallenge
          ? [...game.secretChallenges, secretChallenge]
          : game.secretChallenges,
        cursedObjects: cursedObject ? [...game.cursedObjects, cursedObject] : game.cursedObjects,
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
