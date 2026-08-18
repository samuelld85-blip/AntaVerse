export function CoinFlip({ flipping, label }: { flipping: boolean; label: string }) {
  return (
    <div className={flipping ? "coin coin--flipping" : "coin"} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}
