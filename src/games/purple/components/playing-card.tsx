import type { Card, Suit } from "@/games/purple/lib/game/types";

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export function PlayingCard({
  card,
  index = 0,
  size = "large",
}: {
  card: Card;
  index?: number;
  size?: "large" | "small";
}) {
  const symbol = SUIT_SYMBOLS[card.suit];
  return (
    <div
      className={`playing-card playing-card--${size} playing-card--${card.color}`}
      style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
    >
      <div className="playing-card-inner">
        <div className="playing-card-back" aria-hidden="true">
          <span />
        </div>
        <div className="playing-card-face">
          <span className="playing-card-corner playing-card-corner--top">
            {card.rank}
            <br />
            {symbol}
          </span>
          <span className="playing-card-symbol" aria-hidden="true">
            {symbol}
          </span>
          <span className="playing-card-corner playing-card-corner--bottom">
            {card.rank}
            <br />
            {symbol}
          </span>
        </div>
      </div>
      <span className="sr-only">
        {card.rank} {suitLabel(card.suit)}
      </span>
    </div>
  );
}

function suitLabel(suit: Suit): string {
  switch (suit) {
    case "hearts":
      return "de cœur";
    case "diamonds":
      return "de carreau";
    case "clubs":
      return "de trèfle";
    case "spades":
      return "de pique";
  }
}
