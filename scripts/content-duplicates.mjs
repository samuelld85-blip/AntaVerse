import { normalizeQuestionText, tokenSimilarity } from "./content-fingerprint.mjs";

export function findContentDuplicates(questions) {
  const warnings = [];
  for (let leftIndex = 0; leftIndex < questions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < questions.length; rightIndex += 1) {
      const left = questions[leftIndex];
      const right = questions[rightIndex];
      if (left.id === right.id) continue;
      if (left.answerSetFingerprint === right.answerSetFingerprint) {
        warnings.push({ type: "answer-set", questionIds: [left.id, right.id], score: 1 });
      }
      const leftText = normalizeQuestionText(left.questionText);
      const rightText = normalizeQuestionText(right.questionText);
      if (leftText === rightText) {
        warnings.push({ type: "identical-text", questionIds: [left.id, right.id], score: 1 });
        continue;
      }
      if (
        normalizeQuestionText(left.questionText, { removeDates: true }) ===
        normalizeQuestionText(right.questionText, { removeDates: true })
      ) {
        warnings.push({ type: "date-variant", questionIds: [left.id, right.id], score: 1 });
        continue;
      }
      const similarity = tokenSimilarity(left.questionText, right.questionText);
      if (similarity >= 0.82) {
        warnings.push({ type: "near-text", questionIds: [left.id, right.id], score: similarity });
      }
    }
  }
  return warnings;
}
