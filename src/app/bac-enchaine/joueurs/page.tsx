import type { Metadata } from "next";
import { PageShell } from "@/games/bac-enchaine/components/page-shell";
import { SetupForm } from "@/games/bac-enchaine/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Une table, un téléphone</p>
        <h1>Ajoutez<br />les joueurs.</h1>
        <p>L’ordre entré ici sera celui de la partie.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
