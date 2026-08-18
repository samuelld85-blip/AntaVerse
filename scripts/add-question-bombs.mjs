import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";
import { normalizeAnswer } from "./content-fingerprint.mjs";

const UPDATED_AT = "2026-08-17T12:00:00.000Z";
const CONTENT_VERSION = "2026.08.17-v3";

const exactRules = [
  [/capitales?/iu, "France", "La France est un pays, pas une capitale."],
  [
    /pays d[’']|pays partageant|pays bordés|pays dont|pays très|plus (?:grands|petits|peuplés) pays|pays d’Afrique|pays connus|pays qui/iu,
    "Paris",
    "Paris est une ville, pas un pays.",
  ],
  [
    /monnaies?/iu,
    "Carte bancaire",
    "Une carte bancaire est un moyen de paiement, pas une monnaie.",
  ],
  [
    /façons? de dire bonjour/iu,
    "Au revoir",
    "« Au revoir » est une formule de départ, pas une salutation d’arrivée.",
  ],
  [
    /systèmes? d[’']écriture/iu,
    "Français",
    "Le français est une langue, pas un système d’écriture.",
  ],
  [/langues?/iu, "Euro", "L’euro est une monnaie, pas une langue."],
  [
    /civilisations?/iu,
    "Renaissance",
    "La Renaissance est une période historique, pas une civilisation de l’Antiquité.",
  ],
  [/pharaons?/iu, "Pyramide de Khéops", "La pyramide de Khéops est un monument, pas un pharaon."],
  [
    /présidents? des États-Unis/iu,
    "Maison-Blanche",
    "La Maison-Blanche est un bâtiment, pas un président.",
  ],
  [/inventions?/iu, "Inventeur", "Un inventeur est une personne, pas une invention."],
  [/traités?/iu, "Bataille", "Une bataille est un affrontement, pas un traité."],
  [/batailles?/iu, "Traité de paix", "Un traité de paix n’est pas une bataille."],
  [/dynasties?/iu, "Grande Muraille", "La Grande Muraille est un monument, pas une dynastie."],
  [
    /révolutions? ou soulèvements?/iu,
    "Couronne royale",
    "Une couronne royale est un objet, pas une révolution ni un soulèvement.",
  ],
  [
    /routes? commerciales?/iu,
    "Pièce de monnaie",
    "Une pièce de monnaie est un objet échangé, pas une route commerciale.",
  ],
  [
    /créatures? célèbres|créatures? ou êtres/iu,
    "Saumon",
    "Le saumon est un animal réel, pas une créature mythologique.",
  ],
  [
    /félins|insectes|oiseaux|reptiles|amphibiens|primates|rapaces/iu,
    "Saumon",
    "Le saumon est un poisson et ne relève pas de la catégorie animale précise demandée.",
  ],
  [/mammifères? marins/iu, "Requin", "Le requin est un poisson, pas un mammifère marin."],
  [/requins?/iu, "Dauphin", "Le dauphin est un mammifère marin, pas un requin."],
  [
    /animaux présents dans des logos/iu,
    "Pomme croquée",
    "La pomme croquée est un symbole de marque, mais ce n’est pas un animal.",
  ],
  [
    /animaux utilisés dans la recherche/iu,
    "Microscope",
    "Un microscope est un instrument de recherche, pas un animal.",
  ],
  [
    /animaux connus pour leur vitesse/iu,
    "Chronomètre",
    "Un chronomètre mesure la vitesse, mais ce n’est pas un animal.",
  ],
  [/races? de chiens/iu, "Chat siamois", "Le siamois est une race de chat, pas de chien."],
  [/races? de chats/iu, "Labrador", "Le labrador est une race de chien, pas de chat."],
  [
    /arbres?|conifères?/iu,
    "Tulipe",
    "La tulipe est une plante herbacée, pas un arbre ni un conifère.",
  ],
  [
    /parties? (?:courantes )?d[’']une plante|parties? (?:courantes )?d[’']une fleur/iu,
    "Papillon",
    "Un papillon peut visiter une fleur, mais n’en est pas une partie.",
  ],
  [
    /précipitations?|dépôts atmosphériques/iu,
    "Vent",
    "Le vent est un mouvement d’air, pas une précipitation ni un dépôt atmosphérique.",
  ],
  [
    /biomes?/iu,
    "Aquarium",
    "Un aquarium est une installation artificielle, pas un biome terrestre.",
  ],
  [
    /mers? ou grands bassins/iu,
    "Alpes",
    "Les Alpes sont une chaîne de montagnes, pas une mer ni un bassin maritime.",
  ],
  [
    /écosystèmes? côtiers|marins peu profonds/iu,
    "Désert du Sahara",
    "Le Sahara est un désert terrestre, pas un écosystème côtier ou marin.",
  ],
  [
    /parties? visibles du corps/iu,
    "Foie",
    "Le foie est un organe interne, pas une partie visible du corps.",
  ],
  [/os du corps/iu, "Cœur", "Le cœur est un organe, pas un os."],
  [/organes?/iu, "Fémur", "Le fémur est un os, pas un organe."],
  [/lunes? connues/iu, "Mars", "Mars est une planète, pas une lune."],
  [
    /sources? d[’']énergie/iu,
    "Thermomètre",
    "Un thermomètre mesure une grandeur ; ce n’est pas une source d’énergie.",
  ],
  [
    /matériaux conducteurs/iu,
    "Caoutchouc",
    "Le caoutchouc est couramment isolant, pas conducteur électrique.",
  ],
  [
    /maladies?.*vaccin/iu,
    "Entorse",
    "Une entorse est une lésion, pas une maladie prévenue par un vaccin.",
  ],
  [
    /moyens? de contraception/iu,
    "Test de grossesse",
    "Un test détecte une grossesse ; ce n’est pas un moyen de contraception.",
  ],
  [
    /infections? sexuellement transmissibles/iu,
    "Grossesse",
    "Une grossesse n’est pas une infection sexuellement transmissible.",
  ],
  [
    /risques? associés aux drogues/iu,
    "Hydratation",
    "L’hydratation est une mesure de réduction des risques, pas un risque associé aux drogues.",
  ],
  [/unités? de mesure/iu, "Balance", "Une balance est un instrument, pas une unité de mesure."],
  [/phénomènes?.*météo/iu, "Séisme", "Un séisme est un phénomène géologique, pas météorologique."],
  [
    /sports? (?:collectifs|de précision|présents|d’hiver|de combat|très pratiqués|que l’on peut|qui se jouent|pratiqués)/iu,
    "Sifflet",
    "Un sifflet est un accessoire d’arbitrage, pas un sport.",
  ],
  [
    /arts martiaux/iu,
    "Ballon de football",
    "Un ballon de football est un équipement, pas un art martial.",
  ],
  [
    /épreuves? d[’']endurance/iu,
    "Sprint de 100 mètres",
    "Le 100 mètres est une épreuve de vitesse, pas d’endurance.",
  ],
  [/stades? de football/iu, "Ballon", "Un ballon est un équipement, pas un stade."],
  [
    /derbies?|classiques? du football/iu,
    "Carton jaune",
    "Un carton jaune est une sanction, pas une affiche entre clubs.",
  ],
  [/compétitions? sportives/iu, "Vestiaire", "Un vestiaire est un lieu, pas une compétition."],
  [
    /joueurs?.*finale|sportives? et sportifs?|sportives? devenues|sportifs? détenteurs/iu,
    "Médaille d’or",
    "Une médaille est une récompense, pas une sportive ou un sportif.",
  ],
  [
    /sélections?.*(?:finale de Coupe du monde|finale de l[’']Euro)/iu,
    "Ballon",
    "Un ballon est un équipement, pas une sélection nationale.",
  ],
  [
    /instruments? de musique|instruments? à cordes|instruments? à vent/iu,
    "Microphone",
    "Un microphone capte le son ; ce n’est pas un instrument de musique dans cette catégorie.",
  ],
  [
    /styles? musicaux|musiques? associées/iu,
    "Guitare",
    "La guitare est un instrument, pas un style musical.",
  ],
  [
    /artistes?|chanteuses?|rappeurs?|DJ|compositeurs?/iu,
    "Microphone",
    "Un microphone est un objet, pas une personne ou un artiste.",
  ],
  [
    /groupes? de rock/iu,
    "Guitare électrique",
    "Une guitare électrique est un instrument, pas un groupe de rock.",
  ],
  [/chansons?/iu, "Mariage", "Un mariage est un événement, pas une chanson."],
  [/festivals? de musique/iu, "Casque audio", "Un casque audio est un objet, pas un festival."],
  [/récompenses? musicales/iu, "Piano", "Un piano est un instrument, pas une récompense musicale."],
  [
    /films? connus avec ([^.]+)\./iu,
    ({ match }) => match[1],
    ({ match }) => `${match[1]} est une personne, pas un film.`,
  ],
  [
    /(?:films?|longs-métrages) réalisés par ([^.]+)\./iu,
    ({ match }) => match[1],
    ({ match }) => `${match[1]} est le nom du réalisateur, pas celui d’un film.`,
  ],
  [
    /personnages? (?:de Mario|Pokémon)/iu,
    "Manette",
    "Une manette est un accessoire de jeu, pas un personnage.",
  ],
  [
    /personnages? (?:très connus )?(?:de|des|du) ([^.]+)\./iu,
    ({ match }) => match[1],
    ({ match }) => `${match[1]} désigne l’œuvre ou l’univers, pas un personnage.`,
  ],
  [
    /incarnations? du Docteur/iu,
    "TARDIS",
    "Le TARDIS est le vaisseau du Docteur, pas l’une de ses incarnations.",
  ],
  [
    /braqueurs? de ([^.]+)\./iu,
    ({ match }) => match[1],
    ({ match }) => `${match[1]} est le titre de la série, pas un braqueur.`,
  ],
  [
    /films? d[’']animation (?:des studios )?Pixar|longs-métrages sortis par Pixar/iu,
    "Pixar",
    "Pixar est le studio, pas le titre d’un film.",
  ],
  [/personnages? de films Pixar/iu, "Pixar", "Pixar est le studio, pas un personnage."],
  [
    /méchants? des classiques Disney/iu,
    "Disneyland",
    "Disneyland est un parc, pas un méchant de film.",
  ],
  [
    /films?.*princesse Disney/iu,
    "Ariel",
    "Ariel est un personnage, pas le titre demandé d’un film.",
  ],
  [
    /films? de la saga|films? du Marvel Cinematic Universe|films? où|sagas? de cinéma|longs-métrages d[’']animation liés/iu,
    "Oscar du cinéma",
    "Un Oscar est une récompense, pas un film ni une saga.",
  ],
  [
    /séries? (?:Marvel|disponibles|françaises|adaptées|centrées|avec|situées|policières)/iu,
    "Télécommande",
    "Une télécommande est un objet lié à la télévision, pas une série.",
  ],
  [/enquêteurs?.*séries/iu, "Loupe", "Une loupe est un objet d’enquête, pas un enquêteur."],
  [
    /programmes?.*candidats cuisinent/iu,
    "Poêle à frire",
    "Une poêle est un ustensile, pas un programme télévisé.",
  ],
  [
    /jeux vidéo (?:de sport|en monde ouvert|adaptés|parmi|auxquels)|jeux de course|jeux de survie|jeux principaux/iu,
    "Manette",
    "Une manette est un accessoire, pas un jeu vidéo.",
  ],
  [/consoles? de jeux/iu, "Mario", "Mario est un personnage, pas une console."],
  [
    /personnages? (?:de Mario|Pokémon)|héroïnes? de jeux|méchants?.*jeux vidéo/iu,
    "Manette",
    "Une manette est un accessoire, pas un personnage.",
  ],
  [
    /genres? de jeux vidéo/iu,
    "PlayStation",
    "PlayStation désigne une famille de consoles, pas un genre de jeu.",
  ],
  [/studios? de jeux vidéo/iu, "Joystick", "Un joystick est un accessoire, pas un studio."],
  [
    /termes?.*jeux en ligne/iu,
    "Console",
    "Une console est un appareil, pas un terme de communication en ligne.",
  ],
  [
    /jeux de société|jeux utilisant des dés|jeux pratiqués dans un casino/iu,
    "Pion",
    "Un pion est un élément de jeu, pas un jeu complet.",
  ],
  [/super-héros Marvel/iu, "Marvel", "Marvel est l’éditeur ou l’univers, pas un super-héros."],
  [/super-héros DC/iu, "DC Comics", "DC Comics est l’éditeur, pas un super-héros."],
  [
    /personnages? de bandes dessinées|personnages? de l[’']univers Pokémon/iu,
    "Bulle de dialogue",
    "Une bulle de dialogue est un élément graphique, pas un personnage.",
  ],
  [
    /arcs? (?:du manga|narratifs)|recueils? (?:de la série|de comics)|sorties? Pokémon/iu,
    "Figurine",
    "Une figurine est un produit dérivé, pas une partie de la publication demandée.",
  ],
  [
    /plateformes?.*vidéos|réseaux? sociaux|services? sociaux|plateformes? de discussion/iu,
    "Clavier",
    "Un clavier est un appareil de saisie, pas une plateforme ou un réseau social.",
  ],
  [
    /applications? utilisées/iu,
    "Téléphone",
    "Un téléphone exécute des applications, mais ce n’est pas une application.",
  ],
  [
    /petites victoires? du quotidien/iu,
    "Rater son bus",
    "Rater son bus est une contrariété, pas une petite victoire.",
  ],
  [
    /choses? que l[’']on trouve dans un centre commercial/iu,
    "Demander un remboursement",
    "Demander un remboursement est une action, pas une chose présente dans le centre commercial.",
  ],
  [
    /façons? de personnaliser une tenue/iu,
    "Porter un uniforme imposé",
    "Porter un uniforme imposé est l’inverse d’une personnalisation de tenue.",
  ],
  [
    /choses? qui peuvent ruiner une tenue/iu,
    "Retouche réussie",
    "Une retouche réussie améliore une tenue au lieu de la ruiner.",
  ],
  [
    /choses? à prévoir pour organiser une soirée/iu,
    "Rentrer chez soi la veille",
    "Rentrer chez soi la veille n’est pas un élément à prévoir pour la soirée organisée.",
  ],
  [
    /choses? à apporter chez quelqu[’']un qui reçoit/iu,
    "Repartir avec le cadeau de l’hôte",
    "Repartir avec un cadeau va dans le sens opposé à ce qu’on apporte à l’hôte.",
  ],
  [
    /choses? que l[’']on perd en soirée/iu,
    "Piste de danse",
    "La piste de danse est un lieu, pas un objet personnel que l’on perd.",
  ],
  [
    /façons? de réduire les risques en soirée/iu,
    "Conduire après avoir bu",
    "Conduire après avoir bu augmente le risque au lieu de le réduire.",
  ],
  [
    /signes? qu[’']un premier rendez-vous se passe bien/iu,
    "Regarder son téléphone sans arrêt",
    "Ignorer l’autre pour regarder son téléphone est un signe négatif, pas positif.",
  ],
  [
    /raisons? de télécharger une application de rencontre/iu,
    "Ne vouloir rencontrer personne",
    "Ne vouloir rencontrer personne contredit l’objectif d’une application de rencontre.",
  ],
  [
    /façons? de montrer son affection/iu,
    "Ignorer tous les messages",
    "Ignorer l’autre ne montre pas de l’affection.",
  ],
  [
    /raisons? de rompre/iu,
    "Respect mutuel",
    "Le respect mutuel est un élément sain, pas une raison évidente de rompre.",
  ],
  [
    /éléments? importants dans une relation saine/iu,
    "Manipulation",
    "La manipulation caractérise une relation malsaine, pas une relation saine.",
  ],
  [
    /choses? à ne pas partager sans autorisation/iu,
    "Prévisions météo",
    "Les prévisions météo sont publiques et ne nécessitent pas l’autorisation d’une personne.",
  ],
  [
    /personnes? ou services? à contacter.*substances/iu,
    "Dealer",
    "Un dealer n’est pas un service d’aide à contacter en cas de problème.",
  ],
  [
    /choses? que l[’']on peut mesurer/iu,
    "Mesurer",
    "« Mesurer » est l’action demandée, pas une chose mesurable.",
  ],
  [
    /éléments? présents dans un laboratoire/iu,
    "Prix Nobel",
    "Un prix Nobel est une récompense scientifique, pas un élément du laboratoire.",
  ],
  [
    /choses? à mettre dans une valise/iu,
    "Chambre d’hôtel",
    "Une chambre d’hôtel est un lieu et ne peut pas être mise dans une valise.",
  ],
  [
    /choses? que l[’']on fait le premier jour/iu,
    "Congé annuel",
    "Un congé annuel n’est pas une action du premier jour de travail.",
  ],
  [
    /systèmes? d[’']exploitation/iu,
    "Ordinateur portable",
    "Un ordinateur est un appareil, pas un système d’exploitation.",
  ],
  [/mèmes? Internet/iu, "Navigateur web", "Un navigateur est un logiciel, pas un mème."],
  [
    /langages? de programmation/iu,
    "Clavier",
    "Un clavier sert à écrire du code, mais ce n’est pas un langage de programmation.",
  ],
  [
    /microprocesseurs?/iu,
    "Carte mère",
    "Une carte mère accueille le processeur, mais n’est pas un microprocesseur.",
  ],
  [
    /noms publics sucrés d[’']Android/iu,
    "Salade",
    "Une salade n’est ni un dessert ni un nom public de version Android.",
  ],
  [
    /supports? ou services? de stockage/iu,
    "Écran",
    "Un écran affiche des données, mais ne constitue pas un support de stockage.",
  ],
  [
    /termes? liés à la cybersécurité/iu,
    "Imprimante",
    "Une imprimante est un périphérique, pas un terme de cybersécurité.",
  ],
  [
    /secteurs?.*entreprise/iu,
    "Carte bancaire",
    "Une carte bancaire est un moyen de paiement, pas un secteur d’activité.",
  ],
  [
    /dépenses? fixes/iu,
    "Client",
    "Un client peut générer du chiffre d’affaires ; ce n’est pas une dépense fixe.",
  ],
  [
    /moyens? de paiement/iu,
    "Facture",
    "Une facture demande un paiement, mais n’est pas un moyen de paiement.",
  ],
  [
    /postes? présents|métiers? liés à la vente/iu,
    "Ticket de caisse",
    "Un ticket de caisse est un document, pas un poste ni un métier.",
  ],
  [
    /marques? françaises|grandes entreprises technologiques|entreprises?.*connues/iu,
    "Ticket de caisse",
    "Un ticket de caisse est un document commercial, pas une entreprise ni une marque.",
  ],
  [
    /formes? de publicité/iu,
    "Prix de vente",
    "Le prix de vente est une donnée commerciale, pas une forme de publicité.",
  ],
  [
    /indicateurs?.*économique/iu,
    "Portefeuille",
    "Un portefeuille est un objet, pas un indicateur économique.",
  ],
  [
    /services? proposés par une banque/iu,
    "Billet de banque",
    "Un billet est une monnaie, pas un service bancaire.",
  ],
  [
    /types? de contrats? de travail/iu,
    "Fiche de paie",
    "Une fiche de paie est un document, pas un type de contrat.",
  ],
  [
    /produits?.*abonnement/iu,
    "Ticket de caisse",
    "Un ticket de caisse est une preuve d’achat, pas un produit sous abonnement.",
  ],
  [
    /choses? à préparer avant une présentation/iu,
    "Spectateur",
    "Un spectateur est une personne, pas un élément à préparer avant la présentation.",
  ],
  [
    /moyens? de transport|transports? urbains/iu,
    "Valise",
    "Une valise accompagne un trajet, mais n’est pas un moyen de transport.",
  ],
  [
    /documents?.*voyag|documents?.*administratifs/iu,
    "Valise",
    "Une valise est un bagage, pas un document.",
  ],
  [/types? d[’']hébergement/iu, "Passeport", "Un passeport est un document, pas un hébergement."],
  [/destinations? européennes/iu, "Valise", "Une valise est un bagage, pas une destination."],
  [/éléments?.*vélo/iu, "Cycliste", "Le cycliste utilise le vélo, mais n’en est pas un élément."],
  [
    /dangers?.*panneau triangulaire/iu,
    "Parking autorisé",
    "Un parking autorisé est une indication, pas un danger signalé par un triangle.",
  ],
  [/boissons? chaudes/iu, "Glaçon", "Un glaçon est froid et n’est pas une boisson chaude."],
  [
    /cocktails?/iu,
    "Verre à cocktail",
    "Un verre est un contenant, pas un cocktail ni son alcool principal.",
  ],
  [
    /desserts?|pâtisseries/iu,
    "Soupe à l’oignon",
    "Une soupe est un plat salé, pas un dessert ni une pâtisserie.",
  ],
  [/épices?/iu, "Farine", "La farine est un ingrédient de base, pas une épice."],
  [/fromages?/iu, "Baguette", "La baguette est un pain, pas un fromage."],
  [/agrumes?/iu, "Banane", "La banane est un fruit, mais pas un agrume."],
  [/pâtes italiennes/iu, "Risotto", "Le risotto est un plat de riz, pas un format de pâtes."],
  [/aliments? fermentés/iu, "Sucre blanc", "Le sucre blanc n’est pas un aliment fermenté."],
  [/techniques? de cuisson/iu, "Éplucher", "Éplucher prépare un aliment, mais ne le cuit pas."],
  [/légumineuses?/iu, "Carotte", "La carotte est un légume-racine, pas une légumineuse."],
  [/poisson cru/iu, "Poulet rôti", "Le poulet rôti ne contient ni poisson ni produit cru."],
  [
    /ingrédients?.*cuisine asiatique|ingrédients?.*salade/iu,
    "Casserole",
    "Une casserole est un ustensile, pas un ingrédient.",
  ],
  [/morceaux? de bœuf/iu, "Saumon", "Le saumon est un poisson, pas un morceau de bœuf."],
  [/piments?/iu, "Poire", "La poire est un fruit doux, pas un piment."],
  [
    /cuisines?.*plat de riz/iu,
    "Casserole",
    "Une casserole est un ustensile, pas une cuisine régionale.",
  ],
  [
    /légumes? verts/iu,
    "Tomate rouge",
    "Une tomate rouge ne correspond pas à la catégorie des légumes verts demandée.",
  ],
  [
    /plats?.*avec les doigts/iu,
    "Soupe",
    "Une soupe se mange normalement avec une cuillère, pas avec les doigts.",
  ],
  [
    /marques? (?:de vêtements|automobiles|alimentaires|de sport)|enseignes? de supermarché/iu,
    "Ticket de caisse",
    "Un ticket de caisse est lié à l’achat, mais ce n’est pas une marque ni une enseigne.",
  ],
  [
    /produits?.*pharmacie/iu,
    "Ordonnance",
    "Une ordonnance est un document médical, pas un produit acheté.",
  ],
  [/types? de promotions?/iu, "Prix normal", "Le prix normal n’est pas une promotion commerciale."],
  [
    /grandes maisons derrière des parfums/iu,
    "Flacon",
    "Un flacon contient le parfum, mais ce n’est pas une maison de parfumerie.",
  ],
  [
    /marques?.*slogan/iu,
    "Panneau publicitaire",
    "Un panneau diffuse un slogan, mais ce n’est pas une marque.",
  ],
  [
    /confiseries?.*groupe/iu,
    "Ticket de caisse",
    "Un ticket de caisse n’est ni une confiserie ni son groupe producteur.",
  ],
  [
    /personnes? ou équipes?.*géants de la tech/iu,
    "Ordinateur",
    "Un ordinateur est un produit, pas une personne ni une équipe fondatrice.",
  ],
  [
    /symboles?.*logos|animaux présents dans des logos/iu,
    "Ticket de caisse",
    "Un ticket de caisse est lié à une marque, mais pas au symbole demandé dans son logo.",
  ],
  [
    /marques? automobiles avec leur groupe/iu,
    "Permis de conduire",
    "Un permis est un document, pas une association marque-groupe.",
  ],
];

const kindPatterns = [
  [
    "people",
    /(?:dieux|déesses|divinités|figures|héros|personnages|écrivains|auteurs|explorateurs|dirigeantes|femmes|empereurs|impératrices|acteurs|actrices|personnalités|chefs|humoristes|stars|scientifiques|métiers|collègues|membres|rôles)/iu,
  ],
  ["works", /(?:films|séries|œuvres|prix|mythes|travaux|jeux|albums|musiques|logiciels)/iu],
  [
    "places",
    /(?:pays|capitales|villes|sites|monuments|montagnes|fleuves|îles|régions|cultures|lieux|pièces|espaces|endroits|destinations)/iu,
  ],
  [
    "objects",
    /(?:objets|jouets|appareils|outils|instruments|meubles|produits|équipements|accessoires|fournitures|matériaux|éléments|parties|documents|aliments|ingrédients|vêtements|chaussures|bijoux|boissons|snacks)/iu,
  ],
  [
    "actions",
    /(?:raisons|façons|moyens|choses|situations|signes|étapes|activités|tâches|voyages|expéditions|conquêtes|événements|excuses|habitudes|problèmes|occasions|moments)/iu,
  ],
  [
    "abstract",
    /(?:types|styles|formes|genres|couleurs|records|catégories|sujets|notions|technologies|avantages|indications|indicateurs|secteurs|services|disciplines|matières|termes|expressions)/iu,
  ],
];

const decoys = {
  "arts-literature": {
    people: "Pinceau",
    works: "Bibliothécaire",
    places: "Stylo-plume",
    objects: "Conservateur de musée",
    actions: "Statue",
    abstract: "Chevalet",
  },
  "brands-shopping": {
    people: "Ticket de caisse",
    works: "Vendeur",
    places: "Code-barres",
    objects: "Caissier",
    actions: "Panier",
    abstract: "Client",
  },
  celebrities: {
    people: "Tapis rouge",
    works: "Photographe",
    places: "Microphone",
    objects: "Actrice",
    actions: "Oscar",
    abstract: "Caméra",
  },
  cinema: {
    people: "Projecteur",
    works: "Réalisateur",
    places: "Clap de cinéma",
    objects: "Acteur",
    actions: "Bobine de film",
    abstract: "Caméra",
  },
  "economy-business": {
    people: "Facture",
    works: "Comptable",
    places: "Calculatrice",
    objects: "Économiste",
    actions: "Ticket de caisse",
    abstract: "Client",
  },
  "everyday-life": {
    people: "Réveil",
    works: "Voisin",
    places: "Porte-clés",
    objects: "Concierge",
    actions: "Calendrier",
    abstract: "Facteur",
  },
  "fashion-beauty": {
    people: "Miroir",
    works: "Styliste",
    places: "Cintre",
    objects: "Mannequin vivant",
    actions: "Bouton",
    abstract: "Couturier",
  },
  "games-entertainment": {
    people: "Dé à jouer",
    works: "Arbitre",
    places: "Pion",
    objects: "Joueur",
    actions: "Carte à jouer",
    abstract: "Joueur",
  },
  "geography-world": {
    people: "Boussole",
    works: "Géographe",
    places: "Passeport",
    objects: "Guide touristique",
    actions: "Globe terrestre",
    abstract: "Voyageur",
  },
  history: {
    people: "Manuel d’histoire",
    works: "Historien",
    places: "Chronologie",
    objects: "Archéologue",
    actions: "Pièce de musée",
    abstract: "Témoin",
  },
  "home-diy": {
    people: "Marteau",
    works: "Bricoleur",
    places: "Tournevis",
    objects: "Artisan",
    actions: "Boîte à outils",
    abstract: "Plombier",
  },
  "internet-social": {
    people: "Clavier",
    works: "Internaute",
    places: "Mot de passe",
    objects: "Modérateur",
    actions: "Routeur Wi-Fi",
    abstract: "Utilisateur",
  },
  music: {
    people: "Microphone",
    works: "Chanteur",
    places: "Médiator",
    objects: "Musicien",
    actions: "Billet de concert",
    abstract: "Guitariste",
  },
  "nature-body": {
    people: "Jumelles",
    works: "Naturaliste",
    places: "Microscope",
    objects: "Biologiste",
    actions: "Guide naturaliste",
    abstract: "Vétérinaire",
  },
  "party-alcohol": {
    people: "Verre vide",
    works: "DJ",
    places: "Invitation",
    objects: "Invité",
    actions: "Glaçon",
    abstract: "Barman",
  },
  "records-rankings": {
    people: "Podium",
    works: "Arbitre",
    places: "Médaille",
    objects: "Champion",
    actions: "Chronomètre",
    abstract: "Juge",
  },
  "relationships-substances": {
    people: "Téléphone",
    works: "Thérapeute",
    places: "Message privé",
    objects: "Médecin",
    actions: "Préservatif fermé",
    abstract: "Conseiller",
  },
  "science-inventions": {
    people: "Microscope",
    works: "Scientifique",
    places: "Éprouvette",
    objects: "Chercheuse",
    actions: "Thermomètre",
    abstract: "Laborantin",
  },
  sport: {
    people: "Ballon",
    works: "Arbitre",
    places: "Sifflet",
    objects: "Athlète",
    actions: "Chronomètre",
    abstract: "Entraîneur",
  },
  "television-series": {
    people: "Télécommande",
    works: "Actrice",
    places: "Écran de télévision",
    objects: "Présentateur",
    actions: "Télécommande",
    abstract: "Réalisateur",
  },
  "travel-vacation": {
    people: "Valise",
    works: "Guide touristique",
    places: "Passeport",
    objects: "Voyageur",
    actions: "Carte d’embarquement",
    abstract: "Réceptionniste",
  },
  "video-games": {
    people: "Manette",
    works: "Joueur",
    places: "Joystick",
    objects: "Game designer",
    actions: "Console",
    abstract: "Développeur",
  },
  "work-office": {
    people: "Badge",
    works: "Collègue",
    places: "Agrafeuse",
    objects: "Manager",
    actions: "Ordinateur",
    abstract: "Stagiaire",
  },
  "world-food": {
    people: "Casserole",
    works: "Cuisinier",
    places: "Fourchette",
    objects: "Chef cuisinier",
    actions: "Assiette",
    abstract: "Serveur",
  },
};

function resolveValue(value, context) {
  return typeof value === "function" ? value(context) : value;
}

function bombFor(question) {
  for (const [pattern, displayValue, explanationValue] of exactRules) {
    const match = question.questionText.match(pattern);
    if (match) {
      const context = { match, question };
      return {
        display: resolveValue(displayValue, context).trim(),
        explanation: resolveValue(explanationValue, context).trim(),
      };
    }
  }
  const kind = kindPatterns.find(([, pattern]) => pattern.test(question.questionText))?.[0];
  const display = kind ? decoys[question.themeId]?.[kind] : null;
  if (!display)
    throw new Error(`Aucune bombe éditoriale : ${question.id} — ${question.questionText}`);
  return {
    display,
    explanation: `« ${display} » reste lié au thème, mais n’appartient clairement pas à la catégorie précise demandée.`,
  };
}

const themesRoot = resolve("content", "themes");
const themeDirectories = (await readdir(themesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let questionCount = 0;
for (const directory of themeDirectories) {
  const directoryPath = resolve(themesRoot, directory);
  const themePath = resolve(directoryPath, "theme.json");
  const theme = JSON.parse(await readFile(themePath, "utf8"));
  theme.contentVersion = CONTENT_VERSION;
  await writeFile(themePath, await format(JSON.stringify(theme), { parser: "json" }), "utf8");

  for (const difficulty of ["easy", "medium", "hard"]) {
    const questionPath = resolve(directoryPath, `questions.${difficulty}.json`);
    const questions = JSON.parse(await readFile(questionPath, "utf8"));
    for (const question of questions) {
      const { display, explanation } = bombFor(question);
      const normalized = normalizeAnswer(display);
      const accepted = new Set(
        question.answers.map((answer) => normalizeAnswer(answer.normalized)),
      );
      if (accepted.has(normalized)) {
        throw new Error(`${question.id}: la bombe « ${display} » est une bonne réponse`);
      }
      question.bomb = {
        id: `${question.id}-bomb`,
        display,
        normalized,
        aliases: [],
        abbreviations: [],
        alternativeSpellings: [],
        accentInsensitiveVariants: [],
        hyphenationVariants: [],
        explanation,
      };
      question.version = Math.max(question.version, 3);
      question.updatedAt = UPDATED_AT;
      questionCount += 1;
    }
    await writeFile(
      questionPath,
      await format(JSON.stringify(questions), { parser: "json" }),
      "utf8",
    );
  }
}

if (questionCount !== 480) throw new Error(`480 questions attendues, ${questionCount} traitées`);
console.log(`${questionCount} bombes éditoriales ajoutées, contenu ${CONTENT_VERSION}.`);
