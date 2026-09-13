/** A real, public Interpol Red Notice — see data/notices.json for provenance. */
export interface Notice {
  id: string;
  imageUrl: string;
  fullName: string;
  nationality: string;
  charge: string;
  sourceUrl: string;
}

export interface Player {
  id: string;
  name: string;
  wins: number;
}

export type GamePhase = "handoff" | "briefing" | "guessing" | "result" | "end";

export interface GameState {
  schemaVersion: 1;
  id: string;
  players: Player[];
  masterIndex: number;
  /** Remaining notices for upcoming rounds, one consumed per round. */
  deck: Notice[];
  currentNotice: Notice | null;
  roundNumber: number;
  totalRounds: number;
  phase: GamePhase;
  lastWinnerId: string | null;
  status: "in_progress" | "finished";
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  playerNames: string[];
}
