interface MiniCardProps {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
}

export function MiniCard({ suit }: MiniCardProps) {
  const isRed = suit === "hearts" || suit === "diamonds";
  const suitSymbol = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }[suit];

  return (
    <div className={isRed ? "mini-card mini-card--red" : "mini-card mini-card--black"}>
      <span className="mini-card-suit">{suitSymbol}</span>
    </div>
  );
}
