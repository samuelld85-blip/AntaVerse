"use client";

import type { Route } from "next";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ButtonLink } from "./ui";

// The "resume your in-progress game" card is identical across games: same
// markup, same wording, same "load after mount, hide once finished" behavior.
// Only the persistence lookup, the resume link, and how to summarize the
// in-progress game (team names, player names, ...) differ, so callers supply
// those. Quoi de 9 mirrors this component locally because its persistence is
// async.
//
// The constraint is intentionally just `object`, not `{ status?: string }`:
// a game state that has no "status" concept at all (Triman never finishes)
// would still structurally satisfy an all-optional shape, but TypeScript's
// weak-type check rejects it anyway for sharing zero property names. Reading
// `status` is done with a loose runtime check below instead.
export function ResumeGameCard<T extends object>({
  load,
  resumeHref,
  summary,
}: {
  load: () => T | null;
  resumeHref: Route;
  summary: (game: T) => ReactNode;
}) {
  const [game, setGame] = useState<T | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setGame(load()), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!game || (game as { status?: unknown }).status === "finished") return null;

  return (
    <section className="resume-card" aria-label="Partie en cours">
      <div>
        <p className="eyebrow">Partie en cours</p>
        <p className="resume-teams">{summary(game)}</p>
      </div>
      <ButtonLink href={resumeHref} variant="secondary" className="resume-button">
        Reprendre
      </ButtonLink>
    </section>
  );
}
