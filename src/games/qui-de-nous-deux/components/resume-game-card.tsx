"use client";

import Link from "next/link";
import { loadCurrentGame } from "@/games/qui-de-nous-deux/lib/game/persistence";
import type { GameState } from "@/games/qui-de-nous-deux/lib/game/types";
import type { Route } from "next";

export function ResumeGameCard() {
  const game: GameState | null = typeof window === "undefined" ? null : loadCurrentGame();
  if (!game || game.phase === "finished") return null;
  return (
    <div className="resume-card qndd-resume-card">
      <div>
        <p className="eyebrow">Partie en cours</p>
        <p className="resume-teams">{game.duo.name} · {game.roundIndex + 1}/{game.questionIds.length}</p>
      </div>
      <Link className="button button--primary resume-button" href={"/qui-de-nous-deux/partie" as Route}>Reprendre</Link>
    </div>
  );
}
