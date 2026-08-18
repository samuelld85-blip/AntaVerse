// Roulette du Chaos — shared types for the wheel, events, resolution engine,
// and mini-game sessions. See ARCHITECTURE.md for how this fits the rest of
// AntaVerse: everything here is local to this game (its rules engine), per
// the "Game rules stay inside each game's lib/game/" rule.

export interface Player {
  id: string;
  name: string;
}

export type CategoryId =
  "DISTRIBUE" | "SUBIS" | "DUEL" | "TOUS" | "CHOISIS" | "DESTIN" | "REGLE" | "JACKPOT";

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  /** Weight out of 100, see the wheel's probability table. */
  weight: number;
  icon: string;
  description: string;
}

export type GamePhase = "idle" | "spinning" | "categoryReveal" | "event" | "miniGame";

/** Purely cosmetic hint for which reveal animation the event card should play before showing its outcome. */
export type VisualHint = "none" | "die" | "coin" | "mystery" | "duel";

// --- Resolution ------------------------------------------------------------
//
// Each event owns a small pure `resolve` function (see events/*.ts) that is
// called repeatedly with an accumulating `ResolveInput` as answers come in.
// It either asks for more input (`needsInput`), asks the engine to run a
// mini-game (`needsMiniGame`), or is `done`. Any randomness the resolver
// needs (a random target, a coin flip, a die face, a shuffle) is requested
// by name via `engineRandom` and persisted into `randomSlots` by the engine
// so repeated calls stay pure and deterministic — nothing here ever calls
// `Math.random()` itself.

export interface PickTargetsRequest {
  kind: "pickTargets";
  min: number;
  max: number;
  /** Player ids that may not be picked (usually the active player, sometimes nobody). */
  excludeIds: string[];
  /** Short hint shown above the picker, e.g. "Choisis 2 joueurs". */
  label: string;
}

export interface PickNeighborRequest {
  kind: "pickNeighbor";
}

export interface ChoiceOption {
  key: string;
  label: string;
}

export interface ChoiceRequest {
  kind: "choice";
  /** Optional question/context shown above the buttons (majority prompts, vote framing). */
  prompt: string | null;
  options: ChoiceOption[];
}

export interface MysteryPickRequest {
  kind: "mysteryPick";
  count: number;
}

export interface EngineRandomRequest {
  kind: "engineRandom";
  slots: string[];
}

export type NextInputRequest =
  | PickTargetsRequest
  | PickNeighborRequest
  | ChoiceRequest
  | MysteryPickRequest
  | EngineRandomRequest;

export type MiniGameKind =
  | "reflex"
  | "stopTimer"
  | "rps"
  | "plusMinus"
  | "secretNumber"
  | "estimation"
  | "tapBattle"
  | "binaryPrediction";

export interface MiniGameRequest {
  kind: MiniGameKind;
  mode: "duel" | "solo";
  playerAId: string;
  playerBId: string | null;
}

export interface MiniGameOutcome {
  mode: "duel" | "solo";
  winnerId: string | null;
  loserId: string | null;
  success: boolean | null;
  tie: boolean;
}

export interface TurnOutcome {
  headline: string;
  lines: string[];
  tone: "normal" | "jackpot" | "rule";
}

export type RuleExpiry = "ownerNextTurn" | "firstViolation" | "timer";

export interface ActiveRule {
  ruleId: string;
  title: string;
  description: string;
  ownerId: string;
  expiry: RuleExpiry;
  /** Only set for expiry === "timer" (e.g. R8's 30s silence window). */
  timerEndsAt: string | null;
}

export interface ResolveInput {
  players: Player[];
  activePlayerId: string;
  recentEventIds: readonly string[];
  randomSlots: Record<string, number>;
  /** Every `pickTargets` round answered so far, in order — most events only ever need `targetRounds[0]`. */
  targetRounds: string[][];
  neighborSide: "left" | "right" | null;
  choiceKey: string | null;
  mysteryPickIndex: number | null;
  miniGameResult: MiniGameOutcome | null;
}

export type ResolveResult =
  | { status: "needsInput"; next: NextInputRequest }
  | { status: "needsMiniGame"; request: MiniGameRequest }
  | { status: "done"; outcome: TurnOutcome; rule?: ActiveRule };

export interface EventDefinition {
  id: string;
  category: CategoryId;
  title: string;
  /** Short static instruction shown at the top of the event card, understandable in ~3s. */
  prompt: string;
  visualHint: VisualHint;
  resolve: (input: ResolveInput) => ResolveResult;
}

// --- Persisted resolution/mini-game state ----------------------------------

export interface ResolutionState {
  eventId: string;
  randomSlots: Record<string, number>;
  targetRounds: string[][];
  neighborSide: "left" | "right" | null;
  choiceKey: string | null;
  mysteryPickIndex: number | null;
  miniGameResult: MiniGameOutcome | null;
  pending: NextInputRequest | null;
  outcome: TurnOutcome | null;
}

export interface MiniGameSession {
  kind: MiniGameKind;
  mode: "duel" | "solo";
  playerAId: string;
  playerBId: string | null;
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  selectedCategory: CategoryId | null;
  /** Set the instant the wheel lands (spin logic decides the event, not the animation — see spec 64), consumed once `revealEvent` builds `resolution`. */
  selectedEventId: string | null;
  resolution: ResolutionState | null;
  miniGame: MiniGameSession | null;
  activeRule: ActiveRule | null;
  recentEventIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
