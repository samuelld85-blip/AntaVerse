import { Brand } from "@/games/sans-le-dire/components/brand";
import { ClearTeamNamesOnHome } from "@/games/sans-le-dire/components/clear-team-names-on-home";
import {
  ResumeGameCard,
  SoloResumeGameCard,
} from "@/games/sans-le-dire/components/resume-game-card";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <ClearTeamNamesOnHome />
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/sans-le-dire/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Le jeu des mots qu’il ne faut pas dire</p>
        <h1>
          Sans le
          <br />
          dire
        </h1>
        <p className="home-tagline">
          Fais deviner le mot. Mais surtout,
          <br />
          <strong>ne dis pas ceux-là.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <SoloResumeGameCard />
        <ButtonLink href="/sans-le-dire/jouer">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>2 équipes · 45 secondes · 3 mots interdits</p>
      </section>
    </main>
  );
}
