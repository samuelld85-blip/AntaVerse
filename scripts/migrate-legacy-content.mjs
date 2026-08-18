import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { computeAnswerSetFingerprint, normalizeAnswer } from "./content-fingerprint.mjs";
import { readUtf8Json } from "./text-encoding.mjs";

const themeAliases = {
  geographie: "geography",
  histoire: "history",
  cinema: "cinema",
  musique: "music",
  sport: "sport",
  science: "science",
  nature: "nature",
  litterature: "literature",
  "jeux-video": "video-games",
  technologie: "technology",
  france: "france",
  culture: "world-culture",
};

const explicitThemes = {
  "hard-muses-grecques": "mythology-legends",
  "hard-enneade-egyptienne": "mythology-legends",
  "hard-neuf-mondes-nordiques": "mythology-legends",
  "medium-thriller-neuf-titres": "music",
};

const subthemes = {
  geography: {
    voisin: "borders-territories",
    lusophone: "flags-languages",
    ile: "mountains-islands",
    default: "cities-regions",
  },
  history: { default: "leaders" },
  cinema: { oscar: "awards", nolan: "directors", saga: "sagas", default: "films" },
  music: { beethoven: "classical-music", thriller: "albums-songs", default: "artists-groups" },
  sport: { jo: "olympic-games", baseball: "team-sports", default: "olympic-games" },
  science: { element: "chemistry", default: "mathematics" },
  nature: { ile: "oceans", default: "natural-phenomena" },
  literature: {
    communaute: "characters",
    expanse: "novels",
    dante: "novels",
    default: "novels",
  },
  "video-games": { default: "franchises" },
  technology: { default: "operating-systems" },
  france: {
    lyon: "geography",
    departement: "geography",
    goncourt: "arts",
    default: "heritage",
  },
  "world-culture": { noel: "celebrations", default: "symbols" },
  "mythology-legends": {
    grec: "greek-mythology",
    nordique: "norse-mythology",
    egypt: "egyptian-mythology",
    default: "world-legends",
  },
};

const difficultyFiles = { 1: "easy", 2: "medium", 3: "hard" };
const difficultyLabels = { 1: "Facile", 2: "Moyen", 3: "Difficile" };
const difficultyMetadata = {
  1: {
    editorial: 30,
    specificity: 45,
    popularity: 80,
    recall: 30,
    expected: 6,
    confidence: "medium",
  },
  2: {
    editorial: 60,
    specificity: 65,
    popularity: 60,
    recall: 60,
    expected: 4,
    confidence: "medium",
  },
  3: {
    editorial: 85,
    specificity: 85,
    popularity: 35,
    recall: 85,
    expected: 2,
    confidence: "medium",
  },
};

const legacy = await readUtf8Json(
  resolve("src", "games", "quoi-de-9", "data", "questions.fr.json"),
);
const grouped = new Map();
for (const question of legacy) {
  const themeId = explicitThemes[question.id] ?? themeAliases[question.themeId];
  if (!themeId) throw new Error(`Thème sans migration : ${question.themeId}`);
  const subthemeId = chooseSubtheme(themeId, question.id);
  const difficulty = difficultyMetadata[question.difficultyLevel];
  const answers = question.answers.map((answer, index) => {
    const accentInsensitive = normalizeAnswer(answer.display);
    const hyphenation = answer.display.replace(/-/gu, " ");
    return {
      id: answer.id,
      display: answer.display.normalize("NFC"),
      normalized: normalizeAnswer(answer.normalized),
      aliases: [...new Set(answer.alternatives.map((value) => value.normalize("NFC")))],
      abbreviations: [],
      alternativeSpellings: [],
      accentInsensitiveVariants:
        accentInsensitive === answer.display.toLocaleLowerCase("fr") ? [] : [accentInsensitive],
      hyphenationVariants: hyphenation === answer.display ? [] : [hyphenation],
      displayOrder: index + 1,
      sources: [],
    };
  });
  const migrated = {
    id: question.id,
    slug: question.id,
    language: "fr",
    themeId,
    subthemeIds: [`${themeId}:${subthemeId}`],
    tags: [subthemeId],
    questionText: question.question.normalize("NFC"),
    shortTitle: question.teaser.normalize("NFC"),
    difficultyLevel: question.difficultyLevel,
    difficultyLabel: difficultyLabels[question.difficultyLevel],
    editorialDifficultyScore: difficulty.editorial,
    specificityScore: difficulty.specificity,
    popularityScore: difficulty.popularity,
    recallDifficultyScore: difficulty.recall,
    answerSetHomogeneityScore: 85,
    expectedAverageAnswers: difficulty.expected,
    playCount: 0,
    difficultyConfidence: difficulty.confidence,
    answers,
    explanation:
      "Fiche migrée du catalogue initial ; son périmètre factuel doit être confirmé par la revue éditoriale.",
    qualificationRule:
      "Les neuf réponses doivent toutes satisfaire exactement le périmètre explicite formulé dans la question.",
    exclusionNotes:
      "La revue doit confirmer qu’aucun dixième élément ne satisfait le même périmètre.",
    timeSensitive: false,
    sources: [],
    status: "needs_review",
    answerSetFingerprint: computeAnswerSetFingerprint(answers),
    version: question.version,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
  };
  const key = `${themeId}:${difficultyFiles[question.difficultyLevel]}`;
  grouped.set(key, [...(grouped.get(key) ?? []), migrated]);
}

if (!process.argv.includes("--write")) {
  console.log(`Migration prête : ${legacy.length} fiches marquées needs_review.`);
  process.exit(0);
}

for (const [key, questions] of grouped) {
  const [themeId, difficulty] = key.split(":");
  const path = resolve("content", "themes", themeId, `questions.${difficulty}.json`);
  await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
}
console.log(
  `Migration terminée : ${legacy.length} fiches needs_review réparties dans ${grouped.size} fichiers.`,
);

function chooseSubtheme(themeId, questionId) {
  const rules = subthemes[themeId];
  if (!rules) throw new Error(`Aucun sous-thème configuré pour ${themeId}`);
  for (const [needle, subthemeId] of Object.entries(rules)) {
    if (needle !== "default" && questionId.includes(needle)) return subthemeId;
  }
  return rules.default;
}
