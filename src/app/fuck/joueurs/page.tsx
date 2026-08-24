import type { Metadata } from "next";
import { PageShell } from "@/games/fuck/components/page-shell";
import { SetupForm } from "@/games/fuck/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Qui prend le paquet ?</p>
        <h1>Ajoutez<br />les joueurs.</h1>
        <p>Le premier joueur de la liste commence comme Dealer.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
