import { Brand } from "@/games/roulette-du-chaos/components/brand";
import { ResumeGameCard } from "@/games/roulette-du-chaos/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/games/roulette-du-chaos/lib/game/engine";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/roulette-du-chaos/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Une roue, huit destins</p>
        <h1>
          Roulette
          <br />
          du Chaos
        </h1>
        <p className="home-tagline">
          Tournez la roue, subissez son verdict,
          <br />
          <strong>et laissez le chaos faire le reste.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/roulette-du-chaos/joueurs">
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
