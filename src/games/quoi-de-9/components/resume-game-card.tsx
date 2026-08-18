"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearCurrentGame, loadCurrentGame } from "@/games/quoi-de-9/lib/game/persistence";
import type { GameState } from "@/games/quoi-de-9/lib/game/types";
import { FR } from "@/games/quoi-de-9/lib/i18n/fr";

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

  async function abandon() {
    await clearCurrentGame();
    setGame(null);
  }

  return (
    <section className="glass-panel rounded-3xl p-4" aria-label="Partie en cours">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent-text)]">
            Partie en cours
          </p>
          <p className="mt-1 truncate text-sm font-bold text-white/72">
            {game.teams[0].name} · {game.teams[1].name}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white/[.07] px-3 py-2 text-xs font-black">
          {game.currentRound}/{game.roundsPerTeam}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Link
          href="/quoi-de-9/partie"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lime)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent-ink)]"
        >
          {FR.resumeGame}
        </Link>
        <button
          type="button"
          onClick={() => void abandon()}
          className="min-h-12 rounded-xl border border-white/10 px-4 text-xs font-semibold text-white/58"
          aria-label={FR.abandonGame}
        >
          Effacer
        </button>
      </div>
    </section>
  );
}
