import { readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { computeAnswerSetFingerprint, normalizeAnswer } from "./content-fingerprint.mjs";
import { loadContentLibrary } from "./content-loader.mjs";
import { DIFFICULTY_LABELS, quizQuestionSchema } from "./content-model.mjs";
import { polishQuestionText } from "./question-editorial.mjs";

const REVIEWED_AT = "2026-07-13T21:00:00.000Z";
const REVIEWER = "Revue documentaire Codex";
const writeChanges = process.argv.includes("--write");
const library = await loadContentLibrary();
const themes = new Map(library.themes.map((theme) => [theme.id, theme]));
const packDirectory = resolve("content", "packs");
const packFiles = (await readdir(packDirectory))
  .filter((filename) => filename.endsWith(".mjs"))
  .sort();
const generated = [];
const obsoleteQuestionIds = new Set();
const difficultyOverrides = new Map();

for (const filename of packFiles) {
  const packModule = await import(
    `${pathToFileURL(resolve(packDirectory, filename)).href}?v=${Date.now()}`
  );
  for (const spec of packModule.questions ?? []) generated.push(questionFromSpec(spec, filename));
  for (const id of packModule.obsoleteQuestionIds ?? []) obsoleteQuestionIds.add(id);
  for (const [id, level] of Object.entries(packModule.difficultyOverrides ?? {})) {
    difficultyOverrides.set(id, level);
  }
}

const activeGenerated = generated
  .filter((question) => !obsoleteQuestionIds.has(question.id))
  .map((question) => {
    const difficultyLevel = difficultyOverrides.get(question.id);
    if (!difficultyLevel || difficultyLevel === question.difficultyLevel) return question;
    return {
      ...question,
      difficultyLevel,
      difficultyLabel: DIFFICULTY_LABELS[difficultyLevel],
    };
  });
const generatedIds = activeGenerated.map((question) => question.id);
if (new Set(generatedIds).size !== generatedIds.length) {
  throw new Error("Deux fiches de packs utilisent le même identifiant.");
}

const parsedGenerated = activeGenerated.map((question, index) => {
  const parsed = quizQuestionSchema.safeParse(question);
  if (parsed.success) return parsed.data;
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "$"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Pack ${index + 1} (${question.id}) invalide :\n${details}`);
});

const generatedById = new Map(parsedGenerated.map((question) => [question.id, question]));
const merged = [
  ...library.questions
    .filter((question) => !generatedById.has(question.id) && !obsoleteQuestionIds.has(question.id))
    .map((question) => ({
      ...question,
      questionText: polishQuestionText(question.id, question.questionText),
    })),
  ...parsedGenerated,
];

if (writeChanges) {
  for (const theme of library.themes) {
    for (const [difficultyLevel, filename] of [
      [1, "questions.easy.json"],
      [2, "questions.medium.json"],
      [3, "questions.hard.json"],
    ]) {
      const questions = merged
        .filter(
          (question) =>
            question.themeId === theme.id && question.difficultyLevel === difficultyLevel,
        )
        .sort((left, right) => left.id.localeCompare(right.id));
      await writeFile(
        resolve("content", "themes", theme.id, filename),
        `${JSON.stringify(questions, null, 2)}\n`,
        "utf8",
      );
    }
  }
}

console.log(
  `${parsedGenerated.length} fiche(s) de packs validée(s)${writeChanges ? " et intégrée(s)" : " (simulation)"}.`,
);

function questionFromSpec(spec, filename) {
  const theme = themes.get(spec.themeId);
  if (!theme) throw new Error(`${filename}: thème inconnu ${spec.themeId}`);
  const subthemeId = spec.subthemeId;
  if (!theme.subthemes.some((subtheme) => subtheme.id === subthemeId)) {
    throw new Error(`${filename}: sous-thème inconnu ${subthemeId}`);
  }
  if (!Array.isArray(spec.answers) || spec.answers.length !== 9) {
    throw new Error(`${filename}: ${spec.id} doit définir neuf réponses.`);
  }
  if (!Array.isArray(spec.sources) || spec.sources.length === 0) {
    throw new Error(`${filename}: ${spec.id} doit définir au moins une source.`);
  }
  const sources = spec.sources.map((source, index) => ({
    id: source.id ?? `${spec.id}-source-${index + 1}`,
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    accessedAt: REVIEWED_AT,
    ...(source.publishedAt ? { publishedAt: source.publishedAt } : {}),
    isPrimarySource: source.isPrimarySource ?? true,
    ...(source.notes ? { notes: source.notes } : {}),
  }));
  const answers = spec.answers.map((rawAnswer, index) => {
    const answer = typeof rawAnswer === "string" ? { display: rawAnswer } : rawAnswer;
    const normalized = normalizeAnswer(answer.display);
    const accentVariant = answer.display.normalize("NFD").replace(/\p{M}+/gu, "");
    return {
      id: `${spec.id}-answer-${index + 1}`,
      display: answer.display,
      normalized,
      aliases: answer.aliases ?? [],
      abbreviations: answer.abbreviations ?? [],
      alternativeSpellings: answer.alternativeSpellings ?? [],
      accentInsensitiveVariants:
        accentVariant !== answer.display ? [normalizeAnswer(answer.display)] : [],
      hyphenationVariants: answer.hyphenationVariants ?? [],
      ...(answer.originalName ? { originalName: answer.originalName } : {}),
      ...(answer.explanation ? { explanation: answer.explanation } : {}),
      displayOrder: index + 1,
      sources,
      ...(answer.sensitivityNote ? { sensitivityNote: answer.sensitivityNote } : {}),
    };
  });
  const difficulty = {
    1: { editorial: 30, specificity: 42, popularity: 82, recall: 30, expected: 6 },
    2: { editorial: 60, specificity: 65, popularity: 58, recall: 60, expected: 4 },
    3: { editorial: 85, specificity: 86, popularity: 32, recall: 85, expected: 2 },
  }[spec.difficultyLevel];
  if (!difficulty) throw new Error(`${filename}: difficulté invalide pour ${spec.id}`);
  const question = {
    id: spec.id,
    slug: spec.id,
    language: "fr",
    themeId: spec.themeId,
    subthemeIds: [subthemeId],
    tags: spec.tags ?? [subthemeId.split(":")[1]],
    questionText: polishQuestionText(spec.id, spec.questionText),
    shortTitle: spec.shortTitle,
    difficultyLevel: spec.difficultyLevel,
    difficultyLabel: DIFFICULTY_LABELS[spec.difficultyLevel],
    editorialDifficultyScore: spec.editorialDifficultyScore ?? difficulty.editorial,
    specificityScore: spec.specificityScore ?? difficulty.specificity,
    popularityScore: spec.popularityScore ?? difficulty.popularity,
    recallDifficultyScore: spec.recallDifficultyScore ?? difficulty.recall,
    answerSetHomogeneityScore: spec.answerSetHomogeneityScore ?? 88,
    expectedAverageAnswers: spec.expectedAverageAnswers ?? difficulty.expected,
    playCount: 0,
    difficultyConfidence: spec.difficultyConfidence ?? "medium",
    answers,
    explanation: spec.explanation,
    qualificationRule: spec.qualificationRule,
    ...(spec.exclusionNotes ? { exclusionNotes: spec.exclusionNotes } : {}),
    ...(spec.referenceDate ? { referenceDate: spec.referenceDate } : {}),
    timeSensitive: spec.timeSensitive ?? false,
    ...(spec.recommendedReviewAt ? { recommendedReviewAt: spec.recommendedReviewAt } : {}),
    sources,
    status: "published",
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
    answerSetFingerprint: computeAnswerSetFingerprint(answers),
    version: 1,
    createdAt: REVIEWED_AT,
    updatedAt: REVIEWED_AT,
  };
  return question;
}
