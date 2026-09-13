import { Brand } from "@/games/bac-enchaine/components/brand";
import { ResumeGameCard } from "@/games/bac-enchaine/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";
import { MIN_PLAYERS, MAX_PLAYERS, ROUNDS_PER_GAME } from "@/games/bac-enchaine/lib/game/engine";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell bac-home">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/bac-enchaine/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Le Petit Bac en chaîne</p>
        <h1>Bac<br />Enchaîné</h1>
        <p className="home-tagline">
          Une lettre. Une catégorie.<br />
          <strong>Ne séchez pas.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/bac-enchaine/joueurs">Jouer <span aria-hidden="true">→</span></ButtonLink>
        <ThemeSelector />
        <p>{MIN_PLAYERS} à {MAX_PLAYERS} joueurs · {ROUNDS_PER_GAME} manches · 1 téléphone</p>
      </section>
    </main>
  );
}
