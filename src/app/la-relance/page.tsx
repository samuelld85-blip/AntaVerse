import { Brand } from "@/games/la-relance/components/brand";
import { ResumeGameCard } from "@/games/la-relance/components/resume-game-card";
import { ThemeSelector } from "@/games/la-relance/components/theme-selector";
import { ButtonLink } from "@/games/la-relance/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/la-relance/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Le jeu qui ne vous laisse pas souffler</p>
        <h1>
          À court
          <br />
          d’idées ?
        </h1>
        <p className="home-tagline">
          Un thème. Deux équipes. Une réponse chacun.
          <br />
          <strong>Jusqu’à ce que l’un craque.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/la-relance/equipes">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>2 équipes · 1 téléphone · 5 manches</p>
      </section>
    </main>
  );
}
