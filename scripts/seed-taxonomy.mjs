import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const themes = [
  theme("geography", "Géographie", "Pays, villes, capitales, régions et territoires", "⌖", [
    ["countries-capitals", "Pays & capitales"],
    ["cities-regions", "Villes & régions"],
    ["borders-territories", "Frontières & territoires"],
    ["rivers-seas", "Fleuves & mers"],
    ["mountains-islands", "Montagnes & îles"],
    ["flags-languages", "Drapeaux & langues"],
  ]),
  theme(
    "history",
    "Histoire",
    "Époques, événements, civilisations et personnages historiques",
    "⌛",
    [
      ["antiquity", "Antiquité"],
      ["middle-ages", "Moyen Âge"],
      ["modern-era", "Époque moderne"],
      ["contemporary-history", "Histoire contemporaine"],
      ["civilizations", "Civilisations"],
      ["leaders", "Souverains & dirigeants"],
    ],
  ),
  theme("cinema", "Cinéma", "Films, réalisateurs, acteurs, sagas et récompenses", "◈", [
    ["films", "Films"],
    ["directors", "Réalisateurs"],
    ["performers", "Actrices & acteurs"],
    ["sagas", "Sagas"],
    ["awards", "Récompenses"],
    ["world-cinema", "Cinémas du monde"],
  ]),
  theme(
    "television-series",
    "Télévision & séries",
    "Séries, émissions, personnages, plateformes et programmes cultes",
    "▣",
    [
      ["drama-series", "Séries dramatiques"],
      ["comedy-series", "Séries comiques"],
      ["characters", "Personnages"],
      ["shows", "Émissions"],
      ["platforms", "Chaînes & plateformes"],
      ["french-television", "Télévision française"],
    ],
  ),
  theme("music", "Musique", "Artistes, groupes, albums, chansons et classiques", "♫", [
    ["artists-groups", "Artistes & groupes"],
    ["albums-songs", "Albums & chansons"],
    ["classical-music", "Musique classique"],
    ["genres", "Genres musicaux"],
    ["instruments", "Instruments"],
    ["awards-festivals", "Prix & festivals"],
  ]),
  theme("sport", "Sport", "Disciplines, athlètes, compétitions et records", "◉", [
    ["olympic-games", "Jeux olympiques"],
    ["tennis", "Tennis"],
    ["rugby", "Rugby"],
    ["basketball", "Basketball"],
    ["motorsport", "Sports mécaniques"],
    ["athletics", "Athlétisme"],
    ["cycling", "Cyclisme"],
    ["team-sports", "Sports collectifs"],
  ]),
  theme("football", "Football", "Joueurs, clubs, sélections, compétitions et stades", "⬡", [
    ["world-cup", "Coupe du monde"],
    ["european-championship", "Championnat d’Europe"],
    ["champions-league", "Ligue des champions"],
    ["french-football", "Football français"],
    ["national-teams", "Sélections nationales"],
    ["clubs-players", "Clubs & joueurs"],
    ["stadiums", "Stades"],
  ]),
  theme("science", "Science", "Physique, chimie, biologie, découvertes et inventions", "✦", [
    ["physics", "Physique"],
    ["chemistry", "Chimie"],
    ["biology", "Biologie"],
    ["astronomy", "Astronomie"],
    ["earth-sciences", "Sciences de la Terre"],
    ["discoveries", "Découvertes"],
    ["mathematics", "Mathématiques"],
  ]),
  theme(
    "nature",
    "Nature",
    "Planète, environnement, végétaux, océans et phénomènes naturels",
    "❋",
    [
      ["plants", "Végétaux"],
      ["oceans", "Océans"],
      ["climate", "Climat"],
      ["geology", "Géologie"],
      ["ecosystems", "Écosystèmes"],
      ["natural-phenomena", "Phénomènes naturels"],
    ],
  ),
  theme("animals", "Animaux", "Espèces, habitats, caractéristiques, races et records", "◇", [
    ["mammals", "Mammifères"],
    ["birds", "Oiseaux"],
    ["reptiles-amphibians", "Reptiles & amphibiens"],
    ["marine-life", "Faune marine"],
    ["insects", "Insectes"],
    ["domestic-animals", "Animaux domestiques"],
  ]),
  theme(
    "food-gastronomy",
    "Cuisine & gastronomie",
    "Plats, ingrédients, spécialités, desserts et cuisines du monde",
    "♨",
    [
      ["dishes", "Plats"],
      ["ingredients", "Ingrédients"],
      ["desserts", "Desserts"],
      ["cheeses", "Fromages"],
      ["drinks", "Boissons"],
      ["world-cuisines", "Cuisines du monde"],
    ],
  ),
  theme(
    "literature",
    "Littérature",
    "Livres, auteurs, personnages, genres et œuvres classiques",
    "▤",
    [
      ["novels", "Romans"],
      ["authors", "Autrices & auteurs"],
      ["characters", "Personnages"],
      ["poetry-theatre", "Poésie & théâtre"],
      ["genres", "Genres littéraires"],
      ["awards", "Prix littéraires"],
    ],
  ),
  theme("comics-manga", "BD & mangas", "Bandes dessinées, mangas, auteurs, héros et univers", "▥", [
    ["franco-belgian-comics", "BD franco-belge"],
    ["manga", "Mangas"],
    ["superheroes", "Super-héros"],
    ["authors-artists", "Scénaristes & dessinateurs"],
    ["characters", "Personnages"],
    ["publishers", "Éditeurs"],
  ]),
  theme("video-games", "Jeux vidéo", "Consoles, studios, franchises, personnages et univers", "◆", [
    ["consoles", "Consoles"],
    ["studios", "Studios"],
    ["franchises", "Franchises"],
    ["characters", "Personnages"],
    ["genres", "Genres"],
    ["esports", "Compétitions"],
  ]),
  theme(
    "technology",
    "Technologie",
    "Machines, logiciels, innovations, informatique et inventions",
    "⌘",
    [
      ["computers", "Informatique"],
      ["software", "Logiciels"],
      ["devices", "Appareils"],
      ["inventions", "Inventions"],
      ["operating-systems", "Systèmes d’exploitation"],
      ["telecommunications", "Télécommunications"],
    ],
  ),
  theme(
    "internet-social-media",
    "Internet & réseaux sociaux",
    "Plateformes, créateurs, phénomènes viraux, mèmes et culture web",
    "◎",
    [
      ["platforms", "Plateformes"],
      ["social-networks", "Réseaux sociaux"],
      ["web-creators", "Créateurs du web"],
      ["memes", "Mèmes"],
      ["web-history", "Histoire du web"],
      ["online-communities", "Communautés en ligne"],
    ],
  ),
  theme(
    "france",
    "France",
    "Culture, géographie, histoire, institutions et patrimoine français",
    "⌂",
    [
      ["geography", "Géographie"],
      ["history", "Histoire"],
      ["institutions", "Institutions"],
      ["heritage", "Patrimoine"],
      ["arts", "Arts"],
      ["regions", "Régions & territoires"],
    ],
  ),
  theme(
    "world-culture",
    "Culture du monde",
    "Traditions, symboles, coutumes, fêtes et références internationales",
    "◌",
    [
      ["traditions", "Traditions"],
      ["celebrations", "Fêtes"],
      ["symbols", "Symboles"],
      ["languages", "Langues"],
      ["heritage", "Patrimoine mondial"],
      ["customs", "Coutumes"],
    ],
  ),
  theme(
    "pop-culture",
    "Pop culture",
    "Franchises, personnages, célébrités, univers et références populaires",
    "★",
    [
      ["franchises", "Franchises"],
      ["characters", "Personnages"],
      ["toys-games", "Jouets & jeux"],
      ["fandoms", "Communautés de fans"],
      ["icons", "Icônes populaires"],
      ["cross-media", "Univers transmédias"],
    ],
  ),
  theme(
    "animation",
    "Dessins animés & animation",
    "Disney, Pixar, anime, séries animées et personnages",
    "✺",
    [
      ["animated-films", "Films d’animation"],
      ["animated-series", "Séries animées"],
      ["anime", "Anime"],
      ["studios", "Studios"],
      ["characters", "Personnages"],
      ["techniques", "Techniques d’animation"],
    ],
  ),
  theme(
    "brands-logos",
    "Marques & logos",
    "Marques, entreprises, produits, slogans et identités visuelles",
    "◐",
    [
      ["companies", "Entreprises"],
      ["products", "Produits"],
      ["logos", "Logos"],
      ["slogans", "Slogans"],
      ["luxury-fashion", "Luxe & mode"],
      ["food-brands", "Marques alimentaires"],
    ],
  ),
  theme(
    "celebrities",
    "Célébrités",
    "Acteurs, chanteurs, sportifs, personnalités médiatiques et figures publiques",
    "✧",
    [
      ["actors", "Actrices & acteurs"],
      ["singers", "Chanteuses & chanteurs"],
      ["athletes", "Sportives & sportifs"],
      ["media-figures", "Personnalités médiatiques"],
      ["public-figures", "Figures publiques"],
      ["international-icons", "Icônes internationales"],
    ],
  ),
  theme(
    "mythology-legends",
    "Mythologie & légendes",
    "Dieux, héros, créatures, mythes et légendes",
    "☾",
    [
      ["greek-mythology", "Mythologie grecque"],
      ["roman-mythology", "Mythologie romaine"],
      ["norse-mythology", "Mythologie nordique"],
      ["egyptian-mythology", "Mythologie égyptienne"],
      ["heroes-creatures", "Héros & créatures"],
      ["world-legends", "Légendes du monde"],
    ],
  ),
  theme(
    "everyday-life",
    "Vie quotidienne",
    "Objets, métiers, transports, maison, école et habitudes courantes",
    "☀",
    [
      ["home", "Maison"],
      ["jobs", "Métiers"],
      ["transport", "Transports"],
      ["school", "École"],
      ["objects", "Objets courants"],
      ["habits", "Habitudes"],
    ],
  ),
];

function theme(id, label, description, icon, subthemes) {
  return {
    id,
    label,
    description,
    icon,
    subthemes: subthemes.map(([subthemeId, subthemeLabel]) => ({
      id: `${id}:${subthemeId}`,
      label: subthemeLabel,
      description: `${subthemeLabel} dans le thème ${label}`,
    })),
    tags: subthemes.map(([subthemeId]) => subthemeId),
    contentVersion: "2026.07.13",
  };
}

if (!process.argv.includes("--write")) {
  console.log(
    `Taxonomie prête : ${themes.length} thèmes. Ajoutez --write pour créer les fichiers.`,
  );
  process.exit(0);
}

for (const entry of themes) {
  const directory = resolve("content", "themes", entry.id);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "theme.json"), `${JSON.stringify(entry, null, 2)}\n`, "utf8");
  for (const difficulty of ["easy", "medium", "hard"]) {
    const path = resolve(directory, `questions.${difficulty}.json`);
    try {
      await access(path);
    } catch {
      await writeFile(path, "[]\n", "utf8");
    }
  }
}

console.log(
  `Taxonomie créée : ${themes.length} thèmes et ${themes.reduce((sum, entry) => sum + entry.subthemes.length, 0)} sous-thèmes.`,
);
