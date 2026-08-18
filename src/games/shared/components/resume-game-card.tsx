"use client";

import type { Route } from "next";
import { useEffect, useState } from "react";
import { ButtonLink } from "./ui";

// The "resume your in-progress game" card is identical for La Relance and
// Sans le dire: same markup, same "load after mount, hide once finished"
// behavior, only the persistence lookup and the resume link differ. Quoi de
// 9 has its own IndexedDB-backed resume flow and does not use this.
type ResumableGame = {
  status: string;
  teams: readonly [{ name: string }, { name: string }];
};

export function ResumeGameCard<T extends ResumableGame>({
  load,
  resumeHref,
}: {
  load: () => T | null;
  resumeHref: Route;
}) {
  const [game, setGame] = useState<T | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setGame(load()), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <ButtonLink href={resumeHref} variant="secondary" className="resume-button">
        Reprendre
      </ButtonLink>
    </section>
  );
}
