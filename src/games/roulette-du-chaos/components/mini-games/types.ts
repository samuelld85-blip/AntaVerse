import type { MiniGameOutcome, Player } from "@/games/roulette-du-chaos/lib/game/types";

/** Common props every mini-game UI component receives from MiniGameRouter. */
export interface MiniGameProps {
  playerA: Player;
  /** Only null for Stop Timer in solo mode — every other mini-game is duel-only. */
  playerB: Player | null;
  mode: "duel" | "solo";
  onComplete: (outcome: MiniGameOutcome) => void;
}

export function duelOutcome(winner: "a" | "b", playerA: Player, playerB: Player): MiniGameOutcome {
  return {
    mode: "duel",
    winnerId: winner === "a" ? playerA.id : playerB.id,
    loserId: winner === "a" ? playerB.id : playerA.id,
    success: null,
    tie: false,
  };
}
