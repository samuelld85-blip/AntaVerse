import type { Card } from "@/games/palmier/lib/game/types";

const RED_SUITS = new Set(["♥", "♦"]);

export function PlayingCard({
  card,
  faceUp = true,
  className = "",
}: {
  card: Card;
  faceUp?: boolean;
  className?: string;
}) {
  const isRed = RED_SUITS.has(card.suit);

  if (!faceUp) {
    return (
      <div className={`playing-card playing-card--back ${className}`}>
        <div className="card-back-inner">🌴</div>
      </div>
    );
  }

  return (
    <div
      className={`playing-card playing-card--face ${className}`}
      data-red={isRed ? "true" : "false"}
    >
      <div className="card-corner card-corner--tl">
        <span className="card-value">{card.value}</span>
        <span className="card-suit-small">{card.suit}</span>
      </div>
      <div className="card-center">
        <span className="card-suit-large">{card.suit}</span>
      </div>
      <div className="card-corner card-corner--br" aria-hidden="true">
        <span className="card-value">{card.value}</span>
        <span className="card-suit-small">{card.suit}</span>
      </div>
    </div>
  );
}
