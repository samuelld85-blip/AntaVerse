import type { Metadata } from "next";
import { PageShell } from "@/games/qui-de-nous-deux/components/page-shell";
import { SetupForm } from "@/games/qui-de-nous-deux/features/setup/setup-form";

export const metadata: Metadata = { title: "Préparer la partie" };

export default function PlayersPage() {
  return (
    <PageShell>
      <section className="setup-heading qndd-setup-heading">
        <p className="eyebrow">À qui le tour ?</p>
        <h1>Préparez<br />le duel</h1>
        <p>Le duo joue dos à dos. Les poseurs gardent le téléphone.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
