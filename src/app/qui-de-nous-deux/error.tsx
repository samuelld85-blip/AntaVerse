"use client";

import { ButtonLink } from "@/games/shared/components/ui";
import type { Route } from "next";

export default function GameError() {
  return <main className="error-shell safe-shell"><p className="eyebrow">Qui de nous deux ?</p><h1>La partie a trébuché.</h1><p>Revenez à l’accueil pour relancer une manche proprement.</p><ButtonLink href={"/qui-de-nous-deux" as Route}>Retour au jeu</ButtonLink></main>;
}
