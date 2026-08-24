import { Brand } from "@/games/fuck/components/brand";
import { ResumeGameCard } from "@/games/fuck/components/resume-game-card";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/games/fuck/lib/game/engine";
import { GameHomeNav } from "@/components/game-home-nav";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell">
      <header className="game-home-header"><Brand /><GameHomeNav rulesHref="/fuck/regles" /></header>
      <section className="home-hero">
        <p className="eyebrow">Le jeu du dealer et du hasard</p>
        <h1>Fuck</h1>
        <p className="home-tagline">Devine la carte.<br /><strong>Évite le mauvais écart.</strong></p>
      </section>
      <section className="home-actions">
        <ResumeGameCard />
        <ButtonLink href="/fuck/joueurs">Jouer <span aria-hidden="true">→</span></ButtonLink>
        <ThemeSelector />
        <p>{MIN_PLAYERS} à {MAX_PLAYERS} joueurs · un jeu classique de 52 cartes</p>
      </section>
    </main>
  );
}
