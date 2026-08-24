import { Brand } from "@/games/la-traversee/components/brand";
import { ResumeGameCard } from "@/games/la-traversee/components/resume-game-card";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/games/la-traversee/lib/game/engine";
import { GameHomeNav } from "@/components/game-home-nav";
import { ThemeSelector } from "@/games/shared/components/theme-selector";
import { ButtonLink } from "@/games/shared/components/ui";

export default function HomePage() {
  return <main className="home-shell safe-shell traversee-home"><header className="game-home-header"><Brand /><GameHomeNav rulesHref="/la-traversee/regles" /></header><section className="home-hero"><p className="eyebrow">Le jeu des lignes et du hasard</p><h1>La<br />Traversée</h1><p className="home-tagline">Choisis ta ligne.<br /><strong>Va jusqu’au bout.</strong></p></section><section className="home-actions"><ResumeGameCard /><ButtonLink href="/la-traversee/joueurs">Jouer <span aria-hidden="true">→</span></ButtonLink><ThemeSelector /><p>{MIN_PLAYERS} à {MAX_PLAYERS} joueurs · un jeu de 52 cartes</p></section></main>;
}
