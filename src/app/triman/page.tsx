import { Brand } from "@/games/triman/components/brand";
import { ResumeGameCard } from "@/games/triman/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";
import { MIN_PLAYERS } from "@/games/triman/lib/game/engine";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/triman/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">2 dés, aucune pitié</p>
        <h1>
          Qui est
          <br />
          le Triman ?
        </h1>
        <p className="home-tagline">
          Lancez les dés, trouvez le Triman,
          <br />
          <strong>et ne cassez jamais le rythme.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/triman/joueurs">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>{MIN_PLAYERS} joueurs minimum · 2 dés · partie sans fin</p>
      </section>
    </main>
  );
}
