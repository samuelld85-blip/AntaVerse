const QUESTION_OVERRIDES = {
  "medium-slogans-marques": "Cite 9 marques connues pour leur slogan culte.",
  "medium-parfums-maisons": "Cite 9 grandes maisons derrière des parfums cultes.",
  "hard-techniques-culinaires-definitions":
    "Cite 9 techniques de cuisine qu’un chef connaît par cœur.",
  "hard-neuf-architectes-monuments-francais":
    "Cite 9 grands architectes liés à des monuments français.",
  "medium-panneaux-danger": "Cite 9 dangers signalés par un panneau triangulaire.",
  "medium-symboles-entretien-textile":
    "Cite 9 indications qu’on peut voir sur une étiquette de vêtement.",
  "easy-dieux-egyptiens-attributs": "Cite 9 dieux ou déesses de l’Égypte antique.",
  "hard-classes-feux-extincteurs": "Cite 9 associations entre feux et moyens d’extinction.",
  "hard-cocktails-ingredients-distinctifs": "Cite 9 cocktails avec leur ingrédient signature.",
  "medium-metiers-batiment": "Cite 9 métiers qu’on croise sur un chantier.",
  "medium-neuf-couleurs-drapeaux":
    "Cite 9 couleurs ou duos de couleurs reconnaissables sur des drapeaux.",
  "medium-neuf-elements-patrimoine-immateriel":
    "Cite 9 pays liés à un patrimoine culturel inscrit à l’UNESCO.",
  "hard-cuisines-unesco":
    "Cite 9 pays ou régions dont une tradition culinaire est inscrite à l’UNESCO.",
  "hard-pictogrammes-danger-chimique":
    "Cite les 9 dangers représentés par les pictogrammes chimiques SGH.",
  "hard-cycles-lavage-symboles": "Cite 9 consignes de lavage ou de nettoyage textile.",
  "hard-aop-fromages-regions": "Cite 9 régions ou zones françaises connues pour un fromage AOP.",
  "easy-symboles-neuf-pays": "Cite 9 pays reconnaissables à un symbole national célèbre.",
  "medium-desserts-pays": "Cite 9 pays associés à un dessert célèbre.",
  "easy-fetes-neuf-pays": "Cite 9 pays associés à une fête emblématique.",
  "easy-pays-euro-2016": "Cite 9 adversaires du Portugal pendant sa route vers l’Euro 2016.",
  "easy-monnaies-neuf-pays": "Cite 9 monnaies utilisées dans le monde.",
  "medium-neuf-ecritures": "Cite 9 systèmes d’écriture encore utilisés aujourd’hui.",
  "easy-princesses-neuf-films":
    "Cite 9 films où une princesse Disney apparaît pour la première fois.",
  "hard-neuf-alphabets-noms-autochtones": "Cite 9 écritures utilisées en Asie ou dans le Caucase.",
  "medium-divinites-romaines-domaines":
    "Cite 9 divinités romaines moins connues que Jupiter ou Mars.",
  "hard-createurs-logos": "Cite 9 designers derrière des logos ou identités célèbres.",
  "medium-neuf-instruments-traditionnels":
    "Cite 9 régions ou cultures associées à un instrument traditionnel.",
  "medium-riz-plats-monde": "Cite 9 cuisines du monde connues pour un plat de riz.",
  "medium-fromages-pays": "Cite 9 pays connus pour un fromage emblématique.",
  "medium-tarantino-neuf-jusqua-hateful-eight": "Cite 9 films réalisés par Quentin Tarantino.",
  "hard-neuf-jeux-traditionnels": "Cite 9 pays ou cultures associés à un jeu traditionnel.",
  "hard-neuf-traditions-theatre-asiatique":
    "Cite 9 pays d’Asie associés à une forme de théâtre traditionnel.",
  "medium-cocktails-alcools-base": "Cite 9 cocktails avec leur alcool principal.",
  "easy-produits-entreprises-tech": "Cite 9 entreprises derrière des produits tech très connus.",
  "hard-neuf-danses-unesco-pays": "Cite 9 danses inscrites à l’UNESCO avec leur pays.",
  "hard-neuf-pelerinages-sites": "Cite 9 grands lieux de pèlerinage avec leur pays.",
  "hard-symboles-blasons-automobiles":
    "Cite 9 symboles visibles sur des emblèmes de marques automobiles.",
  "medium-neuf-sites-merveilles-selection":
    "Cite 9 pays qui abritent un site historique mondialement connu.",
  "hard-categories-permis-france": "Cite 9 catégories du permis de conduire français.",
  "easy-danses-neuf-pays": "Cite 9 pays associés à une danse emblématique.",
  "easy-logos-animaux": "Cite 9 animaux présents dans des logos de marques célèbres.",
  "easy-salutations-neuf-langues": "Cite 9 façons de dire bonjour dans le monde.",
  "hard-appellations-vins-regions":
    "Cite 9 régions viticoles françaises liées à une appellation connue.",
  "easy-marques-alimentaires-produits":
    "Cite 9 produits immédiatement associés à une grande marque alimentaire.",
  "hard-scorsese-neuf-premiers-fictions":
    "Cite les 9 premiers films de fiction de Martin Scorsese.",
  "easy-plats-pays": "Cite 9 pays associés à un plat emblématique.",
  "hard-luxe-directeurs-fondateurs":
    "Cite 9 créateurs qui ont donné leur nom à une maison de mode.",
  "hard-marques-alimentaires-origines":
    "Cite 9 villes ou régions où sont nées des marques alimentaires connues.",
  "medium-metamorphoses-zeus": "Cite 9 formes prises par Zeus dans la mythologie.",
  "hard-neuf-stades-france-mondial-1938": "Cite 9 stades français ayant accueilli le Mondial 1938.",
  "medium-jean-dujardin-neuf-premiers": "Cite les 9 premiers longs-métrages de Jean Dujardin.",
  "medium-sauces-meres-derivees":
    "Cite les 5 sauces mères françaises et 4 sauces classiques qui en dérivent.",
  "medium-neuf-tld-2000-2001":
    "Cite 7 extensions approuvées par l’ICANN en 2000, plus .com et .org.",
  "hard-neuf-departements-revolutionnaires-belgique":
    "Cite 9 départements français créés en Belgique en 1795.",
  "medium-logos-formes-symboles": "Cite 9 symboles reconnaissables dans des logos célèbres.",
  "medium-adversaires-france-1998-2000":
    "Cite 9 adversaires de la France aux Mondiaux 1998 et à l’Euro 2000.",
  "medium-neuf-langues-wikipedia":
    "Cite 9 langues des premières éditions de Wikipédia lancées en 2001.",
  "medium-neuf-sites-unesco-1979-1981":
    "Cite 9 sites français inscrits à l’UNESCO en 1979 ou 1981.",
  "medium-heros-legendes-monde": "Cite 9 cultures associées à un héros ou personnage légendaire.",
  "easy-neuf-sites-stackexchange": "Cite 9 sites historiques du réseau Stack Exchange.",
  "medium-neuf-pays-carnavals": "Cite 9 pays connus pour un carnaval emblématique.",
  "easy-finalistes-france-1998":
    "Cite 9 titulaires de la France en finale du Mondial 1998, hors Didier Deschamps.",
  "hard-capitaines-champions-monde-1990-2022":
    "Cite les 9 capitaines champions du monde de 1990 à 2022.",
  "medium-moliere-neuf-premieres-pieces": "Cite les 9 premières pièces connues de Molière.",
  "medium-rois-mythiques-grecs": "Cite 9 cités ou régions gouvernées par un roi mythique grec.",
  "easy-plateformes-societes-meres": "Cite 9 plateformes avec le grand groupe qui les possède.",
  "hard-finales-c1-neuf-villes": "Cite les 9 premières villes à avoir accueilli une finale de C1.",
  "medium-fondateurs-marques-tech":
    "Cite 9 fondateurs ou équipes fondatrices de géants de la tech.",
  "easy-mcu-neuf-premiers": "Cite les 9 premiers films du Marvel Cinematic Universe.",
  "medium-pokemon-neuf-premieres-sorties": "Cite 9 des premières grandes sorties Pokémon au Japon.",
  "hard-kurosawa-neuf-premiers": "Cite les 9 premiers longs-métrages d’Akira Kurosawa.",
  "medium-buteurs-finales-mondial-depuis-1986":
    "Cite 9 joueurs ayant marqué en finale du Mondial depuis 1986.",
  "easy-equivalents-romains-dieux-grecs": "Cite les équivalents romains de 9 grands dieux grecs.",
  "easy-neuf-premiers-presidents-republique":
    "Cite les 9 premiers présidents de la République française.",
  "easy-neuf-tld-classiques": "Cite 9 domaines internet historiques, dont .com et .org.",
  "easy-daniel-radcliffe-neuf-films": "Cite 9 films de Daniel Radcliffe, dont les 8 Harry Potter.",
  "hard-neuf-premiers-castlevania": "Cite 9 des premiers jeux Castlevania.",
  "easy-tortues-ninja-neuf-personnages":
    "Cite les 4 Tortues Ninja et 5 personnages récurrents de la saga.",
  "hard-dnd-neuf-premiers-univers": "Cite 9 des premiers grands univers de Donjons & Dragons.",
  "hard-joni-mitchell-neuf-premiers": "Cite les 9 premiers albums studio de Joni Mitchell.",
  "hard-marques-annees-fondation": "Cite l’année de fondation de 9 marques célèbres.",
  "medium-natalie-portman-neuf-premiers":
    "Cite les 9 premiers longs-métrages de Natalie Portman, hors caméo.",
  "medium-disciplines-heptathlon":
    "Cite les 7 épreuves de l’heptathlon féminin et les 2 relais olympiques.",
  "hard-provinces-canada-avant-1949":
    "Cite les 9 provinces du Canada entrées dans la Confédération avant 1949.",
  "medium-aardman-neuf-longs":
    "Cite les 9 premiers longs-métrages produits ou coproduits par Aardman.",
  "medium-oscar-films-2016-2024": "Cite les 9 Oscars du meilleur film décernés de 2016 à 2024.",
  "easy-maisons-luxe-pays": "Cite 9 maisons de luxe avec leur pays d’origine.",
  "easy-power-rangers-neuf-premieres-series":
    "Cite les 9 premières séries ou ères de Power Rangers.",
  "hard-palmes-or-2014-2023":
    "Cite les 9 Palmes d’or décernées de 2014 à 2023. Il n’y en a pas eu en 2020.",
  "medium-arbitres-finales-rugby-1987-2019":
    "Cite les 9 arbitres des finales du Mondial de rugby de 1987 à 2019.",
  "easy-planete-singes-neuf-canoniques": "Cite 9 films des sagas La Planète des singes.",
  "easy-wizarding-world-neuf-premiers":
    "Cite les 8 Harry Potter et le premier Animaux fantastiques.",
  "medium-departements-19-26":
    "Cite les départements français numérotés de 19 à 26, avec 2A et 2B.",
  "easy-grands-felins": "Cite 9 grands félins sauvages.",
  "medium-confiseries-groupes": "Cite 9 confiseries avec le groupe qui les produit.",
  "medium-miyazaki-neuf-premiers":
    "Cite les 9 premiers longs-métrages réalisés par Hayao Miyazaki.",
  "medium-wes-anderson-neuf-premiers":
    "Cite les 9 premiers longs-métrages réalisés par Wes Anderson.",
  "easy-harry-potter-neuf-livres":
    "Cite les 7 romans Harry Potter et 2 livres de la bibliothèque de Poudlard.",
  "easy-neuf-reseaux-2003-2011": "Cite 9 réseaux ou services sociaux lancés entre 2003 et 2011.",
  "easy-neuf-rois-anglais-1066":
    "Cite les 9 premiers rois d’Angleterre après 1066, sans compter Mathilde.",
  "hard-buteurs-france-euro-1984":
    "Cite les 9 buts français de la phase de groupes de l’Euro 1984.",
  "medium-neuf-langues-ue-alphabetique":
    "Cite les 9 premières langues officielles de l’UE par ordre alphabétique.",
  "easy-marques-automobiles-pays": "Cite 9 marques automobiles avec leur pays d’origine.",
  "easy-neuf-planetes-historiques":
    "Cite les 9 astres autrefois enseignés comme planètes du Système solaire.",
  "hard-monotremes-marsupiaux": "Cite 9 mammifères monotrèmes ou marsupiaux emblématiques.",
  "medium-coen-neuf-premiers": "Cite les 9 premiers longs-métrages réalisés par les frères Coen.",
  "medium-scarlett-neuf-premiers": "Cite les 9 premiers longs-métrages de Scarlett Johansson.",
  "medium-marques-groupes-automobiles": "Cite 9 marques automobiles avec leur groupe propriétaire.",
  "medium-neuf-types-dns": "Cite 9 types d’enregistrements DNS.",
  "hard-ports-bien-connus-20-a-80":
    "Cite les services associés à 9 ports réseau courants, du port 20 au port 80.",
  "hard-acronymes-marques": "Développe le nom ou le sigle de 9 marques célèbres.",
  "medium-marques-anciens-noms": "Cite les anciens noms de 9 entreprises célèbres.",
  "medium-doctor-who-neuf-incarnations":
    "Cite le nom des 9 premières incarnations du Docteur dans Doctor Who.",
  "easy-neuf-premiers-louis": "Cite les rois de France de Louis Ier à Louis IX.",
  "easy-neuf-croisades-numerotees":
    "Cite les 9 croisades traditionnellement numérotées vers la Terre sainte.",
  "easy-stades-finales-mondial-1990-2022":
    "Cite les 9 stades des finales du Mondial de 1990 à 2022.",
  "hard-venise-actrice-2015-2023":
    "Cite les 9 lauréates de la Coupe Volpi à Venise de 2015 à 2023.",
  "easy-oscar-actrice-2004-2012":
    "Cite les 9 Oscars de la meilleure actrice décernés de 2004 à 2012.",
  "easy-champions-rugby-1987-2019": "Cite les vainqueurs des 9 Mondiaux de rugby de 1987 à 2019.",
  "easy-equipes-nba-titres-2015-2024": "Cite les champions NBA des 9 saisons de 2015 à 2023.",
  "hard-nobel-litterature-2015-2023": "Cite les 9 prix Nobel de littérature de 2015 à 2023.",
  "medium-doctor-who-neuf-docteurs":
    "Cite les acteurs des 9 premières incarnations du Docteur dans Doctor Who.",
  "hard-venise-acteur-2015-2023": "Cite les 9 lauréats de la Coupe Volpi à Venise de 2015 à 2023.",
  "hard-cannes-acteur-2011-2019":
    "Cite les 9 prix d’interprétation masculine à Cannes de 2011 à 2019.",
  "easy-oscar-acteur-2015-2023": "Cite les 9 Oscars du meilleur acteur décernés de 2015 à 2023.",
  "medium-grammy-album-2015-2023":
    "Cite les 9 Grammy de l’album de l’année décernés de 2015 à 2023.",
  "hard-angouleme-fauve-2015-2023": "Cite les 9 Fauves d’or d’Angoulême de 2015 à 2023.",
  "easy-eurovision-gagnants-2014-2023": "Cite les 9 gagnants de l’Eurovision entre 2014 et 2023.",
  "medium-departements-01-09": "Cite les départements français numérotés de 01 à 09.",
  "easy-departements-10-18": "Cite les départements français numérotés de 10 à 18.",
  "medium-departements-28-36": "Cite les départements français numérotés de 28 à 36.",
  "hard-annecy-cristal-2014-2022":
    "Cite les 9 Cristals du long métrage décernés à Annecy de 2014 à 2022.",
  "medium-oscar-animation-2002-2010":
    "Cite les 9 Oscars du meilleur film d’animation décernés de 2002 à 2010.",
  "hard-ours-or-2015-2023": "Cite les 9 Ours d’or de la Berlinale de 2015 à 2023.",
  "hard-lions-or-2015-2023": "Cite les 9 Lions d’or de la Mostra de Venise de 2015 à 2023.",
  "hard-oscar-court-animation-neuf-premiers":
    "Cite les 9 premiers Oscars du meilleur court métrage d’animation.",
  "hard-neuf-laureats-nobel-paix-2000-2008": "Cite les 9 prix Nobel de la paix de 2000 à 2008.",
  "hard-neuf-etats-confederes-initiaux": "Cite les 9 premiers États confédérés américains en 1861.",
  "hard-symphonies-beethoven": "Cite les numéros des 9 symphonies de Beethoven.",
  "hard-cercles-enfer-dante": "Cite les péchés ou états des 9 cercles de l’Enfer de Dante.",
  "hard-cannes-palme-realisateurs-2011-2019":
    "Cite les 9 réalisateurs palmés à Cannes de 2011 à 2019.",
  "medium-goncourt-2015-2023": "Cite les 9 prix Goncourt de 2015 à 2023.",
  "medium-hugo-roman-2015-2023": "Cite les 9 prix Hugo du meilleur roman de 2015 à 2023.",
  "hard-time-person-2014-2022": "Cite les 9 Person of the Year de Time de 2014 à 2022.",
  "hard-premieres-championnes-wimbledon":
    "Cite les 9 premières championnes différentes à Wimbledon.",
  "easy-premiers-ballon-or-differents":
    "Cite les 9 premiers vainqueurs différents du Ballon d’or masculin.",
  "hard-premiers-mvp-nba": "Cite les 9 premiers vainqueurs différents du MVP de la saison NBA.",
  "hard-neuf-premiers-vainqueurs-tour":
    "Cite les 9 premiers vainqueurs différents du Tour de France.",
  "hard-neuf-types-media-iana": "Cite les 9 types de médias de premier niveau reconnus par l’IANA.",
  "hard-goncourt-2010-2018": "Cite 9 territoires français habités d’outre-mer.",
  "easy-neuf-pays-plus-peuples-2024": "Cite les 9 pays les plus peuplés en 2024 selon l’ONU.",
  "easy-asterix-neuf-premiers": "Cite 9 albums d’Astérix.",
  "easy-tintin-neuf-premiers": "Cite 9 albums des Aventures de Tintin.",
  "easy-neuf-regions-alphabetiques": "Cite 9 régions françaises.",
  "easy-neuf-travaux-heracles": "Cite 9 travaux d’Héraclès.",
  "medium-ghostbusters-neuf-personnages": "Cite 9 personnages de Ghostbusters.",
  "medium-neuf-langues-ue-alphabetique": "Cite 9 langues officielles de l’Union européenne.",
};

export function polishQuestionText(id, questionText) {
  if (/^(?:Cite|Nomme|Trouve)\b/u.test(questionText) && questionText.length <= 100) {
    return questionText;
  }
  const override = QUESTION_OVERRIDES[id];
  if (override) return override;

  let polished = questionText
    .replace(/^Quels sont les neuf /u, "Cite les 9 ")
    .replace(/^Quelles sont les neuf /u, "Cite les 9 ")
    .replace(/^Quels sont neuf /u, "Cite 9 ")
    .replace(/^Quelles sont neuf /u, "Cite 9 ")
    .replace(/^Quels sont ces neuf /u, "Cite 9 ")
    .replace(/^Quelles sont ces neuf /u, "Cite 9 ")
    .replace(/^Quels sont les /u, "Cite les ")
    .replace(/^Quelles sont les /u, "Cite les ")
    .replace(/^Quels sont ces /u, "Cite ")
    .replace(/^Quelles sont ces /u, "Cite ")
    .replace(/^Quels éléments /u, "Cite les éléments qui ")
    .replace(/^Quelles villes /u, "Cite les villes qui ")
    .replace(/^Quels pays /u, "Cite les pays qui ");

  polished = polished
    .replace(/^Cite ces 9 /u, "Cite 9 ")
    .replace(/^Cite les 9 premiers? /u, "Cite 9 ")
    .replace(/^Cite les 9 premières /u, "Cite 9 ")
    .replace(/^Cite 9 ([^,]+), (?:de|des|du|d’|dans l’ordre|jusqu’à).+\?$/u, "Cite 9 $1.")
    .replace(/^Cite (.+)\?$/u, "Cite $1.")
    .replace(/\s+([?.!,;:])/gu, "$1");

  return polished;
}
