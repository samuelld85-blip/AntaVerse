import { Brand } from "@/games/palmier/components/brand";
import { ResumeGameCard } from "@/games/palmier/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/games/palmier/lib/game/engine";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/palmier/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Un palmier, un seul survivant</p>
        <h1>Palmier</h1>
        <p className="home-tagline">
          Fais tomber le palmier.
          <br />
          <strong>Mais pas à ton tour.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/palmier/joueurs">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>
          {MIN_PLAYERS} à {MAX_PLAYERS} joueurs · aucun accessoire nécessaire
        </p>
      </section>
    </main>
  );
}
