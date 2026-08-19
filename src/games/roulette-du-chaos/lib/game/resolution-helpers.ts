// Small pure builders shared by every event's `resolve()` function (see
// data/events/*.ts). Keeping these here — rather than re-implementing
// "how do I ask for 2 targets" 64 times — is what keeps each event's
// resolver a handful of readable lines.

import type {
  ActiveRule,
  CategoryId,
  ChoiceOption,
  EventDefinition,
  MiniGameKind,
  Player,
  ResolveResult,
  RuleExpiry,
  TurnOutcome,
  VisualHint,
} from "./types";

export function sipsWord(amount: number): string {
  return amount === 1 ? "gorgée" : "gorgées";
}

export function drinks(name: string, amount: number): string {
  return `${name} boit ${amount} ${sipsWord(amount)}`;
}

export function receives(name: string, amount: number): string {
  return `${name} reçoit ${amount} ${sipsWord(amount)}`;
}

export function distributes(name: string, amount: number): string {
  return `${name} distribue ${amount} ${sipsWord(amount)}`;
}

export function findPlayer(players: readonly Player[], id: string | null): Player | null {
  if (!id) return null;
  return players.find((player) => player.id === id) ?? null;
}

export function playerName(players: readonly Player[], id: string | null): string {
  return findPlayer(players, id)?.name ?? "Ce joueur";
}

export function eligibleOthers(players: readonly Player[], activeId: string): Player[] {
  return players.filter((player) => player.id !== activeId);
}

// --- Deterministic randomness from a named slot value (0..1) --------------

export function rollDie(slotValue: number): number {
  return Math.min(6, Math.floor(slotValue * 6) + 1);
}

export function flipCoin(slotValue: number): "heads" | "tails" {
  return slotValue < 0.5 ? "heads" : "tails";
}

export function pickIndexFromSlot(slotValue: number, count: number): number {
  return Math.min(count - 1, Math.floor(slotValue * count));
}

// --- ResolveResult builders -------------------------------------------------

export function needRandom(...slots: string[]): ResolveResult {
  return { status: "needsInput", next: { kind: "engineRandom", slots } };
}

/** True once every named random slot has already been filled by the engine. */
export function hasSlots(slots: Record<string, number>, ...names: string[]): boolean {
  return names.every((name) => name in slots);
}

/**
 * Splits `total` into `count` whole-number amounts as evenly as possible,
 * giving the remainder to the first-picked target(s) — e.g. splitEvenly(5,3)
 * → [2,2,1]. Used by every "distribute freely" event: the amount per
 * recipient falls out of how many targets the player chose to pick.
 */
export function splitEvenly(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

export function needTargets(
  min: number,
  max: number,
  options: { excludeIds?: string[]; label?: string } = {},
): ResolveResult {
  return {
    status: "needsInput",
    next: {
      kind: "pickTargets",
      min,
      max,
      excludeIds: options.excludeIds ?? [],
      label:
        options.label ??
        (min === max
          ? `Choisis ${min} joueur${min > 1 ? "s" : ""}`
          : `Choisis ${min} à ${max} joueurs`),
    },
  };
}

export function needNeighbor(): ResolveResult {
  return { status: "needsInput", next: { kind: "pickNeighbor" } };
}

export function needChoice(options: ChoiceOption[], prompt: string | null = null): ResolveResult {
  return { status: "needsInput", next: { kind: "choice", prompt, options } };
}

export function needMystery(count: number): ResolveResult {
  return { status: "needsInput", next: { kind: "mysteryPick", count } };
}

export function needMiniGame(
  kind: MiniGameKind,
  mode: "duel" | "solo",
  playerAId: string,
  playerBId: string | null = null,
): ResolveResult {
  return { status: "needsMiniGame", request: { kind, mode, playerAId, playerBId } };
}

export function outcome(
  headline: string,
  lines: string[],
  tone: TurnOutcome["tone"] = "normal",
): TurnOutcome {
  return { headline, lines, tone };
}

export function done(turnOutcome: TurnOutcome, rule?: ActiveRule): ResolveResult {
  return { status: "done", outcome: turnOutcome, rule };
}

export function makeRule(
  ruleId: string,
  title: string,
  description: string,
  ownerId: string,
  expiry: RuleExpiry,
  timerMs: number | null = null,
): ActiveRule {
  return {
    ruleId,
    title,
    description,
    ownerId,
    expiry,
    timerEndsAt: timerMs !== null ? new Date(Date.now() + timerMs).toISOString() : null,
  };
}

/**
 * Builds an event that simply lets the active player distribute `total`
 * sips freely among 1..`maxTargets` other players — the amount per
 * recipient falls out of `splitEvenly`, so picking one target gives them
 * everything and picking several splits it evenly. Used across DISTRIBUE
 * and JACKPOT for every "distribute N as you wish" event.
 */
export function freeDistributeEvent(
  id: string,
  category: CategoryId,
  title: string,
  prompt: string,
  total: number,
): EventDefinition {
  return {
    id,
    category,
    title,
    prompt,
    visualHint: "none",
    resolve() {
      return done(
        outcome(title, [`Distribue ${total} gorgée${total > 1 ? "s" : ""} — gérez entre vous.`]),
      );
    },
  };
}

/**
 * Builds an event that needs no input at all: the app just narrates the rule
 * and the table applies it. Used by the many group-arbitrated events (nobody
 * can detect who pointed at whom, or who spoke first) where the phone is a
 * referee card rather than a game controller.
 */
export function narratedEvent(
  id: string,
  category: CategoryId,
  title: string,
  prompt: string,
  lines: string[],
  visualHint: VisualHint = "none",
): EventDefinition {
  return {
    id,
    category,
    title,
    prompt,
    visualHint,
    resolve() {
      return done(outcome(title, lines));
    },
  };
}

/** All eight duel-capable mini-games, used by DUEL/DESTIN/JACKPOT events that need a random one. */
export const DUEL_MINI_GAMES: readonly MiniGameKind[] = [
  "reflex",
  "stopTimer",
  "rps",
  "plusMinus",
  "secretNumber",
  "estimation",
  "tapBattle",
  "binaryPrediction",
];
