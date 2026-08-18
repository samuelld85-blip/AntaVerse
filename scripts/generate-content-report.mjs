import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";
import { loadContentLibrary } from "./content-loader.mjs";
import { validateContentLibrary } from "./content-validation.mjs";
import { CONTENT_STATUSES, DIFFICULTY_LEVELS } from "./content-model.mjs";

const result = validateContentLibrary(await loadContentLibrary(), { strictQuotas: false });
if (result.errors.length > 0) {
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const now = new Date();
const questions = result.questions;
const published = result.published;
const statusCounts = Object.fromEntries(
  CONTENT_STATUSES.map((status) => [
    status,
    questions.filter((question) => question.status === status).length,
  ]),
);
const difficultyCounts = Object.fromEntries(
  DIFFICULTY_LEVELS.map((level) => [
    level,
    published.filter((question) => question.difficultyLevel === level).length,
  ]),
);
const allSources = questions.flatMap((question) => question.sources);
const reviewedDates = questions
  .map((question) => question.reviewedAt)
  .filter(Boolean)
  .sort();
const dueForRevalidation = questions
  .filter(
    (question) =>
      question.recommendedReviewAt && Date.parse(question.recommendedReviewAt) <= now.getTime(),
  )
  .map((question) => question.id);

const themes = result.themes.map((theme) => {
  const records = questions.filter((question) => question.themeId === theme.id);
  const themePublished = records.filter((question) => question.status === "published");
  const byDifficulty = Object.fromEntries(
    DIFFICULTY_LEVELS.map((level) => [
      level,
      themePublished.filter((question) => question.difficultyLevel === level).length,
    ]),
  );
  const required = { 1: 7, 2: 7, 3: 6 };
  return {
    id: theme.id,
    label: theme.label,
    records: records.length,
    verified: records.filter((question) => question.status === "verified").length,
    published: themePublished.length,
    needsReview: records.filter((question) => question.status === "needs_review").length,
    byDifficulty,
    bySubtheme: Object.fromEntries(
      theme.subthemes.map((subtheme) => [
        subtheme.id,
        records.filter((question) => question.subthemeIds.includes(subtheme.id)).length,
      ]),
    ),
    gaps: {
      published: Math.max(0, 20 - themePublished.length),
      difficulty: Object.fromEntries(
        DIFFICULTY_LEVELS.map((level) => [
          level,
          Math.max(0, required[level] - byDifficulty[level]),
        ]),
      ),
    },
  };
});

const report = {
  generatedAt: now.toISOString(),
  schemaVersion: 1,
  totals: {
    themes: result.themes.length,
    records: questions.length,
    primaryAnswers: questions.length * 9,
    published: published.length,
    verified: statusCounts.verified,
    needsReview: statusCounts.needs_review,
    timeSensitive: questions.filter((question) => question.timeSensitive).length,
    withoutPrimarySource: questions.filter(
      (question) => !question.sources.some((source) => source.isPrimarySource),
    ).length,
    averageSourcesPerQuestion:
      questions.length === 0 ? 0 : Number((allSources.length / questions.length).toFixed(2)),
    oldestReviewDate: reviewedDates[0] ?? null,
    dueForRevalidation: dueForRevalidation.length,
    publishedGap: Math.max(0, 480 - published.length),
    recordGap: Math.max(0, 480 - questions.length),
  },
  statusCounts,
  publishedDifficultyCounts: difficultyCounts,
  duplicateWarnings: result.duplicateWarnings,
  dueForRevalidation,
  themes,
};

const outputDirectory = resolve("content", "reports");
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  resolve(outputDirectory, "content-quality-report.json"),
  await format(JSON.stringify(report), { parser: "json", printWidth: 100 }),
  "utf8",
);
await writeFile(
  resolve(outputDirectory, "content-quality-report.md"),
  await format(markdown(report), { parser: "markdown", printWidth: 100 }),
  "utf8",
);
console.log(
  `Rapport généré : ${report.totals.records} fiches, ${report.totals.published} publiées, écart de publication ${report.totals.publishedGap}.`,
);

function markdown(data) {
  const rows = data.themes
    .map(
      (theme) =>
        `| ${theme.label} | ${theme.records} | ${theme.published} | ${theme.needsReview} | ${theme.byDifficulty[1]}/${theme.byDifficulty[2]}/${theme.byDifficulty[3]} | ${theme.gaps.published} |`,
    )
    .join("\n");
  return `# Rapport qualité de la bibliothèque\n\nGénéré le ${data.generatedAt}.\n\n## Synthèse\n\n- Thèmes : ${data.totals.themes}/24\n- Fiches structurées : ${data.totals.records}/480\n- Questions publiées : ${data.totals.published}/480\n- Questions vérifiées non publiées : ${data.totals.verified}\n- Questions en attente de revue : ${data.totals.needsReview}\n- Réponses primaires structurées : ${data.totals.primaryAnswers}\n- Fiches sans source primaire : ${data.totals.withoutPrimarySource}\n- Sources moyennes par fiche : ${data.totals.averageSourcesPerQuestion}\n- Avertissements de doublon : ${data.duplicateWarnings.length}\n- Fiches à revalider : ${data.totals.dueForRevalidation}\n\n> La validation structurelle ne constitue ni une vérification humaine ni une publication. Le quota de lancement reste bloquant tant que les écarts ci-dessous ne sont pas résolus.\n\n## Couverture par thème\n\n| Thème | Fiches | Publiées | À revoir | Facile/Moyen/Difficile publiées | Manque pour 20 |\n|---|---:|---:|---:|---:|---:|\n${rows}\n\n## Statuts\n\n${Object.entries(
    data.statusCounts,
  )
    .map(([status, count]) => `- ${status} : ${count}`)
    .join("\n")}\n`;
}
