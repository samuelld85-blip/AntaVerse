import { Brand } from "@/games/purple/components/brand";
import { ResumeGameCard } from "@/games/purple/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/purple/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Rouge, noir, Skubrum ou Sandwich ?</p>
        <h1>
          Le pot
          <br />
          ne ment pas.
        </h1>
        <p className="home-tagline">
          Devinez la couleur des cartes tirées du paquet. Chaque réussite gonfle le pot commun.
          <br />
          <strong>Chaque échec, vous le buvez.</strong>
        </p>
      </section>
      <section className="home-actions purple-home-actions">
        <ResumeGameCard />
        <ButtonLink href="/purple/joueurs">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>2 à 12 joueurs · 1 téléphone · partie infinie</p>
      </section>
    </main>
  );
}
