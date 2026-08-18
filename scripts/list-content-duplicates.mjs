import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadContentLibrary } from "./content-loader.mjs";
import { findContentDuplicates } from "./content-duplicates.mjs";

const { questions } = await loadContentLibrary();
const warnings = findContentDuplicates(questions);
await writeFile(
  resolve("content", "reports", "duplicate-warnings.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), warnings }, null, 2)}\n`,
  "utf8",
);
if (warnings.length === 0) console.log("Aucun doublon exact ou quasi identique détecté.");
else
  warnings.forEach((warning) => console.log(`${warning.type}: ${warning.questionIds.join(" / ")}`));
if (warnings.length > 0 && process.argv.includes("--fail")) process.exit(1);
