import Image from "next/image";
import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { HomeThemeSelector } from "@/components/home-theme-selector";
import { games } from "@/lib/games";

export default function HomePage() {
  return (
    <main className="launcher-shell">
      <header className="launcher-header">
        <div className="antaverse-brand" aria-label="AntaVerse">
          <Image
            src="/brand/antaverse-logo.png"
            alt="AntaVerse"
            width={588}
            height={568}
            priority
          />
        </div>
        <div className="launcher-header-actions">
          <p>
            <span>LES JEUX PRÉFÉRÉS DES</span>
            <span>SANGLIEEEERS !</span>
          </p>
          <HomeThemeSelector />
        </div>
      </header>

      <section className="launcher-intro" aria-labelledby="launcher-title">
        <p className="launcher-eyebrow">Prêts à jouer ?</p>
        <h1 id="launcher-title">Choisissez votre jeu.</h1>
      </section>

      <section className="launcher-games" aria-label="Jeux disponibles">
        <ol>
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </ol>
      </section>

      <footer className="launcher-footer">
        <span>{games.length} jeux · 1 téléphone</span>
        <Link href="/installer">Installer l’app</Link>
      </footer>
    </main>
  );
}
