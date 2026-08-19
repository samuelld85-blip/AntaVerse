"use client";

import { Button } from "@/games/shared/components/ui";
import { getRuleForCard, getKingRule } from "@/games/palmier/data/card-rules";
import type { GameState } from "@/games/palmier/lib/game/types";
import { PlayingCard } from "./playing-card";

export function CardReveal({
  game,
  onContinue,
}: {
  game: GameState;
  onContinue: () => void;
}) {
  const card = game.currentCard;
  if (!card) return null;

  const isCollapse = game.phase === "collapse";
  const isKing = card.value === "K";

  let title: string;
  let body: string;
  let culSec = false;

  if (isKing) {
    const kingRule = getKingRule(game.kingsDrawn);
    title = kingRule.title;
    body = kingRule.body;
    culSec = kingRule.culSec;
  } else {
    const rule = getRuleForCard(card);
    title = rule.title;
    body = rule.body;
  }

  return (
    <section
      className={`card-reveal ${isCollapse ? "card-reveal--collapse" : ""}`}
      aria-live="polite"
    >
      <div className="card-reveal-card-wrap">
        <PlayingCard card={card} faceUp className="card-reveal-playing-card" />
      </div>

      <div className={`card-reveal-rule ${culSec ? "card-reveal-rule--cul-sec" : ""}`}>
        <h1 className="card-reveal-rule-title">{title}</h1>
        {body ? <p className="card-reveal-rule-body">{body}</p> : null}
      </div>

      {game.maitrePouce || game.maitreQuestions ? (
        <div className="maitre-bar">
          {game.maitrePouce ? (
            <span className="maitre-chip">👍 Maître du pouce : {game.maitrePouce}</span>
          ) : null}
          {game.maitreQuestions ? (
            <span className="maitre-chip">❓ Maître des questions : {game.maitreQuestions}</span>
          ) : null}
        </div>
      ) : null}

      <Button type="button" onClick={onContinue}>
        {isCollapse ? (
          <>On replante <span aria-hidden="true">🌴</span></>
        ) : (
          <>Continuer <span aria-hidden="true">→</span></>
        )}
      </Button>
    </section>
  );
}
