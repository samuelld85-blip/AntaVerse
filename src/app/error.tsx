"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="launcher-shell launcher-error">
      <p className="launcher-eyebrow">Petit imprévu</p>
      <h1>Le jeu n’a pas pu s’ouvrir.</h1>
      <p>Réessayez, ou revenez à la sélection des jeux.</p>
      <div>
        <button type="button" onClick={reset}>
          Réessayer
        </button>
        <Link href="/">Tous les jeux</Link>
      </div>
    </main>
  );
}
