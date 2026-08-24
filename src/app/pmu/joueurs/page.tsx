import { PageShell } from "@/games/pmu/components/page-shell";
import { SetupForm } from "@/games/pmu/features/setup/setup-form";

export default function PlayersPage() {
  return <PageShell><section className="setup-heading"><p className="eyebrow">PMU · Mise en place</p><h1>Qui joue ?</h1><p>Ajoutez les joueurs. Chacun choisira ensuite une mise de 1 à 5 gorgées sur une seule couleur.</p></section><SetupForm /></PageShell>;
}
