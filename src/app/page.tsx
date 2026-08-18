import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { games } from "@/lib/games";

export default function HomePage() {
  return (
    <main className="launcher-shell">
      <header className="launcher-header">
        <div className="antaverse-brand" aria-label="AntaVerse">
          <span className="brand-orbit" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>ANTA</strong>
            <em>VERSE</em>
          </span>
        </div>
        <p>La galaxie des jeux de soirée</p>
      </header>

      <section className="launcher-intro" aria-labelledby="launcher-title">
        <p className="launcher-eyebrow">Prêts à jouer ?</p>
        <h1 id="launcher-title">Choisissez votre jeu.</h1>
        <p>Un téléphone suffit. Touchez une carte et lancez la partie.</p>
      </section>

      <section className="launcher-games" aria-label="Jeux disponibles">
        <ol>
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </ol>
      </section>

      <footer className="launcher-footer">
        <span>3 jeux · 1 téléphone</span>
        <Link href="/installer">Installer l’app</Link>
      </footer>
    </main>
  );
}
