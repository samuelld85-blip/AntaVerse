"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Brand, LogoMark } from "@/games/pifometre/components/brand";
import { questions } from "@/games/pifometre/data/questions";
import { Button, ButtonLink } from "@/games/shared/components/ui";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import {
  awardPoints,
  getCurrentQuestion,
  getWinner,
  revealAnswer,
  replayGame,
  submitEstimate,
} from "@/games/pifometre/lib/game/engine";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "@/games/pifometre/lib/game/persistence";
import type { AwardKind, GameState, Player } from "@/games/pifometre/lib/game/types";

const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 });

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [estimate, setEstimate] = useState("");
  const [handoff, setHandoff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      const availableIds = new Set(questions.map((question) => question.id));
      const invalidQuestion = stored?.selectedQuestionIds.some((id) => !availableIds.has(id));
      if (!stored || invalidQuestion) {
        if (stored) clearCurrentGame();
        router.replace("/pifometre/joueurs");
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
    setEstimate("");
    setError(null);
  }

  function submit() {
    if (!game) return;
    const parsed = Number(estimate.replace(",", "."));
    if (!estimate.trim() || !Number.isFinite(parsed)) {
      setError("Entre un nombre avant de valider.");
      return;
    }
    try {
      const currentPlayer = game.players[game.currentPlayerIndex];
      if (!currentPlayer) return;
      const next = submitEstimate(game, currentPlayer.id, parsed, questions);
      commit(next);
      if (next.status === "answering") setHandoff(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Estimation impossible.",
      );
    }
  }

  function grant(playerId: string, kind: AwardKind) {
    if (!game) return;
    commit(awardPoints(game, playerId, kind));
    setHandoff(false);
  }

  function revealQuickAnswer() {
    if (!game) return;
    try {
      commit(revealAnswer(game, questions));
    } catch (revealError) {
      setError(
        revealError instanceof Error ? revealError.message : "Impossible d’afficher la réponse.",
      );
    }
  }

  function replay() {
    if (!game) return;
    commit(replayGame(game, questions));
    setHandoff(false);
  }

  function goHome() {
    clearCurrentGame();
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <LogoMark />
        <p>Le pif se calibre…</p>
      </main>
    );
  }

  if (game.status === "finished") {
    return <FinishedGame game={game} onReplay={replay} onHome={goHome} />;
  }

  const question = getCurrentQuestion(game, questions);
  const currentPlayer = game.players[game.currentPlayerIndex];

  return (
    <main className="game-shell safe-shell pifometre-game">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/pifometre" />
      </header>

      <div className="game-status">
        <p className="round-pill">
          Question {game.roundIndex + 1} / {game.selectedQuestionIds.length}
        </p>
        <Scoreboard players={game.players} />
      </div>

      {game.status === "question" ? (
        <section className="question-stage" aria-live="polite">
          <div className="question-card">
            <div className="question-card__meta">
              <span>{question.category}</span>
              <span>Réponse en {question.unit}</span>
            </div>
            <p className="eyebrow">Répondez tous ensemble</p>
            <h1>{question.prompt}</h1>
          </div>
          <Button onClick={revealQuickAnswer}>
            Afficher la réponse <span aria-hidden="true">↗</span>
          </Button>
        </section>
      ) : game.status === "answering" ? (
        handoff ? (
          <section className="handoff-card" aria-live="polite">
            <span className="handoff-icon" aria-hidden="true">
              ↗
            </span>
            <p className="eyebrow">Passe le téléphone</p>
            <h1>À toi, {currentPlayer?.name}.</h1>
            <p>Ne regarde pas les estimations déjà saisies.</p>
            <Button onClick={() => setHandoff(false)}>
              Je suis prêt·e <span aria-hidden="true">→</span>
            </Button>
          </section>
        ) : (
          <section className="question-stage" aria-live="polite">
            <div className="question-card">
              <div className="question-card__meta">
                <span>{question.category}</span>
                <span>Réponse en {question.unit}</span>
              </div>
              <h1>{question.prompt}</h1>
            </div>
            <form
              className="estimate-form"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <label htmlFor="estimate">Estimation de {currentPlayer?.name}</label>
              <div className="estimate-input-wrap">
                <input
                  id="estimate"
                  type="text"
                  inputMode="decimal"
                  value={estimate}
                  onChange={(event) => {
                    setEstimate(event.target.value);
                    setError(null);
                  }}
                  placeholder="Votre nombre"
                  autoFocus
                  aria-describedby={error ? "estimate-error" : undefined}
                />
                <span aria-hidden="true">{question.unit}</span>
              </div>
              {error ? (
                <p id="estimate-error" className="form-error" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit">
                Valider l’estimation <span aria-hidden="true">→</span>
              </Button>
            </form>
          </section>
        )
      ) : (
        <RevealCard game={game} question={question} onAward={grant} />
      )}
    </main>
  );
}

function Scoreboard({ players }: { players: Player[] }) {
  return (
    <section className="pifometre-scoreboard" aria-label="Scores">
      {players.map((player) => (
        <div className="pifometre-score" key={player.id}>
          <span>{player.name}</span>
          <strong>{player.score}</strong>
        </div>
      ))}
    </section>
  );
}

function RevealCard({
  game,
  question,
  onAward,
}: {
  game: GameState;
  question: ReturnType<typeof getCurrentQuestion>;
  onAward: (playerId: string, kind: AwardKind) => void;
}) {
  const [awardKind, setAwardKind] = useState<AwardKind>("closest");

  function handleAwardKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    setAwardKind((current) => (current === "closest" ? "exact" : "closest"));
  }

  if (!game.reveal) return null;
  const guesses = game.reveal.guesses ?? [];
  return (
    <section className="reveal-stage" aria-live="assertive">
      <div className="answer-card">
        <p className="eyebrow">La réponse exacte</p>
        <p className="answer-value">
          {formatNumber(game.reveal.answer)} <span>{question.unit}</span>
        </p>
        <a href={game.reveal.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
          Vérifiée par {game.reveal.sourceLabel} ↗
        </a>
        {game.reveal.note ? <p className="answer-note">{game.reveal.note}</p> : null}
      </div>
      <div className="award-panel">
        <div className="award-panel__heading">
          <p className="eyebrow">À vous de trancher</p>
          <p>
            {game.playMode === "quick"
              ? "Cliquez le joueur désigné à l’oral."
              : "Les estimations restent visibles pour comparer."}
          </p>
        </div>
        <div
          className="pifometre-award-switch"
          role="radiogroup"
          aria-label="Type de point à attribuer"
        >
          <button
            type="button"
            role="radio"
            tabIndex={awardKind === "closest" ? 0 : -1}
            aria-checked={awardKind === "closest"}
            className={awardKind === "closest" ? "is-selected" : ""}
            onClick={() => setAwardKind("closest")}
            onKeyDown={handleAwardKeyDown}
          >
            Plus proche · +1
          </button>
          <button
            type="button"
            role="radio"
            tabIndex={awardKind === "exact" ? 0 : -1}
            aria-checked={awardKind === "exact"}
            className={awardKind === "exact" ? "is-selected" : ""}
            onClick={() => setAwardKind("exact")}
            onKeyDown={handleAwardKeyDown}
          >
            Réponse exacte · +2
          </button>
        </div>
        <div className="guess-list">
          {game.players.map((player) => {
            const guess = guesses.find((candidate) => candidate.playerId === player.id);
            return (
              <div className="guess-row" key={player.id}>
                <div>
                  <strong>{player.name}</strong>
                  {guess ? (
                    <span>
                      {formatNumber(guess.value)} {question.unit} · écart{" "}
                      {formatNumber(guess.distance)}
                    </span>
                  ) : (
                    <span>Réponse annoncée à l’oral</span>
                  )}
                </div>
                <div className="guess-actions">
                  <button
                    type="button"
                    className="award-player-button"
                    onClick={() => onAward(player.id, awardKind)}
                    aria-label={`Attribuer ${awardKind === "exact" ? 2 : 1} point${awardKind === "exact" ? "s" : ""} à ${player.name}`}
                  >
                    {awardKind === "exact" ? "+2" : "+1"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
  const winners = getWinner(game);
  return (
    <main className="result-shell safe-shell pifometre-result">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <Brand compact />
      <section className="result-card" aria-live="polite">
        <div className="trophy" aria-hidden="true">
          ✦
        </div>
        <p className="eyebrow">Fin de la partie</p>
        <h1>
          {winners.length > 1 ? (
            "Égalité !"
          ) : (
            <>
              {winners[0]?.name}
              <br />
              <span>gagne la partie !</span>
            </>
          )}
        </h1>
        <p className="final-label">Scores finaux</p>
        <Scoreboard players={[...game.players].sort((a, b) => b.score - a.score)} />
        <div className="result-actions">
          <Button onClick={onReplay}>
            Rejouer <span aria-hidden="true">↻</span>
          </Button>
          <ButtonLink href="/pifometre" variant="secondary" onClick={onHome}>
            Accueil
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
