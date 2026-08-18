"use client";

import { Button } from "@/games/quoi-de-9/components/ui";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="safe-shell grid min-h-[100dvh] place-items-center">
      <section className="glass-panel w-full max-w-md rounded-3xl p-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--coral)]">
          Contenu indisponible
        </p>
        <h1 className="display-face mt-3 text-5xl">Impossible de charger le jeu.</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          Le bundle de questions est absent ou corrompu. Rechargez sa version validée avant de
          reprendre une partie.
        </p>
        <Button className="mt-6" onClick={reset}>
          Réessayer
        </Button>
      </section>
    </main>
  );
}
