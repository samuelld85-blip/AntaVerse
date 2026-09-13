"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { Button, ButtonLink } from "@/games/shared/components/ui";
import {
  finishRound,
  getCurrentRound,
  isPlayerValidated,
  togglePlayerValidation,
} from "@/games/bac-enchaine/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/bac-enchaine/lib/game/persistence";
import type { GameState, Player } from "@/games/bac-enchaine/lib/game/types";
import { Brand, LogoMark } from "@/games/bac-enchaine/components/brand";

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/bac-enchaine/joueurs");
        return;
      }
      setGame(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }

  function toggle(playerId: string) {
    if (!game) return;
    commit(togglePlayerValidation(game, playerId));
  }

  function nextRound() {
    if (!game) return;
    commit(finishRound(game));
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <LogoMark />
        <p>Préparation de la table…</p>
      </main>
    );
  }

  return (
    <main className="game-shell safe-shell bac-game-shell">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/bac-enchaine" />
      </header>
      {game.status === "finished" ? (
        <FinalScores game={game} onNewGame={() => router.push("/bac-enchaine/joueurs")} />
      ) : (
        <RoundScreen game={game} onToggle={toggle} onFinish={nextRound} />
      )}
    </main>
  );
}

function RoundScreen({
  game,
  onToggle,
  onFinish,
}: {
  game: GameState;
  onToggle: (playerId: string) => void;
  onFinish: () => void;
}) {
  const round = getCurrentRound(game);
  if (!round) return null;
  const starter = game.players[round.starterPlayerIndex];

  return (
    <>
      <section className="bac-round-status" aria-labelledby="bac-round-heading">
        <p className="round-pill">
          Manche {game.currentRoundIndex + 1} / {game.rounds.length}
        </p>
        <div className="bac-prompt-card">
          <p className="bac-prompt-category">{round.prompt.category}</p>
          <h1 id="bac-round-heading">
            {round.prompt.category} <span>en</span> <strong>{round.prompt.letter}</strong>
          </h1>
          <p className="bac-starter">
            Commence : <strong>{starter?.name ?? "Joueur 1"}</strong>
          </p>
        </div>
      </section>

      <section className="bac-player-list" aria-label="Validation des réponses">
        <p className="bac-list-hint">Touchez un joueur quand sa réponse est bonne.</p>
        {game.players.map((player, index) => (
          <PlayerValidationButton
            key={player.id}
            player={player}
            index={index}
            validated={isPlayerValidated(game, player.id)}
            onClick={() => onToggle(player.id)}
          />
        ))}
      </section>

      <Button type="button" onClick={onFinish}>
        Fin de la manche <span aria-hidden="true">→</span>
      </Button>
    </>
  );
}

function PlayerValidationButton({
  player,
  index,
  validated,
  onClick,
}: {
  player: Player;
  index: number;
  validated: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={validated ? "bac-player-row bac-player-row--validated" : "bac-player-row"}
      onClick={onClick}
      aria-pressed={validated}
      aria-label={`${player.name}, ${validated ? "réponse validée" : "réponse non validée"}`}
    >
      <span className="bac-player-number" aria-hidden="true">{index + 1}</span>
      <span className="bac-player-name">{player.name}</span>
      <span className="bac-player-result">
        <span>{validated ? "Validé" : "Non validé"}</span>
        <strong>{validated ? "+1" : player.score}</strong>
      </span>
      <span className="bac-player-check" aria-hidden="true">{validated ? "✓" : "○"}</span>
    </button>
  );
}

function FinalScores({ game, onNewGame }: { game: GameState; onNewGame: () => void }) {
  const ranking = [...game.players].sort((a, b) => b.score - a.score);
  const winner = ranking[0];

  return (
    <section className="bac-final" aria-labelledby="bac-final-heading">
      <div>
        <p className="eyebrow">Partie terminée</p>
        <h1 id="bac-final-heading">Bravo<br /><span>{winner?.name}</span></h1>
        <p className="bac-final-score">{winner?.score ?? 0} point{winner?.score === 1 ? "" : "s"}</p>
      </div>
      <ol className="bac-ranking" aria-label="Classement final">
        {ranking.map((player, index) => (
          <li key={player.id}>
            <span>{index + 1}</span>
            <strong>{player.name}</strong>
            <b>{player.score}</b>
          </li>
        ))}
      </ol>
      <div className="bac-final-actions">
        <Button type="button" onClick={onNewGame}>Rejouer <span aria-hidden="true">↻</span></Button>
        <ButtonLink href="/bac-enchaine" variant="secondary">Accueil</ButtonLink>
      </div>
    </section>
  );
}
