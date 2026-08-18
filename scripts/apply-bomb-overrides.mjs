import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";
import { normalizeAnswer } from "./content-fingerprint.mjs";

const overrides = JSON.parse(await readFile(resolve("content", "bomb-overrides.json"), "utf8"));
const themesRoot = resolve("content", "themes");
let applied = 0;

for (const directory of await readdir(themesRoot, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  for (const difficulty of ["easy", "medium", "hard"]) {
    const questionPath = resolve(themesRoot, directory.name, `questions.${difficulty}.json`);
    const questions = JSON.parse(await readFile(questionPath, "utf8"));
    let changed = false;

    for (const question of questions) {
      const override = overrides[question.id];
      if (!override) continue;
      const normalized = normalizeAnswer(override.display);
      const accepted = new Set(
        question.answers.map((answer) => normalizeAnswer(answer.normalized)),
      );
      if (accepted.has(normalized)) {
        throw new Error(`${question.id}: « ${override.display} » est une réponse acceptée.`);
      }
      question.bomb = {
        id: `${question.id}-bomb`,
        display: override.display,
        normalized,
        aliases: [],
        abbreviations: [],
        alternativeSpellings: [],
        accentInsensitiveVariants: [],
        hyphenationVariants: [],
        explanation: override.explanation,
      };
      changed = true;
      applied += 1;
    }

    if (changed) {
      await writeFile(
        questionPath,
        await format(JSON.stringify(questions), { parser: "json" }),
        "utf8",
      );
    }
  }
}

console.log(`${applied} bombe(s) éditoriale(s) appliquée(s).`);
