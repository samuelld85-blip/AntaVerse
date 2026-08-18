import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createGame } from "@/games/quoi-de-9/lib/game/engine";
import type { GameState, TurnResult } from "@/games/quoi-de-9/lib/game/types";
import { FinalScreen, TurnResultsScreen } from "./screens";

function completedTurn({ themeSelection, ...overrides }: Partial<TurnResult> = {}): TurnResult {
  return {
    id: "turn_current",
    answeringTeamId: "",
    questionId: "cinema-saga-2001-2011",
    questionText: "Quels sont les neuf films de cette saga sortis entre 2001 et 2011 ?",
    themeId: "cinema",
    themeLabel: "Cinéma",
    themeSelection: themeSelection ?? {
      selectionMode: "random_imposed",
      proposedThemeIds: ["cinema"],
      selectedThemeId: "cinema",
    },
    turnNumber: 2,
    roundNumber: 1,
    difficultyLevel: 2,
    difficultyLabel: "Moyen",
    foundAnswerIds: ["a1", "a2", "a3", "a4", "a5", "a6"],
    missedAnswerIds: ["a7", "a8", "a9"],
    foundAnswers: [
      { id: "a1", display: "L’École des sorciers" },
      { id: "a2", display: "La Chambre des secrets" },
      { id: "a3", display: "Le Prisonnier d’Azkaban" },
      { id: "a4", display: "La Coupe de feu" },
      { id: "a5", display: "L’Ordre du Phénix" },
      { id: "a6", display: "Le Prince de sang-mêlé" },
    ],
    missedAnswers: [
      { id: "a7", display: "Les Reliques de la Mort — partie 1" },
      { id: "a8", display: "Les Reliques de la Mort — partie 2" },
      { id: "a9", display: "Retour à Poudlard" },
    ],
    baseScore: 600,
    coefficient: 1.5,
    bombTriggered: false,
    bombPenalty: 0,
    pointsEarned: 900,
    startedAt: "2026-07-13T18:00:00.000Z",
    endedAt: "2026-07-13T18:01:30.000Z",
    ...overrides,
  };
}

function gameWithHistory(): GameState {
  const game = createGame({
    teamAName: "Équipe Rouge",
    teamBName: "Équipe Bleue",
    teamAColor: "#ff6f5d",
    teamBColor: "#687dff",
    startingTeamIndex: 0,
    roundsPerTeam: 5,
    turnDurationSeconds: 90,
  });
  const previous = completedTurn({
    id: "turn_previous",
    answeringTeamId: game.teams[1].id,
    questionId: "previous-question",
    questionText: "Quelle était la question du tour précédent ?",
    themeId: "histoire",
    themeLabel: "Histoire",
    turnNumber: 1,
  });
  const current = completedTurn({ answeringTeamId: game.teams[0].id });
  game.teams[0].score = 900;
  game.teams[1].score = 200;
  return { ...game, status: "turn_results", history: [previous, current] };
}

function textFromMarkup(markup: string): string {
  document.body.innerHTML = markup;
  return document.body.textContent?.replace(/\s+/gu, " ").trim() ?? "";
}

describe("écran de résultats", () => {
  it("affiche le tour courant, sa question complète et les caractères français", () => {
    const game = gameWithHistory();
    const text = textFromMarkup(
      renderToStaticMarkup(
        <TurnResultsScreen game={game} onCorrect={vi.fn()} onContinue={vi.fn()} />,
      ),
    );

    const expectedInOrder = [
      "Tour terminé",
      "+900 points",
      "Cinéma · Niveau 2 — Moyen",
      "Quels sont les neuf films de cette saga sortis entre 2001 et 2011 ?",
      "Réponses",
      "6/9 trouvées",
      "Corriger",
      "Tour suivant",
    ];
    let previousIndex = -1;
    for (const expected of expectedInOrder) {
      const index = text.indexOf(expected);
      expect(index, `${expected} doit être visible dans le bon ordre`).toBeGreaterThan(
        previousIndex,
      );
      previousIndex = index;
    }
    expect(text).toContain("L’École des sorciers");
    expect(text).toContain("Les Reliques de la Mort — partie 1");
    expect(text).not.toContain("Scores mis à jour");
    expect(text).not.toContain("6 réponses × 150 points");
    expect(text).not.toContain("6/9 réponses trouvées");
    expect(text).not.toContain("Quelle était la question du tour précédent ?");
    expect(text).not.toMatch(/\u00c3|\u00c2|\u00e2\u20ac|\ufffd/u);
  });

  it("conserve la bonne question pour chaque entrée du résumé final", () => {
    const game = { ...gameWithHistory(), status: "completed" as const };
    const text = textFromMarkup(
      renderToStaticMarkup(<FinalScreen game={game} onReplay={vi.fn()} onNew={vi.fn()} />),
    );
    expect(text).toContain("Quelle était la question du tour précédent ?");
    expect(text).toContain("Quels sont les neuf films de cette saga sortis entre 2001 et 2011 ?");
  });
});
