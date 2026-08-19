import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { GameDefinition } from "@/lib/games";

export function GameCard({ game, index }: { game: GameDefinition; index: number }) {
  const style = {
    "--game-accent": game.accent,
    "--icon-background": game.iconBackground,
  } as CSSProperties;

  return (
    <li className="game-list-item">
      <Link
        href={game.route}
        className="game-card"
        style={style}
        aria-label={`Jouer à ${game.name}`}
      >
        <span className="game-card-modes" aria-hidden="true">
          {game.modes?.includes("competition") && <span>🏆</span>}
          {(game.drinkingGame || game.modes?.includes("fun")) && <span>🍺</span>}
        </span>
        <span className="game-icon" aria-hidden="true">
          <Image src={game.icon} alt="" width={88} height={88} sizes="72px" />
        </span>
        <span className="game-copy">
          <strong>{game.name}</strong>
          <span>{game.description}</span>
        </span>
        <span className="game-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}
