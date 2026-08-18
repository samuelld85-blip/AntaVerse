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
  const teams: [Team, Team] = [
    {
      id: uid("team"),
      name: normalizeText(input.teamAName.trim()),
      color: input.teamAColor,
      score: 0,
      turnOrder: 0,
    },
    {
      id: uid("team"),
      name: normalizeText(input.teamBName.trim()),
      color: input.teamBColor,
      score: 0,
      turnOrder: 1,
    },
  ];

  return {
    schemaVersion: 4,
    id: uid("game"),
    status: "instructions",
    teams,
    startingTeamIndex: input.startingTeamIndex,
    currentTeamIndex: input.startingTeamIndex,
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

function opposingTeamIndex(game: GameState): 0 | 1 {
  return game.currentTeamIndex === 0 ? 1 : 0;
}

function activeTeamId(game: GameState): string {
  return game.teams[game.currentTeamIndex].id;
}

function opponentTeamId(game: GameState): string {
  return game.teams[opposingTeamIndex(game)].id;
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
    status: "question_preparation",
    currentQuestionId: question.id,
    usedQuestionIds: [...game.usedQuestionIds, question.id],
  });
}

export function confirmQuestionPreparation(game: GameState): GameState {
  assertStatus(game, "question_preparation");
  if (!game.currentQuestionId) throw new Error("Aucune question sélectionnée");
  return touch({ ...game, status: "question_ready" });
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
  const isCorrection = game.status === "answer_correction";
  if (!isTimedAnswering && !isCorrection) {
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
  const isCorrection = game.status === "answer_correction";
  if (!isTimedAnswering && !isCorrection) {
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
  if (game.status !== "question_active" && game.status !== "answer_correction") {
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
  if (game.status !== "turn_expired" && game.status !== "answer_correction") {
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
  const updatedTeam = { ...activeTeam, score: activeTeam.score + game.turnScore };
  const teams: [Team, Team] =
    game.currentTeamIndex === 0 ? [updatedTeam, game.teams[1]] : [game.teams[0], updatedTeam];
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

export function reopenTurnForCorrection(game: GameState, timestamp = Date.now()): GameState {
  assertStatus(game, "turn_results");
  const result = game.history.at(-1);
  if (!result || result.turnNumber !== game.currentTurn) {
    throw new Error("Aucun bilan courant à corriger");
  }
  const teamIndex = game.teams.findIndex((team) => team.id === result.answeringTeamId);
  if (teamIndex < 0) throw new Error("Équipe du tour introuvable");
  const scoredTeam = game.teams[teamIndex];
  if (!scoredTeam) {
    throw new Error("Le score du tour ne peut pas être annulé");
  }
  const correctedTeam = { ...scoredTeam, score: scoredTeam.score - result.pointsEarned };
  const teams: [Team, Team] =
    teamIndex === 0 ? [correctedTeam, game.teams[1]] : [game.teams[0], correctedTeam];

  return touch(
    {
      ...game,
      status: "answer_correction",
      teams,
      history: game.history.slice(0, -1),
      revealedAnswerIds: [...result.foundAnswerIds],
      bombTriggered: result.bombTriggered,
      turnScore: result.pointsEarned,
      timerEndsAt: null,
    },
    timestamp,
  );
}

function prepareNextTurn(game: GameState, status: "pass_phone" | "scoreboard"): GameState {
  const nextTeamIndex: 0 | 1 = game.currentTeamIndex === 0 ? 1 : 0;
  return touch({
    ...game,
    status,
    currentTeamIndex: nextTeamIndex,
    currentRound: Math.floor(game.history.length / 2) + 1,
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
  if (game.history.length >= game.roundsPerTeam * 2) {
    const completedAt = iso();
    return { ...game, status: "completed", completedAt, updatedAt: completedAt };
  }
  const completedRound = game.history.length % 2 === 0;
  return prepareNextTurn(game, completedRound ? "scoreboard" : "pass_phone");
}

export function continueFromScoreboard(game: GameState): GameState {
  assertStatus(game, "scoreboard");
  return touch({ ...game, status: "pass_phone" });
}

export function getWinner(game: GameState): WinnerResult {
  const [teamA, teamB] = game.teams;
  const difference = Math.abs(teamA.score - teamB.score);
  if (difference === 0) return { kind: "draw", winner: null, difference: 0 };
  return { kind: "winner", winner: teamA.score > teamB.score ? teamA : teamB, difference };
}

export function replayGame(game: GameState): GameState {
  return createGame({
    teamAName: game.teams[0].name,
    teamBName: game.teams[1].name,
    teamAColor: game.teams[0].color,
    teamBColor: game.teams[1].color,
    startingTeamIndex: game.startingTeamIndex,
    roundsPerTeam: game.roundsPerTeam,
    turnDurationSeconds: game.turnDurationSeconds,
  });
}
