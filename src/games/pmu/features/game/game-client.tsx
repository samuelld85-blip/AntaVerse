"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { Button } from "@/games/shared/components/ui";
import { Brand } from "@/games/pmu/components/brand";
import { BET_UNITS, CHECKPOINT_COUNT, FINISH_POSITION, HORSE_LABELS, SUIT_ORDER, cardValueLabel, getCurrentPlayer, getSettlement, submitBet, drawCard } from "@/games/pmu/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/pmu/lib/game/persistence";
import type { Bet, Card, GameState, Player, Suit } from "@/games/pmu/lib/game/types";

function suitName(suit: Suit): string {
  return HORSE_LABELS[suit];
}

function CardView({ card, label }: { card: Card; label?: string }) {
  const red = card.suit === "♥" || card.suit === "♦";
  return <div className="pmu-card-wrap"><div className="pmu-card" data-red={red}><span className="pmu-card-corner">{card.value}<small>{card.suit}</small></span><span className="pmu-card-center" aria-hidden="true">{card.suit}</span><span className="pmu-card-corner pmu-card-corner--bottom" aria-hidden="true">{card.value}<small>{card.suit}</small></span></div>{label ? <span className="pmu-card-label">{label}</span> : null}</div>;
}

function BetForm({ player, onSubmit }: { player: Player; onSubmit: (bet: Bet) => void }) {
  const [amount, setAmount] = useState<number | null>(null);
  const [suit, setSuit] = useState<Suit | null>(null);
  const [error, setError] = useState<string | null>(null);

  function chooseAmount(nextAmount: number) {
    setAmount(nextAmount);
    setError(null);
    if (suit) onSubmit({ amount: nextAmount, suit });
  }
  function chooseSuit(nextSuit: Suit) {
    if (!amount) {
      setError("Choisis d’abord le nombre de gorgées.");
      return;
    }
    setSuit(nextSuit);
    setError(null);
    onSubmit({ amount, suit: nextSuit });
  }

  return <section className="pmu-bet-panel" aria-labelledby="bet-title"><p className="eyebrow">À toi de jouer</p><h1 id="bet-title">{player.name}, choisis ta mise.</h1><p className="pmu-panel-copy">Deux choix et la course démarre : une quantité, puis une seule couleur.</p><div className="pmu-choice-section"><span className="pmu-choice-label">1. Combien de gorgées ?</span><div className="pmu-amount-grid">{Array.from({ length: BET_UNITS }, (_, index) => { const nextAmount = index + 1; return <button key={nextAmount} type="button" className={`pmu-choice-button ${amount === nextAmount ? "is-selected" : ""}`} aria-pressed={amount === nextAmount} onClick={() => chooseAmount(nextAmount)}>{nextAmount}</button>; })}</div></div><div className="pmu-choice-section"><span className="pmu-choice-label">2. Choisis ta couleur</span><div className="pmu-suit-grid">{SUIT_ORDER.map((nextSuit) => <button key={nextSuit} type="button" className={`pmu-choice-button pmu-suit-button ${suit === nextSuit ? "is-selected" : ""}`} data-suit={nextSuit} aria-pressed={suit === nextSuit} disabled={!amount} onClick={() => chooseSuit(nextSuit)}><b aria-hidden="true">{nextSuit}</b><span>{suitName(nextSuit)}</span></button>)}</div></div>{error ? <p className="form-error" role="alert">{error}</p> : null}</section>;
}

function CheckpointTrack({ game }: { game: GameState }) {
  return <div className="pmu-checkpoint-row" aria-label="Paliers de révélation de la course"><span className="pmu-track-side">DÉPART</span><div className="pmu-checkpoint-track">{Array.from({ length: CHECKPOINT_COUNT }, (_, index) => { const revealed = game.revealedCheckpoints[index]; const card = game.checkpointCards[index]; return <div key={index} className={`pmu-checkpoint ${revealed ? "is-revealed" : ""}`} aria-label={revealed && card ? `Palier ${index + 1}, ${cardValueLabel(card.value)} de ${suitName(card.suit)}` : `Palier ${index + 1}, caché`}>{revealed && card ? <><strong>{card.suit}</strong><small>{index + 1}</small></> : <small>{index + 1}</small>}</div>; })}</div><span className="pmu-track-side pmu-track-side--finish">ARRIVÉE</span></div>;
}

function RaceTrack({ game }: { game: GameState }) {
  return <section className="pmu-race-board" aria-label="Plateau de course"><CheckpointTrack game={game} />{SUIT_ORDER.map((suit) => { const position = Math.min(game.horsePositions[suit], FINISH_POSITION); return <div className="pmu-horse-row" key={suit} data-suit={suit}><div className="pmu-horse-name"><strong aria-hidden="true">{suit}</strong><span>{suitName(suit)}</span></div><div className="pmu-track-line">{Array.from({ length: FINISH_POSITION + 1 }, (_, index) => <span key={index} className={`pmu-track-cell ${index === position ? "is-current" : ""} ${index === FINISH_POSITION ? "is-finish" : ""}`}>{index === position ? <span className="pmu-horse-token" aria-hidden="true">{suit}</span> : null}</span>)}</div></div>; })}</section>;
}

function LastDrawMessage({ game }: { game: GameState }) {
  const draw = game.lastDraw;
  if (!draw) return <p className="pmu-empty-event">La piste est prête. Le croupier peut tirer la première carte.</p>;
  const reveals = draw.revealedCheckpoints;
  const revealTitle = reveals.length === 0
    ? null
    : reveals.length === 1
      ? `Étape ${reveals[0]!.index + 1} franchie`
      : `Étapes ${reveals[0]!.index + 1}–${reveals[reveals.length - 1]!.index + 1} franchies`;
  return <div className="pmu-event-stack" role="status" aria-live="polite">
    <div className="pmu-event pmu-event--draw"><CardView card={draw.card} label={`Le ${suitName(draw.movedSuit)} avance`} /><div><p className="eyebrow">Dernier tirage</p><h2>{suitName(draw.movedSuit)} avance d&apos;une case.</h2><p>La couleur de la carte fait foi, sa valeur ne compte pas.</p></div></div>
    {reveals.length > 0 ? <div className="pmu-event pmu-event--setback"><div className="pmu-reveal-cards">{reveals.map((reveal) => <CardView key={reveal.index} card={reveal.card} label={`Étape ${reveal.index + 1}`} />)}</div><div><p className="eyebrow">{revealTitle}</p><h2>{reveals.map((reveal) => `${suitName(reveal.penalizedSuit)} recule d’une case`).join(" · ")}.</h2><p>La carte retournée impose le recul de la couleur indiquée.</p></div></div> : null}
  </div>;
}

function SettlementPanel({ game }: { game: GameState }) {
  const settlements = getSettlement(game);
  return <section className="pmu-settlement" aria-labelledby="settlement-title"><p className="eyebrow">Résultat des paris</p><h1 id="settlement-title">{game.winnerSuit ? `${suitName(game.winnerSuit)} gagne !` : "La pioche est épuisée."}</h1>{game.winnerSuit ? <p className="pmu-panel-copy">Les gagnants distribuent deux fois leur mise. Les autres prennent leur mise.</p> : null}<div className="pmu-settlement-list">{settlements.map((settlement) => { const player = game.players.find((item) => item.id === settlement.playerId); return <div className="pmu-settlement-row" key={settlement.playerId}><strong>{player?.name}</strong><span>{settlement.winningUnits > 0 ? `Distribue ${settlement.winningUnits * 2} gorgées` : "Aucun pari gagnant"}</span><span>{settlement.losingUnits > 0 ? `Prend ${settlement.losingUnits} gorgée${settlement.losingUnits > 1 ? "s" : ""}` : "Tout est gagnant"}</span></div>; })}</div><Button onClick={() => window.location.assign("/pmu/joueurs")}>Nouvelle course <span aria-hidden="true">→</span></Button></section>;
}

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) { router.replace("/pmu/joueurs"); return; }
      setGame(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }

  if (!ready || !game) return <main className="game-shell safe-shell pmu-shell pmu-loading" aria-busy="true"><Brand compact /><p>Préparation de la piste…</p></main>;
  if (game.phase === "betting") {
    const player = getCurrentPlayer(game);
    return <main className="game-shell safe-shell pmu-shell"><header className="game-header"><Brand compact /><QuitGameButton homeHref="/pmu" /></header><div className="pmu-status"><span>PARIS · JOUEUR {game.currentPlayerIndex + 1}/{game.players.length}</span><strong>{game.players.filter((item) => game.bets[item.id]).length}/{game.players.length} MISÉS</strong></div><BetForm key={player.id} player={player} onSubmit={(bet) => commit(submitBet(game, player.id, bet))} /></main>;
  }

  if (game.phase === "end") return <main className="game-shell safe-shell pmu-shell"><header className="game-header"><Brand compact /><QuitGameButton homeHref="/pmu" /></header><div className="pmu-status"><span>COURSE TERMINÉE</span><strong>{game.lastDraw ? `${game.lastDraw.card.value}${game.lastDraw.card.suit}` : "PMU"}</strong></div><RaceTrack game={game} /><SettlementPanel game={game} /></main>;

  return <main className="game-shell safe-shell pmu-shell pmu-shell--race"><header className="game-header"><Brand compact /><QuitGameButton homeHref="/pmu" /></header><section className="pmu-race-stage"><div className="pmu-race-copy"><p className="eyebrow">Les paris sont verrouillés</p><h1>Tirez la carte.</h1></div><RaceTrack game={game} /><LastDrawMessage game={game} /><Button className="pmu-draw-button" onClick={() => commit(drawCard(game))}>Tirer la carte <span aria-hidden="true">↗</span></Button></section></main>;
}
