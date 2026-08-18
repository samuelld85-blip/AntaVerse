import { loadContentLibrary } from "./content-loader.mjs";
import { validateContentLibrary } from "./content-validation.mjs";

const strictQuotas = !process.argv.includes("--allow-gaps");
const result = validateContentLibrary(await loadContentLibrary(), { strictQuotas });
if (result.errors.length > 0) {
  console.error(`Validation éditoriale échouée (${result.errors.length} erreur(s)) :`);
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(
  `Bibliothèque valide : ${result.themes.length} thèmes, ${result.questions.length} fiches, ${result.published.length} publiées.`,
);
