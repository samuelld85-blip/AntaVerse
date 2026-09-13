import { DuoPortraitFull } from "@/games/ethnoguessr/components/duo-portrait";

export function PhotoScreen({
  manSrc,
  womanSrc,
  roundNumber,
  totalRounds,
  onReady,
}: {
  manSrc: string;
  womanSrc: string;
  roundNumber: number;
  totalRounds: number;
  onReady: () => void;
}) {
  return (
    <>
      <div className="game-status">
        <p className="round-pill">
          Manche {roundNumber}/{totalRounds}
        </p>
      </div>
      <section className="eg-stage">
        <DuoPortraitFull manSrc={manSrc} womanSrc={womanSrc} />
        <p className="eg-hint">Observe le duo aussi longtemps que tu veux, puis réponds.</p>
        <button type="button" className="button button--primary" onClick={onReady}>
          Je réponds <span aria-hidden="true">→</span>
        </button>
      </section>
    </>
  );
}
