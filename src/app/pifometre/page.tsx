import { Brand } from "@/games/pifometre/components/brand";
import { ResumeGameCard } from "@/games/pifometre/components/resume-game-card";
import { ButtonLink } from "@/games/shared/components/ui";
import { GameHomeNav } from "@/components/game-home-nav";
import { ThemeSelector } from "@/games/shared/components/theme-selector";

export default function PifometreHomePage() {
  return (
    <main className="home-shell safe-shell pifometre-home">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref="/pifometre/regles" />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Le quiz où le pif fait loi</p>
        <h1>
          Le
          <br />
          Pifomètre
        </h1>
        <p className="home-tagline">
          Estimez sans tricher.
          <br />
          <strong>La vérité arrive toujours après le bluff.</strong>
        </p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/pifometre/joueurs">
          Jouer <span aria-hidden="true">→</span>
        </ButtonLink>
        <ThemeSelector />
        <p>Questions vérifiées · 2 à 8 joueurs · 1 téléphone</p>
      </section>
    </main>
  );
}
