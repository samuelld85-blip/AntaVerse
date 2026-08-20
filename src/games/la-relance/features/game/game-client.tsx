"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Brand, LogoMark } from "@/games/la-relance/components/brand";
import { Button, ButtonLink } from "@/games/shared/components/ui";
import { themes } from "@/games/la-relance/data/themes";
import {
  STANDARD_ROUNDS,
  awardPoint,
  continueGame,
  getCurrentTheme,
  getWinnerIndex,
  hasTiedLeaders,
  replayGame,
} from "@/games/la-relance/lib/game/engine";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "@/games/la-relance/lib/game/persistence";
import type { GameState, TeamIndex } from "@/games/la-relance/lib/game/types";

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      const availableThemeIds = new Set(themes.map((theme) => theme.id));
      const hasUnavailableTheme = stored?.selectedThemeIds.some(
        (themeId) => !availableThemeIds.has(themeId),
      );

      if (!stored || hasUnavailableTheme) {
        if (stored) clearCurrentGame();
        router.replace("/la-relance/equipes");
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

  function selectWinner(winnerIndex: TeamIndex) {
    if (!game) return;
    commit(awardPoint(game, winnerIndex));
  }

  function nextStep() {
    if (!game) return;
    commit(continueGame(game));
  }

  function replay() {
    if (!game) return;
    commit(replayGame(game, themes));
  }

  function goHome() {
    clearCurrentGame();
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <LogoMark />
        <p>Préparation du thème…</p>
      </main>
    );
  }

  if (game.status === "finished") {
    return <FinishedGame game={game} onReplay={replay} onHome={goHome} />;
  }

  const currentTheme = getCurrentTheme(game, themes);
  const pointWinner = game.lastPointWinner === null ? null : game.teams[game.lastPointWinner];

  return (
    <main className="game-shell safe-shell">
      <header className="game-header">
        <Brand compact />
        <p className={game.suddenDeath ? "round-pill round-pill--danger" : "round-pill"}>
          {game.suddenDeath ? "Mort subite" : `Manche ${game.roundIndex + 1} / ${STANDARD_ROUNDS}`}
        </p>
      </header>

      <Scoreboard game={game} />

      {game.status === "playing" ? (
        <>
          <section className="theme-stage" key={currentTheme.id} aria-live="polite">
            <p className="eyebrow">À vous de relancer</p>
            <h1>{currentTheme.label}</h1>
            <p className="round-instruction">
              Une réponse chacun, à tour de rôle. <strong>Pas de répétition.</strong>
            </p>
          </section>

          <section
            className="winner-actions"
            aria-label="Équipe gagnante de la manche"
            style={{ "--team-count": game.teams.length } as CSSProperties}
          >
            {game.teams.map((team, index) => (
              <button
                key={team.id}
                type="button"
                className={`winner-button winner-button--${index + 1}`}
                onClick={() => selectWinner(index)}
              >
                <span>{team.name}</span>
                <strong>gagne</strong>
                <span className="winner-plus" aria-hidden="true">
                  +1
                </span>
              </button>
            ))}
          </section>
        </>
      ) : (
        <section className="point-card" aria-live="assertive">
          <div
            className="point-badge"
            style={{ backgroundColor: pointWinner?.color }}
            aria-hidden="true"
          >
            +1
          </div>
          <p className="eyebrow">Manche terminée</p>
          <h1>
            Point pour
            <br />
            {pointWinner?.name} !
          </h1>
          <Button onClick={nextStep}>
            {game.roundIndex < STANDARD_ROUNDS - 1
              ? "Thème suivant"
              : hasTiedLeaders(game)
                ? "Lancer la mort subite"
                : "Voir le résultat"}
            <span aria-hidden="true">→</span>
          </Button>
        </section>
      )}
    </main>
  );
}

function Scoreboard({ game }: { game: GameState }) {
  return (
    <section
      className="scoreboard"
      aria-label="Scores"
      style={{ "--team-count": game.teams.length } as CSSProperties}
    >
      {game.teams.map((team, index) => (
        <div className={`score-team score-team--${index + 1}`} key={team.id}>
          <span className="score-name">{team.name}</span>
          <strong className="score-value" key={`${team.id}-${team.score}`}>
            {team.score}
          </strong>
        </div>
      ))}
    </section>
  );
}

function FinishedGame({
  game,
  onReplay,
  onHome,
}: {
  game: GameState;
  onReplay: () => void;
  onHome: () => void;
}) {
  const winnerIndex = getWinnerIndex(game);
  const winner = winnerIndex === null ? null : game.teams[winnerIndex];

  return (
    <main className="result-shell safe-shell">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <Brand compact />
      <section className="result-card" aria-live="polite">
        <h1>
          {winner?.name}
          <br />
          <span style={{ color: winner?.color }}>remporte la partie !</span>
        </h1>
        <p className="final-label">Score final</p>
        <Scoreboard game={game} />
        <div className="result-actions">
          <Button onClick={onReplay}>
            Rejouer <span aria-hidden="true">↻</span>
          </Button>
          <ButtonLink href="/la-relance" variant="secondary" onClick={onHome}>
            Accueil
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
