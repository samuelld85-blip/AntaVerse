"use client";

import { Button } from "@/games/shared/components/ui";
import { MiniGameShell } from "./mini-game-shell";
import { duelOutcome, type MiniGameProps } from "./types";

/** Pierre-feuille-ciseaux is played physically — the app just records who the group called the winner. */
export function Rps({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  return (
    <MiniGameShell
      title="Pierre-feuille-ciseaux"
      instruction={`${playerA.name} contre ${opponent.name} : jouez en vrai, puis touchez le gagnant. Égalité ? Rejouez et retouchez.`}
    >
      <div className="rps-choice">
        <Button type="button" onClick={() => onComplete(duelOutcome("a", playerA, opponent))}>
          {playerA.name} a gagné
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onComplete(duelOutcome("b", playerA, opponent))}
        >
          {opponent.name} a gagné
        </Button>
      </div>
    </MiniGameShell>
  );
}
