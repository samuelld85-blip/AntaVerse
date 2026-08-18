import { Brand } from "@/games/sans-le-dire/components/brand";
import { ResumeGameCard } from "@/games/sans-le-dire/components/resume-game-card";
import { ThemeSelector } from "@/games/sans-le-dire/components/theme-selector";
import { ButtonLink } from "@/games/sans-le-dire/components/ui";
import { GlobalHomeLink } from "@/components/global-home-link";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header>
        <Brand />
        <GlobalHomeLink />
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
        <ButtonLink href="/sans-le-dire/equipes">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>2 équipes · 45 secondes · 3 mots interdits</p>
      </section>
    </main>
  );
}
