import type { Metadata } from "next";
import { PageShell } from "@/games/la-traversee/components/page-shell";
import { SetupForm } from "@/games/la-traversee/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() { return <PageShell><section className="setup-heading"><p className="eyebrow">Préparez le départ</p><h1>Ajoutez<br />les joueurs.</h1><p>Le premier joueur commence à gauche. À chaque tour, il tente sa traversée.</p></section><SetupForm /></PageShell>; }
