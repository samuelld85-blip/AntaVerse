import type { Metadata } from "next";
import { PageShell } from "@/games/palmier/components/page-shell";
import { SetupForm } from "@/games/palmier/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Qui ose jouer ?</p>
        <h1>
          Ajoutez
          <br />
          les joueurs.
        </h1>
        <p>L’ordre entré ici sera celui de la partie.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
