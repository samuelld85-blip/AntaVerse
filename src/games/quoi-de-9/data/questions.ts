import rawBundle from "@/games/quoi-de-9/generated/content-bundle.json";
import { GAME_CONFIG, type DifficultyLevel } from "@/games/quoi-de-9/lib/game/config";
import type { Question, Theme } from "@/games/quoi-de-9/lib/game/types";
import { findSuspiciousMojibake, normalizeUnicodeDeep } from "@/games/quoi-de-9/lib/text/encoding";

interface BundleTheme {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: Theme["category"];
  weight: number;
}

interface BundleAnswer {
  id: string;
  display: string;
  normalized: string;
  displayOrder: number;
}

interface BundleBomb {
  id: string;
  display: string;
  normalized: string;
  alternatives: string[];
  explanation: string;
}

interface BundleQuestion {
  id: string;
  themeId: string;
  subthemeIds: string[];
  questionText: string;
  shortTitle: string;
  difficultyLevel: DifficultyLevel;
  difficultyLabel: "Facile" | "Moyen" | "Difficile";
  language: "fr";
  status: "published";
  version: number;
  createdAt: string;
  updatedAt: string;
  answers: BundleAnswer[];
  bomb: BundleBomb;
}

interface ContentBundle {
  schemaVersion: number;
  contentVersion: string;
  language: "fr";
  themes: BundleTheme[];
  questions: BundleQuestion[];
}

const bundle = normalizeUnicodeDeep(rawBundle) as ContentBundle;
const mojibake = findSuspiciousMojibake(bundle);
if (mojibake.length > 0) {
  throw new Error(`Le bundle contient du texte corrompu à ${mojibake[0]?.path.join(".")}`);
}

function capitalizeAnswer(display: string): string {
  const [firstCharacter, ...remainingCharacters] = Array.from(display);
  return firstCharacter
    ? `${firstCharacter.toLocaleUpperCase("fr-FR")}${remainingCharacters.join("")}`
    : display;
}

export const themes: Theme[] = bundle.themes.map((theme) => ({
  id: theme.id,
  name: theme.label,
  icon: theme.icon,
  description: theme.description,
  category: theme.category,
  weight: theme.weight,
}));

export const questions: Question[] = bundle.questions.map((question) => ({
  id: question.id,
  themeId: question.themeId,
  subthemeIds: question.subthemeIds,
  question: question.questionText,
  teaser: question.shortTitle,
  difficultyLevel: question.difficultyLevel,
  difficultyLabel: question.difficultyLabel,
  coefficient: GAME_CONFIG.difficulties[question.difficultyLevel].coefficient,
  language: question.language,
  status: question.status,
  version: question.version,
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
  answers: question.answers.map((answer) => ({
    id: answer.id,
    display: capitalizeAnswer(answer.display),
    normalized: answer.normalized,
    alternatives: [],
    displayOrder: answer.displayOrder,
  })),
  bomb: {
    ...question.bomb,
    display: capitalizeAnswer(question.bomb.display),
  },
}));

const LEGACY_THEME_ALIASES: Record<string, string> = {
  geographie: "geography-world",
  geography: "geography-world",
  histoire: "history",
  musique: "music",
  litterature: "arts-literature",
  literature: "arts-literature",
  "jeux-video": "video-games",
  technologie: "internet-social",
  technology: "internet-social",
  culture: "travel-vacation",
  "world-culture": "travel-vacation",
  "food-gastronomy": "world-food",
  "everyday-life": "everyday-life",
};

export function getQuestion(questionId: string | null): Question | null {
  if (!questionId) return null;
  return questions.find((question) => question.id === questionId) ?? null;
}

export function getTheme(themeId: string | null): Theme | null {
  if (!themeId) return null;
  const currentId = LEGACY_THEME_ALIASES[themeId] ?? themeId;
  return themes.find((theme) => theme.id === currentId) ?? null;
}
