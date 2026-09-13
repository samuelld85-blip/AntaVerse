import { Button, ButtonLink } from "@/games/shared/components/ui";
import { getCountry } from "@/games/ethnoguessr/lib/geo/countries";
import { MAX_TOTAL_SCORE, totalScore } from "@/games/ethnoguessr/lib/game/engine";
import type { GameState } from "@/games/ethnoguessr/lib/game/types";

export function EndScreen({ game, onReplay }: { game: GameState; onReplay: () => void }) {
  return (
    <main className="result-shell safe-shell">
      <div className="result-card">
        <div className="trophy" aria-hidden="true">
          🌍
        </div>
        <h1>
          Partie <span>terminée</span>
        </h1>
        <p className="final-label">Score final</p>
        <p className="final-score">
          {totalScore(game)} / {MAX_TOTAL_SCORE}
        </p>
        <ul className="eg-recap">
          {game.outcomes.map((outcome, index) => (
            <li key={outcome.duoId}>
              <span>
                Manche {index + 1} · {getCountry(outcome.countryId)?.name ?? "?"}
              </span>
              <strong>{outcome.points}/5</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="result-actions">
        <Button type="button" variant="primary" onClick={onReplay}>
          Rejouer <span aria-hidden="true">↻</span>
        </Button>
        <ButtonLink href="/ethnoguessr" variant="secondary">
          Quitter
        </ButtonLink>
      </div>
    </main>
  );
}
