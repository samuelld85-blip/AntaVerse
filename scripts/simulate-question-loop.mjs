import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadContentLibrary } from "./content-loader.mjs";

/**
 * Passe locale de jouabilité. Elle ne prétend pas remplacer des parties réelles :
 * les joueurs synthétiques rendent les contrôles éditoriaux reproductibles et
 * séparent explicitement le texte, le niveau et les réponses.
 */
const PROFILE_COUNT = 360;
const APPLIED_CHANGES = [
  ["medium-amphibiens-europe", "answers_only", "Remplace des espèces trop pointues par des noms communs de groupes, sans baisser la difficulté."],
  ["medium-neuf-premiers-need-for-speed", "rewrite_question", "Précise que les réponses attendues sont des jeux de la série."],
  ["easy-fast-saga-neuf-premiers", "rewrite_question", "Délimite la saga principale afin que les dérivés ne créent pas de litige."],
  ["new-rework-medium-aardman-neuf-longs", "rewrite_question", "Remplace le critère de production ambigu par le lien clair au studio."],
  ["new-rework-easy-mcu-neuf-premiers", "rewrite_question", "Ajoute la période correspondant au panel de neuf films."],
  ["new-histoire-grandes-epoques-moyen-2", "rewrite_question", "Aligne l’énoncé sur les voyages, expéditions et conquêtes présents dans les réponses."],
  ["new-histoire-grandes-epoques-moyen-4", "answers_only", "Conserve l’énoncé simple et remplace deux souverains hors périmètre par Néron et Hadrien."],
  ["medium-fondateurs-marques-tech", "rewrite_question", "Accepte explicitement les équipes fondatrices, présentes dans le panel."],
  ["new-voyage-vacances-moyen-1", "answers_only", "Retire le doublon fonctionnel du dépôt de bagage et ajoute le contrôle des passeports."],
  ["new-histoire-grandes-epoques-difficile-6", "answers_only", "Remplace le quasi-doublon transsaharien par la route de l’étain."],
].map(([questionId, action, reason]) => ({ questionId, action, reason }));
const DIFFICULTY_TARGETS = {
  1: { minimum: 5.5, maximum: 7.5 },
  2: { minimum: 3.25, maximum: 5.75 },
  3: { minimum: 1.25, maximum: 3.75 },
};

const { questions } = await loadContentLibrary();
const profiles = Array.from({ length: PROFILE_COUNT }, (_, index) => profileFor(index));
const evaluations = questions
  .map((question) => evaluate(question, profiles))
  .sort((left, right) => left.questionId.localeCompare(right.questionId));
const actions = evaluations.reduce((totals, evaluation) => {
  totals[evaluation.action] = (totals[evaluation.action] ?? 0) + 1;
  return totals;
}, {});
const summary = {
  generatedAt: new Date().toISOString(),
  methodology: "simulation heuristique locale et déterministe ; ce ne sont pas des données de joueurs réels",
  simulatedGames: PROFILE_COUNT,
  questionCount: evaluations.length,
  weights: { answerQuality: 0.45, difficultyFit: 0.4, fun: 0.15 },
  actions,
  appliedChanges: APPLIED_CHANGES,
  averages: averageScores(evaluations),
  evaluations,
};

await mkdir(resolve("content", "reports"), { recursive: true });
await writeFile(
  resolve("content", "reports", "question-simulation.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
  "utf8",
);
await writeFile(
  resolve("content", "reports", "question-simulation.md"),
  renderMarkdown(summary),
  "utf8",
);

console.log(
  `${summary.questionCount} questions × ${summary.simulatedGames} profils · ` +
    `réponses ${summary.averages.answerQuality}/10 · difficulté ${summary.averages.difficultyFit}/10 · fun ${summary.averages.fun}/10`,
);
console.log(`Actions : ${Object.entries(actions).map(([name, count]) => `${name} ${count}`).join(", ")}`);
console.log(`Corrections éditoriales appliquées : ${APPLIED_CHANGES.length}`);

function profileFor(index) {
  // Suite déterministe, répartie entre joueurs débutants, habitués et experts.
  const unit = (salt) => ((index * 73 + salt * 37 + 19) % 101) / 100;
  return {
    recall: 0.48 + unit(1) * 0.62,
    toleranceForSpecificity: 0.35 + unit(2) * 0.65,
    interest: 0.45 + unit(3) * 0.55,
  };
}

function evaluate(question, profiles) {
  const answerComplexity = mean(question.answers.map(complexityOf));
  const simulatedAnswers = profiles.map((profile) =>
    Math.min(
      9,
      question.expectedAverageAnswers * profile.recall *
        (1 - answerComplexity * (1 - profile.toleranceForSpecificity) * 0.35),
    ),
  );
  const recoveredAverage = mean(simulatedAnswers);
  const target = DIFFICULTY_TARGETS[question.difficultyLevel];
  const distance = recoveredAverage < target.minimum
    ? target.minimum - recoveredAverage
    : Math.max(0, recoveredAverage - target.maximum);
  const difficultyFit = clamp10(10 - distance * 2.4);
  const answerQuality = clamp10(
    5.5 + question.answerSetHomogeneityScore / 25 - answerComplexity * 2.2,
  );
  // Le thème reste prioritaire : le fun n'annule jamais une question claire et bien calibrée.
  const fun = clamp10(6.4 + (question.popularityScore / 100) * 2 + mean(profiles.map((p) => p.interest)) * 0.8 - answerComplexity * 0.35);
  const overall = answerQuality * 0.45 + difficultyFit * 0.4 + fun * 0.15;
  const wordingIssue = /(?:selon |dans l’ordre|par ordre|jusqu’à|entre \d{4}|de \d{4})/iu.test(question.questionText);
  const action = answerQuality < 6
    ? "answers_only"
    : difficultyFit < 6
      ? "reclassify_difficulty"
      : wordingIssue && overall < 6.5
        ? "rewrite_question"
        : "keep";
  return {
    questionId: question.id,
    themeId: question.themeId,
    difficultyLevel: question.difficultyLevel,
    scores: {
      fun: round(fun),
      difficultyFit: round(difficultyFit),
      answerQuality: round(answerQuality),
      overall: round(overall),
    },
    simulatedAverageAnswers: round(recoveredAverage),
    action,
    reasons: reasonsFor({ answerComplexity, difficultyFit, answerQuality, wordingIssue, target }),
  };
}

function complexityOf(answer) {
  const value = answer.display;
  const words = value.trim().split(/\s+/u).length;
  return Math.min(1, (words - 1) * 0.16 + (/[\-’']/u.test(value) ? 0.08 : 0) + (value.length > 22 ? 0.12 : 0));
}

function reasonsFor({ answerComplexity, difficultyFit, answerQuality, wordingIssue, target }) {
  const reasons = [];
  if (answerComplexity >= 0.3) reasons.push("plusieurs réponses demandent un nom composé ou très précis");
  if (difficultyFit < 6) reasons.push(`moyenne simulée hors cible ${target.minimum}–${target.maximum}`);
  if (answerQuality < 6) reasons.push("ensemble de réponses peu homogène ou trop spécifique");
  if (wordingIssue) reasons.push("énoncé à contrainte de liste ou de chronologie");
  return reasons.length ? reasons : ["ensemble cohérent pour la simulation locale"];
}

function averageScores(evaluations) {
  return Object.fromEntries(
    ["fun", "difficultyFit", "answerQuality", "overall"].map((key) => [
      key,
      round(mean(evaluations.map((evaluation) => evaluation.scores[key]))),
    ]),
  );
}

function renderMarkdown(summary) {
  const flagged = summary.evaluations.filter((evaluation) => evaluation.action !== "keep");
  const lines = [
    "# Simulation locale de jouabilité",
    "",
    `Simulation déterministe de **${summary.questionCount} questions** auprès de **${summary.simulatedGames} profils synthétiques**.`,
    "",
    "Les notes ne sont pas des retours de vrais joueurs. Elles servent à prioriser la revue et à empêcher qu’un score de fun, volontairement peu pondéré, efface un problème de réponses ou de niveau.",
    "",
    "| Critère | Poids | Moyenne |",
    "| --- | ---: | ---: |",
    `| Réponses proposées | 45 % | ${summary.averages.answerQuality}/10 |`,
    `| Difficulté adaptée | 40 % | ${summary.averages.difficultyFit}/10 |`,
    `| Fun | 15 % | ${summary.averages.fun}/10 |`,
    "",
    `Décisions : ${Object.entries(summary.actions).map(([name, count]) => `\`${name}\` ${count}`).join(" · ")}.`,
    "",
    "## Corrections appliquées",
    "",
    ...summary.appliedChanges.map(
      (change) => `- **${change.questionId}** — \`${change.action}\` : ${change.reason}`,
    ),
    "",
    "## À revoir",
    "",
  ];
  if (!flagged.length) lines.push("Aucune fiche n’est sous les seuils automatiques.");
  for (const item of flagged) {
    lines.push(`- **${item.questionId}** — \`${item.action}\` : ${item.reasons.join(" ; ")}.`);
  }
  return `${lines.join("\n")}\n`;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function clamp10(value) {
  return Math.max(0, Math.min(10, value));
}
