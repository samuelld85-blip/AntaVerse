import type { DifficultyLabel, DifficultyLevel } from "./config";

export type GameStatus =
  | "instructions"
  | "pass_phone"
  | "joker_opportunity"
  | "joker_theme_selection"
  | "joker_confirmation"
  | "theme_reveal"
  | "difficulty_selection"
  | "choice_confirmation"
  | "question_preparation"
  | "question_ready"
  | "question_active"
  | "turn_expired"
  | "answer_correction"
  | "turn_results"
  | "scoreboard"
  | "completed";

export type GameMode = "competition" | "fun";
export type ContentStatus = "draft" | "published" | "archived";

export interface Theme {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: "Culture générale accessible" | "Pop culture & loisirs" | "Vie quotidienne & société";
  weight: number;
}

export interface QuestionAnswer {
  id: string;
  display: string;
  normalized: string;
  alternatives: string[];
  displayOrder: number;
}

export interface QuestionBomb {
  id: string;
  display: string;
  normalized: string;
  alternatives: string[];
  explanation: string;
}

export interface Question {
  id: string;
  themeId: string;
  subthemeIds: string[];
  question: string;
  teaser: string;
  difficultyLevel: DifficultyLevel;
  difficultyLabel: DifficultyLabel;
  coefficient: number;
  language: "fr";
  explanation?: string;
  source?: string;
  status: ContentStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  answers: QuestionAnswer[];
  bomb: QuestionBomb;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  turnOrder: 0 | 1;
}

export type JokerType = "theme_choice" | "opponent_theme";

export interface TeamJokerState {
  themeChoiceAvailable: boolean;
  opponentThemeAvailable: boolean;
}

export interface JokerUsage {
  jokerType: JokerType;
  usedByTeamId: string;
  targetTeamId: string;
  turnNumber: number;
  proposedThemeIds: string[];
  selectedThemeId: string;
  usedAt: string;
}

export interface TurnThemeSelection {
  selectionMode: "random_imposed" | "active_team_choice" | "opponent_imposed";
  proposedThemeIds: string[];
  selectedThemeId: string | null;
}

export interface TurnResult {
  id: string;
  answeringTeamId: string;
  questionId: string;
  questionText: string;
  themeId: string;
  themeLabel: string;
  themeSelection: TurnThemeSelection;
  jokerUsage?: JokerUsage;
  turnNumber: number;
  roundNumber: number;
  difficultyLevel: DifficultyLevel;
  difficultyLabel: DifficultyLabel;
  foundAnswerIds: string[];
  missedAnswerIds: string[];
  foundAnswers: Array<{ id: string; display: string }>;
  missedAnswers: Array<{ id: string; display: string }>;
  baseScore: number;
  coefficient: number;
  bombTriggered: boolean;
  bombPenalty: number;
  pointsEarned: number;
  startedAt: string;
  endedAt: string;
}

export interface GameState {
  schemaVersion: 4;
  id: string;
  mode: "competition" | "fun";
  status: GameStatus;
  teams: [Team, Team];
  startingTeamIndex: 0 | 1;
  currentTeamIndex: 0 | 1;
  currentRound: number;
  currentTurn: number;
  roundsPerTeam: number;
  turnDurationSeconds: number;
  usedQuestionIds: string[];
  teamJokers: Record<string, TeamJokerState>;
  jokerUsages: JokerUsage[];
  jokerOpportunityStage: "opponent" | "active" | null;
  turnThemeSelection: TurnThemeSelection | null;
  selectedThemeId: string | null;
  currentQuestionId: string | null;
  currentDifficultyLevel: DifficultyLevel | null;
  revealedAnswerIds: string[];
  bombTriggered: boolean;
  turnScore: number;
  timerStartedAt: string | null;
  timerEndsAt: string | null;
  history: TurnResult[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateGameInput {
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  startingTeamIndex: 0 | 1;
  roundsPerTeam: number;
  turnDurationSeconds: number;
  mode: "competition" | "fun";
}

export interface WinnerResult {
  kind: "winner" | "draw";
  winner: Team | null;
  difference: number;
}
