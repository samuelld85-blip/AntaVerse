import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadContentLibrary } from "./content-loader.mjs";

const { themes, questions } = await loadContentLibrary();
const awaiting = questions
  .filter((question) => ["draft", "needs_review"].includes(question.status))
  .sort(
    (left, right) => left.themeId.localeCompare(right.themeId) || left.id.localeCompare(right.id),
  );
const themeLabels = Object.fromEntries(themes.map((theme) => [theme.id, theme.label]));
const lines = awaiting.map((question) => {
  const missing = [];
  if (question.sources.length === 0) missing.push("source");
  if (!question.reviewer) missing.push("relecteur");
  if (!question.reviewedAt) missing.push("date de revue");
  return `- [ ] **${question.id}** — ${question.questionText} (${question.difficultyLabel}) — manque : ${missing.join(", ") || "revue finale"}`;
});
const grouped = themes
  .map((theme) => {
    const themeLines = lines.filter((_, index) => awaiting[index]?.themeId === theme.id);
    return themeLines.length > 0 ? `## ${themeLabels[theme.id]}\n\n${themeLines.join("\n")}` : "";
  })
  .filter(Boolean)
  .join("\n\n");
const output = `# File de revue éditoriale\n\n${awaiting.length} fiche(s) attendent une revue humaine et documentaire.\n\n${grouped}\n`;
await writeFile(resolve("content", "reports", "needs-review.md"), output, "utf8");
console.log(`File de revue générée : ${awaiting.length} fiche(s).`);
