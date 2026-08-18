import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { readUtf8Json } from "./text-encoding.mjs";

export async function loadContentLibrary() {
  const root = resolve("content", "themes");
  const entries = await readdir(root, { withFileTypes: true });
  const themeDirectories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const themes = [];
  const questions = [];
  for (const directory of themeDirectories) {
    const base = resolve(root, directory);
    const theme = await readUtf8Json(resolve(base, "theme.json"));
    themes.push(theme);
    for (const difficulty of ["easy", "medium", "hard"]) {
      const records = await readUtf8Json(resolve(base, `questions.${difficulty}.json`));
      questions.push(...records);
    }
  }
  return { themes, questions };
}
