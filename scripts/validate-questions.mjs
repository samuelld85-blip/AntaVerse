import { resolve } from "node:path";
import { validateCatalogue } from "./content-schema.mjs";
import { readUtf8Json } from "./text-encoding.mjs";

const questionsPath = resolve(process.argv[2] ?? "src/games/quoi-de-9/data/questions.fr.json");
const themesPath = resolve("src/games/quoi-de-9/data/themes.fr.json");
const [questions, themes] = await Promise.all([
  readUtf8Json(questionsPath),
  readUtf8Json(themesPath),
]);

const validated = validateCatalogue(questions, themes);
const published = validated.filter((question) => question.status === "published");
console.log(
  `Catalogue valide : ${published.length} questions publiées, ${themes.length} thèmes, ${published.length * 9} réponses.`,
);
