"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame, loadSoloGame } from "@/games/sans-le-dire/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/sans-le-dire/partie"
      summary={(game) => game.teams.map((t) => t.name).join(" · ")}
    />
  );
}

export function SoloResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadSoloGame}
      resumeHref="/sans-le-dire/partie"
      summary={(game) => game.players.map((p) => p.name).join(" · ")}
    />
  );
}
