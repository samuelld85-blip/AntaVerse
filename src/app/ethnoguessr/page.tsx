import { Brand } from "@/games/ethnoguessr/components/brand";
import { ResumeGameCard } from "@/games/ethnoguessr/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";
import { ROUND_COUNT } from "@/games/ethnoguessr/lib/game/engine";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/ethnoguessr/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Un duo, une carte, une estimation</p>
        <h1>EthnoGuessr</h1>
        <p className="home-tagline">
          Observe le duo, puis place ta réponse sur la carte du monde.
          <br />
          <strong>Plus tu es précis, plus tu marques de points.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/ethnoguessr/partie">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>{ROUND_COUNT} manches en solo · vraies photos créditées, à des fins de jeu uniquement</p>
      </section>
    </main>
  );
}
