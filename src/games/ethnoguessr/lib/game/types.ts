export type RoundPhase = "viewing" | "guessing" | "result";

export interface RoundGuess {
  lat: number;
  lon: number;
  /** Set when the guess came from picking a country in the search bar. */
  countryId?: string;
}

export interface RoundOutcome {
  duoId: string;
  countryId: string;
  guess: RoundGuess;
  distanceKm: number;
  points: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface GameState {
  schemaVersion: 1;
  status: "playing" | "completed";
  /** The duo shown each round, in play order — fixed for the whole game. */
  duoIds: string[];
  currentRoundIndex: number;
  phase: RoundPhase;
  outcomes: RoundOutcome[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
