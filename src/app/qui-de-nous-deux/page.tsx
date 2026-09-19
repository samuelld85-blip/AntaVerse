import { GameHomeNav } from "@/components/game-home-nav";
import { ButtonLink } from "@/games/shared/components/ui";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { Brand } from "@/games/qui-de-nous-deux/components/brand";
import { ResumeGameCard } from "@/games/qui-de-nous-deux/components/resume-game-card";
import type { Route } from "next";

export default function QuiDeNousDeuxHomePage() {
  return (
    <main className="home-shell safe-shell qndd-home">
      <header className="game-home-header">
        <Brand />
        <GameHomeNav rulesHref={"/qui-de-nous-deux/regles" as Route} />
      </header>
      <section className="home-hero">
        <p className="eyebrow">Le jeu où personne n’est d’accord</p>
        <h1>Qui de<br />nous deux ?</h1>
        <p className="home-tagline">Dos à dos.<br /><strong>Une même réponse ou un point pour les arbitres.</strong></p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href={"/qui-de-nous-deux/joueurs" as Route}>Jouer <span aria-hidden="true">→</span></ButtonLink>
        <ThemeSelector />
        <p>230 questions · 2 équipes · 1 téléphone</p>
      </section>
    </main>
  );
}
