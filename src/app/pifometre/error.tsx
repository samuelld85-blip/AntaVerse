"use client";

import { ButtonLink } from "@/games/shared/components/ui";

export default function PifometreError() {
  return (
    <main className="error-shell safe-shell">
      <p className="eyebrow">Le Pifomètre</p>
      <h1>Oups, le pif a dérapé.</h1>
      <ButtonLink href="/pifometre">Retour au jeu</ButtonLink>
    </main>
  );
}
