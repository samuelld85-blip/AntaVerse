import type { Metadata } from "next";
import { PageShell } from "@/games/pifometre/components/page-shell";
import { SetupForm } from "@/games/pifometre/features/setup/setup-form";

export const metadata: Metadata = { title: "Joueurs" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">À qui le tour ?</p>
        <h1>
          Les
          <br />
          joueurs
        </h1>
        <p>Choisissez le rythme, puis laissez les réponses se faire autour de la table.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
