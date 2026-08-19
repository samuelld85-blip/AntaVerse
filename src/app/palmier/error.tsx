"use client";

import { Button } from "@/games/shared/components/ui";
import { LogoMark } from "@/games/palmier/components/brand";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="error-shell safe-shell">
      <LogoMark />
      <p className="eyebrow">Petit contretemps</p>
      <h1>La partie n’a pas pu être chargée.</h1>
      <Button onClick={reset}>Réessayer</Button>
    </main>
  );
}
