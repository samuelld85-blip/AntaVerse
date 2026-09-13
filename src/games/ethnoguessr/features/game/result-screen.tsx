import { WorldMap } from "@/games/ethnoguessr/components/world-map";
import { getDuo } from "@/games/ethnoguessr/data/duos";
import { getCountry } from "@/games/ethnoguessr/lib/geo/countries";
import type { RoundOutcome } from "@/games/ethnoguessr/lib/game/types";

export function ResultScreen({
  outcome,
  roundNumber,
  totalRounds,
  isLastRound,
  onNext,
}: {
  outcome: RoundOutcome;
  roundNumber: number;
  totalRounds: number;
  isLastRound: boolean;
  onNext: () => void;
}) {
  const answerCountry = getCountry(outcome.countryId);
  const duo = getDuo(outcome.duoId);

  return (
    <>
      <div className="game-status">
        <p className="round-pill">
          Manche {roundNumber}/{totalRounds}
        </p>
      </div>
      <section className="eg-result-stage">
        <WorldMap
          className="eg-result-map"
          highlightCountryId={outcome.countryId}
          markers={
            answerCountry
              ? [
                  { lat: outcome.guess.lat, lon: outcome.guess.lon, kind: "guess" },
                  { lat: answerCountry.lat, lon: answerCountry.lon, kind: "answer" },
                ]
              : [{ lat: outcome.guess.lat, lon: outcome.guess.lon, kind: "guess" }]
          }
        />
        <div className="eg-result-summary">
          <p className={`eg-result-points eg-result-points--${outcome.points}`}>{outcome.points}/5</p>
          <p className="eg-result-country">
            C&apos;était <strong>{answerCountry?.name ?? "un pays inconnu"}</strong>
          </p>
          <p className="eg-result-distance">{Math.round(outcome.distanceKm)} km de ta réponse</p>
          {duo ? (
            <>
              <p className="eg-result-people">
                {duo.man.name} &amp; {duo.woman.name}
              </p>
              <p className="eg-photo-credit">
                Photos :{" "}
                <a href={duo.man.creditUrl} target="_blank" rel="noopener noreferrer">
                  {duo.man.credit}
                </a>{" "}
                ·{" "}
                <a href={duo.woman.creditUrl} target="_blank" rel="noopener noreferrer">
                  {duo.woman.credit}
                </a>{" "}
                (Wikimedia Commons)
              </p>
            </>
          ) : null}
        </div>
        <button type="button" className="button button--primary" onClick={onNext}>
          {isLastRound ? "Voir le score final" : "Manche suivante"} <span aria-hidden="true">→</span>
        </button>
      </section>
    </>
  );
}
