"use client";

import { Button } from "@/games/shared/components/ui";
import { MiniGameShell } from "./mini-game-shell";
import type { MiniGameProps } from "./types";

/** Pierre-feuille-ciseaux est joué en vrai — l'app lance le duel, le résultat se gère entre joueurs. */
export function Rps({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  return (
    <MiniGameShell
      title="Pierre-feuille-ciseaux"
      instruction={`${playerA.name} contre ${opponent.name} — jouez en vrai. Le perdant boit 2 gorgées.`}
    >
      <Button
        type="button"
        onClick={() =>
          onComplete({ mode: "duel", winnerId: null, loserId: null, success: null, tie: false })
        }
      >
        Continuer <span aria-hidden="true">→</span>
      </Button>
    </MiniGameShell>
  );
}
