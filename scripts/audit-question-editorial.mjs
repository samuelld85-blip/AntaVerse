import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const bundle = JSON.parse(
  await readFile(resolve("src", "games", "quoi-de-9", "generated", "content-bundle.json"), "utf8"),
);
const questions = bundle.questions ?? [];
const duplicateTexts = questions.filter(
  (question, index) =>
    questions.findIndex((candidate) => candidate.questionText === question.questionText) !== index,
);
const findings = {
  wrongAnswerCount: questions.filter((question) => question.answers.length !== 9),
  tooLong: questions.filter((question) => question.questionText.length > 100),
  clueLists: questions.filter((question) => (question.questionText.match(/,/gu) ?? []).length >= 4),
  tvQuizOpenings: questions.filter((question) =>
    /^(?:Quels?|Quelles?|Qui|Comment|Dans quels?|De quels?|Selon)\b/u.test(question.questionText),
  ),
  strayQuestionMarks: questions.filter((question) => question.questionText.endsWith("?")),
  duplicateTexts,
};

const averageLength = Math.round(
  questions.reduce((total, question) => total + question.questionText.length, 0) /
    Math.max(questions.length, 1),
);

console.log(`${questions.length} questions · longueur moyenne ${averageLength} caractères`);
for (const [label, entries] of Object.entries(findings)) {
  console.log(`${label}: ${entries.length}`);
  for (const question of entries.slice(0, 10)) {
    console.log(`  - ${question.id}: ${question.questionText}`);
  }
}

const blockingFindings = Object.fromEntries(
  Object.entries(findings).filter(([label]) => label !== "tooLong"),
);
if (Object.values(blockingFindings).some((entries) => entries.length > 0)) process.exitCode = 1;
