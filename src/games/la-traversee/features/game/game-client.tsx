"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { Button } from "@/games/shared/components/ui";
import { Brand } from "@/games/la-traversee/components/brand";
import { advanceAfterFeedback, cardValueLabel, getCardAtPosition, getSelectablePositions, selectCard, resolveGuess } from "@/games/la-traversee/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/la-traversee/lib/game/persistence";
import type { Card, GameState, Guess, Lane, Position } from "@/games/la-traversee/lib/game/types";

const LANES: readonly Lane[] = ["top", "middle", "bottom"];
const LANE_LABEL: Record<Lane, string> = { top: "Haut", middle: "Milieu", bottom: "Bas" };
const FEEDBACK_DURATION_MS = 2_500;

function samePosition(left: Position | null, right: Position): boolean {
  if (!left || left.zone !== right.zone) return false;
  return left.zone !== "lane" || (right.zone === "lane" && left.lane === right.lane && left.index === right.index);
}

function PlayingCard({ card, hidden = false, active = false, onClick }: { card: Card; hidden?: boolean; active?: boolean; onClick?: () => void }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  const className = ["traversee-card", hidden ? "is-hidden" : "", active ? "is-active" : ""].filter(Boolean).join(" ");
  const content = hidden
    ? <span className="traversee-card-back" aria-hidden="true">↗</span>
    : <><span className="traversee-card-corner">{card.value}<small>{card.suit}</small></span><span className="traversee-card-center" aria-hidden="true">{card.suit}</span><span className="traversee-card-corner traversee-card-corner--bottom" aria-hidden="true">{card.value}<small>{card.suit}</small></span></>;
  return <button type="button" className={className} data-red={isRed} onClick={onClick} disabled={!onClick} aria-label={hidden ? "Carte cachée" : `${cardValueLabel(card.value)} de ${card.suit}`}>{content}</button>;
}

function isMiddleVisible(game: GameState, lane: Lane, index: number): boolean { return lane !== "middle" || game.revealedMiddle[index] === true; }

function DrawPile({ game }: { game: GameState }) {
  const position = game.lastGuess?.position;
  const dealX = !position || position.zone === "lane" ? "0rem" : position.zone === "start" ? "-8rem" : "8rem";
  const dealY = !position || position.zone === "lane" ? position?.zone === "lane" && position.index > 1 ? "4rem" : "-4rem" : "0rem";
  const dealClass = game.phase === "feedback" ? "is-dealing" : "";
  return <div className="traversee-draw-pile" aria-label={`${game.remainingDeck.length} cartes dans la pioche`}><div className="traversee-draw-stack" aria-hidden="true"><span className="traversee-draw-card traversee-draw-card--back traversee-draw-card--back-one" /><span className="traversee-draw-card traversee-draw-card--back traversee-draw-card--back-two" /><span className={`traversee-draw-card traversee-draw-card--top ${dealClass}`} style={{ "--deal-x": dealX, "--deal-y": dealY } as CSSProperties}><span>↗</span></span></div><div className="traversee-draw-label"><span>Pioche</span><strong>{game.remainingDeck.length}</strong></div></div>;
}

function LaneCards({ game, lane, selectable, onSelect }: { game: GameState; lane: Lane; selectable: Position[]; onSelect: (position: Position) => void }) {
  const muted = game.selectedLane !== null && game.selectedLane !== lane;
  return <div className={`traversee-lane traversee-lane--${lane} ${muted ? "is-muted" : ""}`} aria-label={`Ligne ${LANE_LABEL[lane]}`}>
    {game.board.lanes[lane].map((card, index) => {
      const position: Position = { zone: "lane", lane, index };
      const canSelect = selectable.some((candidate) => samePosition(candidate, position));
      const active = game.phase === "guessing" && samePosition(game.currentPosition, position);
      return <PlayingCard key={`${card.id}-${index}`} card={card} hidden={!isMiddleVisible(game, lane, index)} active={active} onClick={canSelect ? () => onSelect(position) : undefined} />;
    })}
  </div>;
}

function BoardView({ game, onSelect }: { game: GameState; onSelect: (position: Position) => void }) {
  const selectable = getSelectablePositions(game);
  const canSelect = (position: Position) => selectable.some((candidate) => samePosition(candidate, position));
  return <section className="traversee-board" aria-label="Plateau de La Traversée">
    <div className="traversee-endpoint"><PlayingCard card={game.board.start} active={game.phase === "guessing" && samePosition(game.currentPosition, { zone: "start" })} onClick={canSelect({ zone: "start" }) ? () => onSelect({ zone: "start" }) : undefined} /></div>
    {LANES.map((lane) => <LaneCards key={lane} game={game} lane={lane} selectable={selectable} onSelect={onSelect} />)}
    <div className="traversee-endpoint"><PlayingCard card={game.board.end} active={game.phase === "guessing" && samePosition(game.currentPosition, { zone: "end" })} onClick={canSelect({ zone: "end" }) ? () => onSelect({ zone: "end" }) : undefined} /></div>
  </section>;
}

function Feedback({ game }: { game: GameState }) {
  const last = game.lastGuess;
  if (!last) return null;
  return <section className={`traversee-feedback ${last.outcome === "success" ? "is-success" : "is-failure"}`} aria-live="polite"><div className="traversee-feedback-cards"><PlayingCard card={last.referenceCard} /><span aria-hidden="true">{last.guess === "higher" ? "↑" : "↓"}</span><PlayingCard card={last.drawnCard} /></div><p className="eyebrow">{last.outcome === "success" ? "Bonne estimation" : "Mauvaise estimation"}</p><h1>{last.outcome === "success" ? "Tu avances." : `${last.sips} ${last.sips === 1 ? "gorgée" : "gorgées"}.`}</h1><p>{last.outcome === "success" ? "La carte piochée remplace la carte estimée." : "La carte piochée remplace quand même la carte estimée."}</p></section>;
}

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) { router.replace("/la-traversee/joueurs"); return; }
      setGame(stored); setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!game || game.phase !== "feedback") return;
    busy.current = true;
    const timer = window.setTimeout(() => { const next = advanceAfterFeedback(game); saveCurrentGame(next); setGame(next); busy.current = false; }, FEEDBACK_DURATION_MS);
    return () => { window.clearTimeout(timer); busy.current = false; };
  }, [game]);

  function commit(next: GameState) { saveCurrentGame(next); setGame(next); }
  function select(position: Position) { if (!game || busy.current) return; commit(selectCard(game, position)); }
  function guess(guessType: Guess) { if (!game || game.phase !== "guessing" || busy.current) return; busy.current = true; commit(resolveGuess(game, guessType)); }

  if (!ready || !game) return <main className="game-shell safe-shell traversee-shell traversee-loading" aria-busy="true"><Brand compact /><p>Préparation du plateau…</p></main>;
  if (game.phase === "end") return <main className="game-shell safe-shell traversee-shell"><header className="game-header"><Brand compact /><QuitGameButton homeHref="/la-traversee" /></header><section className="traversee-end"><p className="eyebrow">Le paquet est traversé</p><h1>Fin de partie</h1><p>Il n’y a plus assez de cartes pour continuer. Recommencez quand vous voulez.</p><Button onClick={() => router.push("/la-traversee/joueurs")}>Nouvelle partie</Button></section></main>;

  const currentCard = game.currentPosition ? getCardAtPosition(game.board, game.currentPosition) : null;
  const initial = game.currentPosition === null;
  const guessing = game.phase === "guessing";
  return <main className="game-shell safe-shell traversee-shell">
    <header className="game-header"><Brand compact /><QuitGameButton homeHref="/la-traversee" /></header>
    <section className={`traversee-stage ${game.phase === "feedback" ? "is-feedback" : ""}`}>
      {game.phase === "feedback" ? <><Feedback game={game} /><div className="traversee-board-wrap"><BoardView game={game} onSelect={() => undefined} /><DrawPile game={game} /></div></> : <><div className={`traversee-copy ${!initial ? "is-continuation" : ""}`}><p className="eyebrow">{guessing ? "Carte sélectionnée" : initial ? "À toi de choisir" : "À toi de continuer"}</p><h1>{guessing ? "Plus ou moins ?" : initial ? "Choisis ton départ." : "Choisis ta prochaine carte."}</h1>{guessing ? <p>{`La carte piochée sera-t-elle plus haute ou plus basse que le ${cardValueLabel(currentCard?.value ?? "2").toLowerCase()} ?`}</p> : null}</div><div className="traversee-board-wrap"><BoardView game={game} onSelect={select} /><DrawPile game={game} /></div><div className="traversee-actions">{guessing ? <><Button className="traversee-guess traversee-guess--lower" onClick={() => guess("lower")}>Moins <span aria-hidden="true">↓</span></Button><Button className="traversee-guess traversee-guess--higher" onClick={() => guess("higher")}>Plus <span aria-hidden="true">↑</span></Button></> : null}</div></>}
    </section>
  </main>;
}
