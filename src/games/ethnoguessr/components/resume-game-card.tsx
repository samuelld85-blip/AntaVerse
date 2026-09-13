"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/ethnoguessr/lib/game/persistence";
import { ROUND_COUNT, totalScore } from "@/games/ethnoguessr/lib/game/engine";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard
      load={loadCurrentGame}
      resumeHref="/ethnoguessr/partie"
      summary={(game) =>
        `Manche ${game.currentRoundIndex + 1}/${ROUND_COUNT} · ${totalScore(game)} pts`
      }
    />
  );
}
