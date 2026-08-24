"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { Button } from "@/games/shared/components/ui";
import { Brand } from "@/games/fuck/components/brand";
import { CARD_VALUES } from "@/games/fuck/data/deck";
import {
  cardValueLabel,
  chooseNewMaster,
  getMaster,
  getTarget,
  resolveRound,
  startRound,
} from "@/games/fuck/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/fuck/lib/game/persistence";
import type { Card, GameState } from "@/games/fuck/lib/game/types";

function PlayingCard({ card, compact = false }: { card: Card; compact?: boolean }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`fuck-card${compact ? " fuck-card--compact" : ""}`} data-red={isRed} aria-label={`${cardValueLabel(card.value)} de ${card.suit}`}>
      <span className="fuck-card-corner">{card.value}<small>{card.suit}</small></span>
      <span className="fuck-card-center" aria-hidden="true">{card.suit}</span>
      <span className="fuck-card-corner fuck-card-corner--bottom" aria-hidden="true">{card.value}<small>{card.suit}</small></span>
    </div>
  );
}

function CardHistory({ cards }: { cards: readonly Card[] }) {
  return (
    <section className="fuck-history" aria-label="Cartes dévoilées">
      <div className="fuck-section-heading">
        <h2>Cartes dévoilées</h2>
        <span>{cards.length} / 52</span>
      </div>
      <div className="fuck-history-grid">
        {CARD_VALUES.map((value) => {
          const matching = cards.filter((card) => card.value === value);
          if (matching.length === 0) return null;
          return (
            <div className="fuck-history-stack" key={value} aria-label={`${cardValueLabel(value)}, ${matching.length} dévoilée${matching.length > 1 ? "s" : ""}`}>
              <div className="fuck-history-cards">
                {matching.map((card, index) => (
                  <div className="fuck-history-card" style={{ zIndex: index + 1 }} key={card.id}>
                    <PlayingCard card={card} compact />
                  </div>
                ))}
              </div>
              <span className="fuck-history-label">{cardValueLabel(value)} · {matching.length}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OutcomeMessage({ game }: { game: GameState }) {
  if (!game.lastOutcome) return null;
  const master = game.players.find((player) => player.id === game.lastOutcome?.masterId)?.name;
  const target = game.players.find((player) => player.id === game.lastOutcome?.targetId)?.name;
  return (
    <p className={`fuck-outcome ${game.lastOutcome.outcome === "master-won" ? "is-win" : "is-fail"}`} role="status">
      {game.lastOutcome.outcome === "master-won"
        ? `${master} remporte la manche face à ${target}.`
        : `${target} a trouvé la carte : le Dealer échoue.`}
    </p>
  );
}

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/fuck/joueurs");
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
    return <main className="game-shell safe-shell fuck-shell fuck-loading" aria-busy="true"><Brand compact /><p>Préparation du paquet…</p></main>;
  }

  if (game.phase === "end") {
    return (
      <main className="game-shell safe-shell fuck-shell">
        <header className="game-header"><Brand compact /></header>
        <section className="fuck-end-card">
          <p className="eyebrow">Le paquet est vide</p>
          <h1>Fin de partie</h1>
          <p>Les 52 cartes ont été dévoilées. À vous de refaire le tour des meilleurs moments.</p>
          <Button onClick={() => router.push("/fuck")}>Retour à l’accueil</Button>
          <CardHistory cards={game.revealedCards} />
        </section>
      </main>
    );
  }

  const master = getMaster(game);
  const target = getTarget(game);

  return (
    <main className="game-shell safe-shell fuck-shell">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/fuck" />
      </header>

      <section className="fuck-status-bar" aria-label="État de la partie">
        <span>Manche {game.roundsPlayed}</span>
        <span>{game.remainingDeck.length} cartes restantes</span>
        <span>Série du Dealer : {game.masterStreak} / 3</span>
      </section>

      {game.phase === "handoff" ? (
        <section className="fuck-panel fuck-handoff-panel">
          <p className="eyebrow">Trois victoires d’affilée</p>
          <h1>{master.name} choisit le prochain Dealer.</h1>
          <p>Le Dealer actuel désigne la personne qui prendra sa place.</p>
          <div className="fuck-player-choices">
            {game.players.filter((player) => player.id !== master.id).map((player) => (
              <button type="button" className="fuck-player-choice" key={player.id} onClick={() => commit(chooseNewMaster(game, player.id))}>
                <span>{player.name}</span><span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      ) : game.phase === "ready" ? (
        <section className="fuck-panel">
            <p className="eyebrow">Dealer : {master.name}</p>
          <h1>À {target.name} de deviner.</h1>
          <p className="fuck-instruction">
            Passez le téléphone au Dealer. Lui seul regarde la carte, puis donne les indices à voix haute.
          </p>
          <OutcomeMessage game={game} />
          <Button onClick={() => commit(startRound(game))}>
            Voir la carte <span aria-hidden="true">♠</span>
          </Button>
        </section>
      ) : (
        <section className="fuck-panel fuck-judging-panel">
          <p className="eyebrow">Carte réservée au Dealer</p>
          <h1>{target.name} propose deux fois.</h1>
          {game.currentCard ? <PlayingCard card={game.currentCard} /> : null}
          <p className="fuck-instruction">
            Le Dealer annonce « plus » ou « moins » après la première proposition. L’écart entre la deuxième proposition et la carte donne les gorgées.
          </p>
          <div className="fuck-outcome-actions">
            <button type="button" className="fuck-result-button fuck-result-button--win" onClick={() => commit(resolveRound(game, "master-won"))}>
              Le Dealer a gagné
            </button>
            <button type="button" className="fuck-result-button fuck-result-button--fail" onClick={() => commit(resolveRound(game, "master-failed"))}>
              Le Dealer a échoué
            </button>
          </div>
        </section>
      )}

      <CardHistory cards={game.revealedCards} />
    </main>
  );
}
