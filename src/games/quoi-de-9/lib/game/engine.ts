import { DIFFICULTY_LEVELS, GAME_CONFIG, type DifficultyLevel } from "./config";
import { calculateBombPenalty, calculateTurnScore } from "./scoring";
import type {
  CreateGameInput,
  GameState,
  JokerType,
  Question,
  Team,
  Theme,
  TurnThemeSelection,
  WinnerResult,
} from "./types";
import { normalizeText } from "@/games/quoi-de-9/lib/text/encoding";

function uid(prefix: string): string {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${randomId}`;
}

function iso(timestamp = Date.now()): string {
  return new Date(timestamp).toISOString();
}

function assertStatus(game: GameState, expected: GameState["status"]): void {
  if (game.status !== expected) {
    throw new Error(`Transition impossible depuis l’état ${game.status}`);
  }
}

function touch(game: GameState, timestamp = Date.now()): GameState {
  return { ...game, updatedAt: iso(timestamp) };
}

export function createGame(input: CreateGameInput): GameState {
  const createdAt = iso();
  const teams: Team[] = [
    {
      id: uid("team"),
      name: normalizeText(input.teamAName.trim()),
      color: input.teamAColor,
      score: 0,
    },
    {
      id: uid("team"),
      name: normalizeText(input.teamBName.trim()),
      color: input.teamBColor,
      score: 0,
    },
  ];

  if (input.teamCName && input.teamCColor) {
    teams.push({
      id: uid("team"),
      name: normalizeText(input.teamCName.trim()),
      color: input.teamCColor,
      score: 0,
    });
  }

  const startingTeamIndex =
    input.startingTeamIndex >= 0 && input.startingTeamIndex < teams.length
      ? input.startingTeamIndex
      : 0;

  return {
    schemaVersion: 6,
    id: uid("game"),
    mode: input.mode,
    status: "instructions",
    teams,
    startingTeamIndex,
    currentTeamIndex: startingTeamIndex,
    currentRound: 1,
    currentTurn: 1,
    roundsPerTeam: input.roundsPerTeam,
    turnDurationSeconds: input.turnDurationSeconds,
    usedQuestionIds: [],
    teamJokers: Object.fromEntries(
      teams.map((team) => [team.id, { themeChoiceAvailable: true, opponentThemeAvailable: true }]),
    ),
    jokerUsages: [],
    jokerOpportunityStage: null,
    turnThemeSelection: null,
    selectedThemeId: null,
    currentQuestionId: null,
    currentDifficultyLevel: null,
    revealedAnswerIds: [],
    bombTriggered: false,
    turnScore: 0,
    timerStartedAt: null,
    timerEndsAt: null,
    history: [],
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  };
}

export function acknowledgeInstructions(game: GameState): GameState {
  assertStatus(game, "instructions");
  return touch({ ...game, status: "pass_phone" });
}

export function confirmPhonePass(game: GameState): GameState {
  assertStatus(game, "pass_phone");
  return touch({ ...game, status: "joker_opportunity", jokerOpportunityStage: "opponent" });
}

export function getDifficultyAvailability(
  questions: Question[],
  themeId: string,
  usedQuestionIds: string[],
): Record<DifficultyLevel, number> {
  const used = new Set(usedQuestionIds);
  return Object.fromEntries(
    DIFFICULTY_LEVELS.map((difficultyLevel) => [
      difficultyLevel,
      questions.filter(
        (question) =>
          question.status === "published" &&
          question.language === "fr" &&
          question.themeId === themeId &&
          question.difficultyLevel === difficultyLevel &&
          !used.has(question.id),
      ).length,
    ]),
  ) as Record<DifficultyLevel, number>;
}

interface ThemeAvailability {
  theme: Theme;
  available: boolean;
  supportsAllDifficulties: boolean;
  totalUnused: number;
  byDifficulty: Record<DifficultyLevel, number>;
}

export function getThemeAvailability(
  themes: Theme[],
  questions: Question[],
  usedQuestionIds: string[],
): ThemeAvailability[] {
  return themes.map((theme) => {
    const byDifficulty = getDifficultyAvailability(questions, theme.id, usedQuestionIds);
    const totalUnused = Object.values(byDifficulty).reduce((total, count) => total + count, 0);
    return {
      theme,
      byDifficulty,
      totalUnused,
      supportsAllDifficulties: DIFFICULTY_LEVELS.every(
        (difficultyLevel) => byDifficulty[difficultyLevel] > 0,
      ),
      available: totalUnused > 0,
    };
  });
}

function getNextTeamIndex(game: GameState): number {
  return (game.currentTeamIndex + 1) % game.teams.length;
}

function activeTeamId(game: GameState): string {
  const team = game.teams[game.currentTeamIndex];
  if (!team) throw new Error("Équipe active introuvable");
  return team.id;
}

function opponentTeamId(game: GameState): string {
  const team = game.teams[getNextTeamIndex(game)];
  if (!team) throw new Error("Équipe suivante introuvable");
  return team.id;
}

export function drawEligibleThemes(
  game: GameState,
  themes: Theme[],
  questions: Question[],
  count: number,
  random = Math.random,
): Theme[] {
  const candidates = getThemeAvailability(themes, questions, game.usedQuestionIds).filter(
    (entry) => entry.available,
  );
  const pool = [...candidates];
  const selected: Theme[] = [];
  while (selected.length < Math.min(count, pool.length + selected.length)) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.theme.weight, 0);
    let cursor = random() * totalWeight;
    let selectedIndex = pool.length - 1;
    for (let index = 0; index < pool.length; index += 1) {
      cursor -= pool[index]!.theme.weight;
      if (cursor < 0) {
        selectedIndex = index;
        break;
      }
    }
    const [entry] = pool.splice(selectedIndex, 1);
    if (entry) selected.push(entry.theme);
  }
  return selected;
}

function startThemeSelection(
  game: GameState,
  selectionMode: TurnThemeSelection["selectionMode"],
  proposedThemeIds: string[],
  status: "theme_reveal" | "joker_theme_selection",
): GameState {
  if (proposedThemeIds.length === 0) throw new Error("Aucun thème éligible");
  const selectedThemeId = status === "theme_reveal" ? (proposedThemeIds[0] ?? null) : null;
  return touch({
    ...game,
    status,
    selectedThemeId,
    turnThemeSelection: {
      selectionMode,
      proposedThemeIds,
      selectedThemeId,
    },
  });
}

export function skipOpponentThemeJoker(game: GameState): GameState {
  assertStatus(game, "joker_opportunity");
  if (game.jokerOpportunityStage !== "opponent")
    throw new Error("Cette opportunité joker est terminée");
  return touch({ ...game, jokerOpportunityStage: "active" });
}

export function activateOpponentThemeJoker(
  game: GameState,
  themes: Theme[],
  questions: Question[],
  random = Math.random,
): GameState {
  assertStatus(game, "joker_opportunity");
  if (game.jokerOpportunityStage !== "opponent")
    throw new Error("Le joker adverse n’est pas disponible");
  if (!game.teamJokers[opponentTeamId(game)]?.opponentThemeAvailable)
    throw new Error("Ce joker a déjà été utilisé");
  return startThemeSelection(
    game,
    "opponent_imposed",
    drawEligibleThemes(game, themes, questions, 3, random).map((theme) => theme.id),
    "joker_theme_selection",
  );
}

export function activateThemeChoiceJoker(
  game: GameState,
  themes: Theme[],
  questions: Question[],
  random = Math.random,
): GameState {
  assertStatus(game, "joker_opportunity");
  if (game.jokerOpportunityStage !== "active")
    throw new Error("Le joker de choix n’est pas disponible");
  if (!game.teamJokers[activeTeamId(game)]?.themeChoiceAvailable)
    throw new Error("Ce joker a déjà été utilisé");
  return startThemeSelection(
    game,
    "active_team_choice",
    drawEligibleThemes(game, themes, questions, 3, random).map((theme) => theme.id),
    "joker_theme_selection",
  );
}

export function imposeRandomTheme(
  game: GameState,
  themes: Theme[],
  questions: Question[],
  random = Math.random,
): GameState {
  assertStatus(game, "joker_opportunity");
  if (game.jokerOpportunityStage !== "active")
    throw new Error("Le choix adverse doit être résolu d’abord");
  return startThemeSelection(
    game,
    "random_imposed",
    drawEligibleThemes(game, themes, questions, 1, random).map((theme) => theme.id),
    "theme_reveal",
  );
}

export function selectJokerTheme(game: GameState, themeId: string): GameState {
  assertStatus(game, "joker_theme_selection");
  if (!game.turnThemeSelection?.proposedThemeIds.includes(themeId))
    throw new Error("Thème joker invalide");
  return touch({
    ...game,
    status: "joker_confirmation",
    selectedThemeId: themeId,
    turnThemeSelection: { ...game.turnThemeSelection, selectedThemeId: themeId },
  });
}

export function cancelJokerTheme(game: GameState): GameState {
  assertStatus(game, "joker_confirmation");
  const mode = game.turnThemeSelection?.selectionMode;
  return touch({
    ...game,
    status: "joker_opportunity",
    jokerOpportunityStage: mode === "opponent_imposed" ? "opponent" : "active",
    selectedThemeId: null,
    turnThemeSelection: null,
  });
}

export function confirmJokerTheme(game: GameState, timestamp = Date.now()): GameState {
  assertStatus(game, "joker_confirmation");
  const selection = game.turnThemeSelection;
  if (!selection?.selectedThemeId || selection.selectionMode === "random_imposed")
    throw new Error("Joker incomplet");
  const jokerType: JokerType =
    selection.selectionMode === "opponent_imposed" ? "opponent_theme" : "theme_choice";
  const usedByTeamId = jokerType === "opponent_theme" ? opponentTeamId(game) : activeTeamId(game);
  const key = jokerType === "opponent_theme" ? "opponentThemeAvailable" : "themeChoiceAvailable";
  if (!game.teamJokers[usedByTeamId]?.[key]) throw new Error("Ce joker a déjà été utilisé");
  const usage = {
    jokerType,
    usedByTeamId,
    targetTeamId: activeTeamId(game),
    turnNumber: game.currentTurn,
    proposedThemeIds: selection.proposedThemeIds,
    selectedThemeId: selection.selectedThemeId,
    usedAt: iso(timestamp),
  };
  return touch(
    {
      ...game,
      status: "theme_reveal",
      teamJokers: {
        ...game.teamJokers,
        [usedByTeamId]: { ...game.teamJokers[usedByTeamId], [key]: false },
      },
      jokerUsages: [...game.jokerUsages, usage],
    },
    timestamp,
  );
}

export function continueFromThemeReveal(game: GameState, questions: Question[]): GameState {
  assertStatus(game, "theme_reveal");
  const selectedThemeId = game.turnThemeSelection?.selectedThemeId;
  if (!selectedThemeId) throw new Error("Aucun thème imposé");
  if (
    Object.values(
      getDifficultyAvailability(questions, selectedThemeId, game.usedQuestionIds),
    ).every((count) => count === 0)
  )
    throw new Error("Ce thème n’a plus de question disponible");
  return touch({
    ...game,
    status: "difficulty_selection",
    selectedThemeId,
    jokerOpportunityStage: null,
  });
}

export function chooseDifficulty(
  game: GameState,
  difficultyLevel: DifficultyLevel,
  questions: Question[],
): GameState {
  assertStatus(game, "difficulty_selection");
  if (!game.selectedThemeId) throw new Error("Aucun thème sélectionné");
  const availability = getDifficultyAvailability(
    questions,
    game.selectedThemeId,
    game.usedQuestionIds,
  );
  if (availability[difficultyLevel] < 1) {
    throw new Error("Cette difficulté n’est plus disponible");
  }
  return touch({
    ...game,
    status: "choice_confirmation",
    currentDifficultyLevel: difficultyLevel,
  });
}

export function cancelDifficultyChoice(game: GameState): GameState {
  assertStatus(game, "choice_confirmation");
  return touch({ ...game, status: "difficulty_selection", currentDifficultyLevel: null });
}

export function confirmChoice(
  game: GameState,
  questions: Question[],
  random = Math.random,
): GameState {
  assertStatus(game, "choice_confirmation");
  if (!game.selectedThemeId || !game.currentDifficultyLevel) throw new Error("Choix incomplet");
  const eligible = questions.filter(
    (question) =>
      question.status === "published" &&
      question.themeId === game.selectedThemeId &&
      question.difficultyLevel === game.currentDifficultyLevel &&
      !game.usedQuestionIds.includes(question.id),
  );
  const previousQuestionId = game.history.at(-1)?.questionId;
  const previousSubthemes = new Set(
    questions.find((question) => question.id === previousQuestionId)?.subthemeIds ?? [],
  );
  const variedEligible = eligible.filter(
    (question) => !question.subthemeIds.some((subthemeId) => previousSubthemes.has(subthemeId)),
  );
  const selectionPool = variedEligible.length > 0 ? variedEligible : eligible;
  const question = selectionPool[Math.floor(random() * selectionPool.length)];
  if (!question) throw new Error("Aucune question éligible");

  return touch({
    ...game,
    status: "question_ready",
    currentQuestionId: question.id,
    usedQuestionIds: [...game.usedQuestionIds, question.id],
  });
}

export function startTimer(game: GameState, timestamp = Date.now()): GameState {
  assertStatus(game, "question_ready");
  if (!game.currentQuestionId) throw new Error("Aucune question sélectionnée");
  return touch(
    {
      ...game,
      status: "question_active",
      timerStartedAt: iso(timestamp),
      timerEndsAt: iso(timestamp + game.turnDurationSeconds * 1000),
    },
    timestamp,
  );
}

export function getRemainingSeconds(game: GameState, timestamp = Date.now()): number {
  if (!game.timerEndsAt) return game.turnDurationSeconds;
  return Math.max(0, Math.ceil((Date.parse(game.timerEndsAt) - timestamp) / 1000));
}

export function isBombTurn(game: GameState): boolean {
  const activeTeamTurnNumber =
    game.history.filter((turn) => turn.answeringTeamId === activeTeamId(game)).length + 1;
  return activeTeamTurnNumber === 2 || activeTeamTurnNumber === 4;
}

export function toggleAnswer(
  game: GameState,
  answerId: string,
  question: Question,
  timestamp = Date.now(),
): GameState {
  const isTimedAnswering = game.status === "question_active";
  if (!isTimedAnswering) {
    throw new Error(`Transition impossible depuis l’état ${game.status}`);
  }
  if (question.id !== game.currentQuestionId) throw new Error("La question ne correspond pas");
  if (isTimedAnswering && (!game.timerEndsAt || timestamp >= Date.parse(game.timerEndsAt))) {
    throw new Error("Le temps est écoulé");
  }
  if (!question.answers.some((answer) => answer.id === answerId))
    throw new Error("Réponse inconnue");

  const wasFound = game.revealedAnswerIds.includes(answerId);
  const revealedAnswerIds = wasFound
    ? game.revealedAnswerIds.filter((id) => id !== answerId)
    : [...game.revealedAnswerIds, answerId];
  return touch(
    {
      ...game,
      revealedAnswerIds,
      turnScore: calculateTurnScore(
        revealedAnswerIds.length,
        question.difficultyLevel,
        game.bombTriggered,
      ),
    },
    timestamp,
  );
}

export function toggleBomb(game: GameState, question: Question, timestamp = Date.now()): GameState {
  const isTimedAnswering = game.status === "question_active";
  if (!isTimedAnswering) {
    throw new Error(`Transition impossible depuis l’état ${game.status}`);
  }
  if (!isBombTurn(game)) throw new Error("La bombe n’est pas active pour ce tour");
  if (question.id !== game.currentQuestionId) throw new Error("La question ne correspond pas");
  if (isTimedAnswering && (!game.timerEndsAt || timestamp >= Date.parse(game.timerEndsAt))) {
    throw new Error("Le temps est écoulé");
  }
  const bombTriggered = !game.bombTriggered;
  return touch(
    {
      ...game,
      bombTriggered,
      turnScore: calculateTurnScore(
        game.revealedAnswerIds.length,
        question.difficultyLevel,
        bombTriggered,
      ),
    },
    timestamp,
  );
}

export function undoLastAnswer(
  game: GameState,
  question: Question,
  timestamp = Date.now(),
): GameState {
  if (game.status !== "question_active") {
    throw new Error(`Transition impossible depuis l’état ${game.status}`);
  }
  const answerId = game.revealedAnswerIds.at(-1);
  return answerId ? toggleAnswer(game, answerId, question, timestamp) : game;
}

export function expireTurn(game: GameState, timestamp = Date.now(), force = false): GameState {
  assertStatus(game, "question_active");
  if (!game.timerEndsAt) throw new Error("Le chrono n’a pas démarré");
  if (!force && timestamp < Date.parse(game.timerEndsAt))
    throw new Error("Le temps n’est pas écoulé");
  return touch({ ...game, status: "turn_expired" }, timestamp);
}

export function recoverTimer(game: GameState, timestamp = Date.now()): GameState {
  if (
    game.status === "question_active" &&
    game.timerEndsAt &&
    timestamp >= Date.parse(game.timerEndsAt)
  ) {
    return expireTurn(game, timestamp);
  }
  return game;
}

export function finalizeExpiredTurn(
  game: GameState,
  question: Question,
  themeLabel: string,
  timestamp = Date.now(),
): GameState {
  const recovered = recoverTimer(game, timestamp);
  return recovered.status === "turn_expired"
    ? finalizeTurn(recovered, question, themeLabel, timestamp)
    : recovered;
}

export function finalizeTurn(
  game: GameState,
  question: Question,
  themeLabel: string,
  timestamp = Date.now(),
): GameState {
  if (game.status !== "turn_expired") {
    throw new Error(`Transition impossible depuis l’état ${game.status}`);
  }
  if (
    question.id !== game.currentQuestionId ||
    !game.currentDifficultyLevel ||
    !game.selectedThemeId ||
    !game.turnThemeSelection
  ) {
    throw new Error("Données du tour incomplètes");
  }
  const activeTeam = game.teams[game.currentTeamIndex];
  if (!activeTeam) throw new Error("Équipe actuelle introuvable");
  const updatedTeam = { ...activeTeam, score: activeTeam.score + game.turnScore };
  const teams = game.teams.map((team, index) =>
    index === game.currentTeamIndex ? updatedTeam : team,
  ) as Team[];
  const endedAt = iso(timestamp);
  const foundAnswerIds = [...game.revealedAnswerIds];
  const foundAnswerSet = new Set(foundAnswerIds);
  const missedAnswerIds = question.answers
    .filter((answer) => !foundAnswerSet.has(answer.id))
    .map((answer) => answer.id);

  return touch(
    {
      ...game,
      status: "turn_results",
      teams,
      history: [
        ...game.history,
        {
          id: uid("turn"),
          answeringTeamId: activeTeam.id,
          questionId: question.id,
          questionText: question.question,
          themeId: game.selectedThemeId,
          themeLabel,
          themeSelection: game.turnThemeSelection,
          jokerUsage:
            game.jokerUsages.at(-1)?.turnNumber === game.currentTurn
              ? game.jokerUsages.at(-1)
              : undefined,
          turnNumber: game.currentTurn,
          roundNumber: game.currentRound,
          difficultyLevel: game.currentDifficultyLevel,
          difficultyLabel: question.difficultyLabel,
          foundAnswerIds,
          missedAnswerIds,
          foundAnswers: question.answers
            .filter((answer) => foundAnswerSet.has(answer.id))
            .map(({ id, display }) => ({ id, display })),
          missedAnswers: question.answers
            .filter((answer) => !foundAnswerSet.has(answer.id))
            .map(({ id, display }) => ({ id, display })),
          baseScore: game.revealedAnswerIds.length * GAME_CONFIG.basePointsPerAnswer,
          coefficient: GAME_CONFIG.difficulties[game.currentDifficultyLevel].coefficient,
          bombTriggered: game.bombTriggered,
          bombPenalty: game.bombTriggered ? calculateBombPenalty(game.currentDifficultyLevel) : 0,
          pointsEarned: game.turnScore,
          startedAt: game.timerStartedAt ?? endedAt,
          endedAt,
        },
      ],
    },
    timestamp,
  );
}

export function toggleTurnResultAnswer(
  game: GameState,
  answerId: string,
  timestamp = Date.now(),
): GameState {
  assertStatus(game, "turn_results");
  const result = game.history.at(-1);
  if (!result || result.turnNumber !== game.currentTurn) {
    throw new Error("Aucun bilan courant à corriger");
  }
  const allAnswers = [...result.foundAnswers, ...result.missedAnswers];
  if (!allAnswers.some((answer) => answer.id === answerId)) throw new Error("Réponse inconnue");

  const wasFound = result.foundAnswerIds.includes(answerId);
  const foundAnswerIds = wasFound
    ? result.foundAnswerIds.filter((id) => id !== answerId)
    : [...result.foundAnswerIds, answerId];
  const foundAnswerSet = new Set(foundAnswerIds);
  const missedAnswerIds = allAnswers
    .map((answer) => answer.id)
    .filter((id) => !foundAnswerSet.has(id));

  const pointsEarned = calculateTurnScore(
    foundAnswerIds.length,
    result.difficultyLevel,
    result.bombTriggered,
  );

  const teamIndex = game.teams.findIndex((team) => team.id === result.answeringTeamId);
  if (teamIndex < 0) throw new Error("Équipe du tour introuvable");
  const scoredTeam = game.teams[teamIndex];
  if (!scoredTeam) throw new Error("Équipe du tour introuvable");
  const updatedTeam = {
    ...scoredTeam,
    score: scoredTeam.score - result.pointsEarned + pointsEarned,
  };
  const teams = game.teams.map((team, index) =>
    index === teamIndex ? updatedTeam : team,
  ) as Team[];

  const updatedResult = {
    ...result,
    foundAnswerIds,
    missedAnswerIds,
    foundAnswers: allAnswers.filter((answer) => foundAnswerSet.has(answer.id)),
    missedAnswers: allAnswers.filter((answer) => !foundAnswerSet.has(answer.id)),
    baseScore: foundAnswerIds.length * GAME_CONFIG.basePointsPerAnswer,
    pointsEarned,
  };

  return touch(
    {
      ...game,
      teams,
      history: [...game.history.slice(0, -1), updatedResult],
    },
    timestamp,
  );
}

function prepareNextTurn(game: GameState, status: "pass_phone" | "scoreboard"): GameState {
  const nextTeamIndex = getNextTeamIndex(game);
  return touch({
    ...game,
    status,
    currentTeamIndex: nextTeamIndex,
    currentRound: Math.floor(game.history.length / game.teams.length) + 1,
    currentTurn: game.history.length + 1,
    selectedThemeId: null,
    jokerOpportunityStage: null,
    turnThemeSelection: null,
    currentQuestionId: null,
    currentDifficultyLevel: null,
    revealedAnswerIds: [],
    bombTriggered: false,
    turnScore: 0,
    timerStartedAt: null,
    timerEndsAt: null,
  });
}

export function advanceAfterResults(game: GameState): GameState {
  assertStatus(game, "turn_results");
  const totalTurns = game.roundsPerTeam * game.teams.length;
  if (game.history.length >= totalTurns) {
    const completedAt = iso();
    return { ...game, status: "completed", completedAt, updatedAt: completedAt };
  }
  const completedRound = game.history.length % game.teams.length === 0;
  return prepareNextTurn(game, completedRound ? "scoreboard" : "pass_phone");
}

export function continueFromScoreboard(game: GameState): GameState {
  assertStatus(game, "scoreboard");
  return touch({ ...game, status: "pass_phone" });
}

export function getWinner(game: GameState): WinnerResult {
  if (game.teams.length === 0) throw new Error("Aucune équipe");
  const maxScore = Math.max(...game.teams.map((t) => t.score));
  const winners = game.teams.filter((t) => t.score === maxScore);
  if (winners.length > 1) {
    return { kind: "draw", winner: null, difference: 0 };
  }
  const winner = winners[0];
  if (!winner) throw new Error("Gagnant introuvable");
  const secondMaxScore = Math.max(
    ...game.teams.map((t) => (t.id === winner.id ? -Infinity : t.score)),
  );
  const difference = winner.score - (secondMaxScore === -Infinity ? 0 : secondMaxScore);
  return { kind: "winner", winner, difference };
}

// Joker de changement de thème activé depuis l'écran de révélation (nouveau flow).
// L'équipe qui répond souhaite changer le thème tiré au hasard.
export function activateChangeThemeJoker(
  game: GameState,
  themes: Theme[],
  questions: Question[],
  random = Math.random,
): GameState {
  assertStatus(game, "theme_reveal");
  if (!game.teamJokers[activeTeamId(game)]?.themeChoiceAvailable)
    throw new Error("Ce joker a déjà été utilisé");
  const proposedThemeIds = drawEligibleThemes(game, themes, questions, 3, random).map((t) => t.id);
  if (proposedThemeIds.length === 0) throw new Error("Aucun thème éligible");
  return touch({
    ...game,
    status: "joker_theme_selection",
    turnThemeSelection: {
      selectionMode: "active_team_choice",
      proposedThemeIds,
      selectedThemeId: null,
    },
  });
}

// Joker d'imposition de thème activé depuis l'écran de révélation (nouveau flow).
// L'équipe adverse souhaite imposer un thème à l'équipe qui répond.
export function activateOpponentOverrideJoker(
  game: GameState,
  themes: Theme[],
  questions: Question[],
  random = Math.random,
): GameState {
  assertStatus(game, "theme_reveal");
  if (!game.teamJokers[opponentTeamId(game)]?.opponentThemeAvailable)
    throw new Error("Ce joker a déjà été utilisé");
  const proposedThemeIds = drawEligibleThemes(game, themes, questions, 3, random).map((t) => t.id);
  if (proposedThemeIds.length === 0) throw new Error("Aucun thème éligible");
  return touch({
    ...game,
    status: "joker_theme_selection",
    turnThemeSelection: {
      selectionMode: "opponent_imposed",
      proposedThemeIds,
      selectedThemeId: null,
    },
  });
}

// Annule la sélection de thème joker avant confirmation (depuis joker_theme_selection).
export function cancelJokerThemeSelection(game: GameState): GameState {
  assertStatus(game, "joker_theme_selection");
  const mode = game.turnThemeSelection?.selectionMode;
  return touch({
    ...game,
    status: "joker_opportunity",
    jokerOpportunityStage: mode === "opponent_imposed" ? "opponent" : "active",
    selectedThemeId: null,
    turnThemeSelection: null,
  });
}

export function replayGame(game: GameState): GameState {
  return createGame({
    teamAName: game.teams[0]!.name,
    teamBName: game.teams[1]!.name,
    teamAColor: game.teams[0]!.color,
    teamBColor: game.teams[1]!.color,
    teamCName: game.teams[2]?.name,
    teamCColor: game.teams[2]?.color,
    startingTeamIndex: game.startingTeamIndex,
    roundsPerTeam: game.roundsPerTeam,
    turnDurationSeconds: game.turnDurationSeconds,
    mode: game.mode,
  });
}
