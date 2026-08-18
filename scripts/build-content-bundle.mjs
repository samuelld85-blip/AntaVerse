import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";
import { loadContentLibrary } from "./content-loader.mjs";
import { validateContentLibrary } from "./content-validation.mjs";

const result = validateContentLibrary(await loadContentLibrary(), { strictQuotas: false });
if (result.errors.length > 0) {
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
const published = result.published.sort((left, right) => left.id.localeCompare(right.id));
const version =
  result.themes
    .map((theme) => theme.contentVersion)
    .sort()
    .at(-1) ?? "0";
const playerThemes = result.themes
  .sort((left, right) => left.id.localeCompare(right.id))
  .map(({ id, label, description, icon, category, weight }) => ({
    id,
    label,
    description,
    icon,
    category,
    weight,
  }));
const playerQuestions = published.map((question) => ({
  id: question.id,
  themeId: question.themeId,
  subthemeIds: question.subthemeIds,
  questionText: question.questionText,
  shortTitle: question.shortTitle,
  difficultyLevel: question.difficultyLevel,
  difficultyLabel: question.difficultyLabel,
  language: question.language,
  status: question.status,
  version: question.version,
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
  answers: question.answers.map(({ id, display, normalized, displayOrder }) => ({
    id,
    display,
    normalized,
    displayOrder,
  })),
  bomb: {
    id: question.bomb.id,
    display: question.bomb.display,
    normalized: question.bomb.normalized,
    alternatives: [
      ...question.bomb.aliases,
      ...question.bomb.abbreviations,
      ...question.bomb.alternativeSpellings,
      ...question.bomb.accentInsensitiveVariants,
      ...question.bomb.hyphenationVariants,
    ],
    explanation: question.bomb.explanation,
  },
}));
const bundle = {
  schemaVersion: 1,
  contentVersion: version,
  language: "fr",
  themes: playerThemes,
  questions: playerQuestions,
};
const reviewBundle = {
  schemaVersion: 1,
  contentVersion: version,
  language: "fr",
  themes: result.themes.sort((left, right) => left.id.localeCompare(right.id)),
  questions: result.questions.sort((left, right) => left.id.localeCompare(right.id)),
  duplicateWarnings: result.duplicateWarnings,
};
await mkdir(resolve("src", "games", "quoi-de-9", "generated"), { recursive: true });
await writeWithRetry(
  resolve("src", "games", "quoi-de-9", "generated", "content-bundle.json"),
  await format(JSON.stringify(bundle), { parser: "json", printWidth: 100 }),
);
await writeWithRetry(
  resolve("src", "games", "quoi-de-9", "generated", "content-review-bundle.json"),
  await format(JSON.stringify(reviewBundle), { parser: "json", printWidth: 100 }),
);
console.log(
  `Bundle hors ligne généré : ${published.length} question(s) publiée(s), version ${version}.`,
);

async function writeWithRetry(path, content) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await writeFile(path, content, "utf8");
      return;
    } catch (error) {
      if (attempt === 3 || error?.code !== "UNKNOWN") throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 250));
    }
  }
}
