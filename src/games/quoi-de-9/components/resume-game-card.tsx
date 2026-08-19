"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCurrentGame } from "@/games/quoi-de-9/lib/game/persistence";
import type { GameState } from "@/games/quoi-de-9/lib/game/types";

// Same card, wording and markup as shared/components/resume-game-card.tsx.
// Quoi de 9 keeps its own copy only because its persistence is async
// (IndexedDB) while the shared component loads synchronously; the styles come
// from the `.resume-*` rules mirrored in quoi-de-9/styles.css. Abandoning a
// game is done from the in-game "Quitter" action, as in every other game.
export function ResumeGameCard() {
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    let active = true;
    void loadCurrentGame().then((stored) => {
      if (active && stored && stored.status !== "completed") setGame(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!game) return null;

  return (
    <section className="resume-card" aria-label="Partie en cours">
      <div>
        <p className="eyebrow">Partie en cours</p>
        <p className="resume-teams">
          {game.teams.map((team) => team.name).join(" · ")}
        </p>
      </div>
      <Link href="/quoi-de-9/partie" className="resume-button">
        Reprendre
      </Link>
    </section>
  );
}
