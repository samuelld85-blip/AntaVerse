import type { Metadata } from "next";
import { PageShell } from "@/games/purple/components/page-shell";
import { SetupForm } from "@/games/purple/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Qui joue ?</p>
        <h1>
          Ajoutez
          <br />
          vos joueurs.
        </h1>
        <p>Le premier à jouer est tiré au sort.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
