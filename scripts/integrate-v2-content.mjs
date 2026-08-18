import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { computeAnswerSetFingerprint, normalizeAnswer } from "./content-fingerprint.mjs";
import { extraAnswersFor } from "../.codex-work/question-audit/v2-extra-answers.mjs";

const outputRoot = resolve(process.argv[2] ?? ".codex-work/v2-content-output/themes");
const selected = JSON.parse(
  await readFile(resolve(".codex-work/question-audit/final-selected.json"), "utf8"),
);

for (const question of selected) {
  if (question.id === "new-cinema-facile-5") {
    question.question = "Cite 9 films d’animation des studios Pixar.";
    question.answers = ["Toy Story", "Coco", "Ratatouille"];
  }
  if (question.id === "new-maison-objets-bricolage-facile-3") {
    question.question = "Cite 9 objets utilisés pour nettoyer la maison.";
    question.answers = ["aspirateur", "balai", "éponge"];
  }
  if (question.id === "new-sciences-inventions-facile-2") {
    question.question = "Cite 9 os du corps humain.";
    question.answers = ["crâne", "fémur", "tibia"];
  }
  if (question.id === "new-sport-facile-2") {
    question.question = "Cite 9 sports de précision.";
    question.answers = ["tir à l’arc", "golf", "pétanque"];
  }
}

const themeDefinitions = [
  ["geography-world", "Géographie, pays & monde", "Culture générale accessible", 7, "🌍", "Pays, villes, paysages et repères du monde"],
  ["history", "Histoire & grandes époques", "Culture générale accessible", 6, "🏛️", "Époques, civilisations et événements historiques accessibles"],
  ["science-inventions", "Sciences & inventions", "Culture générale accessible", 6, "🔬", "Découvertes, inventions et notions scientifiques familières"],
  ["nature-body", "Nature, animaux & corps humain", "Culture générale accessible", 6, "🐾", "Animaux, nature et fonctionnement du corps humain"],
  ["world-food", "Gastronomie du monde", "Culture générale accessible", 6, "🍽️", "Plats, produits, saveurs et traditions culinaires"],
  ["arts-literature", "Arts, littérature & patrimoine", "Culture générale accessible", 6, "🎨", "Œuvres, artistes, récits et patrimoine culturel"],
  ["economy-business", "Économie, entreprises & consommation", "Culture générale accessible", 6, "💼", "Entreprises, argent et mécanismes de consommation courants"],
  ["records-rankings", "Records, classements & faits marquants", "Culture générale accessible", 7, "🏆", "Records connus, grands classements et faits marquants"],
  ["music", "Musique", "Pop culture & loisirs", 6, "🎵", "Artistes, chansons, instruments et univers musicaux"],
  ["cinema", "Cinéma", "Pop culture & loisirs", 3, "🎬", "Films, personnages, sagas et métiers du cinéma"],
  ["television-series", "Séries & télévision", "Pop culture & loisirs", 3, "📺", "Séries, émissions et personnages du petit écran"],
  ["sport", "Sport", "Pop culture & loisirs", 4, "⚽", "Disciplines, compétitions, règles et figures sportives"],
  ["video-games", "Jeux vidéo", "Pop culture & loisirs", 2, "🎮", "Jeux, consoles, personnages et culture vidéoludique"],
  ["games-entertainment", "Jeux, jouets & divertissements", "Pop culture & loisirs", 2, "🎲", "Jeux de société, jouets et divertissements populaires"],
  ["celebrities", "Célébrités & personnalités", "Pop culture & loisirs", 3, "⭐", "Personnalités connues du spectacle, du web et du sport"],
  ["internet-social", "Internet, réseaux & tendances", "Pop culture & loisirs", 2, "📱", "Web, réseaux sociaux, usages et tendances numériques"],
  ["everyday-life", "Vie quotidienne", "Vie quotidienne & société", 6, "☀️", "Objets, habitudes et petites situations de tous les jours"],
  ["work-office", "Travail, études & vie de bureau", "Vie quotidienne & société", 3, "🗂️", "Bureau, études, métiers et vie professionnelle"],
  ["travel-vacation", "Voyage & vacances", "Vie quotidienne & société", 3, "✈️", "Départs, transports, hébergements et vacances"],
  ["home-diy", "Maison, objets & bricolage", "Vie quotidienne & société", 3, "🏠", "Pièces, objets domestiques, entretien et bricolage"],
  ["brands-shopping", "Marques, produits & shopping", "Vie quotidienne & société", 3, "🛍️", "Marques, achats, produits et habitudes de shopping"],
  ["fashion-beauty", "Mode, beauté & style", "Vie quotidienne & société", 2, "👗", "Vêtements, accessoires, beauté et styles"],
  ["party-alcohol", "Soirées, alcool & fête", "Vie quotidienne & société", 3, "🥂", "Fêtes, sorties, boissons et situations de soirée"],
  ["relationships-substances", "Sexe, relations & substances", "Vie quotidienne & société", 2, "💬", "Relations, santé sexuelle et réduction des risques"],
];

const subthemeTemplates = [
  ["essentials", "Les essentiels", "Références immédiatement associées au thème"],
  ["people", "Personnes & personnages", "Personnes réelles ou fictives liées au thème"],
  ["places", "Lieux & destinations", "Lieux, régions et espaces liés au thème"],
  ["objects", "Objets & produits", "Objets, produits et éléments concrets du thème"],
  ["situations", "Usages & situations", "Actions, habitudes et situations typiques du thème"],
];

const difficulty = {
  Facile: { level: 1, editorial: 25, specificity: 25, popularity: 88, recall: 25, homogeneity: 88, expected: 8 },
  Moyen: { level: 2, editorial: 55, specificity: 50, popularity: 72, recall: 55, homogeneity: 82, expected: 6 },
  Difficile: { level: 3, editorial: 80, specificity: 70, popularity: 60, recall: 78, homogeneity: 76, expected: 4 },
};

const reviewedAt = "2026-08-17T09:30:00.000Z";
const createdAt = "2026-08-17T09:30:00.000Z";
const themeByLabel = new Map(themeDefinitions.map((definition) => [definition[1], definition]));

function sourceFor(question) {
  if (question.category !== "Culture générale accessible") return null;
  if (!question.source) throw new Error(`Source documentaire absente : ${question.question}`);
  const url = new URL(question.source);
  const publisher = url.hostname.replace(/^www\./u, "");
  return {
    id: `source-${question.id}`,
    title: `Référence éditoriale — ${question.theme}`,
    publisher,
    url: question.source,
    accessedAt: reviewedAt,
    isPrimarySource: false,
  };
}

function shortTitle(questionText) {
  const title = questionText.replace(/^Cite 9 /u, "").replace(/\.$/u, "");
  return title.length <= 48 ? title : `${title.slice(0, 45).trimEnd()}…`;
}

const questions = selected.map((question, index) => {
  const definition = themeByLabel.get(question.theme);
  if (!definition) throw new Error(`Thème inconnu : ${question.theme}`);
  const [themeId] = definition;
  const metrics = difficulty[question.difficulty];
  const displays = question.fullAnswers ?? [...question.answers, ...(extraAnswersFor(question.question) ?? [])];
  if (displays.length !== 9 || new Set(displays.map(normalizeAnswer)).size !== 9) {
    throw new Error(`Panel invalide pour ${question.id}`);
  }
  const source = sourceFor(question);
  const answers = displays.map((display, answerIndex) => ({
    id: `${question.id}-answer-${answerIndex + 1}`,
    display,
    normalized: normalizeAnswer(display),
    aliases: [],
    abbreviations: [],
    alternativeSpellings: [],
    accentInsensitiveVariants: [],
    hyphenationVariants: [],
    displayOrder: answerIndex + 1,
    sources: source ? [source] : [],
  }));
  const subtheme = subthemeTemplates[index % subthemeTemplates.length][0];
  return {
    id: question.id,
    slug: question.id,
    language: "fr",
    themeId,
    subthemeIds: [`${themeId}:${subtheme}`],
    tags: [subtheme, question.difficulty.toLowerCase()],
    questionText: question.question,
    shortTitle: shortTitle(question.question),
    difficultyLevel: metrics.level,
    difficultyLabel: question.difficulty,
    editorialDifficultyScore: metrics.editorial,
    specificityScore: metrics.specificity,
    popularityScore: metrics.popularity,
    recallDifficultyScore: metrics.recall,
    answerSetHomogeneityScore: metrics.homogeneity,
    expectedAverageAnswers: metrics.expected,
    playCount: 0,
    difficultyConfidence: "medium",
    validationMode: source ? "documentary" : "editorial_panel",
    answers,
    explanation: source
      ? "Panel de neuf réponses correctes et accessibles, vérifié à partir de la référence indiquée."
      : "Panel éditorial de neuf réponses fréquentes et reconnaissables, conçu pour une manche rapide.",
    qualificationRule: source
      ? "Une réponse est retenue lorsqu’elle appartient clairement à la catégorie demandée."
      : "Les joueurs valident les formulations proches lorsque l’idée correspond clairement au panel.",
    timeSensitive: false,
    sources: source ? [source] : [],
    status: "published",
    reviewer: "Revue éditoriale V2",
    reviewedAt,
    answerSetFingerprint: computeAnswerSetFingerprint(answers),
    version: 2,
    createdAt,
    updatedAt: createdAt,
  };
});

const fingerprintCounts = new Map();
for (const question of questions) {
  fingerprintCounts.set(
    question.answerSetFingerprint,
    (fingerprintCounts.get(question.answerSetFingerprint) ?? 0) + 1,
  );
}
for (const question of questions) {
  if ((fingerprintCounts.get(question.answerSetFingerprint) ?? 0) > 1) {
    question.duplicateJustification =
      "Panel conservé car la formulation et l’angle de jeu diffèrent malgré des réponses proches.";
  }
}

await mkdir(outputRoot, { recursive: true });
for (const definition of themeDefinitions) {
  const [id, label, category, weight, icon, description] = definition;
  const themeRoot = resolve(outputRoot, id);
  await mkdir(themeRoot, { recursive: true });
  const theme = {
    id,
    label,
    description,
    icon,
    category,
    weight,
    subthemes: subthemeTemplates.map(([slug, subthemeLabel, subthemeDescription]) => ({
      id: `${id}:${slug}`,
      label: subthemeLabel,
      description: subthemeDescription,
    })),
    tags: subthemeTemplates.map(([slug]) => slug),
    contentVersion: "2026.08.17-v2",
  };
  await writeFile(resolve(themeRoot, "theme.json"), `${JSON.stringify(theme, null, 2)}\n`, "utf8");
  for (const [filename, level] of [["easy", 1], ["medium", 2], ["hard", 3]]) {
    const records = questions.filter(
      (question) => question.themeId === id && question.difficultyLevel === level,
    );
    await writeFile(
      resolve(themeRoot, `questions.${filename}.json`),
      `${JSON.stringify(records, null, 2)}\n`,
      "utf8",
    );
  }
}

const counts = Object.fromEntries(
  themeDefinitions.map(([id]) => [id, questions.filter((question) => question.themeId === id).length]),
);
if (themeDefinitions.length !== 24 || questions.length !== 480 || Object.values(counts).some((count) => count !== 20)) {
  throw new Error(`Couverture V2 invalide : ${JSON.stringify(counts)}`);
}
console.log(`Contenu V2 généré : ${questions.length} questions, ${themeDefinitions.length} thèmes, sortie ${outputRoot}.`);
