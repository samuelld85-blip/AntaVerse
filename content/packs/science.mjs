const source = (id, title, publisher, url, isPrimarySource = true) => ({
  id,
  title,
  publisher,
  url,
  isPrimarySource,
});

const OEIS = (id, title, sequence) =>
  source(id, title, "Online Encyclopedia of Integer Sequences", `https://oeis.org/${sequence}`, false);
const IUPAC = source(
  "iupac-periodic-table-pack",
  "Periodic Table of Elements",
  "International Union of Pure and Applied Chemistry",
  "https://iupac.org/what-we-do/periodic-table-of-elements/",
);
const NCBI = source(
  "ncbi-essential-amino-acids",
  "Biochemistry, Essential Amino Acids",
  "National Center for Biotechnology Information",
  "https://www.ncbi.nlm.nih.gov/books/NBK557845/",
);
const IUPAC_ALKANES = source(
  "iupac-blue-book-alkanes",
  "Nomenclature of Organic Chemistry — Parent Hydrides",
  "International Union of Pure and Applied Chemistry",
  "https://iupac.qmul.ac.uk/BlueBook/P1.html",
);
const NASA_ASTEROIDS = source(
  "nasa-small-body-database",
  "Small-Body Database Lookup",
  "NASA Jet Propulsion Laboratory",
  "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html",
);
const NASA_APOLLO = source(
  "nasa-apollo-program",
  "The Apollo Program",
  "NASA",
  "https://www.nasa.gov/the-apollo-program/",
);
const NIST = source(
  "nist-si-guide-chapter-8",
  "NIST Guide to the SI, Chapter 8",
  "National Institute of Standards and Technology",
  "https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8",
);
const PLANETARY_BOUNDARIES = source(
  "stockholm-planetary-boundaries",
  "Planetary boundaries",
  "Stockholm Resilience Centre",
  "https://www.stockholmresilience.org/research/planetary-boundaries.html",
  false,
);
const BIPM = source(
  "bipm-si-brochure",
  "The International System of Units — SI Brochure",
  "Bureau international des poids et mesures",
  "https://www.bipm.org/en/publications/si-brochure",
);

const q = (spec) => ({
  themeId: "science",
  qualificationRule:
    spec.qualificationRule ??
    "Les neuf réponses correspondent exactement à la définition ou à la séquence publiée par la source citée.",
  explanation:
    spec.explanation ??
    "L’ensemble est ordonné selon la convention scientifique ou mathématique indiquée dans la question.",
  ...spec,
});

export const questions = [
  q({
    id: "easy-chiffres-non-nuls",
    subthemeId: "science:mathematics",
    difficultyLevel: 1,
    shortTitle: "Écriture décimale",
    questionText: "Quels sont les neuf chiffres non nuls du système décimal ?",
    answers: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    sources: [BIPM],
    qualificationRule: "Sont retenus les neuf symboles décimaux différents de zéro.",
  }),
  q({
    id: "easy-neuf-premiers-carres",
    subthemeId: "science:mathematics",
    difficultyLevel: 1,
    shortTitle: "Nombres carrés",
    questionText: "Quels sont les neuf premiers carrés parfaits positifs, de 1² à 9² ?",
    answers: ["1", "4", "9", "16", "25", "36", "49", "64", "81"],
    sources: [OEIS("oeis-squares", "The squares", "A000290")],
  }),
  q({
    id: "easy-neuf-premiers-nombres-premiers",
    subthemeId: "science:mathematics",
    difficultyLevel: 1,
    shortTitle: "Nombres premiers",
    questionText: "Quels sont les neuf premiers nombres premiers ?",
    answers: ["2", "3", "5", "7", "11", "13", "17", "19", "23"],
    sources: [OEIS("oeis-primes", "The prime numbers", "A000040")],
  }),
  q({
    id: "easy-neuf-premieres-puissances-de-deux",
    subthemeId: "science:mathematics",
    difficultyLevel: 1,
    shortTitle: "Puissances de deux",
    questionText: "Quels sont les neuf premiers résultats de 2⁰ à 2⁸ ?",
    answers: ["1", "2", "4", "8", "16", "32", "64", "128", "256"],
    sources: [OEIS("oeis-powers-two", "Powers of 2", "A000079")],
  }),
  q({
    id: "easy-neuf-premiers-cubes",
    subthemeId: "science:mathematics",
    difficultyLevel: 1,
    shortTitle: "Nombres cubes",
    questionText: "Quels sont les neuf premiers cubes parfaits positifs, de 1³ à 9³ ?",
    answers: ["1", "8", "27", "64", "125", "216", "343", "512", "729"],
    sources: [OEIS("oeis-cubes", "The cubes", "A000578")],
  }),
  q({
    id: "easy-neuf-fibonacci-distincts",
    subthemeId: "science:mathematics",
    difficultyLevel: 1,
    shortTitle: "Suite de Fibonacci",
    questionText: "Quels sont les neuf premiers nombres distincts de la suite de Fibonacci, en partant de 1 ?",
    answers: ["1", "2", "3", "5", "8", "13", "21", "34", "55"],
    sources: [OEIS("oeis-fibonacci", "Fibonacci numbers", "A000045")],
    exclusionNotes: "La seconde occurrence de 1 n’est pas répétée puisque la question demande des valeurs distinctes.",
  }),
  q({
    id: "medium-acides-amines-essentiels",
    subthemeId: "science:biology",
    difficultyLevel: 2,
    shortTitle: "Nutrition humaine",
    questionText: "Quels sont les neuf acides aminés essentiels chez l’adulte humain en bonne santé ?",
    answers: ["Histidine", "Isoleucine", "Leucine", "Lysine", "Méthionine", "Phénylalanine", "Thréonine", "Tryptophane", "Valine"],
    sources: [NCBI],
    exclusionNotes: "Les acides aminés seulement conditionnellement essentiels ne sont pas inclus.",
  }),
  q({
    id: "medium-neuf-premiers-alcanes",
    subthemeId: "science:chemistry",
    difficultyLevel: 2,
    shortTitle: "Chimie organique",
    questionText: "Quels sont les neuf premiers alcanes linéaires, du méthane au nonane ?",
    answers: ["Méthane", "Éthane", "Propane", "Butane", "Pentane", "Hexane", "Heptane", "Octane", "Nonane"],
    sources: [IUPAC_ALKANES],
  }),
  q({
    id: "medium-neuf-premiers-asteroides-numerotes",
    subthemeId: "science:astronomy",
    difficultyLevel: 2,
    shortTitle: "Petites planètes",
    questionText: "Quels sont les neuf premiers astéroïdes numérotés, de (1) à (9) ?",
    answers: ["Cérès", "Pallas", "Junon", "Vesta", "Astrée", "Hébé", "Iris", "Flore", "Métis"],
    sources: [NASA_ASTEROIDS],
  }),
  q({
    id: "medium-missions-apollo-voisinage-lunaire",
    subthemeId: "science:astronomy",
    difficultyLevel: 2,
    shortTitle: "Programme Apollo",
    questionText: "Quelles sont les neuf missions Apollo habitées ayant atteint le voisinage de la Lune ?",
    answers: ["Apollo 8", "Apollo 10", "Apollo 11", "Apollo 12", "Apollo 13", "Apollo 14", "Apollo 15", "Apollo 16", "Apollo 17"],
    sources: [NASA_APOLLO],
    exclusionNotes: "Apollo 9 est restée en orbite terrestre ; Apollo 13 a atteint la Lune sans s’y poser.",
  }),
  q({
    id: "medium-neuf-quotients-nist",
    subthemeId: "science:physics",
    difficultyLevel: 2,
    shortTitle: "Grandeurs du SI",
    questionText: "Quelles sont les neuf grandeurs quotients du tableau 12 du guide SI du NIST ?",
    answers: ["Fraction de quantité de matière", "Volume molaire", "Masse molaire", "Concentration en quantité de matière", "Fraction volumique", "Masse volumique", "Molalité", "Volume massique", "Fraction massique"],
    sources: [NIST],
    qualificationRule: "Sont retenues les neuf cases de grandeurs définies dans le tableau 12 du chapitre 8 du guide SI du NIST.",
  }),
  q({
    id: "medium-elements-10-18",
    subthemeId: "science:chemistry",
    difficultyLevel: 2,
    shortTitle: "Deuxième ligne du tableau",
    questionText: "Quels éléments chimiques portent les numéros atomiques 10 à 18 ?",
    answers: ["Néon", "Sodium", "Magnésium", "Aluminium", "Silicium", "Phosphore", "Soufre", "Chlore", "Argon"],
    sources: [IUPAC],
  }),
  q({
    id: "hard-neuf-limites-planetaires",
    subthemeId: "science:earth-sciences",
    difficultyLevel: 3,
    shortTitle: "Système Terre",
    questionText: "Quelles sont les neuf limites planétaires du cadre scientifique actualisé en 2023 ?",
    answers: ["Changement climatique", "Intégrité de la biosphère", "Changement d’usage des sols", "Modification de l’eau douce", "Flux biogéochimiques", "Acidification des océans", "Charge en aérosols atmosphériques", "Appauvrissement de l’ozone stratosphérique", "Entités nouvelles"],
    sources: [PLANETARY_BOUNDARIES],
    referenceDate: "2023-09-13",
    timeSensitive: true,
    recommendedReviewAt: "2028-09-30",
  }),
  q({
    id: "hard-elements-37-45",
    subthemeId: "science:chemistry",
    difficultyLevel: 3,
    shortTitle: "Numéros atomiques 37 à 45",
    questionText: "Quels éléments chimiques portent les numéros atomiques 37 à 45 ?",
    answers: ["Rubidium", "Strontium", "Yttrium", "Zirconium", "Niobium", "Molybdène", "Technétium", "Ruthénium", "Rhodium"],
    sources: [IUPAC],
  }),
  q({
    id: "hard-elements-55-63",
    subthemeId: "science:chemistry",
    difficultyLevel: 3,
    shortTitle: "Numéros atomiques 55 à 63",
    questionText: "Quels éléments chimiques portent les numéros atomiques 55 à 63 ?",
    answers: ["Césium", "Baryum", "Lanthane", "Cérium", "Praséodyme", "Néodyme", "Prométhium", "Samarium", "Europium"],
    sources: [IUPAC],
  }),
  q({
    id: "hard-elements-73-81",
    subthemeId: "science:chemistry",
    difficultyLevel: 3,
    shortTitle: "Numéros atomiques 73 à 81",
    questionText: "Quels éléments chimiques portent les numéros atomiques 73 à 81 ?",
    answers: ["Tantale", "Tungstène", "Rhénium", "Osmium", "Iridium", "Platine", "Or", "Mercure", "Thallium"],
    sources: [IUPAC],
  }),
  q({
    id: "hard-elements-100-108",
    subthemeId: "science:chemistry",
    difficultyLevel: 3,
    shortTitle: "Numéros atomiques 100 à 108",
    questionText: "Quels éléments chimiques portent les numéros atomiques 100 à 108 ?",
    answers: ["Fermium", "Mendélévium", "Nobélium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium"],
    sources: [IUPAC],
  }),
];
