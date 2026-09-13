"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/pifometre/lib/game/persistence";
import type { GameState } from "@/games/pifometre/lib/game/types";

export function ResumeGameCard() {
  return (
    <SharedResumeGameCard<GameState>
      load={loadCurrentGame}
      resumeHref="/pifometre/partie"
      summary={(game) => game.players.map((player) => player.name).join(" · ")}
    />
  );
}
