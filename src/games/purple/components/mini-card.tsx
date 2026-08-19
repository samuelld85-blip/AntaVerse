import type { Rank, Suit } from "@/games/purple/lib/game/types";

interface MiniCardProps {
  rank?: Rank;
  suit: Suit;
}

export function MiniCard({ rank, suit }: MiniCardProps) {
  const isRed = suit === "hearts" || suit === "diamonds";
  const suitSymbol = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }[suit];

  return (
    <div className={isRed ? "mini-card mini-card--red" : "mini-card mini-card--black"}>
      {rank ? <span className="mini-card-rank">{rank}</span> : null}
      <span className="mini-card-suit">{suitSymbol}</span>
    </div>
  );
}
