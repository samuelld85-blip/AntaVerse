export type GamePhase = "SEARCHING_TRIMAN" | "ACTIVE_TRIMAN";

export interface Player {
  id: string;
  name: string;
}

export interface DiceRoll {
  a: number;
  b: number;
}

export type EffectKind =
  | "triman"
  | "sum-seven"
  | "sum-nine"
  | "sum-eleven"
  | "reflex-finger-1"
  | "reflex-finger-2"
  | "reflex-fist"
  | "double";

export interface RollEffect {
  kind: EffectKind;
  /** Short headline for the effect card, e.g. "Triman", "7", "Poing !". */
  headline: string;
  /** Full sentence with any affected player already resolved by name. */
  detail: string;
  /** True for the 6+X family, where the app cannot resolve who loses the reflex. */
  isReflex: boolean;
}

export interface LastRoll {
  dice: DiceRoll;
  effects: RollEffect[];
  /** Whether the roller must roll again (at least one effect triggered). */
  rollAgain: boolean;
  /** Whether this roll just crowned a new Triman (only possible while searching). */
  trimanFound: boolean;
  /** The player who made this roll (may differ from the game's current player once the turn has advanced). */
  playerId: string;
  /** The phase the game was in when this roll was made, so the UI can render it correctly even after the phase has since changed. */
  phaseAtRoll: GamePhase;
}

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  trimanPlayerId: string | null;
  lastRoll: LastRoll | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
