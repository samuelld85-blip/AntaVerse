import { Brand } from "@/games/interpol/components/brand";
import { ResumeGameCard } from "@/games/interpol/components/resume-game-card";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/games/interpol/lib/game/engine";
import { GameHomeNav } from "@/components/game-home-nav";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header"><Brand /><GameHomeNav rulesHref="/interpol/regles" /></header>
      <section className="home-hero">
        <p className="eyebrow">Le jeu du maître et de la charge</p>
        <h1>Interpol</h1>
        <p className="home-tagline">Un seul connaît la charge.<br /><strong>Aux autres de la trouver.</strong></p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/interpol/joueurs">Jouer <span aria-hidden="true">→</span></ButtonLink>
        <ThemeSelector />
        <p>{MIN_PLAYERS} à {MAX_PLAYERS} joueurs</p>
      </section>
    </main>
  );
}
