"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { ButtonLink } from "@/games/shared/components/ui";
import { Brand } from "@/games/interpol/components/brand";
import {
  confirmBriefing,
  getGuessers,
  getMaster,
  nextRound,
  ranking,
  resolveRound,
  revealToMaster,
} from "@/games/interpol/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/interpol/lib/game/persistence";
import type { GameState } from "@/games/interpol/lib/game/types";

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/interpol/joueurs");
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

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell interpol-shell interpol-loading" aria-busy="true">
        <Brand compact />
        <p>Préparation de la partie…</p>
      </main>
    );
  }

  if (game.phase === "end") {
    const standings = ranking(game);
    const winner = standings[0]!;
    const isTie = standings.length > 1 && standings[1]!.wins === winner.wins;

    return (
      <main className="result-shell safe-shell">
        <header className="game-header">
          <Brand compact />
        </header>
        <section className="result-card">
          <p className="eyebrow">Partie terminée</p>
          <div className="trophy" aria-hidden="true">🏆</div>
          <h1>{isTie ? "Égalité" : <>{winner.name}<br />gagne</>}</h1>
          <p className="final-label">Manches trouvées</p>
          <p className="final-score">{winner.wins}</p>
          <ol className="interpol-ranking">
            {standings.map((player, index) => (
              <li key={player.id}>
                <span className="interpol-rank-badge">{index + 1}</span>
                <span className="interpol-rank-name">{player.name}</span>
                <span className="interpol-rank-score">{player.wins}</span>
              </li>
            ))}
          </ol>
          <div className="result-actions">
            <ButtonLink href="/interpol/joueurs">Rejouer</ButtonLink>
            <ButtonLink href="/interpol" variant="secondary">Accueil</ButtonLink>
          </div>
        </section>
      </main>
    );
  }

  const master = getMaster(game);

  return (
    <main className="game-shell safe-shell interpol-shell">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/interpol" />
      </header>

      <p className="round-pill">Manche {game.roundNumber} / {game.totalRounds}</p>

      {game.phase === "handoff" ? (
        <section className="interpol-panel">
          <p className="eyebrow">Maître du jeu</p>
          <h1>Passez le téléphone<br />à {master.name}.</h1>
          <p className="interpol-instruction">
            {master.name} seul·e doit regarder l&rsquo;écran. Une fois prêt·e, appuyez pour découvrir le portrait et la charge.
          </p>
          <button type="button" className="button button--primary" onClick={() => commit(revealToMaster(game))}>
            Voir le portrait et la charge <span aria-hidden="true">→</span>
          </button>
        </section>
      ) : null}

      {game.phase === "briefing" && game.currentNotice ? (
        <section className="interpol-panel">
          <p className="eyebrow">Vous seul·e voyez cet écran</p>
          <div className="interpol-portrait-frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed local dataset image */}
            <img src={game.currentNotice.imageUrl} alt="Portrait de la personne recherchée" />
          </div>
          <div className="interpol-charge-card">
            <p>Charge</p>
            <p>{game.currentNotice.charge}</p>
          </div>
          <p className="interpol-instruction">
            Mémorisez la charge : elle disparaîtra dès que vous montrerez le portrait aux autres joueurs.
          </p>
          <button type="button" className="button button--primary" onClick={() => commit(confirmBriefing(game))}>
            J&rsquo;ai pris connaissance <span aria-hidden="true">→</span>
          </button>
        </section>
      ) : null}

      {game.phase === "guessing" && game.currentNotice ? (
        <section className="interpol-panel">
          <p className="eyebrow">Montrez ce portrait à tout le monde</p>
          <div className="interpol-portrait-frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed local dataset image */}
            <img src={game.currentNotice.imageUrl} alt="Portrait de la personne recherchée" />
          </div>
          <p className="interpol-instruction">
            Les autres joueurs posent des questions ou proposent une charge à voix haute. <strong>{master.name}</strong> répond
            et valide ci-dessous dès que quelqu&rsquo;un trouve.
          </p>
          <ul className="interpol-guesser-list">
            {getGuessers(game).map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  className="interpol-guesser-button"
                  onClick={() => commit(resolveRound(game, player.id))}
                >
                  <span>{player.name} a trouvé</span>
                  <span aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {game.phase === "result" && game.lastWinnerId && game.currentNotice ? (
        <ResultPanel game={game} onNext={() => commit(nextRound(game))} />
      ) : null}
    </main>
  );
}

function ResultPanel({ game, onNext }: { game: GameState; onNext: () => void }) {
  const winner = game.players.find((player) => player.id === game.lastWinnerId)!;
  const notice = game.currentNotice!;
  const isLastRound = game.roundNumber >= game.totalRounds;
  return (
    <section className="interpol-panel">
      <div className="interpol-outcome-badge" aria-hidden="true">✓</div>
      <h1>{winner.name}<br />a trouvé !</h1>
      <p className="interpol-reveal-name">{notice.fullName}</p>
      <p className="interpol-reveal-meta">{notice.nationality}</p>
      <div className="interpol-charge-card">
        <p>Charge réelle</p>
        <p>{notice.charge}</p>
      </div>
      <a className="interpol-reveal-link" href={notice.sourceUrl} target="_blank" rel="noopener noreferrer">
        Voir la notice Interpol officielle
      </a>
      <button type="button" className="button button--primary" onClick={onNext}>
        {isLastRound ? "Voir le classement" : "Manche suivante"} <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
