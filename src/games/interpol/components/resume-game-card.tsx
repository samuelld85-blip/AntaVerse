"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { getMaster } from "@/games/interpol/lib/game/engine";
import { loadCurrentGame } from "@/games/interpol/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/interpol/partie"
      summary={(game) => `Manche ${game.roundNumber}/${game.totalRounds} · maître : ${getMaster(game).name}`}
    />
  );
}
