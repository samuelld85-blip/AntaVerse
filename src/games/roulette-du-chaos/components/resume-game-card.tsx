"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/roulette-du-chaos/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/roulette-du-chaos/partie"
      summary={(game) => game.players.map((player) => player.name).join(" · ")}
    />
  );
}
