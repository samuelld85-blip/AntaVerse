"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button, ButtonLink } from "@/games/shared/components/ui";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { questions } from "@/games/qui-de-nous-deux/data/questions";
import { Brand, LogoMark } from "@/games/qui-de-nous-deux/components/brand";
import { clearCurrentGame, loadCurrentGame, saveCurrentGame } from "@/games/qui-de-nous-deux/lib/game/persistence";
import { getCurrentQuestion, getWinner, nextRound, revealRound, tick } from "@/games/qui-de-nous-deux/lib/game/engine";
import type { GameState, RoundOutcome } from "@/games/qui-de-nous-deux/lib/game/types";

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadCurrentGame();
    const hasUnknownQuestion = stored?.questionIds.some((id) => !questions.some((question) => question.id === id));
    if (!stored || hasUnknownQuestion) {
      clearCurrentGame();
      router.replace("/qui-de-nous-deux/joueurs" as Route);
      return;
    }
    setGame(stored);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!game || game.phase !== "question") return;
    const interval = window.setInterval(() => {
      setGame((current) => {
        if (!current || current.phase !== "question" || current.secondsLeft <= 0) return current;
        const next = tick(current);
        saveCurrentGame(next);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [game?.phase]);

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }

  function resolve(outcome: RoundOutcome) {
    if (game) commit(revealRound(game, outcome));
  }

  function continueGame() {
    if (game) commit(nextRound(game));
  }

  function goHome() {
    clearCurrentGame();
    router.push("/qui-de-nous-deux" as Route);
  }

  if (!ready || !game) return <main className="game-shell safe-shell game-loading"><LogoMark /><p>Les questions se mélangent…</p></main>;
  if (game.phase === "finished") return <FinishedGame game={game} onReplay={() => router.push("/qui-de-nous-deux/joueurs" as Route)} onHome={goHome} />;

  const question = getCurrentQuestion(game, questions);
  const timedOut = game.secondsLeft === 0;

  return (
    <main className="game-shell safe-shell qndd-game">
      <header className="game-header"><Brand compact /><QuitGameButton homeHref={"/qui-de-nous-deux" as Route} /></header>
      <div className="game-status">
        <div className="qndd-round-line"><p className="round-pill">Question {game.roundIndex + 1} / {game.questionIds.length}</p><span className={timedOut ? "qndd-timer qndd-timer--done" : "qndd-timer"} aria-label={`${game.secondsLeft} secondes restantes`}><span aria-hidden="true">◷</span> {game.secondsLeft}s</span></div>
        <Scoreboard game={game} />
      </div>
      {game.phase === "question" ? <QuestionStage question={question.prompt} category={question.category} timedOut={timedOut} onResolve={resolve} /> : <RevealStage game={game} onContinue={continueGame} />}
    </main>
  );
}

function Scoreboard({ game }: { game: GameState }) {
  return <section className="qndd-scoreboard" aria-label="Scores"><div className="qndd-score qndd-score--duo"><span>{game.duo.name}</span><strong>{game.duo.score}</strong><small>DOS À DOS</small></div><div className="qndd-score qndd-score--questioners"><span>{game.questionTeam.name}</span><strong>{game.questionTeam.score}</strong><small>POSEURS</small></div></section>;
}

function QuestionStage({ question, category, timedOut, onResolve }: { question: string; category: string; timedOut: boolean; onResolve: (outcome: RoundOutcome) => void }) {
  return <section className="qndd-stage" aria-live="polite"><div className="qndd-question-card"><span className="qndd-category">{category}</span><p className="eyebrow">Lisez à voix haute</p><h1>{question}</h1><div className="qndd-duo-hint"><span aria-hidden="true">↔</span><span>Dos à dos · pointez en même temps</span></div></div><div className="qndd-resolution"><div className="qndd-resolution-heading"><p className="eyebrow">Après les gestes</p><p>{timedOut ? "Le temps est écoulé : faites pointer le duo maintenant, puis tranchez." : "Les deux réponses sont-elles identiques ?"}</p></div><div className="qndd-resolution-buttons"><Button onClick={() => onResolve("same")} className="qndd-same-button"><span aria-hidden="true">✓</span> Même personne</Button><Button onClick={() => onResolve("different")} variant="secondary" className="qndd-different-button"><span aria-hidden="true">≠</span> Réponses différentes</Button></div></div></section>;
}

function RevealStage({ game, onContinue }: { game: GameState; onContinue: () => void }) {
  if (!game.lastResult) return null;
  const duoWon = game.lastResult.pointsTo === "duo";
  return <section className="qndd-stage qndd-reveal-stage" aria-live="assertive"><div className={duoWon ? "qndd-result-card qndd-result-card--duo" : "qndd-result-card qndd-result-card--questioners"}><span className="qndd-result-symbol" aria-hidden="true">{duoWon ? "✓" : "≠"}</span><p className="eyebrow">Résultat de la manche</p><h1>{duoWon ? "Même réponse !" : "Pas la même personne"}</h1><strong>+1 pour {duoWon ? "le duo" : "les poseurs"}</strong><p>{duoWon ? "Ils se connaissent décidément très bien." : "La question a semé le doute : point pour les arbitres."}</p></div><div className="qndd-reveal-score"><Scoreboard game={game} /><Button onClick={onContinue}>{game.roundIndex === game.questionIds.length - 1 ? "Voir le résultat" : "Question suivante"} <span aria-hidden="true">→</span></Button></div></section>;
}

function FinishedGame({ game, onReplay, onHome }: { game: GameState; onReplay: () => void; onHome: () => void }) {
  const winner = getWinner(game);
  const title = winner === "tie" ? "Égalité parfaite" : winner === "duo" ? `${game.duo.name} gagne` : `${game.questionTeam.name} gagne`;
  return <main className="result-shell safe-shell qndd-result"><div className="qndd-result-mark" aria-hidden="true">✦</div><Brand compact /><section className="qndd-final-card" aria-live="polite"><p className="eyebrow">Fin de la partie</p><h1>{title}</h1><p className="qndd-final-copy">{winner === "tie" ? "Personne ne peut fanfaronner. Il faut une revanche." : winner === "duo" ? "Le duo a trouvé le même coupable assez souvent." : "Les poseurs ont réussi à semer le doute."}</p><div className="qndd-final-scores"><div><span>{game.duo.name}</span><strong>{game.duo.score}</strong></div><div><span>{game.questionTeam.name}</span><strong>{game.questionTeam.score}</strong></div></div><div className="result-actions"><Button onClick={onReplay}>Rejouer <span aria-hidden="true">↻</span></Button><ButtonLink href={"/qui-de-nous-deux" as Route} variant="secondary" onClick={onHome}>Accueil</ButtonLink></div></section></main>;
}
