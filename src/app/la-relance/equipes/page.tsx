import type { Metadata } from "next";
import { PageShell } from "@/games/la-relance/components/page-shell";
import { SetupForm } from "@/games/la-relance/features/setup/setup-form";

export const metadata: Metadata = { title: "Équipes" };

export default function TeamsPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Qui s’affronte ?</p>
        <h1>
          Donnez un nom
          <br />à vos équipes.
        </h1>
        <p>Vous pourrez rejouer avec les mêmes noms.</p>
      </section>
      <SetupForm />
    </PageShell>
  );
}
