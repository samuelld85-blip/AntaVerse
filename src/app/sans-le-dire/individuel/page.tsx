import { PageShell } from "@/games/sans-le-dire/components/page-shell";
import { SoloSetupForm } from "@/games/sans-le-dire/features/setup/solo-setup-form";

export default function IndividuelPage() {
  return (
    <PageShell>
      <section className="setup-heading">
        <p className="eyebrow">Qui joue ?</p>
        <h1>
          Entrez les
          <br />
          joueurs.
        </h1>
        <p>L’ordre saisi sera l’ordre des maîtres du jeu.</p>
      </section>
      <SoloSetupForm />
    </PageShell>
  );
}
