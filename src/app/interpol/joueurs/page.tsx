import type { Metadata } from "next";
import { PageShell } from "@/games/interpol/components/page-shell";
import { SetupForm } from "@/games/interpol/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Qui va enquêter ?</p>
        <h1>Ajoutez<br />les joueurs.</h1>
        <p>Le premier joueur de la liste commence comme maître du jeu.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
