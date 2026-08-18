import { quizQuestionSchema, themeSchema, DIFFICULTY_LEVELS } from "./content-model.mjs";
import { findContentDuplicates } from "./content-duplicates.mjs";

export function validateContentLibrary(library, { strictQuotas = true } = {}) {
  const errors = [];
  const themes = [];
  const questions = [];
  for (const [index, rawTheme] of library.themes.entries()) {
    const parsed = themeSchema.safeParse(rawTheme);
    if (parsed.success) themes.push(parsed.data);
    else errors.push(...formatZodErrors(parsed.error, `themes[${index}]`));
  }
  for (const [index, rawQuestion] of library.questions.entries()) {
    const parsed = quizQuestionSchema.safeParse(rawQuestion);
    if (parsed.success) questions.push(parsed.data);
    else errors.push(...formatZodErrors(parsed.error, `questions[${index}]`));
  }

  const themeIds = new Set(themes.map((theme) => theme.id));
  const subthemeIds = new Set(
    themes.flatMap((theme) => theme.subthemes.map((subtheme) => subtheme.id)),
  );
  const uniqueChecks = [
    ["ID", questions.map((question) => question.id)],
    ["slug", questions.map((question) => question.slug)],
  ];
  for (const [label, values] of uniqueChecks) {
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
    if (duplicates.length > 0)
      errors.push(`${label} dupliqué : ${[...new Set(duplicates)].join(", ")}`);
  }
  for (const question of questions) {
    if (!themeIds.has(question.themeId))
      errors.push(`${question.id}: thème inconnu ${question.themeId}`);
    for (const subthemeId of question.subthemeIds) {
      if (!subthemeIds.has(subthemeId))
        errors.push(`${question.id}: sous-thème inconnu ${subthemeId}`);
      if (!subthemeId.startsWith(`${question.themeId}:`)) {
        errors.push(`${question.id}: le sous-thème ${subthemeId} appartient à un autre thème`);
      }
    }
  }

  const duplicateWarnings = findContentDuplicates(questions);
  for (const warning of duplicateWarnings.filter((warning) => warning.type === "answer-set")) {
    const collided = warning.questionIds.map((id) =>
      questions.find((question) => question.id === id),
    );
    if (collided.some((question) => !question?.duplicateJustification)) {
      errors.push(`Empreinte de réponses dupliquée : ${warning.questionIds.join(" / ")}`);
    }
  }

  const published = questions.filter((question) => question.status === "published");
  if (strictQuotas) {
    if (themes.length !== 24) errors.push(`24 thèmes requis, ${themes.length} trouvés`);
    if (published.length < 360)
      errors.push(`360 questions publiées requises, ${published.length} trouvées`);
    for (const theme of themes) {
      const themeQuestions = published.filter((question) => question.themeId === theme.id);
      if (themeQuestions.length < 15) {
        errors.push(
          `${theme.id}: 15 questions publiées requises, ${themeQuestions.length} trouvées`,
        );
      }
      const required = { 1: 5, 2: 5, 3: 5 };
      for (const level of DIFFICULTY_LEVELS) {
        const count = themeQuestions.filter(
          (question) => question.difficultyLevel === level,
        ).length;
        if (count < required[level]) {
          errors.push(
            `${theme.id}: niveau ${level}, minimum ${required[level]}, ${count} trouvé(s)`,
          );
        }
      }
    }
  }

  return { themes, questions, published, duplicateWarnings, errors };
}

function formatZodErrors(error, prefix) {
  return error.issues.map((issue) => `${prefix}.${issue.path.join(".")}: ${issue.message}`);
}
