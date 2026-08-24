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
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </ol>
      </section>

      <footer className="launcher-footer">
        <span className="launcher-footer-left">{games.length} jeux · 1 téléphone</span>
        <span className="launcher-footer-center">
          <Link href="/installer">Installer l’app</Link>
        </span>
        <span className="launcher-footer-right">
          <Link href="/legal">Informations &amp; support</Link>
        </span>
      </footer>
    </main>
  );
}
