"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/games/shared/components/ui";
import { loadCurrentGame } from "@/games/la-relance/lib/game/persistence";
import type { GameState } from "@/games/la-relance/lib/game/types";

export function ResumeGameCard() {
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setGame(loadCurrentGame()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!game || game.status === "finished") return null;

  return (
    <section className="resume-card" aria-label="Partie en cours">
      <div>
        <p className="eyebrow">Partie en cours</p>
        <p className="resume-teams">
          {game.teams[0].name} · {game.teams[1].name}
        </p>
      </div>
      <ButtonLink href="/la-relance/partie" variant="secondary" className="resume-button">
        Reprendre
      </ButtonLink>
    </section>
  );
}
