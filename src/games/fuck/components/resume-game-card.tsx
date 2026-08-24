"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/fuck/lib/game/persistence";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/fuck/partie"
      summary={(game) => {
        const master = game.players[game.masterIndex];
        return `${master?.name ?? "Dealer"} · ${game.remainingDeck.length} cartes restantes`;
      }}
    />
  );
}
