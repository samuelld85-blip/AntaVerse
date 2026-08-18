import { writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { loadContentLibrary } from "./content-loader.mjs";
import { readUtf8Json } from "./text-encoding.mjs";

const REVIEWED_AT = "2026-07-13T19:30:00.000Z";
const REVIEWER = "Revue documentaire Codex";

function source(id, title, publisher, url, isPrimarySource = true) {
  return { id, title, publisher, url, accessedAt: REVIEWED_AT, isPrimarySource };
}

const SOURCES = {
  germany: source(
    "federal-germany-neighbours",
    "Germany and its neighbouring countries",
    "Gouvernement fédéral allemand",
    "https://www.make-it-in-germany.com/en/living-in-germany/discover-germany/german-states",
  ),
  cplp: source(
    "cplp-member-states",
    "Estados-Membros",
    "Communauté des pays de langue portugaise",
    "https://www.cplp.org/estados-membros/",
  ),
  sriLanka: source(
    "sri-lanka-census-2024",
    "Census of Population and Housing 2024 — Preliminary Report",
    "Department of Census and Statistics, Sri Lanka",
    "https://www.statistics.gov.lk/Resource/en/Population/CPH_2024/Preliminary_Report.pdf",
  ),
  starWars: source(
    "star-wars-films",
    "Star Wars Films",
    "Lucasfilm",
    "https://www.starwars.com/films/",
  ),
  oscars: source(
    "oscars-ceremony-archive",
    "Academy Awards ceremony archive",
    "Academy of Motion Picture Arts and Sciences",
    "https://www.oscars.org/oscars/ceremonies",
  ),
  nolan: source(
    "bfi-christopher-nolan",
    "Where to begin with Christopher Nolan",
    "British Film Institute",
    "https://www.bfi.org.uk/features/where-begin-with-christopher-nolan",
    false,
  ),
  taylorSwift: source(
    "taylor-swift-archive",
    "The Swiftie Archive",
    "Taylor Swift",
    "https://www.taylorswift.com/swiftiearchive/",
  ),
  wuTang: source(
    "grammy-wu-tang-members",
    "A guide to the Wu-Tang Clan",
    "Recording Academy",
    "https://qa.grammy.com/news/wu-tang-clan-guide-eras-albums-singles-affiliates-members",
    false,
  ),
  baseball: source(
    "mlb-field-positions",
    "The field and positions",
    "Major League Baseball",
    "https://www.mlb.com/official-information/basics/field",
  ),
  olympicHosts: source(
    "ioc-olympic-hosts",
    "Olympic Games host cities",
    "Comité international olympique",
    "https://library.olympics.com/default/basicfilesdownload.ashx?itemId=321460",
  ),
  athens1896: source(
    "ioc-athens-1896-facts",
    "Factsheet — The Games of the Olympiad",
    "Comité international olympique",
    "https://library.olympics.com/digitalCollection/DigitalCollectionAttachmentDownloadHandler.ashx?documentId=3703315&parentDocumentId=172552&skipCopyright=true&skipWatermark=true",
  ),
  cnedMaths: source(
    "cned-table-nine",
    "Mathématiques — la table de 9",
    "Ministère de l’Éducation nationale — CNED",
    "https://cache.media.eduscol.education.fr/file/FLS/71/3/MAN_2_-_S07_249713.pdf",
  ),
  iupac: source(
    "iupac-periodic-table",
    "Periodic Table of Elements",
    "International Union of Pure and Applied Chemistry",
    "https://iupac.org/what-we-do/periodic-table-of-elements/",
  ),
  nasaPluto: source(
    "nasa-pluto-facts",
    "Pluto Facts",
    "NASA",
    "https://science.nasa.gov/dwarf-planets/pluto/facts/",
  ),
  iauPlanets: source(
    "iau-planet-definition",
    "Frequently Asked Questions — planets and Pluto",
    "Union astronomique internationale",
    "https://www.iau.org/Iau/Iau/Science/What-we-do/FAQs.aspx",
  ),
  capeVerde: source(
    "cape-verde-climate-report",
    "Cabo Verde Biennial Update Report",
    "Gouvernement du Cap-Vert",
    "https://portaldoclima.gov.cv/wp-content/uploads/2024/06/BUR_EN_Digital.pdf",
  ),
  azores: source(
    "azores-islands",
    "Explore the Azores",
    "Tourisme des Açores",
    "https://www.visitazores.com/en/explore?category=places-to-visit",
  ),
  fellowship: source(
    "publisher-fellowship-guide",
    "Teacher’s Guide — The Fellowship of the Ring",
    "Penguin Random House",
    "https://images.penguinrandomhouse.com/teachers_guides/9780345339706.pdf",
  ),
  expanse: source(
    "hachette-expanse-series",
    "The Expanse series",
    "Hachette Book Group — Orbit",
    "https://www.hachettebookgroup.com/series/james-s-a-corey/the-expanse/",
  ),
  dante: source(
    "princeton-dante-inferno",
    "The Princeton Dante Project — Inferno",
    "Université de Princeton",
    "https://dante.princeton.edu/cgi-bin/dante/DispToynbeeByTitOrId.pl?INP_ID=212216&SMALL=0",
    false,
  ),
  appleVersions: source(
    "apple-macos-versions",
    "Find out which macOS your Mac is using",
    "Apple",
    "https://support.apple.com/en-us/109033",
  ),
  androidVersions: source(
    "android-version-codes",
    "Build.VERSION_CODES",
    "Android Developers",
    "https://developer.android.com/reference/android/os/Build.VERSION_CODES.html",
  ),
  lyon: source(
    "lyon-arrondissements",
    "Les maires et élus d’arrondissement",
    "Ville de Lyon",
    "https://www.lyon.fr/actions-et-projets/le-maire-et-les-elus/les-maires-et-elus-darrondissement",
  ),
  insee: source(
    "insee-cog-2026",
    "Code officiel géographique au 1er janvier 2026",
    "Insee",
    "https://www.insee.fr/fr/information/8740222",
  ),
  goncourt: source(
    "goncourt-laureates",
    "Tous les lauréats du prix Goncourt",
    "Académie Goncourt",
    "https://www.academiegoncourt.com/tous-les-laureats-prix-goncourt",
  ),
};

function review(sourceReferences, explanation, qualificationRule, extra = {}) {
  return { sourceReferences, explanation, qualificationRule, ...extra };
}

const REVIEWS = {
  "easy-voisins-allemagne": review(
    [SOURCES.germany],
    "L’Allemagne partage une frontière terrestre avec neuf États européens.",
    "Un État est retenu si le portail fédéral allemand le présente comme pays voisin terrestre.",
    { exclusionNotes: "Les frontières maritimes ne sont pas prises en compte." },
  ),
  "medium-pays-lusophones": review(
    [SOURCES.cplp],
    "La CPLP réunit les neuf États souverains indiqués dans sa liste institutionnelle.",
    "Seuls les États membres figurant sur la page officielle de la CPLP sont admis.",
  ),
  "hard-provinces-sri-lanka": review(
    [SOURCES.sriLanka],
    "Le découpage administratif du Sri Lanka comprend neuf provinces.",
    "Sont retenues les provinces du tableau territorial du recensement national de 2024.",
  ),
  "easy-saga-skywalker": review(
    [SOURCES.starWars],
    "La saga Skywalker correspond aux épisodes numérotés I à IX de Star Wars.",
    "Le titre français principal de chacun des neuf épisodes numérotés est accepté.",
    { exclusionNotes: "Les films dérivés, séries et productions d’animation sont exclus." },
  ),
  "medium-oscar-films-2016-2024": review(
    [SOURCES.oscars],
    "Chaque réponse est le lauréat de la catégorie Best Picture lors d’une cérémonie de 2016 à 2024.",
    "La période désigne les neuf cérémonies des Oscars de 2016 à 2024 incluses, et non l’année de sortie.",
    {
      questionText:
        "Lors des neuf cérémonies des Oscars de 2016 à 2024 incluses, quels films ont remporté l’Oscar du meilleur film ?",
      exclusionNotes: "Les autres catégories et les films seulement nommés sont exclus.",
    },
  ),
  "hard-nolan-neuf-films": review(
    [SOURCES.nolan],
    "La filmographie de Christopher Nolan va de Following à Interstellar pour ce groupe de neuf longs-métrages.",
    "Sont comptés les neuf premiers longs-métrages réalisés par Nolan, dans leur ordre de sortie.",
    {
      exclusionNotes:
        "Les courts-métrages, crédits de production seuls et films postérieurs sont exclus.",
    },
  ),
  "easy-taylor-neuf-albums": review(
    [SOURCES.taylorSwift],
    "Evermore clôt la suite des neuf premiers albums studio originaux de Taylor Swift.",
    "Sont comptés les albums studio originaux, de Taylor Swift à Evermore, dans l’ordre de parution.",
    {
      exclusionNotes:
        "Les réenregistrements Taylor’s Version, albums live, EP et compilations sont exclus.",
    },
  ),
  "medium-wu-tang": review(
    [SOURCES.wuTang],
    "Le noyau originel du Wu-Tang Clan est constitué des neuf artistes listés.",
    "Sont retenus les neuf membres originels présentés ensemble par la Recording Academy.",
    {
      questionText: "Quels sont les neuf membres originels du Wu-Tang Clan ?",
      exclusionNotes:
        "Cappadonna, associé puis membre du groupe, n’appartient pas au noyau originel de neuf.",
    },
  ),
  "easy-positions-baseball": review(
    [SOURCES.baseball],
    "Une défense de baseball place neuf joueurs aux neuf positions conventionnelles du terrain.",
    "Chaque réponse doit correspondre à l’une des neuf positions défensives définies par la MLB.",
  ),
  "medium-villes-jo-ete": review(
    [SOURCES.olympicHosts],
    "Neuf éditions des Jeux olympiques d’été se succèdent de Barcelone 1992 à Paris 2024.",
    "La réponse attend la ville hôte officielle de chaque édition d’été de 1992 à 2024 incluses.",
    {
      questionText: "Quelles villes ont accueilli les neuf éditions des JO d’été de 1992 à 2024 ?",
      exclusionNotes:
        "Tokyo reste associé à l’édition 2020, même si les épreuves ont eu lieu en 2021.",
    },
  ),
  "hard-sports-jo-1896": review(
    [SOURCES.athens1896],
    "Le programme des Jeux d’Athènes 1896 était réparti entre neuf sports.",
    "Les disciplines sont regroupées selon les neuf sports reconnus dans la fiche historique du CIO.",
  ),
  "easy-table-neuf": review(
    [SOURCES.cnedMaths],
    "Les neuf produits demandés suivent la table de multiplication par neuf de 9 à 81.",
    "Chaque réponse est le produit exact de 9 par un entier compris entre 1 et 9 inclus.",
  ),
  "medium-elements-un-neuf": review(
    [SOURCES.iupac],
    "Les numéros atomiques 1 à 9 vont de l’hydrogène au fluor dans le tableau périodique.",
    "Sont retenus les noms français usuels des éléments dont le numéro atomique est compris entre 1 et 9.",
  ),
  "hard-elements-91-99": review(
    [SOURCES.iupac],
    "Les numéros atomiques 91 à 99 forment cette suite de neuf éléments lourds.",
    "Sont retenus les noms français usuels des éléments dont le numéro atomique est compris entre 91 et 99.",
  ),
  "easy-neuf-planetes-historiques": review(
    [SOURCES.nasaPluto, SOURCES.iauPlanets],
    "Avant la définition adoptée en 2006, Pluton complétait la liste scolaire des neuf planètes.",
    "La réponse suit l’ancienne liste des planètes, avant le classement de Pluton comme planète naine en 2006.",
    { exclusionNotes: "Le statut scientifique actuel de Pluton reste celui d’une planète naine." },
  ),
  "medium-iles-cap-vert-habitees": review(
    [SOURCES.capeVerde],
    "Le Cap-Vert compte dix îles principales, dont neuf sont habitées.",
    "Seules les neuf îles explicitement indiquées comme habitées dans le rapport national sont retenues.",
    { exclusionNotes: "Santa Luzia, inhabitée, est exclue." },
  ),
  "hard-iles-acores": review(
    [SOURCES.azores],
    "L’archipel autonome des Açores est composé de neuf îles principales.",
    "Sont retenues les neuf îles présentées par le portail touristique officiel des Açores.",
  ),
  "easy-communaute-anneau": review(
    [SOURCES.fellowship],
    "La Communauté de l’Anneau réunit quatre Hobbits, deux Hommes, un Elfe, un Nain et un magicien.",
    "Sont acceptés les neuf compagnons nommés dans le guide pédagogique de l’éditeur du roman.",
  ),
  "medium-romans-expanse": review(
    [SOURCES.expanse],
    "La trame principale de The Expanse est racontée dans neuf romans publiés par Orbit.",
    "Sont comptés les neuf romans principaux dans l’ordre de publication de la série éditoriale.",
    { exclusionNotes: "Les nouvelles, novellas et le recueil Memory’s Legion sont exclus." },
  ),
  "hard-cercles-enfer-dante": review(
    [SOURCES.dante],
    "L’Enfer de Dante descend à travers neuf cercles associés à des états ou catégories de péchés.",
    "Chaque réponse désigne la catégorie principale traditionnellement associée à l’un des neuf cercles.",
  ),
  "easy-macos-californie": review(
    [SOURCES.appleVersions],
    "Apple a utilisé neuf noms californiens consécutifs de Mavericks à Monterey.",
    "Sont retenus les neuf noms publics de macOS 10.9 à macOS 12 dans la liste officielle Apple.",
  ),
  "medium-android-desserts": review(
    [SOURCES.androidVersions],
    "Les noms publics sucrés d’Android suivent l’ordre alphabétique de Cupcake à KitKat.",
    "Sont retenus les neuf noms de version publics associés aux codes C à K dans la documentation Android.",
  ),
  "hard-mac-os-x-felins": review(
    [SOURCES.appleVersions],
    "Les neuf versions de Mac OS X 10.0 à OS X 10.8 portent des noms de félins.",
    "Sont retenus les noms publics successifs des versions 10.0 à 10.8 dans la liste officielle Apple.",
  ),
  "easy-arrondissements-lyon": review(
    [SOURCES.lyon],
    "Lyon est divisée en neuf arrondissements municipaux numérotés de 1 à 9.",
    "Chaque réponse désigne l’un des neuf arrondissements municipaux présentés par la Ville de Lyon.",
  ),
  "medium-departements-01-09": review(
    [SOURCES.insee],
    "Le Code officiel géographique associe les codes 01 à 09 à ces neuf départements.",
    "Sont retenus les libellés départementaux du COG 2026 pour les codes 01 à 09 inclus.",
    { referenceDate: "2026-01-01", timeSensitive: true, recommendedReviewAt: "2027-01-31" },
  ),
  "hard-goncourt-2010-2018": review(
    [SOURCES.goncourt],
    "Les neuf romans listés ont reçu le prix Goncourt chaque année de 2010 à 2018.",
    "La période couvre les neuf millésimes 2010 à 2018 inclus dans le palmarès officiel.",
    { exclusionNotes: "Les prix Goncourt des lycéens et autres déclinaisons ne sont pas inclus." },
  ),
};

const writeChanges = process.argv.includes("--write");
const library = await loadContentLibrary();
const byFile = new Map();
let reviewedCount = 0;

for (const question of library.questions) {
  const editorialReview = REVIEWS[question.id];
  if (!editorialReview) continue;
  const sourceReferences = editorialReview.sourceReferences;
  Object.assign(question, editorialReview, {
    sources: sourceReferences,
    status: "published",
    reviewer: REVIEWER,
    reviewedAt: REVIEWED_AT,
    version: Math.max(question.version, 2),
    updatedAt: REVIEWED_AT,
  });
  delete question.sourceReferences;
  for (const answer of question.answers) answer.sources = sourceReferences;
  reviewedCount += 1;

  const difficultyFile = { 1: "easy", 2: "medium", 3: "hard" }[question.difficultyLevel];
  const filePath = resolve(
    "content",
    "themes",
    question.themeId,
    `questions.${difficultyFile}.json`,
  );
  if (!byFile.has(filePath)) byFile.set(filePath, await readUtf8Json(filePath));
  const fileQuestions = byFile.get(filePath);
  const index = fileQuestions.findIndex((candidate) => candidate.id === question.id);
  if (index === -1)
    throw new Error(`${question.id} est absent de ${relative(process.cwd(), filePath)}`);
  fileQuestions[index] = question;
}

const unknownReviewIds = Object.keys(REVIEWS).filter(
  (id) => !library.questions.some((question) => question.id === id),
);
if (unknownReviewIds.length > 0)
  throw new Error(`Fiches introuvables : ${unknownReviewIds.join(", ")}`);

if (writeChanges) {
  for (const [filePath, questions] of byFile) {
    await writeFile(filePath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  }
}

console.log(
  `${reviewedCount} fiche(s) documentée(s)${writeChanges ? " et publiée(s)" : " (simulation ; ajouter --write)"}.`,
);
