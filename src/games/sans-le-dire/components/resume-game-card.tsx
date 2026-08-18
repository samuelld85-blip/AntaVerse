"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/sans-le-dire/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/sans-le-dire/partie"
      summary={(game) => `${game.teams[0].name} · ${game.teams[1].name}`}
    />
  );
}
