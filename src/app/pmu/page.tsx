import { Brand } from "@/games/pmu/components/brand";
import { ResumeGameCard } from "@/games/pmu/components/resume-game-card";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/games/pmu/lib/game/engine";
import { GameHomeNav } from "@/components/game-home-nav";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";

export default function HomePage() {
  return <main className="home-shell safe-shell pmu-home"><header className="game-home-header"><Brand /><GameHomeNav rulesHref="/pmu/regles" /></header><section className="home-hero"><p className="eyebrow">Le grand jeu des chevaux</p><h1>PMU</h1><p className="home-tagline">Misez sur votre cheval.<br /><strong>Encaissez la victoire.</strong></p></section><section className="home-actions"><ResumeGameCard /><ButtonLink href="/pmu/joueurs">Jouer <span aria-hidden="true">→</span></ButtonLink><ThemeSelector /><p>{MIN_PLAYERS} à {MAX_PLAYERS} joueurs · 1 à 5 gorgées par joueur · un jeu de 52 cartes</p></section></main>;
}
