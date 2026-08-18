import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { obsoleteQuestionIds } from "../content/packs/playability-pass.mjs";

const bundle = JSON.parse(
  await readFile(resolve("src", "games", "quoi-de-9", "generated", "content-bundle.json"), "utf8"),
);
const questions = bundle.questions ?? [];
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("fr");
const obsolete = new Set(obsoleteQuestionIds);

const findings = {
  obsoleteStillPublished: questions.filter((question) => obsolete.has(question.id)),
  episodeRecitation: questions.filter((question) =>
    /(?:cite (?:les )?9 episodes|titres? des episodes|chapitres? de)/u.test(
      normalize(question.questionText),
    ),
  ),
  yearByYear: questions.filter((question) =>
    /annee par annee/u.test(normalize(question.questionText)),
  ),
  arbitrarySelection: questions.filter((question) =>
    /(?:retenus ici|selection explicite|par ordre alphabetique|dans l.index)/u.test(
      normalize(question.questionText),
    ),
  ),
  specialistRegistry: questions.filter((question) =>
    /\b(?:rfc|iana|ipv4|posix)\b/u.test(normalize(question.questionText)),
  ),
  easyCatalog: questions.filter(
    (question) =>
      question.difficultyLevel === 1 &&
      /(?:annee par annee|par ordre|dans l.index|titres? des episodes)/u.test(
        normalize(question.questionText),
      ),
  ),
};

const distributionErrors = [];
for (const themeId of [...new Set(questions.map((question) => question.themeId))]) {
  const themeQuestions = questions.filter((question) => question.themeId === themeId);
  if (themeQuestions.length < 15)
    distributionErrors.push(`${themeId}: ${themeQuestions.length}/15`);
  for (const level of [1, 2, 3]) {
    const count = themeQuestions.filter((question) => question.difficultyLevel === level).length;
    if (count < 5) distributionErrors.push(`${themeId} niveau ${level}: ${count}/5`);
  }
}

console.log(
  `${questions.length} questions jouables · ${obsolete.size} anciennes questions exclues`,
);
for (const [label, entries] of Object.entries(findings)) {
  console.log(`${label}: ${entries.length}`);
  for (const question of entries.slice(0, 10)) {
    console.log(`  - ${question.id}: ${question.questionText}`);
  }
}
console.log(`distributionErrors: ${distributionErrors.length}`);
for (const error of distributionErrors) console.log(`  - ${error}`);

if (
  Object.values(findings).some((entries) => entries.length > 0) ||
  distributionErrors.length > 0
) {
  process.exitCode = 1;
}
