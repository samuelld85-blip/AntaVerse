import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { questionCollectionSchema, validateCatalogue } from "./content-schema.mjs";
import { normalizeUnicode, readUtf8Json } from "./text-encoding.mjs";

const sourceArgument = process.argv.find(
  (argument) => !argument.startsWith("--") && argument.endsWith(".json"),
);
if (!sourceArgument) {
  console.error("Usage : npm run questions:import -- chemin/questions.json [--write]");
  process.exit(1);
}

const targetPath = resolve("src/games/quoi-de-9/data/questions.fr.json");
const themesPath = resolve("src/games/quoi-de-9/data/themes.fr.json");
const sourcePath = resolve(sourceArgument);
const [existing, incoming, themes] = await Promise.all([
  readUtf8Json(targetPath),
  readUtf8Json(sourcePath),
  readUtf8Json(themesPath),
]);

const candidates = questionCollectionSchema.parse(normalizeUnicode(incoming));
const incomingIds = new Set(candidates.map((question) => question.id));
const merged = [...existing.filter((question) => !incomingIds.has(question.id)), ...candidates];
validateCatalogue(merged, themes);

if (process.argv.includes("--write")) {
  await writeFile(targetPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`${candidates.length} question(s) importée(s). Lancez npm run format.`);
} else {
  console.log(
    `${candidates.length} question(s) validée(s). Ajoutez --write pour mettre à jour le catalogue.`,
  );
}
