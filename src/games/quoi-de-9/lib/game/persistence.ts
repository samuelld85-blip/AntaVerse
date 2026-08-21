import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { getQuestion, getTheme } from "@/games/quoi-de-9/data/questions";
import { DIFFICULTY_LABELS, type DifficultyLevel } from "./config";
import type { GameState, TurnResult } from "./types";
import { normalizeUnicodeDeep } from "@/games/quoi-de-9/lib/text/encoding";

interface LegacyTurn {
  id: string;
  teamId: string;
  questionId: string;
  themeId: string;
  turnNumber: number;
  roundNumber: number;
  difficulty?: "easy" | "medium" | "hard";
  difficultyLevel?: DifficultyLevel;
  answerIds: string[];
  baseScore: number;
  coefficient: number;
  finalScore: number;
  startedAt: string;
  endedAt: string;
}

type LegacyGame = Omit<
  GameState,
  | "schemaVersion"
  | "currentDifficultyLevel"
  | "history"
  | "teamJokers"
  | "jokerUsages"
  | "jokerOpportunityStage"
  | "turnThemeSelection"
> & {
  schemaVersion?: 1 | 2 | 3 | 4;
  currentDifficulty?: "easy" | "medium" | "hard" | null;
  currentDifficultyLevel?: DifficultyLevel | number | null;
  history: Array<LegacyTurn | Omit<TurnResult, "themeSelection" | "jokerUsage">>;
};

interface GameDatabase extends DBSchema {
  games: {
    key: "current";
    value: GameState;
  };
}

let databasePromise: Promise<IDBPDatabase<GameDatabase>> | null = null;
const FALLBACK_STORAGE_KEY = "qui-des-9:current-game";
// Last-resort fallback below IndexedDB and localStorage: some WebKit private-
// browsing modes throw on both (IndexedDB unavailable, localStorage.setItem
// quota-capped at 0), but still allow window.name, which survives reloads
// (though not tab close) — see HOW_ANTAVERSE_WORKS.md §7.
const WINDOW_NAME_PREFIX = "qui-des-9-game:";

function database(): Promise<IDBPDatabase<GameDatabase>> {
  if (!databasePromise) {
    databasePromise = openDB<GameDatabase>("qui-des-9", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("games")) db.createObjectStore("games");
      },
    });
  }
  return databasePromise;
}

export async function saveCurrentGame(game: GameState): Promise<void> {
  const normalized = normalizeUnicodeDeep(game);
  try {
    const db = await database();
    await db.put("games", normalized, "current");
  } catch {
    saveFallback(normalized);
  }
}

export async function loadCurrentGame(): Promise<GameState | null> {
  let stored: GameState | LegacyGame | null = null;
  try {
    const db = await database();
    stored = (await db.get("games", "current")) ?? null;
  } catch {
    const serialized = loadFallback();
    stored = serialized ? (JSON.parse(serialized) as GameState | LegacyGame) : null;
  }
  return stored ? normalizeUnicodeDeep(migrateStoredGame(stored)) : null;
}

export async function clearCurrentGame(): Promise<void> {
  try {
    const db = await database();
    await db.delete("games", "current");
  } catch {
    // IndexedDB peut être indisponible sur une origine réseau HTTP locale.
  }
  clearFallback();
}

function saveFallback(game: GameState): void {
  const serialized = JSON.stringify(game);
  try {
    window.localStorage.setItem(FALLBACK_STORAGE_KEY, serialized);
  } catch {
    window.name = `${WINDOW_NAME_PREFIX}${serialized}`;
  }
}

function loadFallback(): string | null {
  try {
    return window.localStorage.getItem(FALLBACK_STORAGE_KEY);
  } catch {
    return window.name.startsWith(WINDOW_NAME_PREFIX)
      ? window.name.slice(WINDOW_NAME_PREFIX.length)
      : null;
  }
}

function clearFallback(): void {
  try {
    window.localStorage.removeItem(FALLBACK_STORAGE_KEY);
  } catch {
    // Le stockage de l’origine peut être bloqué par le navigateur.
  }
  if (window.name.startsWith(WINDOW_NAME_PREFIX)) window.name = "";
}

export function resetPersistenceConnectionForTests(): void {
  databasePromise = null;
}

function migrateStoredGame(stored: GameState | LegacyGame): GameState {
  if ("schemaVersion" in stored && stored.schemaVersion === 6) return stored as GameState;
  if ("schemaVersion" in stored && (stored.schemaVersion as number | undefined) === 5) {
    // v5 → v6: difficulty level 3 (Difficile) no longer exists.
    const v5 = stored as unknown as Omit<GameState, "schemaVersion" | "currentDifficultyLevel"> & {
      schemaVersion: 5;
      currentDifficultyLevel: number | null;
    };
    const rawLevel = v5.currentDifficultyLevel;
    const currentDifficultyLevel: DifficultyLevel | null =
      rawLevel === 1 || rawLevel === 2 ? rawLevel : null;
    const status: GameState["status"] =
      rawLevel === 3 && v5.status === "choice_confirmation" ? "difficulty_selection" : v5.status;
    return { ...v5, schemaVersion: 6, currentDifficultyLevel, status };
  }
  if (
    "schemaVersion" in stored &&
    (stored.schemaVersion as number | undefined) === 4
  ) {
    return { ...(stored as unknown as GameState), schemaVersion: 6 };
  }
  const legacy = stored as LegacyGame;
  const status =
    (legacy.status as string) === "theme_selection" ? "joker_opportunity" : legacy.status;
  const rawDifficultyLevel =
    legacy.currentDifficultyLevel ?? difficultyLevelFromLegacy(legacy.currentDifficulty ?? null);
  const currentDifficultyLevel: DifficultyLevel | null =
    rawDifficultyLevel === 1 || rawDifficultyLevel === 2 ? rawDifficultyLevel : null;
  return {
    ...legacy,
    schemaVersion: 6,
    status,
    currentDifficultyLevel,
    bombTriggered: "bombTriggered" in legacy ? Boolean(legacy.bombTriggered) : false,
    teamJokers: Object.fromEntries(
      legacy.teams.map((team) => [
        team.id,
        { themeChoiceAvailable: true, opponentThemeAvailable: true },
      ]),
    ),
    jokerUsages: [],
    jokerOpportunityStage: status === "joker_opportunity" ? "opponent" : null,
    turnThemeSelection: legacy.selectedThemeId
      ? {
          selectionMode: "random_imposed",
          proposedThemeIds: [legacy.selectedThemeId],
          selectedThemeId: legacy.selectedThemeId,
        }
      : null,
    history: legacy.history.map((turn) => {
      if ("foundAnswerIds" in turn) {
        return {
          ...turn,
          bombTriggered: "bombTriggered" in turn ? Boolean(turn.bombTriggered) : false,
          bombPenalty: "bombPenalty" in turn ? Number(turn.bombPenalty) : 0,
          themeSelection: {
            selectionMode: "random_imposed" as const,
            proposedThemeIds: [turn.themeId],
            selectedThemeId: turn.themeId,
          },
        };
      }
      const question = getQuestion(turn.questionId);
      const theme = getTheme(turn.themeId);
      const foundAnswerIds = [...turn.answerIds];
      const found = new Set(foundAnswerIds);
      const difficultyLevel =
        turn.difficultyLevel ?? difficultyLevelFromLegacy(turn.difficulty ?? null) ?? 1;
      return {
        id: turn.id,
        answeringTeamId: turn.teamId,
        questionId: turn.questionId,
        questionText: question?.question ?? "Question d’une ancienne partie",
        themeId: turn.themeId,
        themeLabel: theme?.name ?? turn.themeId,
        themeSelection: {
          selectionMode: "random_imposed",
          proposedThemeIds: [turn.themeId],
          selectedThemeId: turn.themeId,
        },
        turnNumber: turn.turnNumber,
        roundNumber: turn.roundNumber,
        difficultyLevel,
        difficultyLabel: DIFFICULTY_LABELS[difficultyLevel],
        foundAnswerIds,
        missedAnswerIds:
          question?.answers.filter((answer) => !found.has(answer.id)).map((answer) => answer.id) ??
          [],
        foundAnswers:
          question?.answers
            .filter((answer) => found.has(answer.id))
            .map(({ id, display }) => ({ id, display })) ?? [],
        missedAnswers:
          question?.answers
            .filter((answer) => !found.has(answer.id))
            .map(({ id, display }) => ({ id, display })) ?? [],
        baseScore: turn.baseScore,
        coefficient: turn.coefficient,
        bombTriggered: false,
        bombPenalty: 0,
        pointsEarned: turn.finalScore,
        startedAt: turn.startedAt,
        endedAt: turn.endedAt,
      };
    }),
  };
}

function difficultyLevelFromLegacy(
  difficulty: "easy" | "medium" | "hard" | null,
): DifficultyLevel | null {
  if (difficulty === "easy") return 1;
  if (difficulty === "medium") return 2;
  // "hard" (niveau 3) n'existe plus — les tours legacy avec ce niveau gardent
  // leur historique mais le niveau actif est remis à null.
  return null;
}
