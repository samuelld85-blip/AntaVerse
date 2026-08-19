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
        <div className="flex items-end justify-between gap-6">
          <h1 id="launcher-title">Choisissez votre jeu.</h1>
          <div className="flex flex-col gap-3 text-sm text-white shrink-0 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏆</span>
              <span className="font-medium">Compétition</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🍺</span>
              <span className="font-medium">Jeu à boire</span>
            </div>
          </div>
        </div>
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
