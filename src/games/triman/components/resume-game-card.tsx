"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/triman/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/triman/partie"
      summary={(game) => game.players.map((player) => player.name).join(" · ")}
    />
  );
}
