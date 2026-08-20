"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/la-relance/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/la-relance/partie"
      summary={(game) => game.teams.map((t) => t.name).join(" · ")}
    />
  );
}
