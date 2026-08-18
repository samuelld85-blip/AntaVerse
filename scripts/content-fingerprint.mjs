import { createHash } from "node:crypto";

export function normalizeAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("fr")
    .replace(/[’']/gu, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

export function normalizeQuestionText(value, { removeDates = false } = {}) {
  const normalized = normalizeAnswer(value);
  return removeDates ? normalized.replace(/\b(?:1[0-9]{3}|20[0-9]{2})\b/gu, "#date") : normalized;
}

export function computeAnswerSetFingerprint(answers) {
  const canonical = answers
    .map((answer) => normalizeAnswer(answer.normalized ?? answer.display))
    .sort();
  return createHash("sha256").update(canonical.join("\u001f"), "utf8").digest("hex");
}

export function tokenSimilarity(left, right) {
  const leftTokens = new Set(normalizeQuestionText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeQuestionText(right).split(" ").filter(Boolean));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 1 : intersection / union;
}
