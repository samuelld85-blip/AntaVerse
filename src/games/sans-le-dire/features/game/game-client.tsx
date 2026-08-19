"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand, LogoMark } from "@/games/sans-le-dire/components/brand";
import { Button, ButtonLink } from "@/games/shared/components/ui";
import { cards } from "@/games/sans-le-dire/data/cards";
import {
  continueGame,
  endRound,
  faultCard,
  foundCard,
  getCurrentCard,
  getWinnerIndex,
  passCard,
  recordForbiddenViolation,
  replayGame,
  STANDARD_ROUNDS,
  startRound,
} from "@/games/sans-le-dire/lib/game/engine";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "@/games/sans-le-dire/lib/game/persistence";
import type { GameState } from "@/games/sans-le-dire/lib/game/types";

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const locked = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      const ids = new Set(cards.map((card) => card.id));
      if (!stored || stored.deck.some((id) => !ids.has(id))) {
        if (stored) clearCurrentGame();
        router.replace("/sans-le-dire/equipes");
        return;
      }
      setGame(stored.status === "playing" ? endRound(stored) : stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);
  useEffect(() => {
    if (!game || game.status !== "playing" || game.roundEndsAt === null) return;
    const update = () => {
      const value = Math.max(0, game.roundEndsAt! - Date.now());
      setRemainingMs(value);
      if (value === 0) {
        const next = endRound(game);
        saveCurrentGame(next);
        setGame(next);
        feedback("end");
      }
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [game]);

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }
  function begin() {
    if (!game) return;
    const next = startRound(game);
    setRemainingMs((next.roundEndsAt ?? Date.now()) - Date.now());
    commit(next);
  }
  function act(kind: "found" | "pass" | "fault") {
    if (!game || game.status !== "playing" || locked.current) return;
    locked.current = true;
    try {
      const card = getCurrentCard(game, cards);
      let next = game;
      if (kind === "found") {
        next = foundCard(game, card.id);
      } else if (kind === "pass") {
        next = passCard(game, card.id);
      } else if (kind === "fault") {
        if (game.playMode === "fun") {
          next = recordForbiddenViolation(game, card.id);
        } else {
          next = faultCard(game, card.id);
        }
      }
      commit(next);
      feedback(kind);
    } catch {
      if (game.roundEndsAt !== null && Date.now() >= game.roundEndsAt) commit(endRound(game));
    } finally {
      window.setTimeout(() => {
        locked.current = false;
      }, 140);
    }
  }
  function nextStep() {
    if (game) commit(continueGame(game));
  }
  function replay() {
    if (game) commit(replayGame(game, cards));
  }
  function goHome() {
    clearCurrentGame();
  }

  if (!ready || !game)
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <LogoMark />
        <p>Préparation des cartes…</p>
      </main>
    );
  if (game.status === "finished")
    return <FinishedGame game={game} onReplay={replay} onHome={goHome} />;
  if (game.status === "preparation") return <Preparation game={game} onReady={begin} />;
  if (game.status === "roundResult") return <RoundResult game={game} onContinue={nextStep} />;

  const card = getCurrentCard(game, cards);
  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <main className="play-shell safe-shell">
      <header className="play-header">
        <div>
          <strong>{game.teams[game.activeTeamIndex]?.name}</strong>
          <span>
            {game.roundMode === "standard"
              ? `Manche ${game.roundIndex + 1} / ${STANDARD_ROUNDS}`
              : `Départage ${game.tiebreakCycle}`}
          </span>
        </div>
        <p className="live-score" aria-live="polite">
          <span>Score</span>
          <strong>{game.roundScore > 0 ? `+${game.roundScore}` : game.roundScore}</strong>
        </p>
        <time className={seconds <= 10 ? "timer timer--urgent" : "timer"} aria-live="off">
          00:{String(seconds).padStart(2, "0")}
        </time>
      </header>
      <section className="word-card" key={card.id} aria-live="polite">
        <h1>{card.word}</h1>
        <p>Mots interdits</p>
        <ul>
          {card.forbidden.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </section>
      <section className="play-actions" aria-label="Actions de la carte">
        <button className="action-found" type="button" onClick={() => act("found")}>
          Trouvé <span>+1</span>
        </button>
        <div>
          <button
            className="action-pass"
            type="button"
            disabled={game.passesRemaining === 0}
            onClick={() => act("pass")}
          >
            Passer · {game.passesRemaining}
          </button>
          <button className="action-fault" type="button" onClick={() => act("fault")}>
            {game.playMode === "fun" ? "Mot interdit · +1 gorgée" : "Mot interdit · −1"}
          </button>
        </div>
      </section>
    </main>
  );
}

function Preparation({ game, onReady }: { game: GameState; onReady: () => void }) {
  const card = getCurrentCard(game, cards);
  const duration = game.roundMode === "standard" ? 45 : 30;

  return (
    <main className="play-shell safe-shell">
      <header className="play-header">
        <div>
          <strong>{game.teams[game.activeTeamIndex]?.name}</strong>
          <span>
            {game.roundMode === "standard"
              ? `Manche ${game.roundIndex + 1} / ${STANDARD_ROUNDS}`
              : `Départage ${game.tiebreakCycle}`}
          </span>
        </div>
        <p className="live-score">
          <span>Score</span>
          <strong>0</strong>
        </p>
        <time className="timer" aria-label={`Chronomètre prêt à démarrer, ${duration} secondes`}>
          00:{String(duration).padStart(2, "0")}
        </time>
      </header>
      <section className="word-card" aria-label="Premier mot">
        <h1>{card.word}</h1>
        <p>Mots interdits</p>
        <ul>
          {card.forbidden.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </section>
      <section className="ready-action">
        <Button onClick={onReady}>
          Je suis prêt <span aria-hidden="true">→</span>
        </Button>
        <p>Le chrono démarre au toucher.</p>
      </section>
    </main>
  );
}

function RoundResult({ game, onContinue }: { game: GameState; onContinue: () => void }) {
  const lastStandard = game.roundMode === "standard" && game.roundIndex === STANDARD_ROUNDS - 1;
  const allScores = game.teams.map((t) => t.score);
  const maxScore = Math.max(...allScores);
  const tiedTeams = allScores.filter((s) => s === maxScore).length > 1;
  const activeTeam = game.teams[game.activeTeamIndex];
  const opponentTeam = game.teams.find((_, i) => i !== game.activeTeamIndex);

  return (
    <main className="result-shell safe-shell">
      <Brand compact />
      <section className="round-result">
        <p className="eyebrow">Fin du tour !</p>
        {game.playMode === "fun" ? (
          <>
            <div className="fun-mode-result">
              <div className="consequence consequence--drinks">
                <p className="consequence-label">Gorgées à donner</p>
                <p className="consequence-text">
                  {game.teams.length === 2 ? (
                    <>
                      <span className="team-name" style={{ color: activeTeam?.color }}>
                        {activeTeam?.name}
                      </span>{" "}
                      donne <strong>{game.roundScore}</strong>{" "}
                      {game.roundScore === 1 ? "gorgée" : "gorgées"} à
                      <br />
                      <span className="team-name" style={{ color: opponentTeam?.color }}>
                        {opponentTeam?.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="team-name" style={{ color: activeTeam?.color }}>
                        {activeTeam?.name}
                      </span>{" "}
                      distribue <strong>{game.roundScore}</strong>{" "}
                      {game.roundScore === 1 ? "gorgée" : "gorgées"} à qui ils veulent
                    </>
                  )}
                </p>
              </div>
              {game.forbiddenViolations > 0 && (
                <div className="consequence consequence--penalty">
                  <p className="consequence-label">Mots interdits</p>
                  <p className="consequence-text">
                    <span className="team-name" style={{ color: activeTeam?.color }}>
                      {activeTeam?.name}
                    </span>{" "}
                    a déclenché <strong>{game.forbiddenViolations}</strong>{" "}
                    {game.forbiddenViolations === 1 ? "mot interdit" : "mots interdits"} et doit
                    boire <strong>{game.forbiddenViolations}</strong>{" "}
                    {game.forbiddenViolations === 1 ? "gorgée" : "gorgées"}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h1>{activeTeam?.name}</h1>
            <p className="round-found">
              <strong>{game.roundScore > 0 ? `+${game.roundScore}` : game.roundScore}</strong>score du
              tour
            </p>
            <Scoreboard game={game} />
          </>
        )}
        <Button onClick={onContinue}>
          {game.roundMode === "tiebreak"
            ? game.activeTeamIndex === game.teams.length - 1
              ? tiedTeams
                ? "Nouveau départage"
                : "Voir le résultat"
              : "Équipe suivante"
            : lastStandard
              ? tiedTeams
                ? "Lancer le départage"
                : "Voir le résultat"
              : "Équipe suivante"}
          <span aria-hidden="true">→</span>
        </Button>
      </section>
    </main>
  );
}

function Scoreboard({ game }: { game: GameState }) {
  return (
    <section className="scoreboard" aria-label="Score général">
      {game.teams.map((team, index) => (
        <div className={`score-team score-team--${index + 1}`} key={team.id}>
          <span className="score-name">{team.name}</span>
          <strong className="score-value">{team.score}</strong>
          {game.roundMode === "tiebreak" ? <small>+{game.tiebreakScores[index]}</small> : null}
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
        <p className="eyebrow">Victoire !</p>
        <div className="trophy" aria-hidden="true">
          ★
        </div>
        <h1>
          {winner?.name}
          <br />
          <span>gagne !</span>
        </h1>
        <p className="final-label">Score final</p>
        <p className="final-score">
          {game.teams.map((t) => t.score).join(" — ")}
        </p>
        {game.roundMode === "tiebreak" ? (
          <p className="tiebreak-final">
            Départage : {game.tiebreakScores.join(" — ")}
          </p>
        ) : null}
        <div className="result-actions">
          <Button onClick={onReplay}>
            Rejouer <span aria-hidden="true">↻</span>
          </Button>
          <ButtonLink href="/sans-le-dire" variant="secondary" onClick={onHome}>
            Accueil
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

function feedback(kind: "found" | "pass" | "fault" | "violation" | "end") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator)
    navigator.vibrate(kind === "end" ? [80, 50, 120] : kind === "found" ? 35 : 20);
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = kind === "found" ? 660 : kind === "end" ? 220 : 330;
    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {
    /* Le jeu reste entièrement utilisable sans audio. */
  }
}
