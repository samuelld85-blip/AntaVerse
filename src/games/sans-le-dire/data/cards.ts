import type { Card } from "@/games/sans-le-dire/lib/game/types";

type Group = { clues: readonly [string, string]; items: readonly (readonly [string, string])[] };

const groups: readonly Group[] = [
  {
    clues: ["Plat", "Manger"],
    items: [
      ["Raclette", "Fromage"],
      ["Pizza", "Italie"],
      ["Sushi", "Japon"],
      ["Burger", "Pain"],
      ["Tacos", "Mexique"],
      ["Kebab", "Broche"],
      ["Crêpe", "Bretagne"],
      ["Fondue", "Savoyarde"],
      ["Paella", "Riz"],
      ["Couscous", "Semoule"],
    ],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [
      ["Tiramisu", "Café"],
      ["Macaron", "Ladurée"],
      ["Brownie", "Chocolat"],
      ["Cheesecake", "Fromage"],
      ["Éclair", "Pâtisserie"],
      ["Donut", "Trou"],
      ["Cookie", "Pépites"],
      ["Mousse au chocolat", "Œufs"],
      ["Crème brûlée", "Caramel"],
      ["Glace", "Froid"],
    ],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [
      ["Mojito", "Menthe"],
      ["Spritz", "Orange"],
      ["Margarita", "Tequila"],
      ["Piña colada", "Ananas"],
      ["Gin tonic", "Concombre"],
      ["Moscow mule", "Gingembre"],
      ["Caipirinha", "Brésil"],
      ["Bloody Mary", "Tomate"],
      ["Sex on the beach", "Cocktail"],
      ["Monaco", "Bière"],
    ],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [
      ["Tequila", "Mexique"],
      ["Vodka", "Russie"],
      ["Whisky", "Écosse"],
      ["Rhum", "Pirate"],
      ["Champagne", "Bulles"],
      ["Pastis", "Anis"],
      ["Rosé", "Vin"],
      ["Jägermeister", "Digestif"],
      ["Get 27", "Menthe"],
      ["Limoncello", "Citron"],
    ],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [
      ["Boîte de nuit", "Danser"],
      ["After", "Matin"],
      ["Open bar", "Illimité"],
      ["Gueule de bois", "Lendemain"],
      ["Videur", "Entrée"],
      ["DJ", "Platine"],
      ["Karaoké", "Chanter"],
      ["Happy hour", "Réduction"],
      ["Piste de danse", "Musique"],
      ["Dernier verre", "Fermeture"],
    ],
  },
  {
    clues: ["Festival", "Musique"],
    items: [
      ["Coachella", "Californie"],
      ["Tomorrowland", "Électro"],
      ["Hellfest", "Métal"],
      ["Solidays", "Paris"],
      ["Vieilles Charrues", "Bretagne"],
      ["Lollapalooza", "Concert"],
      ["Garorock", "Marmande"],
      ["Main Square", "Arras"],
      ["Rock en Seine", "Saint-Cloud"],
      ["Eurovision", "Chanson"],
    ],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [
      ["Tinder", "Swipe"],
      ["Instagram", "Photo"],
      ["TikTok", "Vidéo"],
      ["Snapchat", "Éphémère"],
      ["WhatsApp", "Message"],
      ["Uber", "Chauffeur"],
      ["Deliveroo", "Livraison"],
      ["Shazam", "Reconnaître"],
      ["Duolingo", "Langue"],
      ["Vinted", "Vêtement"],
    ],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [
      ["Facebook", "Amis"],
      ["LinkedIn", "Travail"],
      ["X", "Tweet"],
      ["Reddit", "Forum"],
      ["Pinterest", "Inspiration"],
      ["BeReal", "Notification"],
      ["Twitch", "Stream"],
      ["Discord", "Serveur"],
      ["YouTube", "Vidéo"],
      ["OnlyFans", "Abonnement"],
    ],
  },
  {
    clues: ["Site", "Internet"],
    items: [
      ["Google", "Recherche"],
      ["Wikipedia", "Encyclopédie"],
      ["Amazon", "Achat"],
      ["Leboncoin", "Occasion"],
      ["Booking", "Hôtel"],
      ["Airbnb", "Location"],
      ["Netflix", "Série"],
      ["Spotify", "Musique"],
      ["Doctolib", "Rendez-vous"],
      ["Pornhub", "Adulte"],
    ],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [
      ["Apple", "iPhone"],
      ["Samsung", "Galaxy"],
      ["Microsoft", "Windows"],
      ["Sony", "PlayStation"],
      ["Nintendo", "Mario"],
      ["Tesla", "Électrique"],
      ["Dyson", "Aspirateur"],
      ["GoPro", "Caméra"],
      ["Bose", "Casque"],
      ["Canon", "Photo"],
    ],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [
      ["Nike", "Virgule"],
      ["Adidas", "Trois bandes"],
      ["Zara", "Espagne"],
      ["H&M", "Suède"],
      ["Lacoste", "Crocodile"],
      ["Levi's", "Jean"],
      ["The North Face", "Doudoune"],
      ["Uniqlo", "Japon"],
      ["Ralph Lauren", "Polo"],
      ["Patagonia", "Outdoor"],
    ],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [
      ["Louis Vuitton", "Monogramme"],
      ["Chanel", "Numéro 5"],
      ["Dior", "Couture"],
      ["Hermès", "Birkin"],
      ["Gucci", "Italie"],
      ["Rolex", "Montre"],
      ["Cartier", "Bijou"],
      ["Prada", "Sac"],
      ["Balenciaga", "Sneakers"],
      ["Louboutin", "Semelle rouge"],
    ],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [
      ["McDonald's", "Big Mac"],
      ["Burger King", "Whopper"],
      ["KFC", "Poulet"],
      ["Subway", "Sandwich"],
      ["Domino's", "Pizza"],
      ["O'Tacos", "French tacos"],
      ["Five Guys", "Cacahuètes"],
      ["Quick", "Giant"],
      ["Starbucks", "Café"],
      ["Pokawa", "Poké bowl"],
    ],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [
      ["Carrefour", "Hypermarché"],
      ["Auchan", "Caddie"],
      ["Lidl", "Discount"],
      ["Monoprix", "Centre-ville"],
      ["Picard", "Surgelé"],
      ["Franprix", "Proximité"],
      ["Leclerc", "Ticket"],
      ["Intermarché", "Mousquetaires"],
      ["Aldi", "Prix"],
      ["Grand Frais", "Fruits"],
    ],
  },
  {
    clues: ["Ville", "France"],
    items: [
      ["Paris", "Tour Eiffel"],
      ["Marseille", "Vieux-Port"],
      ["Lyon", "Bouchon"],
      ["Bordeaux", "Vin"],
      ["Lille", "Nord"],
      ["Toulouse", "Rose"],
      ["Nice", "Promenade"],
      ["Nantes", "Éléphant"],
      ["Strasbourg", "Alsace"],
      ["Montpellier", "Sud"],
    ],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [
      ["Londres", "Big Ben"],
      ["Madrid", "Espagne"],
      ["Rome", "Colisée"],
      ["Berlin", "Allemagne"],
      ["Lisbonne", "Portugal"],
      ["Amsterdam", "Canaux"],
      ["Bruxelles", "Belgique"],
      ["Athènes", "Acropole"],
      ["Dublin", "Irlande"],
      ["Vienne", "Autriche"],
    ],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [
      ["New York", "Statue de la Liberté"],
      ["Los Angeles", "Hollywood"],
      ["Tokyo", "Japon"],
      ["Dubaï", "Burj Khalifa"],
      ["Bangkok", "Thaïlande"],
      ["Sydney", "Opéra"],
      ["Rio de Janeiro", "Christ"],
      ["Montréal", "Québec"],
      ["Marrakech", "Maroc"],
      ["Istanbul", "Turquie"],
    ],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [
      ["TGV", "SNCF"],
      ["Métro", "Souterrain"],
      ["Tramway", "Rails"],
      ["Trottinette", "Électrique"],
      ["Covoiturage", "BlaBlaCar"],
      ["Avion", "Aéroport"],
      ["Ferry", "Bateau"],
      ["Camping-car", "Vacances"],
      ["Téléphérique", "Montagne"],
      ["Eurostar", "Londres"],
    ],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [
      ["Passeport", "Frontière"],
      ["Valise", "Bagage"],
      ["Auberge de jeunesse", "Dortoir"],
      ["All inclusive", "Hôtel"],
      ["Jet lag", "Décalage"],
      ["Road trip", "Voiture"],
      ["Carte postale", "Timbre"],
      ["Guide touristique", "Visite"],
      ["Souvenir", "Rapporter"],
      ["Douane", "Contrôle"],
    ],
  },
  {
    clues: ["Plage", "Été"],
    items: [
      ["Crème solaire", "UV"],
      ["Maillot de bain", "Nager"],
      ["Serviette", "Sécher"],
      ["Château de sable", "Enfant"],
      ["Bouée", "Flotter"],
      ["Parasol", "Ombre"],
      ["Coup de soleil", "Rouge"],
      ["Glacière", "Froid"],
      ["Beach-volley", "Ballon"],
      ["Tongs", "Pieds"],
    ],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [
      ["Titanic", "Iceberg"],
      ["Avatar", "Bleu"],
      ["Harry Potter", "Sorcier"],
      ["Star Wars", "Jedi"],
      ["Le Roi Lion", "Simba"],
      ["Jurassic Park", "Dinosaure"],
      ["Matrix", "Pilule"],
      ["Inception", "Rêve"],
      ["Intouchables", "Fauteuil"],
      ["Astérix et Obélix", "Gaulois"],
    ],
  },
  {
    clues: ["Série", "Télévision"],
    items: [
      ["Game of Thrones", "Dragon"],
      ["Stranger Things", "Upside Down"],
      ["Friends", "Café"],
      ["Breaking Bad", "Méthamphétamine"],
      ["La Casa de Papel", "Braquage"],
      ["Squid Game", "Corée"],
      ["The Walking Dead", "Zombie"],
      ["Peaky Blinders", "Birmingham"],
      ["Emily in Paris", "Mode"],
      ["Kaamelott", "Arthur"],
    ],
  },
  {
    clues: ["Personnage", "Film"],
    items: [
      ["James Bond", "007"],
      ["Batman", "Gotham"],
      ["Spider-Man", "Araignée"],
      ["Dark Vador", "Masque"],
      ["Shrek", "Ogre"],
      ["Barbie", "Poupée"],
      ["Indiana Jones", "Fouet"],
      ["Rocky", "Boxe"],
      ["Jack Sparrow", "Pirate"],
      ["Forrest Gump", "Courir"],
    ],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [
      ["Mickey", "Disney"],
      ["Bob l'éponge", "Ananas"],
      ["Homer Simpson", "Donut"],
      ["Pikachu", "Pokémon"],
      ["Stitch", "Hawaï"],
      ["Totoro", "Japon"],
      ["Buzz l'Éclair", "Espace"],
      ["Scooby-Doo", "Chien"],
      ["Titeuf", "Mèche"],
      ["Ladybug", "Coccinelle"],
    ],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [
      ["Stromae", "Belgique"],
      ["Jul", "Marseille"],
      ["Orelsan", "Caen"],
      ["Gims", "Lunettes"],
      ["Vianney", "Guitare"],
      ["Soprano", "Rappeur"],
      ["David Guetta", "DJ"],
      ["Mylène Farmer", "Rousse"],
      ["Johnny Hallyday", "Rock"],
      ["Patrick Bruel", "Place des grands hommes"],
    ],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [
      ["Aya Nakamura", "Djadja"],
      ["Angèle", "Belgique"],
      ["Taylor Swift", "Eras"],
      ["Beyoncé", "Queen B"],
      ["Rihanna", "Barbade"],
      ["Lady Gaga", "Poker Face"],
      ["Adele", "Hello"],
      ["Dua Lipa", "Dance"],
      ["Billie Eilish", "Cheveux"],
      ["Céline Dion", "Titanic"],
    ],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [
      ["Booba", "Duc"],
      ["Ninho", "Jefe"],
      ["SCH", "A7"],
      ["PNL", "Deux frères"],
      ["Damso", "Bruxelles"],
      ["Nekfeu", "Feu"],
      ["Kaaris", "Sevran"],
      ["Lomepal", "Yeux disent"],
      ["Vald", "Désaccordé"],
      ["Bigflo et Oli", "Toulouse"],
    ],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [
      ["Mario Kart", "Course"],
      ["Fortnite", "Battle royale"],
      ["Minecraft", "Cube"],
      ["FIFA", "Football"],
      ["Call of Duty", "Guerre"],
      ["Grand Theft Auto", "Vol de voiture"],
      ["Animal Crossing", "Île"],
      ["The Sims", "Vie"],
      ["League of Legends", "MOBA"],
      ["Among Us", "Imposteur"],
    ],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [
      ["Uno", "Cartes"],
      ["Monopoly", "Argent"],
      ["Time's Up", "Sabliers"],
      ["Loup-garou", "Village"],
      ["Beer pong", "Gobelet"],
      ["Action ou vérité", "Question"],
      ["Limite Limite", "Humour"],
      ["Blanc-manger Coco", "Phrase"],
      ["Jungle Speed", "Totem"],
      ["Mario Party", "Mini-jeux"],
    ],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [
      ["Football", "But"],
      ["Basketball", "Panier"],
      ["Rugby", "Essai"],
      ["Tennis", "Raquette"],
      ["Handball", "Main"],
      ["Volleyball", "Filet"],
      ["Golf", "Trou"],
      ["Baseball", "Batte"],
      ["Water-polo", "Piscine"],
      ["Pétanque", "Cochonnet"],
    ],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [
      ["Kylian Mbappé", "Football"],
      ["Zinédine Zidane", "Numéro 10"],
      ["Antoine Dupont", "Rugby"],
      ["Teddy Riner", "Judo"],
      ["Léon Marchand", "Natation"],
      ["Tony Parker", "Basket"],
      ["Rafael Nadal", "Tennis"],
      ["Usain Bolt", "Sprint"],
      ["Michael Jordan", "Chicago"],
      ["Cristiano Ronaldo", "Portugal"],
    ],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [
      ["Jeux olympiques", "Médaille"],
      ["Coupe du monde", "Football"],
      ["Tour de France", "Vélo"],
      ["Roland-Garros", "Terre battue"],
      ["Super Bowl", "Football américain"],
      ["Formule 1", "Voiture"],
      ["Ligue des champions", "Europe"],
      ["Marathon", "42 kilomètres"],
      ["Wimbledon", "Gazon"],
      ["NBA", "Basket"],
    ],
  },
  {
    clues: ["Étudiant", "École"],
    items: [
      ["BDE", "Soirée"],
      ["Partiel", "Examen"],
      ["Amphi", "Cours"],
      ["CROUS", "Bourse"],
      ["Erasmus", "Étranger"],
      ["Alternance", "Entreprise"],
      ["Stage", "Convention"],
      ["Rattrapage", "Note"],
      ["Mémoire", "Soutenance"],
      ["Gala", "Promotion"],
    ],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [
      ["Réunion", "Agenda"],
      ["Télétravail", "Maison"],
      ["Open space", "Collègues"],
      ["Pause café", "Machine"],
      ["PowerPoint", "Diapositive"],
      ["Burn-out", "Épuisement"],
      ["Afterwork", "Verre"],
      ["Team building", "Équipe"],
      ["Slack", "Messages"],
      ["Ticket restaurant", "Déjeuner"],
    ],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [
      ["Start-up", "Innovation"],
      ["CEO", "Directeur"],
      ["RH", "Recrutement"],
      ["CDD", "Contrat"],
      ["Freelance", "Indépendant"],
      ["Licenciement", "Viré"],
      ["Augmentation", "Salaire"],
      ["Entretien d'embauche", "Candidat"],
      ["Démission", "Quitter"],
      ["Séminaire", "Hôtel"],
    ],
  },
  {
    clues: ["Relation", "Amour"],
    items: [
      ["Premier rendez-vous", "Restaurant"],
      ["Coup de foudre", "Instantané"],
      ["Friendzone", "Ami"],
      ["Relation à distance", "Kilomètres"],
      ["Jalousie", "Possessif"],
      ["Rupture", "Séparation"],
      ["Demande en mariage", "Bague"],
      ["Ex", "Ancien"],
      ["Crush", "Attirance"],
      ["Âme sœur", "Destin"],
    ],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [
      ["Match", "Compatible"],
      ["Swipe", "Glisser"],
      ["Ghosting", "Disparaître"],
      ["Red flag", "Danger"],
      ["Bio Tinder", "Profil"],
      ["Date", "Rendez-vous"],
      ["Célibataire", "Couple"],
      ["Plan cul", "Sexe"],
      ["Love bombing", "Messages"],
      ["Pécho", "Embrasser"],
    ],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [
      ["Préservatif", "Protection"],
      ["Sex-toy", "Plaisir"],
      ["Missionnaire", "Position"],
      ["Strip-tease", "Se déshabiller"],
      ["Libido", "Désir"],
      ["Sexto", "Message"],
      ["Nudiste", "Nu"],
      ["Orgasm", "Jouissance"],
      ["Menottes", "Poignets"],
      ["Plan à trois", "Trois personnes"],
    ],
  },
  {
    clues: ["Fête", "Produit"],
    items: [
      ["Joint", "Cannabis"],
      ["MDMA", "Ecstasy"],
      ["Cigarette", "Tabac"],
      ["Chicha", "Narguilé"],
      ["CBD", "Cannabidiol"],
      ["Vape", "Électronique"],
      ["Poppers", "Flacon"],
      ["Caféine", "Énergie"],
      ["Energy drink", "Taurine"],
      ["Champignon hallucinogène", "Psychédélique"],
    ],
  },
  {
    clues: ["Objet", "Maison"],
    items: [
      ["Aspirateur", "Poussière"],
      ["Micro-ondes", "Réchauffer"],
      ["Canapé", "Salon"],
      ["Frigo", "Froid"],
      ["Lave-vaisselle", "Assiette"],
      ["Télécommande", "Télévision"],
      ["Réveil", "Matin"],
      ["Bougie", "Flamme"],
      ["Miroir", "Reflet"],
      ["Oreiller", "Dormir"],
    ],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [
      ["Chargeur", "Batterie"],
      ["Coque", "Protection"],
      ["Écouteurs", "Musique"],
      ["Mode avion", "Réseau"],
      ["Code PIN", "Déverrouiller"],
      ["Capture d'écran", "Image"],
      ["Notification", "Alerte"],
      ["Batterie externe", "Recharge"],
      ["AirDrop", "Apple"],
      ["Selfie", "Photo"],
    ],
  },
  {
    clues: ["Internet", "Expression"],
    items: [
      ["Mème", "Image"],
      ["Influenceur", "Abonnés"],
      ["Hashtag", "Dièse"],
      ["Buzz", "Viral"],
      ["Troll", "Provoquer"],
      ["Fake news", "Faux"],
      ["Story", "24 heures"],
      ["Algorithme", "Recommandation"],
      ["Podcast", "Audio"],
      ["Live", "Direct"],
    ],
  },
  {
    clues: ["Célébrité", "France"],
    items: [
      ["Omar Sy", "Intouchables"],
      ["Jean Dujardin", "The Artist"],
      ["Marion Cotillard", "Oscar"],
      ["Jamel Debbouze", "Humoriste"],
      ["Florence Foresti", "Spectacle"],
      ["Philippe Etchebest", "Cuisine"],
      ["Léna Situations", "Influenceuse"],
      ["Squeezie", "YouTube"],
      ["Inoxtag", "Everest"],
      ["Nabilla", "Allô"],
    ],
  },
  {
    clues: ["Star", "International"],
    items: [
      ["Leonardo DiCaprio", "Titanic"],
      ["Brad Pitt", "Acteur"],
      ["Angelina Jolie", "Tomb Raider"],
      ["Tom Cruise", "Mission impossible"],
      ["Zendaya", "Euphoria"],
      ["Kim Kardashian", "Télé-réalité"],
      ["Elon Musk", "Tesla"],
      ["MrBeast", "YouTube"],
      ["Gordon Ramsay", "Cuisine"],
      ["Greta Thunberg", "Climat"],
    ],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [
      ["Koh-Lanta", "Aventure"],
      ["Top Chef", "Cuisine"],
      ["The Voice", "Chant"],
      ["Fort Boyard", "Clés"],
      ["Pékin Express", "Voyage"],
      ["Danse avec les stars", "Danser"],
      ["L'amour est dans le pré", "Agriculteur"],
      ["Questions pour un champion", "Quiz"],
      ["Secret Story", "Secret"],
      ["Les Marseillais", "Télé-réalité"],
    ],
  },
  {
    clues: ["Corps", "Humain"],
    items: [
      ["Cerveau", "Penser"],
      ["Cœur", "Battre"],
      ["Poumon", "Respirer"],
      ["Foie", "Alcool"],
      ["Estomac", "Digérer"],
      ["Genou", "Jambe"],
      ["Coude", "Bras"],
      ["Nombril", "Ventre"],
      ["Sourcil", "Œil"],
      ["Cheville", "Pied"],
    ],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [
      ["Rhume", "Nez"],
      ["Migraine", "Tête"],
      ["Fièvre", "Température"],
      ["Allergie", "Éternuer"],
      ["Courbatures", "Muscle"],
      ["Hoquet", "Respiration"],
      ["Entorse", "Cheville"],
      ["Insomnie", "Dormir"],
      ["Mal de mer", "Bateau"],
      ["Nausée", "Vomir"],
    ],
  },
  {
    clues: ["Expression", "Français"],
    items: [
      ["Poser un lapin", "Rendez-vous"],
      ["Avoir le seum", "Dégoûté"],
      ["Tomber dans les pommes", "Évanouir"],
      ["Coûter un bras", "Cher"],
      ["Donner sa langue au chat", "Réponse"],
      ["Mettre les pieds dans le plat", "Gaffe"],
      ["Avoir la dalle", "Faim"],
      ["Raconter des salades", "Mentir"],
      ["Être au bout du rouleau", "Fatigué"],
      ["Prendre la grosse tête", "Prétentieux"],
    ],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [
      ["Honte", "Rougir"],
      ["Fierté", "Réussite"],
      ["Nostalgie", "Passé"],
      ["Stress", "Anxiété"],
      ["Ennui", "Temps"],
      ["Euphorie", "Joie"],
      ["Déception", "Attente"],
      ["Soulagement", "Ouf"],
      ["Culpabilité", "Faute"],
      ["Coup de blues", "Triste"],
    ],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [
      ["Canicule", "Chaud"],
      ["Orage", "Tonnerre"],
      ["Arc-en-ciel", "Couleurs"],
      ["Brouillard", "Visibilité"],
      ["Neige", "Blanc"],
      ["Grêle", "Glace"],
      ["Tornade", "Vent"],
      ["Foudre", "Éclair"],
      ["Averse", "Pluie"],
      ["Gel", "Froid"],
    ],
  },
  {
    clues: ["Animal", "Nature"],
    items: [
      ["Panda", "Bambou"],
      ["Girafe", "Cou"],
      ["Kangourou", "Poche"],
      ["Flamant rose", "Patte"],
      ["Paresseux", "Lent"],
      ["Dauphin", "Mer"],
      ["Requin", "Dents"],
      ["Pingouin", "Banquise"],
      ["Caméléon", "Couleur"],
      ["Licorne", "Corne"],
    ],
  },
  {
    clues: ["Sucre", "Chocolat"],
    items: [["Churros", "Espagne"]],
  },
  {
    clues: ["Boulangerie", "Petit-déjeuner"],
    items: [["Croissant", "Beurre"]],
  },
  {
    clues: ["Lardons", "Tarte"],
    items: [["Quiche lorraine", "Œufs"]],
  },
  {
    clues: ["Crème", "Four"],
    items: [["Gratin dauphinois", "Pommes de terre"]],
  },
  {
    clues: ["Viande", "Mijoté"],
    items: [["Bœuf bourguignon", "Vin rouge"]],
  },
  {
    clues: ["Saucisse", "Toulouse"],
    items: [["Cassoulet", "Haricots"]],
  },
  {
    clues: ["Italie", "Parmesan"],
    items: [["Risotto", "Riz"]],
  },
  {
    clues: ["Italie", "Béchamel"],
    items: [["Lasagnes", "Pâtes"]],
  },
  {
    clues: ["Lardons", "Italie"],
    items: [["Carbonara", "Pâtes"]],
  },
  {
    clues: ["Nouilles", "Cacahuète"],
    items: [["Pad thaï", "Thaïlande"]],
  },
  {
    clues: ["Épices", "Sauce"],
    items: [["Curry", "Inde"]],
  },
  {
    clues: ["Caramel", "Renversée"],
    items: [["Tarte Tatin", "Pomme"]],
  },
  {
    clues: ["Rhum", "Vanille"],
    items: [["Cannelé", "Bordeaux"]],
  },
  {
    clues: ["Crème", "Dessert"],
    items: [["Panna cotta", "Italie"]],
  },
  {
    clues: ["Poisson", "Friture"],
    items: [["Fish and chips", "Angleterre"]],
  },
  {
    clues: ["Fromage", "Pain"],
    items: [["Croque-monsieur", "Jambon"]],
  },
  {
    clues: ["Rose", "New York"],
    items: [["Cosmopolitan", "Vodka"]],
  },
  {
    clues: ["Cassis", "Apéritif"],
    items: [["Kir royal", "Champagne"]],
  },
  {
    clues: ["Crème", "Café"],
    items: [["Baileys", "Irlande"]],
  },
  {
    clues: ["Anis", "Interdite"],
    items: [["Absinthe", "Fée verte"]],
  },
  {
    clues: ["Cul sec", "Rapide"],
    items: [["Shot", "Verre"]],
  },
  {
    clues: ["Liqueur", "Moine"],
    items: [["Chartreuse", "Vert"]],
  },
  {
    clues: ["Ticket", "Entrée"],
    items: [["Vestiaire", "Manteau"]],
  },
  {
    clues: ["Extérieur", "Pause"],
    items: [["Fumoir", "Cigarette"]],
  },
  {
    clues: ["Lancer", "Nouvel An"],
    items: [["Confettis", "Fête"]],
  },
  {
    clues: ["Chanson", "Ordre"],
    items: [["Playlist", "Musique"]],
  },
  {
    clues: ["Artiste", "Accès"],
    items: [["Backstage", "Coulisses"]],
  },
  {
    clues: ["Scène", "Concert"],
    items: [["Fosse", "Devant"]],
  },
  {
    clues: ["Repas", "Application"],
    items: [["Uber Eats", "Livraison"]],
  },
  {
    clues: ["Trajet", "Bouchon"],
    items: [["Waze", "GPS"]],
  },
  {
    clues: ["Itinéraire", "Carte"],
    items: [["Google Maps", "GPS"]],
  },
  {
    clues: ["Application", "Carte"],
    items: [["Revolut", "Banque"]],
  },
  {
    clues: ["Application", "Course"],
    items: [["Strava", "Sport"]],
  },
  {
    clues: ["Réunion", "Application"],
    items: [["Zoom", "Visio"]],
  },
  {
    clues: ["Scanner", "Alimentation"],
    items: [["Yuka", "Application"]],
  },
  {
    clues: ["Téléphone", "Marque"],
    items: [["Huawei", "Chine"]],
  },
  {
    clues: ["Téléphone", "Marque"],
    items: [["Xiaomi", "Chine"]],
  },
  {
    clues: ["Télévision", "Électroménager"],
    items: [["LG", "Corée"]],
  },
  {
    clues: ["Marque", "Rasoir"],
    items: [["Philips", "Électroménager"]],
  },
  {
    clues: ["Son", "Bluetooth"],
    items: [["JBL", "Enceinte"]],
  },
  {
    clues: ["Clavier", "Informatique"],
    items: [["Logitech", "Souris"]],
  },
  {
    clues: ["Marque", "Gaming"],
    items: [["Asus", "Ordinateur"]],
  },
  {
    clues: ["Gaming", "Puce"],
    items: [["Nvidia", "Carte graphique"]],
  },
  {
    clues: ["Montre", "Sport"],
    items: [["Garmin", "GPS"]],
  },
  {
    clues: ["Marque", "Chaussures"],
    items: [["Puma", "Sport"]],
  },
  {
    clues: ["Marque", "Chaussures"],
    items: [["Reebok", "Sport"]],
  },
  {
    clues: ["Marque", "Chaussures"],
    items: [["New Balance", "Sport"]],
  },
  {
    clues: ["Marque", "Étoile"],
    items: [["Converse", "Chaussures"]],
  },
  {
    clues: ["Skate", "Marque"],
    items: [["Vans", "Chaussures"]],
  },
  {
    clues: ["Marque", "Vêtements"],
    items: [["Bershka", "Zara"]],
  },
  {
    clues: ["Magasin", "Enseigne"],
    items: [["Boulanger", "Électroménager"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Rennes", "Bretagne"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Reims", "Champagne"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Grenoble", "Montagne"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Dijon", "Moutarde"]],
  },
  {
    clues: ["Montagne", "Ville"],
    items: [["Annecy", "Lac"]],
  },
  {
    clues: ["Côte", "Ville"],
    items: [["Biarritz", "Surf"]],
  },
  {
    clues: ["Océan", "Ville"],
    items: [["La Rochelle", "Port"]],
  },
  {
    clues: ["Pont", "Ville"],
    items: [["Avignon", "Festival"]],
  },
  {
    clues: ["Catalan", "Ville"],
    items: [["Perpignan", "Sud"]],
  },
  {
    clues: ["Gondole", "Canaux"],
    items: [["Venise", "Italie"]],
  },
  {
    clues: ["Ville", "Pont"],
    items: [["Prague", "République tchèque"]],
  },
  {
    clues: ["Bains", "Ville"],
    items: [["Budapest", "Hongrie"]],
  },
  {
    clues: ["Vélo", "Ville"],
    items: [["Copenhague", "Danemark"]],
  },
  {
    clues: ["Ville", "Capitale"],
    items: [["Stockholm", "Suède"]],
  },
  {
    clues: ["Ville", "Capitale"],
    items: [["Oslo", "Norvège"]],
  },
  {
    clues: ["Ville", "Capitale"],
    items: [["Helsinki", "Finlande"]],
  },
  {
    clues: ["Ville", "Capitale"],
    items: [["Varsovie", "Pologne"]],
  },
  {
    clues: ["Vin", "Ville"],
    items: [["Porto", "Portugal"]],
  },
  {
    clues: ["Ville", "Pont"],
    items: [["San Francisco", "Californie"]],
  },
  {
    clues: ["Désert", "Ville"],
    items: [["Las Vegas", "Casino"]],
  },
  {
    clues: ["Capitale", "Ville"],
    items: [["Mexico", "Mexique"]],
  },
  {
    clues: ["Tango", "Ville"],
    items: [["Buenos Aires", "Argentine"]],
  },
  {
    clues: ["Ville", "Capitale"],
    items: [["Séoul", "Corée"]],
  },
  {
    clues: ["Ville", "État"],
    items: [["Singapour", "Asie"]],
  },
  {
    clues: ["Île", "Plage"],
    items: [["Bali", "Indonésie"]],
  },
  {
    clues: ["Ville", "Montagne"],
    items: [["Le Cap", "Afrique du Sud"]],
  },
  {
    clues: ["Pédale", "Guidon"],
    items: [["Vélo", "Deux roues"]],
  },
  {
    clues: ["Paris", "Banlieue"],
    items: [["RER", "Train"]],
  },
  {
    clues: ["Ligne", "Arrêt"],
    items: [["Bus", "Transport"]],
  },
  {
    clues: ["Chauffeur", "Course"],
    items: [["Taxi", "Voiture"]],
  },
  {
    clues: ["Moteur", "Casque"],
    items: [["Scooter", "Deux roues"]],
  },
  {
    clues: ["Moteur", "Casque"],
    items: [["Moto", "Deux roues"]],
  },
  {
    clues: ["Voyage", "Pays"],
    items: [["Visa", "Document"]],
  },
  {
    clues: ["Attente", "Aéroport"],
    items: [["Escale", "Vol"]],
  },
  {
    clues: ["Randonnée", "Porté"],
    items: [["Sac à dos", "Voyage"]],
  },
  {
    clues: ["Aéroport", "Attente"],
    items: [["Correspondance", "Vol"]],
  },
  {
    clues: ["Visite", "Groupe"],
    items: [["Excursion", "Sortie"]],
  },
  {
    clues: ["Été", "Accessoire"],
    items: [["Lunettes de soleil", "Yeux"]],
  },
  {
    clues: ["Plage", "Bronzer"],
    items: [["Transat", "Chaise"]],
  },
  {
    clues: ["Peau", "Été"],
    items: [["Bronzage", "Soleil"]],
  },
  {
    clues: ["Grain", "Château"],
    items: [["Sable", "Plage"]],
  },
  {
    clues: ["Debout", "Rame"],
    items: [["Paddle", "Planche"]],
  },
  {
    clues: ["Hobbit", "Fantasy"],
    items: [["Le Seigneur des Anneaux", "Anneau"]],
  },
  {
    clues: ["Pirate", "Mer"],
    items: [["Pirates des Caraïbes", "Bateau"]],
  },
  {
    clues: ["Temps", "DeLorean"],
    items: [["Retour vers le futur", "Voiture"]],
  },
  {
    clues: ["Enfant", "Vélo"],
    items: [["E.T.", "Extraterrestre"]],
  },
  {
    clues: ["Club", "Comédie"],
    items: [["Les Bronzés", "Vacances"]],
  },
  {
    clues: ["Comédie", "Facteur"],
    items: [["Bienvenue chez les Ch'tis", "Nord"]],
  },
  {
    clues: ["Comédie", "Rétro"],
    items: [["OSS 117", "Espion"]],
  },
  {
    clues: ["Nuit", "Cannes"],
    items: [["La Cité de la Peur", "Comédie"]],
  },
  {
    clues: ["Fantaisie", "Paris"],
    items: [["Le Fabuleux Destin d'Amélie Poulain", "Montmartre"]],
  },
  {
    clues: ["Kryptonite", "Vole"],
    items: [["Superman", "Cape"]],
  },
  {
    clues: ["Lasso", "Super-héroïne"],
    items: [["Wonder Woman", "Amazone"]],
  },
  {
    clues: ["Colère", "Muscle"],
    items: [["Hulk", "Vert"]],
  },
  {
    clues: ["Robot", "Milliardaire"],
    items: [["Iron Man", "Armure"]],
  },
  {
    clues: ["Dieu", "Viking"],
    items: [["Thor", "Marteau"]],
  },
  {
    clues: ["Petit", "Sagesse"],
    items: [["Yoda", "Jedi"]],
  },
  {
    clues: ["Méchant", "Nez"],
    items: [["Voldemort", "Sorcier"]],
  },
  {
    clues: ["Glace", "Princesse"],
    items: [["Elsa", "Reine des Neiges"]],
  },
  {
    clues: ["Génie", "Tapis"],
    items: [["Aladdin", "Lampe"]],
  },
  {
    clues: ["Enfant", "Crochet"],
    items: [["Peter Pan", "Vole"]],
  },
  {
    clues: ["Renard", "Manga"],
    items: [["Naruto", "Ninja"]],
  },
  {
    clues: ["Rapide", "Bleu"],
    items: [["Sonic", "Hérisson"]],
  },
  {
    clues: ["Moustache", "Champignon"],
    items: [["Mario", "Plombier"]],
  },
  {
    clues: ["Anglais", "Roux"],
    items: [["Ed Sheeran", "Guitare"]],
  },
  {
    clues: ["Canada", "Pop"],
    items: [["Justin Bieber", "Chanteur"]],
  },
  {
    clues: ["Pop", "Chapeau"],
    items: [["Bruno Mars", "Chanteur"]],
  },
  {
    clues: ["Pop", "Canada"],
    items: [["The Weeknd", "Chanteur"]],
  },
  {
    clues: ["Canada", "Hip-hop"],
    items: [["Drake", "Rappeur"]],
  },
  {
    clues: ["Pop", "Queue de cheval"],
    items: [["Ariana Grande", "Chanteuse"]],
  },
  {
    clues: ["Pop", "Américaine"],
    items: [["Katy Perry", "Chanteuse"]],
  },
  {
    clues: ["Football", "Ballon"],
    items: [["Rocket League", "Voiture"]],
  },
  {
    clues: ["Assassin", "Capuche"],
    items: [["Assassin's Creed", "Historique"]],
  },
  {
    clues: ["Cheval", "Aventure"],
    items: [["Red Dead Redemption", "Western"]],
  },
  {
    clues: ["Combat", "Dresseur"],
    items: [["Pokémon", "Créature"]],
  },
  {
    clues: ["Symbole", "Rapidité"],
    items: [["Dobble", "Cartes"]],
  },
  {
    clues: ["Équipe", "Espion"],
    items: [["Codenames", "Mots"]],
  },
  {
    clues: ["Deviner", "Équipe"],
    items: [["Pictionary", "Dessin"]],
  },
  {
    clues: ["Couleurs", "Contorsion"],
    items: [["Twister", "Tapis"]],
  },
  {
    clues: ["Nager", "Crawl"],
    items: [["Natation", "Piscine"]],
  },
  {
    clues: ["Mur", "Prise"],
    items: [["Escalade", "Grimper"]],
  },
  {
    clues: ["Piste", "Bâtons"],
    items: [["Ski", "Neige"]],
  },
  {
    clues: ["Planche", "Piste"],
    items: [["Snowboard", "Neige"]],
  },
  {
    clues: ["Rame", "Eau"],
    items: [["Aviron", "Bateau"]],
  },
  {
    clues: ["Volant", "Filet"],
    items: [["Badminton", "Raquette"]],
  },
  {
    clues: ["Argentine", "Ballon d'or"],
    items: [["Lionel Messi", "Football"]],
  },
  {
    clues: ["Serbie", "Champion"],
    items: [["Novak Djokovic", "Tennis"]],
  },
  {
    clues: ["Suisse", "Champion"],
    items: [["Roger Federer", "Tennis"]],
  },
  {
    clues: ["Américaine", "Championne"],
    items: [["Simone Biles", "Gymnastique"]],
  },
  {
    clues: ["NBA", "Américain"],
    items: [["LeBron James", "Basketball"]],
  },
  {
    clues: ["Pilote", "Champion"],
    items: [["Lewis Hamilton", "Formule 1"]],
  },
  {
    clues: ["Toast", "Cuisine"],
    items: [["Grille-pain", "Pain"]],
  },
  {
    clues: ["Chaud", "Thé"],
    items: [["Bouilloire", "Eau"]],
  },
  {
    clues: ["Chaud", "Air"],
    items: [["Sèche-cheveux", "Cheveux"]],
  },
  {
    clues: ["Chaud", "Plis"],
    items: [["Fer à repasser", "Vêtements"]],
  },
  {
    clues: ["Lessive", "Tambour"],
    items: [["Machine à laver", "Linge"]],
  },
  {
    clues: ["Tissu", "Lumière"],
    items: [["Rideau", "Fenêtre"]],
  },
  {
    clues: ["Meuble", "Livre"],
    items: [["Étagère", "Rangement"]],
  },
  {
    clues: ["Sol", "Poussière"],
    items: [["Balai", "Ménage"]],
  },
  {
    clues: ["Cuisine", "Nettoyer"],
    items: [["Éponge", "Vaisselle"]],
  },
  {
    clues: ["Pouce", "Réseaux"],
    items: [["Like", "Cœur"]],
  },
  {
    clues: ["Privé", "Réseaux"],
    items: [["DM", "Message"]],
  },
  {
    clues: ["Suivre", "Réseaux"],
    items: [["Unfollow", "Arrêter"]],
  },
  {
    clues: ["Télévision", "France"],
    items: [["Cyril Hanouna", "Animateur"]],
  },
  {
    clues: ["Télévision", "France"],
    items: [["Jean-Luc Reichmann", "Animateur"]],
  },
  {
    clues: ["Télévision", "France"],
    items: [["Nagui", "Animateur"]],
  },
  {
    clues: ["Télévision", "France"],
    items: [["Karine Le Marchand", "Animatrice"]],
  },
  {
    clues: ["YouTube", "France"],
    items: [["Michou", "Influenceur"]],
  },
  {
    clues: ["YouTube", "France"],
    items: [["Mister V", "Rappeur"]],
  },
  {
    clues: ["France", "Vidéo"],
    items: [["Cyprien", "YouTubeur"]],
  },
  {
    clues: ["France", "Vidéo"],
    items: [["Norman", "YouTubeur"]],
  },
  {
    clues: ["Télévision", "France"],
    items: [["Nikos Aliagas", "Animateur"]],
  },
  {
    clues: ["Rouge", "Énervé"],
    items: [["Colère", "Émotion"]],
  },
  {
    clues: ["Frisson", "Trembler"],
    items: [["Peur", "Émotion"]],
  },
  {
    clues: ["Larmes", "Pleurer"],
    items: [["Tristesse", "Émotion"]],
  },
  {
    clues: ["Étonnement", "Inattendu"],
    items: [["Surprise", "Émotion"]],
  },
  {
    clues: ["Beurk", "Rejet"],
    items: [["Dégoût", "Émotion"]],
  },
  {
    clues: ["Impatience", "Énergie"],
    items: [["Excitation", "Émotion"]],
  },
  {
    clues: ["Chaud", "Rayons"],
    items: [["Soleil", "Ciel"]],
  },
  {
    clues: ["Ciel", "Parapluie"],
    items: [["Pluie", "Eau"]],
  },
  {
    clues: ["Souffle", "Rafale"],
    items: [["Vent", "Air"]],
  },
  {
    clues: ["Blanc", "Pluie"],
    items: [["Nuage", "Ciel"]],
  },
  {
    clues: ["Violent", "Météo"],
    items: [["Tempête", "Vent"]],
  },
  {
    clues: ["Sans pluie", "Météo"],
    items: [["Sécheresse", "Chaud"]],
  },
  {
    clues: ["Route", "Froid"],
    items: [["Verglas", "Glace"]],
  },
  {
    clues: ["Nuage", "Météo"],
    items: [["Éclaircie", "Soleil"]],
  },
  {
    clues: ["Grand", "Afrique"],
    items: [["Éléphant", "Trompe"]],
  },
  {
    clues: ["Savane", "Crinière"],
    items: [["Lion", "Roi"]],
  },
  {
    clues: ["Félin", "Jungle"],
    items: [["Tigre", "Rayures"]],
  },
  {
    clues: ["Afrique", "Cheval"],
    items: [["Zèbre", "Rayures"]],
  },
  {
    clues: ["Arbre", "Primate"],
    items: [["Singe", "Banane"]],
  },
  {
    clues: ["Grand", "Grognon"],
    items: [["Ours", "Forêt"]],
  },
  {
    clues: ["Hurler", "Forêt"],
    items: [["Loup", "Meute"]],
  },
  {
    clues: ["Rusé", "Forêt"],
    items: [["Renard", "Roux"]],
  },
  {
    clues: ["Australie", "Arbre"],
    items: [["Koala", "Eucalyptus"]],
  },
  {
    clues: ["Gros", "Afrique"],
    items: [["Hippopotame", "Rivière"]],
  },
  {
    clues: ["Afrique", "Gros"],
    items: [["Rhinocéros", "Corne"]],
  },
  {
    clues: ["Dents", "Reptile"],
    items: [["Crocodile", "Rivière"]],
  },
  {
    clues: ["Lent", "Reptile"],
    items: [["Tortue", "Carapace"]],
  },
  {
    clues: ["Couleurs", "Parler"],
    items: [["Perroquet", "Oiseau"]],
  },
  {
    clues: ["Nuit", "Yeux"],
    items: [["Hibou", "Oiseau"]],
  },
  {
    clues: ["Rapace", "Vol"],
    items: [["Aigle", "Oiseau"]],
  },
  {
    clues: ["Transparent", "Piquer"],
    items: [["Méduse", "Mer"]],
  },
  {
    clues: ["Géant", "Chant"],
    items: [["Baleine", "Mer"]],
  },
  {
    clues: ["Arbre", "Queue"],
    items: [["Écureuil", "Noisette"]],
  },
  {
    clues: ["Carotte", "Sauter"],
    items: [["Lapin", "Oreilles"]],
  },
  {
    clues: ["Piquer", "Ruche"],
    items: [["Abeille", "Miel"]],
  },
  {
    clues: ["Camion", "Sauver"],
    items: [["Pompier", "Feu"]],
  },
  {
    clues: ["Ciseaux", "Salon"],
    items: [["Coiffeur", "Cheveux"]],
  },
  {
    clues: ["Eau", "Fuite"],
    items: [["Plombier", "Tuyau"]],
  },
  {
    clues: ["Soigner", "Blouse"],
    items: [["Infirmier", "Hôpital"]],
  },
  {
    clues: ["Soigner", "Cabinet"],
    items: [["Vétérinaire", "Animal"]],
  },
  {
    clues: ["Bâtiment", "Dessin"],
    items: [["Architecte", "Plan"]],
  },
  {
    clues: ["Cockpit", "Voler"],
    items: [["Pilote", "Avion"]],
  },
  {
    clues: ["Opérer", "Bloc"],
    items: [["Chirurgien", "Hôpital"]],
  },
  {
    clues: ["Cabinet", "Fauteuil"],
    items: [["Dentiste", "Dents"]],
  },
  {
    clues: ["Lettre", "Vélo"],
    items: [["Facteur", "Courrier"]],
  },
  {
    clues: ["Courant", "Prise"],
    items: [["Électricien", "Câble"]],
  },
  {
    clues: ["Information", "Micro"],
    items: [["Journaliste", "Article"]],
  },
  {
    clues: ["Loi", "Arrêter"],
    items: [["Policier", "Uniforme"]],
  },
  {
    clues: ["Pantalon", "Bleu"],
    items: [["Jean", "Denim"]],
  },
  {
    clues: ["Chaud", "Vêtement"],
    items: [["Pull", "Laine"]],
  },
  {
    clues: ["Hiver", "Tissu"],
    items: [["Écharpe", "Cou"]],
  },
  {
    clues: ["Visière", "Accessoire"],
    items: [["Casquette", "Tête"]],
  },
  {
    clues: ["Col", "Vêtement"],
    items: [["Chemise", "Boutons"]],
  },
  {
    clues: ["Hiver", "Manteau"],
    items: [["Doudoune", "Chaud"]],
  },
  {
    clues: ["Élégant", "Travail"],
    items: [["Costume", "Cravate"]],
  },
  {
    clues: ["Tissu", "Vêtement"],
    items: [["Robe", "Femme"]],
  },
  {
    clues: ["Tissu", "Vêtement"],
    items: [["Jupe", "Femme"]],
  },
  {
    clues: ["Été", "Vêtement"],
    items: [["Short", "Jambe"]],
  },
  {
    clues: ["Hiver", "Laine"],
    items: [["Bonnet", "Tête"]],
  },
  {
    clues: ["Cuir", "Boucle"],
    items: [["Ceinture", "Taille"]],
  },
  {
    clues: ["Musique", "Gratter"],
    items: [["Guitare", "Cordes"]],
  },
  {
    clues: ["Musique", "Noir et blanc"],
    items: [["Piano", "Touches"]],
  },
  {
    clues: ["Archet", "Musique"],
    items: [["Violon", "Cordes"]],
  },
  {
    clues: ["Jazz", "Musique"],
    items: [["Saxophone", "Cuivre"]],
  },
  {
    clues: ["Musique", "Souffler"],
    items: [["Trompette", "Cuivre"]],
  },
  {
    clues: ["Musique", "Trous"],
    items: [["Flûte", "Souffler"]],
  },
  {
    clues: ["Musique", "Musette"],
    items: [["Accordéon", "Soufflet"]],
  },
  {
    clues: ["Hawaï", "Musique"],
    items: [["Ukulélé", "Cordes"]],
  },
  {
    clues: ["Musique", "Ange"],
    items: [["Harpe", "Cordes"]],
  },
  {
    clues: ["Orange", "Tropical"],
    items: [["Mangue", "Fruit"]],
  },
  {
    clues: ["Vert", "Poilu"],
    items: [["Kiwi", "Fruit"]],
  },
  {
    clues: ["Rouge", "Été"],
    items: [["Pastèque", "Fruit"]],
  },
  {
    clues: ["Violet", "Ratatouille"],
    items: [["Aubergine", "Légume"]],
  },
  {
    clues: ["Vert", "Ratatouille"],
    items: [["Courgette", "Légume"]],
  },
  {
    clues: ["Vert", "Arbre"],
    items: [["Brocoli", "Légume"]],
  },
  {
    clues: ["Vert", "Soupe"],
    items: [["Poireau", "Légume"]],
  },
  {
    clues: ["Feuilles", "Cœur"],
    items: [["Artichaut", "Légume"]],
  },
  {
    clues: ["Rouge", "Été"],
    items: [["Fraise", "Fruit"]],
  },
  {
    clues: ["Rouge", "Été"],
    items: [["Framboise", "Fruit"]],
  },
  {
    clues: ["Sac", "Livres"],
    items: [["Cartable", "École"]],
  },
  {
    clues: ["Stylos", "Sac"],
    items: [["Trousse", "École"]],
  },
  {
    clues: ["Orange", "Petit-déjeuner"],
    items: [["Jus d'orange", "Jus"]],
  },
  {
    clues: ["Connexion", "Appareil"],
    items: [["Bluetooth", "Sans fil"]],
  },
  {
    clues: ["Touches", "Taper"],
    items: [["Clavier", "Ordinateur"]],
  },
  {
    clues: ["Cliquer", "Curseur"],
    items: [["Souris", "Ordinateur"]],
  },
  {
    clues: ["Code", "Compte"],
    items: [["Mot de passe", "Sécurité"]],
  },
  {
    clues: ["Nuit", "Satellite"],
    items: [["Lune", "Ciel"]],
  },
  {
    clues: ["Rouge", "Espace"],
    items: [["Mars", "Planète"]],
  },
  {
    clues: ["Combinaison", "Fusée"],
    items: [["Astronaute", "Espace"]],
  },
  {
    clues: ["Gravité", "Absorber"],
    items: [["Trou noir", "Espace"]],
  },
  {
    clues: ["Queue", "Ciel"],
    items: [["Comète", "Espace"]],
  },
  {
    clues: ["Biologie", "Cellule"],
    items: [["ADN", "Génétique"]],
  },
  {
    clues: ["Tomber", "Terre"],
    items: [["Gravité", "Physique"]],
  },
  {
    clues: ["Particule", "Petit"],
    items: [["Atome", "Physique"]],
  },
  {
    clues: ["Origine", "Explosion"],
    items: [["Big Bang", "Univers"]],
  },
  {
    clues: ["Puce", "Argent"],
    items: [["Carte bancaire", "Paiement"]],
  },
  {
    clues: ["Banque", "Transfert"],
    items: [["Virement", "Argent"]],
  },
  {
    clues: ["Serveur", "Restaurant"],
    items: [["Pourboire", "Argent"]],
  },
  {
    clues: ["Cartes", "Poche"],
    items: [["Portefeuille", "Argent"]],
  },
  {
    clues: ["Sapin", "Cadeaux"],
    items: [["Noël", "Fête"]],
  },
  {
    clues: ["Nouilles", "Bouillon"],
    items: [["Ramen", "Japon"]],
  },
  {
    clues: ["Riz", "Saumon"],
    items: [["Poke bowl", "Hawaï"]],
  },
  {
    clues: ["Pita", "Végétarien"],
    items: [["Falafel", "Pois chiche"]],
  },
  {
    clues: ["Tortilla", "Riz"],
    items: [["Burrito", "Mexique"]],
  },
  {
    clues: ["Fromage", "Guacamole"],
    items: [["Nachos", "Chips"]],
  },
  {
    clues: ["Boulangerie", "France"],
    items: [["Baguette", "Pain"]],
  },
  {
    clues: ["Pommes de terre", "Savoie"],
    items: [["Tartiflette", "Reblochon"]],
  },
  {
    clues: ["Riz", "Bœuf"],
    items: [["Bibimbap", "Corée"]],
  },
  {
    clues: ["Viande", "Pain"],
    items: [["Shawarma", "Liban"]],
  },
  {
    clues: ["Raviole", "Vapeur"],
    items: [["Gyoza", "Japon"]],
  },
  {
    clues: ["Partage", "Apéritif"],
    items: [["Tapas", "Espagne"]],
  },
  {
    clues: ["Citron", "Pérou"],
    items: [["Ceviche", "Poisson cru"]],
  },
  {
    clues: ["Pain", "Four"],
    items: [["Naan", "Inde"]],
  },
  {
    clues: ["Tahini", "Pita"],
    items: [["Houmous", "Pois chiche"]],
  },
  {
    clues: ["Poisson cru", "Baguettes"],
    items: [["Sashimi", "Japon"]],
  },
  {
    clues: ["Riz", "Algue"],
    items: [["Onigiri", "Japon"]],
  },
  {
    clues: ["Pâte", "Farci"],
    items: [["Empanada", "Amérique du Sud"]],
  },
  {
    clues: ["Bouillon", "Nouilles"],
    items: [["Pho", "Vietnam"]],
  },
  {
    clues: ["Panure", "Frit"],
    items: [["Katsu", "Japon"]],
  },
  {
    clues: ["Poulet", "Tortilla"],
    items: [["Fajitas", "Mexique"]],
  },
  {
    clues: ["Mexique", "Apéritif"],
    items: [["Guacamole", "Avocat"]],
  },
  {
    clues: ["Saumon", "Caviar"],
    items: [["Blinis", "Russie"]],
  },
  {
    clues: ["Sucre", "Chantilly"],
    items: [["Gaufre", "Belgique"]],
  },
  {
    clues: ["Anglais", "Four"],
    items: [["Crumble", "Pomme"]],
  },
  {
    clues: ["Pâte", "Farci"],
    items: [["Pierogi", "Pologne"]],
  },
  {
    clues: ["Aubergine", "Gratin"],
    items: [["Moussaka", "Grèce"]],
  },
  {
    clues: ["Ananas", "Broche"],
    items: [["Tacos al pastor", "Mexique"]],
  },
  {
    clues: ["Jambon", "Fromage"],
    items: [["Croque-madame", "Œuf"]],
  },
  {
    clues: ["Légumes", "Sauté"],
    items: [["Wok", "Poêle"]],
  },
  {
    clues: ["Boîte", "Repas"],
    items: [["Bento", "Japon"]],
  },
  {
    clues: ["Vapeur", "Raviole"],
    items: [["Dim sum", "Chine"]],
  },
  {
    clues: ["Miel", "Pistache"],
    items: [["Baklava", "Turquie"]],
  },
  {
    clues: ["Pâtes", "Farci"],
    items: [["Tortellini", "Italie"]],
  },
  {
    clues: ["Frites", "Fromage"],
    items: [["Poutine", "Québec"]],
  },
  {
    clues: ["Pain", "Cream cheese"],
    items: [["Bagel", "New York"]],
  },
  {
    clues: ["Belgique", "Ketchup"],
    items: [["Frites", "Pomme de terre"]],
  },
  {
    clues: ["Barbecue", "Agneau"],
    items: [["Merguez", "Épicé"]],
  },
  {
    clues: ["Couronne", "Janvier"],
    items: [["Galette des rois", "Frangipane"]],
  },
  {
    clues: ["Noël", "Roulé"],
    items: [["Bûche de Noël", "Chocolat"]],
  },
  {
    clues: ["Citron vert", "Glace pilée"],
    items: [["Daïquiri", "Rhum"]],
  },
  {
    clues: ["Vin rouge", "Fruits"],
    items: [["Sangria", "Espagne"]],
  },
  {
    clues: ["Fruits", "Antilles"],
    items: [["Punch", "Rhum"]],
  },
  {
    clues: ["Italie", "Amer"],
    items: [["Négroni", "Gin"]],
  },
  {
    clues: ["Pêche", "Venise"],
    items: [["Bellini", "Prosecco"]],
  },
  {
    clues: ["Jus d'orange", "Brunch"],
    items: [["Mimosa", "Champagne"]],
  },
  {
    clues: ["Orange", "Cocktail"],
    items: [["Screwdriver", "Vodka"]],
  },
  {
    clues: ["Fort", "Mélange"],
    items: [["Long Island Iced Tea", "Vodka"]],
  },
  {
    clues: ["Café", "Crème"],
    items: [["White Russian", "Vodka"]],
  },
  {
    clues: ["Coca", "Cuba"],
    items: [["Cuba Libre", "Rhum"]],
  },
  {
    clues: ["Pastis", "Apéritif"],
    items: [["Ricard", "Anis"]],
  },
  {
    clues: ["Alcool", "Tonic"],
    items: [["Gin", "Genièvre"]],
  },
  {
    clues: ["Verre", "Sec"],
    items: [["Vin blanc", "Bouteille"]],
  },
  {
    clues: ["Mousse", "Pinte"],
    items: [["Bière", "Houblon"]],
  },
  {
    clues: ["Normandie", "Bouteille"],
    items: [["Cidre", "Pomme"]],
  },
  {
    clues: ["Riz", "Chaud"],
    items: [["Sake", "Japon"]],
  },
  {
    clues: ["Alcool fort", "Fin"],
    items: [["Digestif", "Après-repas"]],
  },
  {
    clues: ["Soft", "Sans alcool"],
    items: [["Mocktail", "Sirop"]],
  },
  {
    clues: ["Chaud", "Citron"],
    items: [["Grog", "Rhum"]],
  },
  {
    clues: ["Avant", "Appartement"],
    items: [["Before", "Apéro"]],
  },
  {
    clues: ["Thème", "Déguisement"],
    items: [["Soirée déguisée", "Costume"]],
  },
  {
    clues: ["Élégant", "Venise"],
    items: [["Bal masqué", "Masque"]],
  },
  {
    clues: ["Entrée", "Privilège"],
    items: [["Liste VIP", "Nom"]],
  },
  {
    clues: ["Sélection", "Boîte"],
    items: [["Physionomiste", "Entrée"]],
  },
  {
    clues: ["Cher", "Réservé"],
    items: [["Table VIP", "Bouteille"]],
  },
  {
    clues: ["Minuit", "Fête"],
    items: [["Réveillon", "Nouvel An"]],
  },
  {
    clues: ["Rapide", "Cul sec"],
    items: [["Descente", "Alcool"]],
  },
  {
    clues: ["Verre", "Debout"],
    items: [["Comptoir", "Bar"]],
  },
  {
    clues: ["Ivre", "Lendemain"],
    items: [["Cuite", "Alcool"]],
  },
  {
    clues: ["Fête", "Matin"],
    items: [["Nuit blanche", "Sans dormir"]],
  },
  {
    clues: ["Vue", "Bar"],
    items: [["Rooftop", "Terrasse"]],
  },
  {
    clues: ["Musique", "Silencieux"],
    items: [["Silent disco", "Casque"]],
  },
  {
    clues: ["Carte", "Shaker"],
    items: [["Bar à cocktails", "Mixologue"]],
  },
  {
    clues: ["Enceinte", "Volume"],
    items: [["Sono", "Musique"]],
  },
  {
    clues: ["Canapé", "Musique douce"],
    items: [["Chill zone", "Repos"]],
  },
  {
    clues: ["Boue", "Musique"],
    items: [["Glastonbury", "Angleterre"]],
  },
  {
    clues: ["Art", "Nevada"],
    items: [["Burning Man", "Désert"]],
  },
  {
    clues: ["Île", "Festival"],
    items: [["Sziget", "Budapest"]],
  },
  {
    clues: ["Angleterre", "Metal"],
    items: [["Download Festival", "Rock"]],
  },
  {
    clues: ["Écologie", "Musique"],
    items: [["We Love Green", "Paris"]],
  },
  {
    clues: ["Paris", "Concert"],
    items: [["Fnac Live", "Gratuit"]],
  },
  {
    clues: ["Gratuit", "Rue"],
    items: [["Fête de la Musique", "Juin"]],
  },
  {
    clues: ["Rock", "France"],
    items: [["Printemps de Bourges", "Chanson"]],
  },
  {
    clues: ["Électro", "Nuit"],
    items: [["Nuits Sonores", "Lyon"]],
  },
  {
    clues: ["Électro", "Plage"],
    items: [["Astropolis", "Bretagne"]],
  },
  {
    clues: ["Électro", "DJ"],
    items: [["Ultra Music Festival", "Miami"]],
  },
  {
    clues: ["Accès", "Festival"],
    items: [["Bracelet festival", "Poignet"]],
  },
  {
    clues: ["Bousculade", "Rock"],
    items: [["Pogo", "Concert"]],
  },
  {
    clues: ["Application", "Sécurisé"],
    items: [["Telegram", "Messagerie"]],
  },
  {
    clues: ["Privé", "Chiffré"],
    items: [["Signal", "Messagerie"]],
  },
  {
    clues: ["Repas", "Commande"],
    items: [["Just Eat", "Livraison"]],
  },
  {
    clues: ["Trajet", "Conducteur"],
    items: [["BlaBlaCar", "Covoiturage"]],
  },
  {
    clues: ["En ligne", "Transfert"],
    items: [["PayPal", "Paiement"]],
  },
  {
    clues: ["Amis", "Application"],
    items: [["Lydia", "Paiement"]],
  },
  {
    clues: ["Application", "Création"],
    items: [["Canva", "Design"]],
  },
  {
    clues: ["Robot", "Réponse"],
    items: [["ChatGPT", "Intelligence artificielle"]],
  },
  {
    clues: ["Application", "Femme"],
    items: [["Bumble", "Rencontre"]],
  },
  {
    clues: ["Application", "Homme"],
    items: [["Grindr", "Rencontre"]],
  },
  {
    clues: ["Application", "Profil"],
    items: [["Hinge", "Rencontre"]],
  },
  {
    clues: ["Site", "Sérieux"],
    items: [["Meetic", "Rencontre"]],
  },
  {
    clues: ["Site", "Panier"],
    items: [["Adopte un mec", "Rencontre"]],
  },
  {
    clues: ["Application", "Calme"],
    items: [["Headspace", "Méditation"]],
  },
  {
    clues: ["Bonbon", "Téléphone"],
    items: [["Candy Crush", "Jeu"]],
  },
  {
    clues: ["Téléphone", "Stratégie"],
    items: [["Clash of Clans", "Jeu"]],
  },
  {
    clues: ["Téléphone", "Réalité augmentée"],
    items: [["Pokémon Go", "Jeu"]],
  },
  {
    clues: ["Mot", "Quotidien"],
    items: [["Wordle", "Jeu"]],
  },
  {
    clues: ["Appel", "Application"],
    items: [["Skype", "Visio"]],
  },
  {
    clues: ["Facebook", "Application"],
    items: [["Messenger", "Messagerie"]],
  },
  {
    clues: ["Achat", "Livraison"],
    items: [["Cdiscount", "Site"]],
  },
  {
    clues: ["Achat", "Site"],
    items: [["Rakuten", "Cashback"]],
  },
  {
    clues: ["Application", "Seconde main"],
    items: [["Depop", "Vêtements"]],
  },
  {
    clues: ["Marque", "Portable"],
    items: [["Acer", "Ordinateur"]],
  },
  {
    clues: ["Ordinateur", "Marque"],
    items: [["HP", "Imprimante"]],
  },
  {
    clues: ["Marque", "Portable"],
    items: [["Dell", "Ordinateur"]],
  },
  {
    clues: ["Puce", "Ordinateur"],
    items: [["Intel", "Processeur"]],
  },
  {
    clues: ["Livre", "Écran"],
    items: [["Kindle", "Liseuse"]],
  },
  {
    clues: ["Caméra", "Marque"],
    items: [["DJI", "Drone"]],
  },
  {
    clues: ["Caméra", "Sécurité"],
    items: [["Ring", "Sonnette"]],
  },
  {
    clues: ["Robot", "Autonome"],
    items: [["Roomba", "Aspirateur"]],
  },
  {
    clues: ["Sport", "Santé"],
    items: [["Fitbit", "Montre"]],
  },
  {
    clues: ["Marque", "Mode"],
    items: [["Diesel", "Jean"]],
  },
  {
    clues: ["Marque", "Mode"],
    items: [["Calvin Klein", "Sous-vêtement"]],
  },
  {
    clues: ["Marque", "Drapeau"],
    items: [["Tommy Hilfiger", "Mode"]],
  },
  {
    clues: ["Marque", "Trench"],
    items: [["Burberry", "Écossais"]],
  },
  {
    clues: ["Marque", "Luxe"],
    items: [["Versace", "Italie"]],
  },
  {
    clues: ["Marque", "Costume"],
    items: [["Armani", "Italie"]],
  },
  {
    clues: ["Marque", "Luxe"],
    items: [["Yves Saint Laurent", "Mode"]],
  },
  {
    clues: ["Marque", "Sac"],
    items: [["Fendi", "Italie"]],
  },
  {
    clues: ["Luxe", "Mode"],
    items: [["Givenchy", "Marque"]],
  },
  {
    clues: ["Marque", "Luxe"],
    items: [["Moncler", "Doudoune"]],
  },
  {
    clues: ["Marque", "Virgil"],
    items: [["Off-White", "Streetwear"]],
  },
  {
    clues: ["Marque", "Box logo"],
    items: [["Supreme", "Streetwear"]],
  },
  {
    clues: ["Marque", "Chaussures"],
    items: [["Jordan", "Basket"]],
  },
  {
    clues: ["Marque", "Jaune"],
    items: [["Timberland", "Chaussures"]],
  },
  {
    clues: ["Mode", "Fleur"],
    items: [["Kenzo", "Marque"]],
  },
  {
    clues: ["Marque", "Pliage"],
    items: [["Longchamp", "Sac"]],
  },
  {
    clues: ["Marque", "Suisse"],
    items: [["Swatch", "Montre"]],
  },
  {
    clues: ["Marque", "Soleil"],
    items: [["Ray-Ban", "Lunettes"]],
  },
  {
    clues: ["Marque", "Montre"],
    items: [["Michael Kors", "Sac"]],
  },
  {
    clues: ["Livraison", "Marque"],
    items: [["Pizza Hut", "Pizza"]],
  },
  {
    clues: ["Mexicain", "Chaîne"],
    items: [["Chipotle", "Burrito"]],
  },
  {
    clues: ["Tacos", "Chaîne"],
    items: [["Taco Bell", "Mexicain"]],
  },
  {
    clues: ["Chaîne", "Anglais"],
    items: [["Costa Coffee", "Café"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["Columbus Café", "Café"]],
  },
  {
    clues: ["Chaîne", "Sandwich"],
    items: [["Paul", "Boulangerie"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["Class'Croute", "Sandwich"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["La Croissanterie", "Croissant"]],
  },
  {
    clues: ["Chaîne", "Anglais"],
    items: [["Prêt à Manger", "Sandwich"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["Big Fernand", "Burger"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["Bagelstein", "Bagel"]],
  },
  {
    clues: ["Smoothie", "Chaîne"],
    items: [["Naked", "Jus"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["Cojean", "Salade"]],
  },
  {
    clues: ["Chaîne", "Belgique"],
    items: [["Exki", "Bio"]],
  },
  {
    clues: ["Chaîne", "France"],
    items: [["Pomme de Pain", "Sandwich"]],
  },
  {
    clues: ["Magasin", "Supermarché"],
    items: [["Casino", "Enseigne"]],
  },
  {
    clues: ["Magasin", "Supermarché"],
    items: [["Cora", "Enseigne"]],
  },
  {
    clues: ["Magasin", "Supermarché"],
    items: [["Système U", "Enseigne"]],
  },
  {
    clues: ["Magasin", "Enseigne"],
    items: [["Naturalia", "Bio"]],
  },
  {
    clues: ["Magasin", "Coopérative"],
    items: [["Biocoop", "Bio"]],
  },
  {
    clues: ["Pas cher", "Enseigne"],
    items: [["Action", "Magasin"]],
  },
  {
    clues: ["Déco", "Enseigne"],
    items: [["Gifi", "Magasin"]],
  },
  {
    clues: ["Suède", "Magasin"],
    items: [["Ikea", "Meuble"]],
  },
  {
    clues: ["Magasin", "Enseigne"],
    items: [["Decathlon", "Sport"]],
  },
  {
    clues: ["Loire", "France"],
    items: [["Angers", "Ville"]],
  },
  {
    clues: ["Normandie", "Ville"],
    items: [["Le Havre", "Port"]],
  },
  {
    clues: ["Foot", "France"],
    items: [["Saint-Étienne", "Ville"]],
  },
  {
    clues: ["Sud", "France"],
    items: [["Toulon", "Port"]],
  },
  {
    clues: ["Film", "Côte"],
    items: [["Cannes", "Festival"]],
  },
  {
    clues: ["Ski", "Mont-Blanc"],
    items: [["Chamonix", "Montagne"]],
  },
  {
    clues: ["Normandie", "Casino"],
    items: [["Deauville", "Plage"]],
  },
  {
    clues: ["Ville", "Volcan"],
    items: [["Clermont-Ferrand", "Auvergne"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Metz", "Lorraine"]],
  },
  {
    clues: ["Ville", "Place"],
    items: [["Nancy", "Lorraine"]],
  },
  {
    clues: ["Ville", "Cathédrale"],
    items: [["Amiens", "Picardie"]],
  },
  {
    clues: ["Gaudí", "Ville"],
    items: [["Barcelone", "Espagne"]],
  },
  {
    clues: ["Mode", "Ville"],
    items: [["Milan", "Italie"]],
  },
  {
    clues: ["Renaissance", "Ville"],
    items: [["Florence", "Italie"]],
  },
  {
    clues: ["Pizza", "Ville"],
    items: [["Naples", "Italie"]],
  },
  {
    clues: ["Ville", "Histoire"],
    items: [["Cracovie", "Pologne"]],
  },
  {
    clues: ["Banque", "Ville"],
    items: [["Zurich", "Suisse"]],
  },
  {
    clues: ["Lac", "Ville"],
    items: [["Genève", "Suisse"]],
  },
  {
    clues: ["Flamenco", "Ville"],
    items: [["Séville", "Espagne"]],
  },
  {
    clues: ["Château", "Ville"],
    items: [["Édimbourg", "Écosse"]],
  },
  {
    clues: ["Ville", "Palais"],
    items: [["Saint-Pétersbourg", "Russie"]],
  },
  {
    clues: ["Bière", "Ville"],
    items: [["Munich", "Allemagne"]],
  },
  {
    clues: ["Ville", "Vent"],
    items: [["Chicago", "États-Unis"]],
  },
  {
    clues: ["Plage", "Ville"],
    items: [["Miami", "Floride"]],
  },
  {
    clues: ["Ville", "Tour"],
    items: [["Toronto", "Canada"]],
  },
  {
    clues: ["Pyramides", "Ville"],
    items: [["Le Caire", "Égypte"]],
  },
  {
    clues: ["Ville", "Gratte-ciel"],
    items: [["Shanghai", "Chine"]],
  },
  {
    clues: ["Capitale", "Ville"],
    items: [["Pékin", "Chine"]],
  },
  {
    clues: ["Ville", "Gratte-ciel"],
    items: [["Hong Kong", "Chine"]],
  },
  {
    clues: ["Ville", "Bollywood"],
    items: [["Mumbai", "Inde"]],
  },
  {
    clues: ["Ville", "Film"],
    items: [["Casablanca", "Maroc"]],
  },
  {
    clues: ["Ville", "Religion"],
    items: [["Jérusalem", "Israël"]],
  },
  {
    clues: ["Ville", "Voiture"],
    items: [["Havane", "Cuba"]],
  },
  {
    clues: ["Plage", "Ville"],
    items: [["Cancún", "Mexique"]],
  },
  {
    clues: ["Navigation", "Voile"],
    items: [["Bateau", "Eau"]],
  },
  {
    clues: ["Rotor", "Vol"],
    items: [["Hélicoptère", "Air"]],
  },
  {
    clues: ["Décollage", "Astronaute"],
    items: [["Fusée", "Espace"]],
  },
  {
    clues: ["Recharge", "Écologique"],
    items: [["Voiture électrique", "Batterie"]],
  },
  {
    clues: ["Péage", "Vitesse"],
    items: [["Autoroute", "Route"]],
  },
  {
    clues: ["Payer", "Barrière"],
    items: [["Péage", "Autoroute"]],
  },
  {
    clues: ["Route", "Gratuit"],
    items: [["Auto-stop", "Pouce"]],
  },
  {
    clues: ["Roues", "Trick"],
    items: [["Skateboard", "Planche"]],
  },
  {
    clues: ["Patin", "Casque"],
    items: [["Rollers", "Roues"]],
  },
  {
    clues: ["Bagage", "Terminal"],
    items: [["Aéroport", "Avion"]],
  },
  {
    clues: ["Avion", "Sac"],
    items: [["Bagage à main", "Cabine"]],
  },
  {
    clues: ["Réservation", "Séjour"],
    items: [["Hôtel", "Chambre"]],
  },
  {
    clues: ["Nature", "Vacances"],
    items: [["Camping (vacances)", "Tente"]],
  },
  {
    clues: ["Sac à dos", "Budget"],
    items: [["Backpacker", "Voyageur"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Office de tourisme", "Information"]],
  },
  {
    clues: ["Monnaie", "Banque"],
    items: [["Bureau de change", "Devise"]],
  },
  {
    clues: ["Complet", "Avion"],
    items: [["Overbooking", "Vol"]],
  },
  {
    clues: ["Santé", "Obligatoire"],
    items: [["Vaccin voyage", "Piqûre"]],
  },
  {
    clues: ["Voyage", "Remboursement"],
    items: [["Assurance voyage", "Protection"]],
  },
  {
    clues: ["Deux pièces", "Plage"],
    items: [["Bikini", "Maillot"]],
  },
  {
    clues: ["Soleil", "Plage"],
    items: [["Chapeau de paille", "Tête"]],
  },
  {
    clues: ["Bassin", "Nage"],
    items: [["Piscine", "Eau"]],
  },
  {
    clues: ["Surf", "Océan"],
    items: [["Vague", "Mer"]],
  },
  {
    clues: ["Mer", "Sport"],
    items: [["Planche de surf", "Vague"]],
  },
  {
    clues: ["Pieds", "Plongée"],
    items: [["Palmes", "Nager"]],
  },
  {
    clues: ["Eau", "Voir"],
    items: [["Masque de plongée", "Yeux"]],
  },
  {
    clues: ["Peau", "Allongé"],
    items: [["Bronzette", "Soleil"]],
  },
  {
    clues: ["Plage", "Noix de coco"],
    items: [["Cocotier", "Arbre"]],
  },
  {
    clues: ["Seul", "Océan"],
    items: [["Île déserte", "Plage"]],
  },
  {
    clues: ["Course", "Vin Diesel"],
    items: [["Fast and Furious", "Voiture"]],
  },
  {
    clues: ["Tom Cruise", "Action"],
    items: [["Mission Impossible", "Espion"]],
  },
  {
    clues: ["Chien", "Action"],
    items: [["John Wick", "Tueur"]],
  },
  {
    clues: ["Amour", "Loup-garou"],
    items: [["Twilight", "Vampire"]],
  },
  {
    clues: ["Survie", "Districts"],
    items: [["The Hunger Games", "Arène"]],
  },
  {
    clues: ["Dystopie", "Adolescent"],
    items: [["Divergente", "Faction"]],
  },
  {
    clues: ["Assistante", "Rédactrice"],
    items: [["Le Diable s'habille en Prada", "Mode"]],
  },
  {
    clues: ["Los Angeles", "Amour"],
    items: [["La La Land", "Comédie musicale"]],
  },
  {
    clues: ["Été", "Amour"],
    items: [["Dirty Dancing", "Danse"]],
  },
  {
    clues: ["Lycée", "Musical"],
    items: [["Grease", "Danse"]],
  },
  {
    clues: ["Mer", "Dauphin"],
    items: [["Le Grand Bleu", "Plongée"]],
  },
  {
    clues: ["Comédie", "Gendres"],
    items: [["Qu'est-ce qu'on a fait au Bon Dieu", "Famille"]],
  },
  {
    clues: ["Marseille", "Course-poursuite"],
    items: [["Taxi (film)", "Voiture"]],
  },
  {
    clues: ["Internat", "Enfants"],
    items: [["Les Choristes", "Chorale"]],
  },
  {
    clues: ["Noir et blanc", "Social"],
    items: [["La Haine", "Banlieue"]],
  },
  {
    clues: ["Agence", "Série"],
    items: [["Dix Pour Cent", "Acteurs"]],
  },
  {
    clues: ["Gentleman", "Omar Sy"],
    items: [["Lupin", "Voleur"]],
  },
  {
    clues: ["Enquête", "Série"],
    items: [["HPI", "Intelligence"]],
  },
  {
    clues: ["Marseille", "Série"],
    items: [["Plus Belle la Vie", "Feuilleton"]],
  },
  {
    clues: ["Saint-Tropez", "Plage"],
    items: [["Sous le Soleil", "Série"]],
  },
  {
    clues: ["Série", "Occupation"],
    items: [["Un Village Français", "Guerre"]],
  },
  {
    clues: ["DGSE", "Série"],
    items: [["Le Bureau des Légendes", "Espion"]],
  },
  {
    clues: ["Bateau", "Série"],
    items: [["Vikings", "Guerrier"]],
  },
  {
    clues: ["Angleterre", "Série"],
    items: [["The Crown", "Reine"]],
  },
  {
    clues: ["Londres", "Enquête"],
    items: [["Sherlock", "Détective"]],
  },
  {
    clues: ["Anthologie", "Futur"],
    items: [["Black Mirror", "Technologie"]],
  },
  {
    clues: ["Mutant", "X-Men"],
    items: [["Wolverine", "Griffes"]],
  },
  {
    clues: ["Poilu", "Star Wars"],
    items: [["Chewbacca", "Wookiee"]],
  },
  {
    clues: ["Sorcier", "Bâton"],
    items: [["Gandalf", "Magicien"]],
  },
  {
    clues: ["Anneau", "Voyage"],
    items: [["Frodon", "Hobbit"]],
  },
  {
    clues: ["Sorcier", "Barbe"],
    items: [["Dumbledore", "Directeur"]],
  },
  {
    clues: ["Roi", "Savane"],
    items: [["Simba", "Lion"]],
  },
  {
    clues: ["Jouet", "Shérif"],
    items: [["Woody", "Cow-boy"]],
  },
  {
    clues: ["Jouet", "Toy Story"],
    items: [["Jessie (Toy Story)", "Cow-girl"]],
  },
  {
    clues: ["Océan", "Perdu"],
    items: [["Nemo", "Poisson"]],
  },
  {
    clues: ["Oubli", "Bleu"],
    items: [["Dory", "Poisson"]],
  },
  {
    clues: ["Miel", "Jaune"],
    items: [["Winnie l'ourson", "Ours"]],
  },
  {
    clues: ["Forêt", "Disney"],
    items: [["Bambi", "Faon"]],
  },
  {
    clues: ["Vœux", "Bleu"],
    items: [["Génie (Aladdin)", "Lampe"]],
  },
  {
    clues: ["Princesse", "Minuit"],
    items: [["Cendrillon", "Chaussure"]],
  },
  {
    clues: ["Nains", "Princesse"],
    items: [["Blanche-Neige", "Pomme"]],
  },
  {
    clues: ["Voix", "Sirène"],
    items: [["La Petite Sirène", "Océan"]],
  },
  {
    clues: ["Gaulois", "Moustache"],
    items: [["Astérix", "Potion"]],
  },
  {
    clues: ["Gaulois", "Sanglier"],
    items: [["Obélix", "Menhir"]],
  },
  {
    clues: ["Houppette", "Chien"],
    items: [["Tintin", "Reporter"]],
  },
  {
    clues: ["Maladroit", "Bande dessinée"],
    items: [["Gaston Lagaffe", "Bureau"]],
  },
  {
    clues: ["Manga", "Boule"],
    items: [["Goku", "Saiyan"]],
  },
  {
    clues: ["Manga", "Chapeau"],
    items: [["Luffy", "Pirate"]],
  },
  {
    clues: ["Américain", "Blanc"],
    items: [["Eminem", "Rappeur"]],
  },
  {
    clues: ["Américain", "Producteur"],
    items: [["Kanye West", "Rappeur"]],
  },
  {
    clues: ["Américain", "Beyoncé"],
    items: [["Jay-Z", "Rappeur"]],
  },
  {
    clues: ["Américain", "Cannabis"],
    items: [["Snoop Dogg", "Rappeur"]],
  },
  {
    clues: ["Américain", "Hip-hop"],
    items: [["Kendrick Lamar", "Rappeur"]],
  },
  {
    clues: ["Pop", "Icône"],
    items: [["Madonna", "Chanteuse"]],
  },
  {
    clues: ["Pop", "Moonwalk"],
    items: [["Michael Jackson", "Chanteur"]],
  },
  {
    clues: ["Rock", "Roi"],
    items: [["Elvis Presley", "Chanteur"]],
  },
  {
    clues: ["Rock", "Anglais"],
    items: [["The Beatles", "Groupe"]],
  },
  {
    clues: ["Rock", "Freddie"],
    items: [["Queen", "Groupe"]],
  },
  {
    clues: ["Rock", "Anglais"],
    items: [["Coldplay", "Groupe"]],
  },
  {
    clues: ["Électro", "Casque"],
    items: [["Daft Punk", "Duo"]],
  },
  {
    clues: ["Rock", "France"],
    items: [["Indochine", "Groupe"]],
  },
  {
    clues: ["Rock", "France"],
    items: [["Téléphone", "Groupe"]],
  },
  {
    clues: ["France", "Voix"],
    items: [["Zaz", "Chanteuse"]],
  },
  {
    clues: ["France", "Pop"],
    items: [["Christine and the Queens", "Chanteuse"]],
  },
  {
    clues: ["France", "Voix"],
    items: [["Slimane", "Chanteur"]],
  },
  {
    clues: ["France", "Duo"],
    items: [["Vitaa", "Chanteuse"]],
  },
  {
    clues: ["France", "Chanteur"],
    items: [["Grand Corps Malade", "Slam"]],
  },
  {
    clues: ["France", "Rétro"],
    items: [["Renaud", "Chanteur"]],
  },
  {
    clues: ["France", "Guitare"],
    items: [["Francis Cabrel", "Chanteur"]],
  },
  {
    clues: ["France", "Rétro"],
    items: [["Jean-Jacques Goldman", "Chanteur"]],
  },
  {
    clues: ["France", "Arménien"],
    items: [["Charles Aznavour", "Chanteur"]],
  },
  {
    clues: ["France", "Môme"],
    items: [["Édith Piaf", "Chanteuse"]],
  },
  {
    clues: ["France", "Provocateur"],
    items: [["Serge Gainsbourg", "Chanteur"]],
  },
  {
    clues: ["France", "Rétro"],
    items: [["France Gall", "Chanteuse"]],
  },
  {
    clues: ["France", "RnB"],
    items: [["Dadju", "Chanteur"]],
  },
  {
    clues: ["Marseille", "France"],
    items: [["Naps", "Rappeur"]],
  },
  {
    clues: ["France", "Underground"],
    items: [["Josman", "Rappeur"]],
  },
  {
    clues: ["France", "Jeune"],
    items: [["Tiakola", "Rappeur"]],
  },
  {
    clues: ["France", "Drill"],
    items: [["Gazo", "Rappeur"]],
  },
  {
    clues: ["France", "Récent"],
    items: [["Werenoi", "Rappeur"]],
  },
  {
    clues: ["France", "Slam"],
    items: [["Hatik", "Rappeur"]],
  },
  {
    clues: ["Nintendo", "Épée"],
    items: [["Zelda", "Aventure"]],
  },
  {
    clues: ["Équipe", "Héros"],
    items: [["Overwatch", "Tir"]],
  },
  {
    clues: ["Équipe", "Agent"],
    items: [["Valorant", "Tir"]],
  },
  {
    clues: ["Tir", "Équipe"],
    items: [["Apex Legends", "Battle royale"]],
  },
  {
    clues: ["Création", "Enfant"],
    items: [["Roblox", "Jeu"]],
  },
  {
    clues: ["Fantasy", "Quête"],
    items: [["World of Warcraft", "MMO"]],
  },
  {
    clues: ["Anime", "Gacha"],
    items: [["Genshin Impact", "Aventure"]],
  },
  {
    clues: ["Champignon", "Nintendo"],
    items: [["Super Mario Bros", "Plombier"]],
  },
  {
    clues: ["Rond", "Rétro"],
    items: [["Pac-Man", "Fantôme"]],
  },
  {
    clues: ["Puzzle", "Rétro"],
    items: [["Tetris", "Blocs"]],
  },
  {
    clues: ["Console", "Musique"],
    items: [["Just Dance", "Danse"]],
  },
  {
    clues: ["Sport", "Manette"],
    items: [["Wii Sports", "Console"]],
  },
  {
    clues: ["Arcade", "Coup spécial"],
    items: [["Street Fighter", "Combat"]],
  },
  {
    clues: ["Fatality", "Sanglant"],
    items: [["Mortal Kombat", "Combat"]],
  },
  {
    clues: ["Lara Croft", "Ruines"],
    items: [["Tomb Raider", "Aventure"]],
  },
  {
    clues: ["Horreur", "Survie"],
    items: [["Resident Evil", "Zombie"]],
  },
  {
    clues: ["Brouillard", "Survie"],
    items: [["Silent Hill", "Horreur"]],
  },
  {
    clues: ["Néon", "Ville"],
    items: [["Cyberpunk 2077", "Futur"]],
  },
  {
    clues: ["École", "Harry Potter"],
    items: [["Hogwarts Legacy", "Sorcier"]],
  },
  {
    clues: ["Cartes", "Téléphone"],
    items: [["Clash Royale", "Stratégie"]],
  },
  {
    clues: ["Téléphone", "Personnages"],
    items: [["Brawl Stars", "Combat"]],
  },
  {
    clues: ["Camembert", "Culture"],
    items: [["Trivial Pursuit", "Quiz"]],
  },
  {
    clues: ["Mots", "Plateau"],
    items: [["Scrabble", "Lettres"]],
  },
  {
    clues: ["Meurtre", "Plateau"],
    items: [["Cluedo", "Enquête"]],
  },
  {
    clues: ["Territoire", "Plateau"],
    items: [["Risk", "Stratégie"]],
  },
  {
    clues: ["Aligner", "Plateau"],
    items: [["Puissance 4", "Pions"]],
  },
  {
    clues: ["Grille", "Couler"],
    items: [["Bataille navale", "Bateau"]],
  },
  {
    clues: ["Rapidité", "Jeu"],
    items: [["Kem's", "Cartes"]],
  },
  {
    clues: ["Atout", "Plateau"],
    items: [["Tarot (cartes)", "Cartes"]],
  },
  {
    clues: ["Atout", "Levée"],
    items: [["Belote", "Cartes"]],
  },
  {
    clues: ["Bluff", "Mise"],
    items: [["Poker", "Cartes"]],
  },
  {
    clues: ["Combinaison", "Score"],
    items: [["Yams", "Dés"]],
  },
  {
    clues: ["Dés", "Pions"],
    items: [["Petits Chevaux", "Plateau"]],
  },
  {
    clues: ["Construction", "Tour"],
    items: [["Kapla", "Bois"]],
  },
  {
    clues: ["Pince", "Nez"],
    items: [["Docteur Maboul", "Opération"]],
  },
  {
    clues: ["Piste", "Saut"],
    items: [["Athlétisme", "Course"]],
  },
  {
    clues: ["Gants", "Ring"],
    items: [["Boxe", "Combat"]],
  },
  {
    clues: ["Tatami", "Ceinture"],
    items: [["Judo", "Combat"]],
  },
  {
    clues: ["Ceinture", "Coup de pied"],
    items: [["Karaté", "Combat"]],
  },
  {
    clues: ["Course", "Pédale"],
    items: [["Cyclisme", "Vélo"]],
  },
  {
    clues: ["Agrès", "Musculation"],
    items: [["Gymnastique", "Souplesse"]],
  },
  {
    clues: ["Selle", "Galop"],
    items: [["Équitation", "Cheval"]],
  },
  {
    clues: ["Combat", "Masque"],
    items: [["Escrime", "Épée"]],
  },
  {
    clues: ["Balle", "Table"],
    items: [["Ping-pong", "Raquette"]],
  },
  {
    clues: ["Boule", "Piste"],
    items: [["Bowling", "Quilles"]],
  },
  {
    clues: ["Lancer", "Pointe"],
    items: [["Fléchettes", "Cible"]],
  },
  {
    clues: ["Marathon", "Foulée"],
    items: [["Course à pied", "Baskets"]],
  },
  {
    clues: ["Brésil", "Dribble"],
    items: [["Neymar", "Football"]],
  },
  {
    clues: ["France", "Ballon d'or"],
    items: [["Karim Benzema", "Football"]],
  },
  {
    clues: ["France", "Arsenal"],
    items: [["Thierry Henry", "Football"]],
  },
  {
    clues: ["Américaine", "Championne"],
    items: [["Serena Williams", "Tennis"]],
  },
  {
    clues: ["NBA", "Américain"],
    items: [["Kobe Bryant", "Basketball"]],
  },
  {
    clues: ["NBA", "Trois points"],
    items: [["Steph Curry", "Basketball"]],
  },
  {
    clues: ["Américain", "Champion"],
    items: [["Mike Tyson", "Boxe"]],
  },
  {
    clues: ["Américain", "Légende"],
    items: [["Muhammad Ali", "Boxe"]],
  },
  {
    clues: ["France", "Championne"],
    items: [["Marie-José Pérec", "Athlétisme"]],
  },
  {
    clues: ["France", "Athlétisme"],
    items: [["Renaud Lavillenie", "Perche"]],
  },
  {
    clues: ["France", "Champion"],
    items: [["Martin Fourcade", "Biathlon"]],
  },
  {
    clues: ["France", "Ballon d'or"],
    items: [["Antoine Griezmann", "Football"]],
  },
  {
    clues: ["Football", "Nations"],
    items: [["Euro de football", "Compétition"]],
  },
  {
    clues: ["Afrique", "Compétition"],
    items: [["Coupe d'Afrique des Nations", "Football"]],
  },
  {
    clues: ["Voiture", "Circuit"],
    items: [["Grand Prix", "Course"]],
  },
  {
    clues: ["Nations", "Compétition"],
    items: [["Tournoi des Six Nations", "Rugby"]],
  },
  {
    clues: ["New York", "Championnat"],
    items: [["US Open", "Tennis"]],
  },
  {
    clues: ["Championnat", "Veste verte"],
    items: [["Masters (golf)", "Golf"]],
  },
  {
    clues: ["Espagne", "Course"],
    items: [["Vuelta", "Cyclisme"]],
  },
  {
    clues: ["Italie", "Course"],
    items: [["Giro", "Cyclisme"]],
  },
  {
    clues: ["Pavés", "Course"],
    items: [["Paris-Roubaix", "Cyclisme"]],
  },
  {
    clues: ["Désert", "Rallye"],
    items: [["Dakar", "Course"]],
  },
  {
    clues: ["Endurance", "Course"],
    items: [["Le Mans (course)", "Voiture"]],
  },
  {
    clues: ["Équipe", "Compétition"],
    items: [["Coupe Davis", "Tennis"]],
  },
  {
    clues: ["Équipe", "Femmes"],
    items: [["Fed Cup", "Tennis"]],
  },
  {
    clues: ["Sport", "Titre"],
    items: [["Championnat du monde", "Compétition"]],
  },
  {
    clues: ["France", "Compétition"],
    items: [["Trophée des Champions", "Football"]],
  },
  {
    clues: ["Partagé", "Loyer"],
    items: [["Colocation", "Appartement"]],
  },
  {
    clues: ["Étude", "Silence"],
    items: [["Bibliothèque universitaire", "Livre"]],
  },
  {
    clues: ["Prof", "Écouter"],
    items: [["Cours magistral", "Amphi"]],
  },
  {
    clues: ["Groupe", "Exercice"],
    items: [["TD", "Cours"]],
  },
  {
    clues: ["Rite", "Humiliation"],
    items: [["Bizutage", "Nouveau"]],
  },
  {
    clues: ["Six mois", "Note"],
    items: [["Semestre", "Études"]],
  },
  {
    clues: ["Validation", "Études"],
    items: [["Crédit ECTS", "Note"]],
  },
  {
    clues: ["Argent", "Emprunt"],
    items: [["Prêt étudiant", "Banque"]],
  },
  {
    clues: ["Argent", "Études"],
    items: [["Job étudiant", "Travail"]],
  },
  {
    clues: ["Étudiant", "Chambre"],
    items: [["Résidence universitaire", "Logement"]],
  },
  {
    clues: ["Campus", "Activité"],
    items: [["Association étudiante", "Groupe"]],
  },
  {
    clues: ["Campus", "Alcool"],
    items: [["Soirée étudiante", "Fête"]],
  },
  {
    clues: ["Réussite", "Études"],
    items: [["Diplôme", "Papier"]],
  },
  {
    clues: ["Sélection", "Places limitées"],
    items: [["Concours", "Examen"]],
  },
  {
    clues: ["Aide", "Étudiant"],
    items: [["Bourse (études)", "Argent"]],
  },
  {
    clues: ["Travail", "Stable"],
    items: [["CDI", "Contrat"]],
  },
  {
    clues: ["Test", "Début"],
    items: [["Période d'essai", "Contrat"]],
  },
  {
    clues: ["Document", "Mensuel"],
    items: [["Fiche de paie", "Salaire"]],
  },
  {
    clues: ["Travail", "Repos"],
    items: [["Congés payés", "Vacances"]],
  },
  {
    clues: ["Médecin", "Absence"],
    items: [["Arrêt maladie", "Travail"]],
  },
  {
    clues: ["Travail", "Argent"],
    items: [["Notes de frais", "Remboursement"]],
  },
  {
    clues: ["Bonus", "Travail"],
    items: [["Prime", "Argent"]],
  },
  {
    clues: ["Équipe", "Travail"],
    items: [["Manager", "Chef"]],
  },
  {
    clues: ["Bureau", "Équipe"],
    items: [["Collègue", "Travail"]],
  },
  {
    clues: ["Patron", "Travail"],
    items: [["Boss", "Chef"]],
  },
  {
    clues: ["Professionnel", "Réseau"],
    items: [["Networking", "Contact"]],
  },
  {
    clues: ["Emploi", "Candidature"],
    items: [["CV", "Document"]],
  },
  {
    clues: ["Emploi", "Lettre"],
    items: [["Lettre de motivation", "Candidature"]],
  },
  {
    clues: ["Partagé", "Espace"],
    items: [["Coworking", "Bureau"]],
  },
  {
    clues: ["Écran", "À distance"],
    items: [["Visioconférence", "Réunion"]],
  },
  {
    clues: ["Date limite", "Travail"],
    items: [["Deadline", "Délai"]],
  },
  {
    clues: ["Réunion", "Créativité"],
    items: [["Brainstorming", "Idées"]],
  },
  {
    clues: ["Poste", "Travail"],
    items: [["Promotion (travail)", "Avancement"]],
  },
  {
    clues: ["Défense", "Grève"],
    items: [["Syndicat", "Travailleurs"]],
  },
  {
    clues: ["Manifestation", "Arrêt"],
    items: [["Grève", "Travail"]],
  },
  {
    clues: ["Bureau", "Adieu"],
    items: [["Pot de départ", "Collègues"]],
  },
  {
    clues: ["Candidat", "Poste"],
    items: [["Recrutement", "Emploi"]],
  },
  {
    clues: ["Alliance", "Église"],
    items: [["Mariage", "Robe blanche"]],
  },
  {
    clues: ["Demande", "Couple"],
    items: [["Fiançailles", "Bague"]],
  },
  {
    clues: ["Mariage", "Couple"],
    items: [["Lune de miel", "Voyage"]],
  },
  {
    clues: ["Fête", "Amour"],
    items: [["Anniversaire de couple", "Date"]],
  },
  {
    clues: ["Bras", "Affection"],
    items: [["Câlin", "Tendresse"]],
  },
  {
    clues: ["Tendresse", "Affection"],
    items: [["Bisou", "Lèvres"]],
  },
  {
    clues: ["Sentiments", "Romantique"],
    items: [["Déclaration d'amour", "Mots"]],
  },
  {
    clues: ["Rencontre", "Premier"],
    items: [["Rendez-vous Tinder", "Application"]],
  },
  {
    clues: ["Rapide", "Table"],
    items: [["Speed dating", "Rencontre"]],
  },
  {
    clues: ["Mariage", "Avocat"],
    items: [["Divorce", "Séparation"]],
  },
  {
    clues: ["Couple", "Secret"],
    items: [["Infidélité", "Tromperie"]],
  },
  {
    clues: ["Pardon", "Retour"],
    items: [["Réconciliation", "Couple"]],
  },
  {
    clues: ["Amour", "Surprise"],
    items: [["Cadeau romantique", "Fleurs"]],
  },
  {
    clues: ["Instant", "Objet"],
    items: [["Coup de cœur", "Émotion"]],
  },
  {
    clues: ["Couple", "Astrologie"],
    items: [["Compatibilité amoureuse", "Signes"]],
  },
  {
    clues: ["Diamant", "Demande"],
    items: [["Bague de fiançailles", "Doigt"]],
  },
  {
    clues: ["Sans mariage", "Vie"],
    items: [["Union libre", "Couple"]],
  },
  {
    clues: ["Papiers", "Couple"],
    items: [["Pacs", "Union"]],
  },
  {
    clues: ["Couple", "Mari"],
    items: [["Belle-mère", "Famille"]],
  },
  {
    clues: ["Couple", "Femme"],
    items: [["Beau-père", "Famille"]],
  },
  {
    clues: ["Lien", "Fratrie"],
    items: [["Demi-frère", "Famille"]],
  },
  {
    clues: ["Couple", "Jalousie"],
    items: [["Triangle amoureux", "Trois"]],
  },
  {
    clues: ["Sexe", "Caresses"],
    items: [["Préliminaires", "Avant"]],
  },
  {
    clues: ["Une nuit", "Sans lendemain"],
    items: [["One night stand", "Anglais"]],
  },
  {
    clues: ["Voyage", "Intimité"],
    items: [["Chambre d'hôtel", "Lit"]],
  },
  {
    clues: ["Désir", "Secret"],
    items: [["Fantasme", "Imaginaire"]],
  },
  {
    clues: ["Attirer", "Regard"],
    items: [["Séduction", "Charme"]],
  },
  {
    clues: ["Charme", "Bar"],
    items: [["Drague", "Approche"]],
  },
  {
    clues: ["Effet", "Huître"],
    items: [["Aphrodisiaque", "Désir"]],
  },
  {
    clues: ["Dentelle", "Sexy"],
    items: [["Lingerie", "Sous-vêtement"]],
  },
  {
    clues: ["Corps", "Détente"],
    items: [["Massage sensuel", "Mains"]],
  },
  {
    clues: ["Charme", "Léger"],
    items: [["Flirt", "Regard"]],
  },
  {
    clues: ["Émotion", "Sensation"],
    items: [["Frisson", "Peau"]],
  },
  {
    clues: ["Langue", "Intense"],
    items: [["Baiser passionné", "Lèvres"]],
  },
  {
    clues: ["Passion", "Intense"],
    items: [["Nuit torride", "Chaud"]],
  },
  {
    clues: ["Résister", "Envie"],
    items: [["Tentation", "Désir"]],
  },
  {
    clues: ["Séduire", "Sourire"],
    items: [["Charme", "Attirance"]],
  },
  {
    clues: ["Connexion", "Couple"],
    items: [["Alchimie (couple)", "Étincelle"]],
  },
  {
    clues: ["Peau", "Proche"],
    items: [["Corps à corps", "Contact"]],
  },
  {
    clues: ["Intime", "Recoin"],
    items: [["Alcôve", "Chambre"]],
  },
  {
    clues: ["Blanche", "Nez"],
    items: [["Cocaïne", "Poudre"]],
  },
  {
    clues: ["Herbe", "Fumer"],
    items: [["Cannabis", "Plante"]],
  },
  {
    clues: ["Fumer", "Cannabis"],
    items: [["Shit (haschich)", "Brun"]],
  },
  {
    clues: ["Boisson", "Soirée"],
    items: [["Alcool fort", "Fort"]],
  },
  {
    clues: ["Fumer", "Paquet"],
    items: [["Tabac", "Cigarette"]],
  },
  {
    clues: ["Papier", "Rouler"],
    items: [["Cigarette roulée", "Tabac"]],
  },
  {
    clues: ["Eau", "Tabac"],
    items: [["Pipe à eau", "Fumer"]],
  },
  {
    clues: ["Soirée", "Effet"],
    items: [["Ecstasy", "Pilule"]],
  },
  {
    clues: ["Hallucination", "Effet"],
    items: [["LSD", "Buvard"]],
  },
  {
    clues: ["Soirée", "Effet"],
    items: [["Kétamine", "Anesthésiant"]],
  },
  {
    clues: ["Poudre", "Soirée"],
    items: [["Speed", "Stimulant"]],
  },
  {
    clues: ["Soirée", "Effet"],
    items: [["Molly", "Poudre"]],
  },
  {
    clues: ["Machine", "Cuisine"],
    items: [["Cafetière", "Café"]],
  },
  {
    clues: ["Chaleur", "Cuisson"],
    items: [["Four", "Cuisine"]],
  },
  {
    clues: ["Feu", "Casserole"],
    items: [["Plaque de cuisson", "Cuisine"]],
  },
  {
    clues: ["Air", "Été"],
    items: [["Climatisation", "Froid"]],
  },
  {
    clues: ["Hiver", "Radiateur"],
    items: [["Chauffage", "Chaud"]],
  },
  {
    clues: ["Électrique", "Plafond"],
    items: [["Ampoule", "Lumière"]],
  },
  {
    clues: ["Chambre", "Nuit"],
    items: [["Lampe de chevet", "Lumière"]],
  },
  {
    clues: ["Salon", "Poser"],
    items: [["Tapis", "Sol"]],
  },
  {
    clues: ["Doux", "Décoration"],
    items: [["Coussin", "Canapé"]],
  },
  {
    clues: ["Dormir", "Mousse"],
    items: [["Matelas", "Lit"]],
  },
  {
    clues: ["Chaud", "Dormir"],
    items: [["Couette", "Lit"]],
  },
  {
    clues: ["Jeter", "Cuisine"],
    items: [["Poubelle", "Déchets"]],
  },
  {
    clues: ["Chauffage", "Réglage"],
    items: [["Thermostat", "Température"]],
  },
  {
    clues: ["Compte", "Réseaux"],
    items: [["Followers", "Abonnés"]],
  },
  {
    clues: ["Envoyer", "Réseaux"],
    items: [["Partage", "Publication"]],
  },
  {
    clues: ["Écrire", "Publication"],
    items: [["Commentaire", "Réaction"]],
  },
  {
    clues: ["Visage", "Effet"],
    items: [["Filtre photo", "Instagram"]],
  },
  {
    clues: ["Instagram", "Court"],
    items: [["Réel", "Vidéo"]],
  },
  {
    clues: ["Public", "Réseaux"],
    items: [["Clash", "Dispute"]],
  },
  {
    clues: ["Scandale", "Réseaux"],
    items: [["Bad buzz", "Négatif"]],
  },
  {
    clues: ["Marque", "Réseaux"],
    items: [["Community manager", "Métier"]],
  },
  {
    clues: ["Compte", "Réseaux"],
    items: [["Abonnement (réseaux)", "Suivre"]],
  },
  {
    clues: ["Empêcher", "Réseaux"],
    items: [["Bloquer", "Compte"]],
  },
  {
    clues: ["Image", "Compte"],
    items: [["Photo de profil", "Avatar"]],
  },
  {
    clues: ["Réseaux", "Punition"],
    items: [["Shadowban", "Invisible"]],
  },
  {
    clues: ["Vidéo", "Intelligence artificielle"],
    items: [["Deepfake", "Faux"]],
  },
  {
    clues: ["Réseaux", "Harcèlement"],
    items: [["Cyberharcèlement", "Insultes"]],
  },
  {
    clues: ["Rapide", "Réseaux"],
    items: [["Viral", "Partagé"]],
  },
  {
    clues: ["France", "Acteur"],
    items: [["Gad Elmaleh", "Humoriste"]],
  },
  {
    clues: ["France", "Jeune"],
    items: [["Kev Adams", "Humoriste"]],
  },
  {
    clues: ["France", "Comédie"],
    items: [["Kad Merad", "Acteur"]],
  },
  {
    clues: ["France", "Ch'tis"],
    items: [["Dany Boon", "Acteur"]],
  },
  {
    clues: ["France", "Humoriste"],
    items: [["Franck Dubosc", "Acteur"]],
  },
  {
    clues: ["France", "Cinéma"],
    items: [["Vincent Cassel", "Acteur"]],
  },
  {
    clues: ["France", "Réalisateur"],
    items: [["Guillaume Canet", "Acteur"]],
  },
  {
    clues: ["France", "Humoriste"],
    items: [["Alain Chabat", "Acteur"]],
  },
  {
    clues: ["Télévision", "France"],
    items: [["Michel Cymes", "Médecin"]],
  },
  {
    clues: ["Américain", "Gifle"],
    items: [["Will Smith", "Acteur"]],
  },
  {
    clues: ["Américain", "Pirate"],
    items: [["Johnny Depp", "Acteur"]],
  },
  {
    clues: ["Américaine", "Hunger Games"],
    items: [["Jennifer Lawrence", "Actrice"]],
  },
  {
    clues: ["Américaine", "Avengers"],
    items: [["Scarlett Johansson", "Actrice"]],
  },
  {
    clues: ["Américaine", "Oscar"],
    items: [["Meryl Streep", "Actrice"]],
  },
  {
    clues: ["Américain", "Iron Man"],
    items: [["Robert Downey Jr", "Acteur"]],
  },
  {
    clues: ["Australien", "Thor"],
    items: [["Chris Hemsworth", "Acteur"]],
  },
  {
    clues: ["Catcheur", "The Rock"],
    items: [["Dwayne Johnson", "Acteur"]],
  },
  {
    clues: ["Américain", "Matrix"],
    items: [["Keanu Reeves", "Acteur"]],
  },
  {
    clues: ["Amazon", "Américain"],
    items: [["Jeff Bezos", "Milliardaire"]],
  },
  {
    clues: ["Milliardaire", "Américain"],
    items: [["Mark Zuckerberg", "Facebook"]],
  },
  {
    clues: ["Milliardaire", "Américain"],
    items: [["Bill Gates", "Microsoft"]],
  },
  {
    clues: ["Américain", "Politique"],
    items: [["Barack Obama", "Président"]],
  },
  {
    clues: ["Américain", "Politique"],
    items: [["Donald Trump", "Président"]],
  },
  {
    clues: ["Américaine", "Télévision"],
    items: [["Oprah Winfrey", "Animatrice"]],
  },
  {
    clues: ["Américaine", "Baywatch"],
    items: [["Pamela Anderson", "Actrice"]],
  },
  {
    clues: ["Américaine", "Musique"],
    items: [["Cardi B", "Rappeuse"]],
  },
  {
    clues: ["Actrice", "Américaine"],
    items: [["Selena Gomez", "Chanteuse"]],
  },
  {
    clues: ["Télévision", "Concours"],
    items: [["Nouvelle Star", "Chant"]],
  },
  {
    clues: ["Enfant", "Télévision"],
    items: [["The Voice Kids", "Chant"]],
  },
  {
    clues: ["Obstacle", "Télévision"],
    items: [["Ninja Warrior", "Parcours"]],
  },
  {
    clues: ["Jeu", "Télévision"],
    items: [["N'oubliez pas les paroles", "Chanson"]],
  },
  {
    clues: ["Midi", "Télévision"],
    items: [["Les 12 Coups de midi", "Jeu"]],
  },
  {
    clues: ["Mots", "Télévision"],
    items: [["Slam (émission)", "Jeu"]],
  },
  {
    clues: ["Argent", "Télévision"],
    items: [["Money Drop", "Jeu"]],
  },
  {
    clues: ["Mot", "Télévision"],
    items: [["Motus", "Jeu"]],
  },
  {
    clues: ["Vente", "Télévision"],
    items: [["Affaire conclue", "Objets"]],
  },
  {
    clues: ["Télévision", "Visite"],
    items: [["Recherche appartement ou maison", "Immobilier"]],
  },
  {
    clues: ["Île", "Télévision"],
    items: [["L'île de la tentation", "Couple"]],
  },
  {
    clues: ["Télévision", "Inconnu"],
    items: [["Mariés au premier regard", "Mariage"]],
  },
  {
    clues: ["Concours", "Télévision"],
    items: [["La France a un incroyable talent", "Talent"]],
  },
  {
    clues: ["Dîner", "Télévision"],
    items: [["Un dîner presque parfait", "Cuisine"]],
  },
  {
    clues: ["Cuisine", "Télévision"],
    items: [["Cauchemar en cuisine", "Restaurant"]],
  },
  {
    clues: ["Filtre", "Corps"],
    items: [["Rein", "Organe"]],
  },
  {
    clues: ["Corps", "Abdomen"],
    items: [["Rate", "Organe"]],
  },
  {
    clues: ["Pipi", "Corps"],
    items: [["Vessie", "Organe"]],
  },
  {
    clues: ["Digestion", "Corps"],
    items: [["Intestin", "Organe"]],
  },
  {
    clues: ["Os", "Corps"],
    items: [["Rotule", "Genou"]],
  },
  {
    clues: ["Épaule", "Corps"],
    items: [["Clavicule", "Os"]],
  },
  {
    clues: ["Dos", "Corps"],
    items: [["Omoplate", "Os"]],
  },
  {
    clues: ["Visage", "Corps"],
    items: [["Mâchoire", "Os"]],
  },
  {
    clues: ["Os", "Joue"],
    items: [["Pommette", "Visage"]],
  },
  {
    clues: ["Poitrine", "Corps"],
    items: [["Cage thoracique", "Os"]],
  },
  {
    clues: ["Symptôme", "Tousser"],
    items: [["Toux", "Gorge"]],
  },
  {
    clues: ["Douleur", "Maladie"],
    items: [["Angine", "Gorge"]],
  },
  {
    clues: ["Douleur", "Maladie"],
    items: [["Otite", "Oreille"]],
  },
  {
    clues: ["Symptôme", "Toilettes"],
    items: [["Diarrhée", "Ventre"]],
  },
  {
    clues: ["Symptôme", "Toilettes"],
    items: [["Constipation", "Ventre"]],
  },
  {
    clues: ["Symptôme", "Tourner"],
    items: [["Vertige", "Tête"]],
  },
  {
    clues: ["Douleur", "Symptôme"],
    items: [["Torticolis", "Cou"]],
  },
  {
    clues: ["Douleur", "Symptôme"],
    items: [["Crampe", "Muscle"]],
  },
  {
    clues: ["Douleur", "Symptôme"],
    items: [["Brûlure d'estomac", "Ventre"]],
  },
  {
    clues: ["Douleur", "Symptôme"],
    items: [["Piqûre d'insecte", "Peau"]],
  },
  {
    clues: ["Gorge", "Expression"],
    items: [["Avoir un chat dans la gorge", "Voix"]],
  },
  {
    clues: ["Expression", "Agacer"],
    items: [["Casser les pieds", "Ennuyer"]],
  },
  {
    clues: ["Expression", "Déprime"],
    items: [["Avoir le cafard", "Triste"]],
  },
  {
    clues: ["Expression", "Se faire avoir"],
    items: [["Tomber dans le panneau", "Piège"]],
  },
  {
    clues: ["Expression", "Forme"],
    items: [["Avoir la pêche", "Énergie"]],
  },
  {
    clues: ["Expression", "Précipité"],
    items: [["Mettre la charrue avant les bœufs", "Ordre"]],
  },
  {
    clues: ["Expression", "Fainéant"],
    items: [["Avoir un poil dans la main", "Paresse"]],
  },
  {
    clues: ["Expression", "Discret"],
    items: [["Filer à l'anglaise", "Partir"]],
  },
  {
    clues: ["Expression", "Critiquer"],
    items: [["Casser du sucre sur le dos", "Médire"]],
  },
  {
    clues: ["Expression", "Confiance"],
    items: [["Avoir le melon", "Prétentieux"]],
  },
  {
    clues: ["Expression", "Tard"],
    items: [["Faire la grasse matinée", "Dormir"]],
  },
  {
    clues: ["Expression", "Direct"],
    items: [["Tourner autour du pot", "Détour"]],
  },
  {
    clues: ["Expression", "Trop"],
    items: [["Avoir les yeux plus gros que le ventre", "Manger"]],
  },
  {
    clues: ["Expression", "Amour"],
    items: [["Se prendre un râteau", "Refus"]],
  },
  {
    clues: ["Expression", "Intervenir"],
    items: [["Mettre son grain de sel", "Avis"]],
  },
  {
    clues: ["Expression", "Content"],
    items: [["Avoir la banane", "Sourire"]],
  },
  {
    clues: ["Expression", "Énerver"],
    items: [["Péter un câble", "Colère"]],
  },
  {
    clues: ["Expression", "Fatigue"],
    items: [["Avoir la flemme", "Paresse"]],
  },
  {
    clues: ["Sourire", "Bonheur"],
    items: [["Joie", "Émotion"]],
  },
  {
    clues: ["Stress", "Inquiétude"],
    items: [["Anxiété", "Émotion"]],
  },
  {
    clues: ["Triste", "Doux"],
    items: [["Mélancolie", "Émotion"]],
  },
  {
    clues: ["Empathie", "Aider"],
    items: [["Compassion", "Émotion"]],
  },
  {
    clues: ["Assurance", "Fierté"],
    items: [["Confiance en soi", "Émotion"]],
  },
  {
    clues: ["Merci", "Reconnaissance"],
    items: [["Gratitude", "Émotion"]],
  },
  {
    clues: ["Violent", "Tempête"],
    items: [["Ouragan", "Vent"]],
  },
  {
    clues: ["Pluie", "Débordement"],
    items: [["Inondation", "Eau"]],
  },
  {
    clues: ["Ramper", "Venin"],
    items: [["Serpent", "Reptile"]],
  },
  {
    clues: ["Mer", "Intelligent"],
    items: [["Poulpe", "Tentacules"]],
  },
  {
    clues: ["Petit", "Boule"],
    items: [["Hérisson", "Piquants"]],
  },
  {
    clues: ["Vole", "Grotte"],
    items: [["Chauve-souris", "Nuit"]],
  },
  {
    clues: ["Four", "Farine"],
    items: [["Boulanger (métier)", "Pain"]],
  },
  {
    clues: ["Défendre", "Loi"],
    items: [["Avocat (métier)", "Tribunal"]],
  },
  {
    clues: ["Tracteur", "Récolte"],
    items: [["Agriculteur", "Champ"]],
  },
  {
    clues: ["Meuble", "Scie"],
    items: [["Menuisier", "Bois"]],
  },
  {
    clues: ["Élève", "Tableau"],
    items: [["Enseignant", "École"]],
  },
  {
    clues: ["France", "Marque"],
    items: [["Peugeot", "Voiture"]],
  },
  {
    clues: ["France", "Marque"],
    items: [["Renault", "Voiture"]],
  },
  {
    clues: ["France", "Marque"],
    items: [["Citroën", "Voiture"]],
  },
  {
    clues: ["Allemagne", "Marque"],
    items: [["BMW", "Voiture"]],
  },
  {
    clues: ["Allemagne", "Marque"],
    items: [["Mercedes", "Voiture"]],
  },
  {
    clues: ["Allemagne", "Marque"],
    items: [["Audi", "Voiture"]],
  },
  {
    clues: ["Italie", "Rouge"],
    items: [["Ferrari", "Voiture"]],
  },
  {
    clues: ["Allemagne", "Sport"],
    items: [["Porsche", "Voiture"]],
  },
  {
    clues: ["Japon", "Marque"],
    items: [["Toyota", "Voiture"]],
  },
  {
    clues: ["Allemagne", "Marque"],
    items: [["Volkswagen", "Voiture"]],
  },
  {
    clues: ["Italie", "Marque"],
    items: [["Fiat", "Voiture"]],
  },
  {
    clues: ["Italie", "Sport"],
    items: [["Lamborghini", "Voiture"]],
  },
  {
    clues: ["Sirène", "Gyrophare"],
    items: [["Voiture de police", "Voiture"]],
  },
  {
    clues: ["Gros", "Transport"],
    items: [["Camion", "Route"]],
  },
  {
    clues: ["Voiture", "Course"],
    items: [["Karting", "Circuit"]],
  },
  {
    clues: ["Serré", "Vêtement"],
    items: [["Legging", "Jambe"]],
  },
  {
    clues: ["Chaud", "Vêtement"],
    items: [["Sweat à capuche", "Capuche"]],
  },
  {
    clues: ["Sport", "Lacets"],
    items: [["Baskets", "Chaussures"]],
  },
  {
    clues: ["Numéro", "Sport"],
    items: [["Maillot de foot", "Équipe"]],
  },
  {
    clues: ["Hiver", "Vêtement"],
    items: [["Gants", "Mains"]],
  },
  {
    clues: ["Costume", "Nœud"],
    items: [["Cravate", "Cou"]],
  },
  {
    clues: ["Musique", "Rythme"],
    items: [["Batterie (musique)", "Baguettes"]],
  },
  {
    clues: ["Musique", "Frapper"],
    items: [["Tambour", "Percussion"]],
  },
  {
    clues: ["Musique", "Électronique"],
    items: [["Synthétiseur", "Touches"]],
  },
  {
    clues: ["Jaune", "Tropical"],
    items: [["Ananas", "Fruit"]],
  },
  {
    clues: ["Vert", "Noyau"],
    items: [["Avocat (fruit)", "Fruit"]],
  },
  {
    clues: ["Asie", "Rose"],
    items: [["Litchi", "Fruit"]],
  },
  {
    clues: ["Rouge", "Terre"],
    items: [["Betterave", "Légume"]],
  },
  {
    clues: ["Rouge", "Terre"],
    items: [["Radis", "Légume"]],
  },
  {
    clues: ["Anis", "Bulbe"],
    items: [["Fenouil", "Légume"]],
  },
  {
    clues: ["Orange", "Halloween"],
    items: [["Citrouille", "Légume"]],
  },
  {
    clues: ["Jaune", "Lorraine"],
    items: [["Mirabelle", "Fruit"]],
  },
  {
    clues: ["Jouer", "Pause"],
    items: [["Cour de récré", "École"]],
  },
  {
    clues: ["Enseignante", "Primaire"],
    items: [["Maîtresse", "École"]],
  },
  {
    clues: ["Repas", "Plateau"],
    items: [["Cantine", "École"]],
  },
  {
    clues: ["Vacances", "Groupe"],
    items: [["Colonie de vacances", "Enfants"]],
  },
  {
    clues: ["Fête", "Stand"],
    items: [["Kermesse", "École"]],
  },
  {
    clues: ["Enfant", "Cacher"],
    items: [["Cache-cache", "Jeu"]],
  },
  {
    clues: ["Craie", "Sauter"],
    items: [["Marelle", "Jeu"]],
  },
  {
    clues: ["Enfant", "Sauter"],
    items: [["Élastique (jeu)", "Jeu"]],
  },
  {
    clues: ["Enfant", "Rond"],
    items: [["Billes", "Jeu"]],
  },
  {
    clues: ["Enfant", "Sauter"],
    items: [["Corde à sauter", "Jeu"]],
  },
  {
    clues: ["Enfant", "Tourner"],
    items: [["Toupie", "Jouet"]],
  },
  {
    clues: ["Enfant", "Fille"],
    items: [["Poupée", "Jouet"]],
  },
  {
    clues: ["Peluche", "Nuit"],
    items: [["Doudou", "Enfant"]],
  },
  {
    clues: ["Bouche", "Calmer"],
    items: [["Tétine", "Bébé"]],
  },
  {
    clues: ["Lait", "Boire"],
    items: [["Biberon", "Bébé"]],
  },
  {
    clues: ["Pause", "Jouer"],
    items: [["Récréation", "École"]],
  },
  {
    clues: ["Rouge", "Marque"],
    items: [["Coca-Cola", "Soda"]],
  },
  {
    clues: ["Orange", "Marque"],
    items: [["Fanta", "Soda"]],
  },
  {
    clues: ["Citron", "Marque"],
    items: [["Sprite", "Soda"]],
  },
  {
    clues: ["Boisson", "Marque"],
    items: [["Ice tea", "Thé glacé"]],
  },
  {
    clues: ["France", "Marque"],
    items: [["Perrier", "Eau gazeuse"]],
  },
  {
    clues: ["Fruit", "Marque"],
    items: [["Oasis", "Jus"]],
  },
  {
    clues: ["Enfant", "Sachet"],
    items: [["Capri-Sun", "Jus"]],
  },
  {
    clues: ["Boisson", "Marque"],
    items: [["Red Bull", "Énergisant"]],
  },
  {
    clues: ["Marque", "Fruit"],
    items: [["Innocent", "Smoothie"]],
  },
  {
    clues: ["Marque", "Bouteille"],
    items: [["Volvic", "Eau"]],
  },
  {
    clues: ["Marque", "Bouteille"],
    items: [["Evian", "Eau"]],
  },
  {
    clues: ["Citron", "Gazeuse"],
    items: [["Limonade", "Boisson"]],
  },
  {
    clues: ["Rouge", "Boisson"],
    items: [["Sirop de grenadine", "Sirop"]],
  },
  {
    clues: ["Chaud", "Cacao"],
    items: [["Chocolat chaud", "Boisson"]],
  },
  {
    clues: ["Chocolat", "Marque"],
    items: [["Nutella", "Pâte à tartiner"]],
  },
  {
    clues: ["Mou", "Blanc"],
    items: [["Chamallow", "Bonbon"]],
  },
  {
    clues: ["Marque", "Sucre"],
    items: [["Bonbon Haribo", "Bonbon"]],
  },
  {
    clues: ["Bouche", "Bulle"],
    items: [["Chewing-gum", "Mâcher"]],
  },
  {
    clues: ["Rose", "Fête foraine"],
    items: [["Barbe à papa", "Sucre"]],
  },
  {
    clues: ["Cinéma", "Sucré ou salé"],
    items: [["Pop-corn", "Maïs"]],
  },
  {
    clues: ["Jouet", "Œuf"],
    items: [["Kinder Surprise", "Chocolat"]],
  },
  {
    clues: ["Marque", "Beurre"],
    items: [["Petit Lu", "Biscuit"]],
  },
  {
    clues: ["Marque", "Bâton"],
    items: [["Chupa Chups", "Sucette"]],
  },
  {
    clues: ["Caramel", "Blague"],
    items: [["Carambar", "Bonbon"]],
  },
  {
    clues: ["Fondant", "Doré"],
    items: [["Caramel", "Sucre"]],
  },
  {
    clues: ["Mou", "Blanc"],
    items: [["Guimauve", "Sucre"]],
  },
  {
    clues: ["Noir", "Anis"],
    items: [["Réglisse", "Bonbon"]],
  },
  {
    clues: ["Fruit", "Sucre"],
    items: [["Pâte de fruit", "Bonbon"]],
  },
  {
    clues: ["Carré", "Marque"],
    items: [["Tablette de chocolat", "Chocolat"]],
  },
  {
    clues: ["Acide", "Sucre"],
    items: [["Bonbon acidulé", "Bonbon"]],
  },
  {
    clues: ["Amandes", "Blanc"],
    items: [["Nougat", "Sucre"]],
  },
  {
    clues: ["Chocolat", "Sucre"],
    items: [["Praline", "Noisette"]],
  },
  {
    clues: ["Sans fil", "Connexion"],
    items: [["Wifi", "Internet"]],
  },
  {
    clues: ["Encre", "Bureau"],
    items: [["Imprimante", "Papier"]],
  },
  {
    clues: ["Port", "Données"],
    items: [["Clé USB", "Stockage"]],
  },
  {
    clues: ["Carré", "Téléphone"],
    items: [["QR code", "Scanner"]],
  },
  {
    clues: ["Connexion", "Réseau"],
    items: [["VPN", "Sécurité"]],
  },
  {
    clues: ["Internet", "Données"],
    items: [["Cloud", "Stockage"]],
  },
  {
    clues: ["Ordinateur", "Futur"],
    items: [["Intelligence artificielle", "Robot"]],
  },
  {
    clues: ["Immersion", "Jeu"],
    items: [["Réalité virtuelle", "Casque"]],
  },
  {
    clues: ["Ordinateur", "Virus"],
    items: [["Antivirus", "Sécurité"]],
  },
  {
    clues: ["Ordinateur", "Site"],
    items: [["Navigateur web", "Internet"]],
  },
  {
    clues: ["Écran", "Téléphone"],
    items: [["Écran tactile", "Toucher"]],
  },
  {
    clues: ["Anglais", "Honte"],
    items: [["Cringe", "Gênant"]],
  },
  {
    clues: ["Expression", "Une fois"],
    items: [["Yolo", "Anglais"]],
  },
  {
    clues: ["Anglais", "Confiance"],
    items: [["Swag", "Style"]],
  },
  {
    clues: ["Anglais", "Ressenti"],
    items: [["Vibe", "Ambiance"]],
  },
  {
    clues: ["Anglais", "Beauté"],
    items: [["Glow up", "Transformation"]],
  },
  {
    clues: ["Anglais", "Fierté"],
    items: [["Flex", "Montrer"]],
  },
  {
    clues: ["Anglais", "Calme"],
    items: [["Chill", "Détendu"]],
  },
  {
    clues: ["Anglais", "Bizarre"],
    items: [["Random", "Hasard"]],
  },
  {
    clues: ["Calme", "Détente"],
    items: [["No stress", "Anglais"]],
  },
  {
    clues: ["Anglais", "Émotion"],
    items: [["Feeling", "Ressenti"]],
  },
  {
    clues: ["Anglais", "Éviter"],
    items: [["Skip", "Passer"]],
  },
  {
    clues: ["Anglais", "Mensonge"],
    items: [["Fake", "Faux"]],
  },
  {
    clues: ["Anglais", "Marché"],
    items: [["Deal", "Accord"]],
  },
  {
    clues: ["Anglais", "Réseaux"],
    items: [["Challenge", "Défi"]],
  },
  {
    clues: ["Anglais", "Mode"],
    items: [["Trend", "Tendance"]],
  },
  {
    clues: ["Anglais", "Attente"],
    items: [["Hype", "Excitation"]],
  },
  {
    clues: ["Anglais", "Amis"],
    items: [["Squad", "Groupe"]],
  },
  {
    clues: ["Anglais", "Mode"],
    items: [["Vintage", "Rétro"]],
  },
  {
    clues: ["Anglais", "Humour"],
    items: [["Roast", "Moquer"]],
  },
  {
    clues: ["Anglais", "Négatif"],
    items: [["Toxic", "Relation"]],
  },
  {
    clues: ["Nuit", "Briller"],
    items: [["Étoile", "Ciel"]],
  },
  {
    clues: ["Orbite", "Système solaire"],
    items: [["Planète", "Espace"]],
  },
  {
    clues: ["Étoiles", "Univers"],
    items: [["Galaxie", "Espace"]],
  },
  {
    clues: ["Tomber", "Roche"],
    items: [["Météorite", "Espace"]],
  },
  {
    clues: ["Soleil", "Espace"],
    items: [["Système solaire", "Planètes"]],
  },
  {
    clues: ["Agence", "Fusée"],
    items: [["NASA", "Espace"]],
  },
  {
    clues: ["Corps", "Microscope"],
    items: [["Cellule", "Biologie"]],
  },
  {
    clues: ["Lave", "Éruption"],
    items: [["Volcan", "Géologie"]],
  },
  {
    clues: ["Terre", "Trembler"],
    items: [["Séisme", "Géologie"]],
  },
  {
    clues: ["Océan", "Catastrophe"],
    items: [["Tsunami", "Vague"]],
  },
  {
    clues: ["Lune", "Ombre"],
    items: [["Éclipse", "Soleil"]],
  },
  {
    clues: ["Retrait", "Banque"],
    items: [["Distributeur de billets", "Argent"]],
  },
  {
    clues: ["Banque", "Négatif"],
    items: [["Découvert bancaire", "Argent"]],
  },
  {
    clues: ["Épargne", "Banque"],
    items: [["Économies", "Argent"]],
  },
  {
    clues: ["Logement", "Mensuel"],
    items: [["Loyer", "Argent"]],
  },
  {
    clues: ["Payer", "Document"],
    items: [["Facture", "Argent"]],
  },
  {
    clues: ["État", "Déclaration"],
    items: [["Impôts", "Argent"]],
  },
  {
    clues: ["Banque", "Rembourser"],
    items: [["Crédit (prêt)", "Argent"]],
  },
  {
    clues: ["Collecte", "Groupe"],
    items: [["Cagnotte", "Argent"]],
  },
  {
    clues: ["Pièces", "Poche"],
    items: [["Petite monnaie", "Argent"]],
  },
  {
    clues: ["Numérique", "Bitcoin"],
    items: [["Cryptomonnaie", "Argent"]],
  },
  {
    clues: ["Argent", "Numérique"],
    items: [["Bitcoin", "Cryptomonnaie"]],
  },
  {
    clues: ["Actions", "Marché"],
    items: [["Bourse (finance)", "Argent"]],
  },
  {
    clues: ["Œufs", "Chocolat"],
    items: [["Pâques", "Fête"]],
  },
  {
    clues: ["Citrouille", "Déguisement"],
    items: [["Halloween", "Fête"]],
  },
  {
    clues: ["Minuit", "Champagne"],
    items: [["Nouvel An", "Fête"]],
  },
  {
    clues: ["Amour", "Cœur"],
    items: [["Saint-Valentin", "Fête"]],
  },
  {
    clues: ["Cadeau", "Maman"],
    items: [["Fête des Mères", "Fête"]],
  },
  {
    clues: ["Cadeau", "Papa"],
    items: [["Fête des Pères", "Fête"]],
  },
  {
    clues: ["France", "Feu d'artifice"],
    items: [["14 juillet", "Fête"]],
  },
  {
    clues: ["Galette", "Couronne"],
    items: [["Épiphanie", "Fête"]],
  },
  {
    clues: ["Déguisement", "Défilé"],
    items: [["Carnaval", "Fête"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Pizza", "Italie"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Sushi", "Japon"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Burger", "Pain"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Tacos", "Mexique"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Kebab", "Broche"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Crêpe", "Bretagne"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Fondue", "Savoyarde"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Paella", "Riz"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Couscous", "Semoule"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Macaron", "Ladurée"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Brownie", "Chocolat"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Cheesecake", "Fromage"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Éclair", "Pâtisserie"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Donut", "Trou"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Cookie", "Pépites"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Mousse au chocolat", "Œufs"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Crème brûlée", "Caramel"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Glace", "Froid"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Spritz", "Orange"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Margarita", "Tequila"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Piña colada", "Ananas"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Gin tonic", "Concombre"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Moscow mule", "Gingembre"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Caipirinha", "Brésil"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Bloody Mary", "Tomate"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Sex on the beach", "Cocktail"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Monaco", "Bière"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Vodka", "Russie"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Whisky", "Écosse"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Rhum", "Pirate"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Champagne", "Bulles"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Pastis", "Anis"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Rosé", "Vin"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Jägermeister", "Digestif"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Get 27", "Menthe"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Limoncello", "Citron"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["After", "Matin"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Open bar", "Illimité"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Gueule de bois", "Lendemain"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Videur", "Entrée"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["DJ", "Platine"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Karaoké", "Chanter"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Happy hour", "Réduction"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Piste de danse", "Musique"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Dernier verre", "Fermeture"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Tomorrowland", "Électro"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Hellfest", "Métal"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Solidays", "Paris"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Vieilles Charrues", "Bretagne"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Lollapalooza", "Concert"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Garorock", "Marmande"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Main Square", "Arras"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Rock en Seine", "Saint-Cloud"]],
  },
  {
    clues: ["Festival", "Musique"],
    items: [["Eurovision", "Chanson"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Instagram", "Photo"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["TikTok", "Vidéo"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Snapchat", "Éphémère"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["WhatsApp", "Message"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Uber", "Chauffeur"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Deliveroo", "Livraison"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Shazam", "Reconnaître"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Duolingo", "Langue"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Vinted", "Vêtement"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["LinkedIn", "Travail"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["X", "Tweet"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["Reddit", "Forum"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["Pinterest", "Inspiration"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["BeReal", "Notification"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["Twitch", "Stream"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["Discord", "Serveur"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["YouTube", "Vidéo"]],
  },
  {
    clues: ["Réseau social", "Internet"],
    items: [["OnlyFans", "Abonnement"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Wikipedia", "Encyclopédie"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Amazon", "Achat"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Leboncoin", "Occasion"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Booking", "Hôtel"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Airbnb", "Location"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Netflix", "Série"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Spotify", "Musique"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Doctolib", "Rendez-vous"]],
  },
  {
    clues: ["Site", "Internet"],
    items: [["Pornhub", "Adulte"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Samsung", "Galaxy"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Microsoft", "Windows"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Sony", "PlayStation"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Nintendo", "Mario"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Tesla", "Électrique"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Dyson", "Aspirateur"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["GoPro", "Caméra"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Bose", "Casque"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Canon", "Photo"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Adidas", "Trois bandes"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Zara", "Espagne"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["H&M", "Suède"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Lacoste", "Crocodile"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Levi's", "Jean"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["The North Face", "Doudoune"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Uniqlo", "Japon"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Ralph Lauren", "Polo"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Patagonia", "Outdoor"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Chanel", "Numéro 5"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Dior", "Couture"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Hermès", "Birkin"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Gucci", "Italie"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Rolex", "Montre"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Cartier", "Bijou"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Prada", "Sac"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Balenciaga", "Sneakers"]],
  },
  {
    clues: ["Luxe", "Marque"],
    items: [["Louboutin", "Semelle rouge"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Burger King", "Whopper"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["KFC", "Poulet"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Subway", "Sandwich"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Domino's", "Pizza"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["O'Tacos", "French tacos"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Five Guys", "Cacahuètes"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Quick", "Giant"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Starbucks", "Café"]],
  },
  {
    clues: ["Fast-food", "Manger"],
    items: [["Pokawa", "Poké bowl"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Auchan", "Caddie"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Lidl", "Discount"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Monoprix", "Centre-ville"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Picard", "Surgelé"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Franprix", "Proximité"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Leclerc", "Ticket"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Intermarché", "Mousquetaires"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Aldi", "Prix"]],
  },
  {
    clues: ["Supermarché", "Courses"],
    items: [["Grand Frais", "Fruits"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Marseille", "Vieux-Port"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Lyon", "Bouchon"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Bordeaux", "Vin"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Lille", "Nord"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Toulouse", "Rose"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Nice", "Promenade"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Nantes", "Éléphant"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Strasbourg", "Alsace"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Montpellier", "Sud"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Madrid", "Espagne"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Rome", "Colisée"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Berlin", "Allemagne"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Lisbonne", "Portugal"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Amsterdam", "Canaux"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Bruxelles", "Belgique"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Athènes", "Acropole"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Dublin", "Irlande"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Vienne", "Autriche"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Los Angeles", "Hollywood"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Tokyo", "Japon"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Dubaï", "Burj Khalifa"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Bangkok", "Thaïlande"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Sydney", "Opéra"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Rio de Janeiro", "Christ"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Montréal", "Québec"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Marrakech", "Maroc"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Istanbul", "Turquie"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Métro", "Souterrain"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Tramway", "Rails"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Trottinette", "Électrique"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Covoiturage", "BlaBlaCar"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Avion", "Aéroport"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Ferry", "Bateau"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Camping-car", "Vacances"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Téléphérique", "Montagne"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Eurostar", "Londres"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Valise", "Bagage"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Auberge de jeunesse", "Dortoir"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["All inclusive", "Hôtel"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Jet lag", "Décalage"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Road trip", "Voiture"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Carte postale", "Timbre"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Guide touristique", "Visite"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Souvenir", "Rapporter"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Douane", "Contrôle"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Maillot de bain", "Nager"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Serviette", "Sécher"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Château de sable", "Enfant"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Bouée", "Flotter"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Parasol", "Ombre"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Coup de soleil", "Rouge"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Glacière", "Froid"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Beach-volley", "Ballon"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Tongs", "Pieds"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Avatar", "Bleu"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Harry Potter", "Sorcier"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Star Wars", "Jedi"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Le Roi Lion", "Simba"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Jurassic Park", "Dinosaure"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Matrix", "Pilule"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Inception", "Rêve"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Intouchables", "Fauteuil"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Astérix et Obélix", "Gaulois"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Stranger Things", "Upside Down"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Friends", "Café"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Breaking Bad", "Méthamphétamine"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["La Casa de Papel", "Braquage"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Squid Game", "Corée"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["The Walking Dead", "Zombie"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Peaky Blinders", "Birmingham"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Emily in Paris", "Mode"]],
  },
  {
    clues: ["Série", "Télévision"],
    items: [["Kaamelott", "Arthur"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Batman", "Gotham"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Spider-Man", "Araignée"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Dark Vador", "Masque"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Shrek", "Ogre"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Barbie", "Poupée"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Indiana Jones", "Fouet"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Rocky", "Boxe"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Jack Sparrow", "Pirate"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Forrest Gump", "Courir"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Bob l'éponge", "Ananas"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Homer Simpson", "Donut"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Pikachu", "Pokémon"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Stitch", "Hawaï"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Totoro", "Japon"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Buzz l'Éclair", "Espace"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Scooby-Doo", "Chien"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Titeuf", "Mèche"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Ladybug", "Coccinelle"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Jul", "Marseille"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Orelsan", "Caen"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Gims", "Lunettes"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Vianney", "Guitare"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Soprano", "Rappeur"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["David Guetta", "DJ"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Mylène Farmer", "Rousse"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Johnny Hallyday", "Rock"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Patrick Bruel", "Place des grands hommes"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Angèle", "Belgique"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Taylor Swift", "Eras"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Beyoncé", "Queen B"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Rihanna", "Barbade"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Lady Gaga", "Poker Face"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Adele", "Hello"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Dua Lipa", "Dance"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Billie Eilish", "Cheveux"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Céline Dion", "Titanic"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Ninho", "Jefe"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["SCH", "A7"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["PNL", "Deux frères"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Damso", "Bruxelles"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Nekfeu", "Feu"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Kaaris", "Sevran"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Lomepal", "Yeux disent"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Vald", "Désaccordé"]],
  },
  {
    clues: ["Rap", "Artiste"],
    items: [["Bigflo et Oli", "Toulouse"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Fortnite", "Battle royale"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Minecraft", "Cube"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["FIFA", "Football"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Call of Duty", "Guerre"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Grand Theft Auto", "Vol de voiture"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Animal Crossing", "Île"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["The Sims", "Vie"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["League of Legends", "MOBA"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Among Us", "Imposteur"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Monopoly", "Argent"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Time's Up", "Sabliers"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Loup-garou", "Village"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Beer pong", "Gobelet"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Action ou vérité", "Question"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Limite Limite", "Humour"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Blanc-manger Coco", "Phrase"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Jungle Speed", "Totem"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Mario Party", "Mini-jeux"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Basketball", "Panier"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Rugby", "Essai"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Tennis", "Raquette"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Handball", "Main"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Volleyball", "Filet"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Golf", "Trou"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Baseball", "Batte"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Water-polo", "Piscine"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Pétanque", "Cochonnet"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Zinédine Zidane", "Numéro 10"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Antoine Dupont", "Rugby"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Teddy Riner", "Judo"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Léon Marchand", "Natation"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Tony Parker", "Basket"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Rafael Nadal", "Tennis"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Usain Bolt", "Sprint"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Michael Jordan", "Chicago"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Cristiano Ronaldo", "Portugal"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Coupe du monde", "Football"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Tour de France", "Vélo"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Roland-Garros", "Terre battue"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Super Bowl", "Football américain"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Formule 1", "Voiture"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Ligue des champions", "Europe"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Marathon", "42 kilomètres"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["Wimbledon", "Gazon"]],
  },
  {
    clues: ["Compétition", "Sport"],
    items: [["NBA", "Basket"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Partiel", "Examen"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Amphi", "Cours"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["CROUS", "Bourse"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Erasmus", "Étranger"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Alternance", "Entreprise"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Stage", "Convention"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Rattrapage", "Note"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Mémoire", "Soutenance"]],
  },
  {
    clues: ["Étudiant", "École"],
    items: [["Gala", "Promotion"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Télétravail", "Maison"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Open space", "Collègues"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Pause café", "Machine"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["PowerPoint", "Diapositive"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Burn-out", "Épuisement"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Afterwork", "Verre"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Team building", "Équipe"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Slack", "Messages"]],
  },
  {
    clues: ["Travail", "Bureau"],
    items: [["Ticket restaurant", "Déjeuner"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["CEO", "Directeur"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["RH", "Recrutement"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["CDD", "Contrat"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["Freelance", "Indépendant"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["Licenciement", "Viré"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["Augmentation", "Salaire"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["Entretien d'embauche", "Candidat"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["Démission", "Quitter"]],
  },
  {
    clues: ["Entreprise", "Travail"],
    items: [["Séminaire", "Hôtel"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Coup de foudre", "Instantané"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Friendzone", "Ami"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Relation à distance", "Kilomètres"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Jalousie", "Possessif"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Rupture", "Séparation"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Demande en mariage", "Bague"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Ex", "Ancien"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Crush", "Attirance"]],
  },
  {
    clues: ["Relation", "Amour"],
    items: [["Âme sœur", "Destin"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Swipe", "Glisser"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Ghosting", "Disparaître"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Red flag", "Danger"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Bio Tinder", "Profil"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Date", "Rendez-vous"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Célibataire", "Couple"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Plan cul", "Sexe"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Love bombing", "Messages"]],
  },
  {
    clues: ["Dating", "Rencontre"],
    items: [["Pécho", "Embrasser"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Sex-toy", "Plaisir"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Missionnaire", "Position"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Strip-tease", "Se déshabiller"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Libido", "Désir"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Sexto", "Message"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Nudiste", "Nu"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Orgasm", "Jouissance"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Menottes", "Poignets"]],
  },
  {
    clues: ["Adulte", "Intime"],
    items: [["Plan à trois", "Trois personnes"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["MDMA", "Ecstasy"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Cigarette", "Tabac"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Chicha", "Narguilé"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["CBD", "Cannabidiol"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Vape", "Électronique"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Poppers", "Flacon"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Caféine", "Énergie"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Energy drink", "Taurine"]],
  },
  {
    clues: ["Fête", "Produit"],
    items: [["Champignon hallucinogène", "Psychédélique"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Micro-ondes", "Réchauffer"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Canapé", "Salon"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Frigo", "Froid"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Lave-vaisselle", "Assiette"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Télécommande", "Télévision"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Réveil", "Matin"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Bougie", "Flamme"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Miroir", "Reflet"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Oreiller", "Dormir"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Coque", "Protection"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Écouteurs", "Musique"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Mode avion", "Réseau"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Code PIN", "Déverrouiller"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Capture d'écran", "Image"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Notification", "Alerte"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Batterie externe", "Recharge"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["AirDrop", "Apple"]],
  },
  {
    clues: ["Objet", "Téléphone"],
    items: [["Selfie", "Photo"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Influenceur", "Abonnés"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Hashtag", "Dièse"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Buzz", "Viral"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Troll", "Provoquer"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Fake news", "Faux"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Story", "24 heures"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Algorithme", "Recommandation"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Podcast", "Audio"]],
  },
  {
    clues: ["Internet", "Expression"],
    items: [["Live", "Direct"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Jean Dujardin", "The Artist"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Marion Cotillard", "Oscar"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Jamel Debbouze", "Humoriste"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Florence Foresti", "Spectacle"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Philippe Etchebest", "Cuisine"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Léna Situations", "Influenceuse"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Squeezie", "YouTube"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Inoxtag", "Everest"]],
  },
  {
    clues: ["Célébrité", "France"],
    items: [["Nabilla", "Allô"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Brad Pitt", "Acteur"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Angelina Jolie", "Tomb Raider"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Tom Cruise", "Mission impossible"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Zendaya", "Euphoria"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Kim Kardashian", "Télé-réalité"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Elon Musk", "Tesla"]],
  },
  {
    clues: ["Star", "International"],
    items: [["MrBeast", "YouTube"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Gordon Ramsay", "Cuisine"]],
  },
  {
    clues: ["Star", "International"],
    items: [["Greta Thunberg", "Climat"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Top Chef", "Cuisine"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["The Voice", "Chant"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Fort Boyard", "Clés"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Pékin Express", "Voyage"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Danse avec les stars", "Danser"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["L'amour est dans le pré", "Agriculteur"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Questions pour un champion", "Quiz"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Secret Story", "Secret"]],
  },
  {
    clues: ["Télévision", "Émission"],
    items: [["Les Marseillais", "Télé-réalité"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Cœur", "Battre"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Poumon", "Respirer"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Foie", "Alcool"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Estomac", "Digérer"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Genou", "Jambe"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Coude", "Bras"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Nombril", "Ventre"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Sourcil", "Œil"]],
  },
  {
    clues: ["Corps", "Humain"],
    items: [["Cheville", "Pied"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Migraine", "Tête"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Fièvre", "Température"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Allergie", "Éternuer"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Courbatures", "Muscle"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Hoquet", "Respiration"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Entorse", "Cheville"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Insomnie", "Dormir"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Mal de mer", "Bateau"]],
  },
  {
    clues: ["Santé", "Symptôme"],
    items: [["Nausée", "Vomir"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Avoir le seum", "Dégoûté"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Tomber dans les pommes", "Évanouir"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Coûter un bras", "Cher"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Donner sa langue au chat", "Réponse"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Mettre les pieds dans le plat", "Gaffe"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Avoir la dalle", "Faim"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Raconter des salades", "Mentir"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Être au bout du rouleau", "Fatigué"]],
  },
  {
    clues: ["Expression", "Français"],
    items: [["Prendre la grosse tête", "Prétentieux"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Fierté", "Réussite"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Nostalgie", "Passé"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Stress", "Anxiété"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Ennui", "Temps"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Euphorie", "Joie"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Déception", "Attente"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Soulagement", "Ouf"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Culpabilité", "Faute"]],
  },
  {
    clues: ["Émotion", "Ressentir"],
    items: [["Coup de blues", "Triste"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Orage", "Tonnerre"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Arc-en-ciel", "Couleurs"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Brouillard", "Visibilité"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Neige", "Blanc"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Grêle", "Glace"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Tornade", "Vent"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Foudre", "Éclair"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Averse", "Pluie"]],
  },
  {
    clues: ["Météo", "Ciel"],
    items: [["Gel", "Froid"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Girafe", "Cou"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Kangourou", "Poche"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Flamant rose", "Patte"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Paresseux", "Lent"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Dauphin", "Mer"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Requin", "Dents"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Pingouin", "Banquise"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Caméléon", "Couleur"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Licorne", "Corne"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Choucroute", "Alsace"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Blanquette", "Veau"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Paris-Brest", "Praliné"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Mille-feuille", "Feuilletage"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Profiteroles", "Choux"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Madeleine", "Coquillage"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Financier", "Amande"]],
  },
  {
    clues: ["Dessert", "Sucré"],
    items: [["Île flottante", "Crème anglaise"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Espresso martini", "Café"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Negroni", "Campari"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Mai Tai", "Rhum"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Martini", "Olive"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Americano", "Vermouth"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Blue Lagoon", "Bleu"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Tequila sunrise", "Grenadine"]],
  },
  {
    clues: ["Boisson", "Bar"],
    items: [["Long Island", "Cinq alcools"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Cognac", "Charente"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Armagnac", "Gascogne"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Calvados", "Pomme"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Saké", "Japon"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Prosecco", "Italie"]],
  },
  {
    clues: ["Alcool", "Verre"],
    items: [["Cointreau", "Orange"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Guest list", "Liste"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Dancefloor", "Danse"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Pré-soirée", "Avant"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Barathon", "Plusieurs bars"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Rave", "Techno"]],
  },
  {
    clues: ["Soirée", "Nuit"],
    items: [["Retour de soirée", "Taxi"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Citymapper", "Métro"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Too Good To Go", "Invendus"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Notion", "Notes"]],
  },
  {
    clues: ["Application", "Téléphone"],
    items: [["Google Photos", "Sauvegarde"]],
  },
  {
    clues: ["Marque", "Technologie"],
    items: [["Lenovo", "ThinkPad"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Carhartt", "Workwear"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Dickies", "Travail"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Pull&Bear", "Espagne"]],
  },
  {
    clues: ["Marque", "Vêtement"],
    items: [["Asics", "Running"]],
  },
  {
    clues: ["Ville", "France"],
    items: [["Tours", "Loire"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Bucarest", "Roumanie"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Sofia", "Bulgarie"]],
  },
  {
    clues: ["Capitale", "Europe"],
    items: [["Zagreb", "Croatie"]],
  },
  {
    clues: ["Voyage", "Ville"],
    items: [["Hanoï", "Vietnam"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Train de nuit", "Couchette"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Navette", "Aéroport"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Funiculaire", "Pente"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Monorail", "Un rail"]],
  },
  {
    clues: ["Transport", "Voyage"],
    items: [["Hydravion", "Eau"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Check-in", "Enregistrement"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Boarding pass", "Embarquement"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Resort", "Complexe"]],
  },
  {
    clues: ["Vacances", "Voyage"],
    items: [["Location de voiture", "Agence"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Surf", "Vague"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Snorkeling", "Masque"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Marée", "Océan"]],
  },
  {
    clues: ["Plage", "Été"],
    items: [["Glace à l'italienne", "Cornet"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Gladiator", "Rome"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Interstellar", "Espace"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Pulp Fiction", "Tarantino"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Fight Club", "Savon"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Les Visiteurs", "Moyen Âge"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Le Dîner de cons", "Mercredi"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Hannibal Lecter", "Cannibale"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Gollum", "Précieux"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Terminator", "Robot"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Rambo", "Soldat"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Joker", "Clown"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Mary Poppins", "Parapluie"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Doc Brown", "DeLorean"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Le Parrain", "Mafia"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Son Goku", "Saiyan"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Sailor Moon", "Lune"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Dora l'exploratrice", "Sac à dos"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Olaf", "Bonhomme de neige"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Wall-E", "Robot"]],
  },
  {
    clues: ["Animation", "Personnage"],
    items: [["Gru", "Minions"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Post Malone", "Tatouages"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Harry Styles", "One Direction"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Kendji Girac", "Gitan"]],
  },
  {
    clues: ["Chanteur", "Musique"],
    items: [["Calogero", "Basse"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Miley Cyrus", "Flowers"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Sia", "Perruque"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Shakira", "Colombie"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Lana Del Rey", "Summertime Sadness"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Olivia Rodrigo", "Drivers License"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Doja Cat", "Say So"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Rosalía", "Espagne"]],
  },
  {
    clues: ["Chanteuse", "Musique"],
    items: [["Clara Luciani", "Grenade"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["The Legend of Zelda", "Link"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["The Witcher", "Geralt"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["God of War", "Kratos"]],
  },
  {
    clues: ["Jeu vidéo", "Console"],
    items: [["Counter-Strike", "Terroriste"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["6 qui prend !", "Bœufs"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Skyjo", "Cartes"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Mölkky", "Quilles"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Blind test", "Musique"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Je n'ai jamais", "Confession"]],
  },
  {
    clues: ["Jeu", "Soirée"],
    items: [["Qui est-ce ?", "Visage"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Padel", "Vitres"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Futsal", "Salle"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Beach soccer", "Sable"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Football américain", "Touchdown"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Cricket", "Wicket"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Balle au prisonnier", "Éliminer"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Ultimate", "Frisbee"]],
  },
  {
    clues: ["Sport", "Ballon"],
    items: [["Polo", "Cheval"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Max Verstappen", "Red Bull"]],
  },
  {
    clues: ["Sportif", "Champion"],
    items: [["Stephen Curry", "Trois points"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Ventilateur", "Air"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Plaque à induction", "Cuisson"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Paillasson", "Entrée"]],
  },
  {
    clues: ["Objet", "Maison"],
    items: [["Porte-manteau", "Vestes"]],
  },
  {
    clues: ["Fruit", "Aliment"],
    items: [["Banane", "Peau"]],
  },
  {
    clues: ["Fruit", "Aliment"],
    items: [["Pomme", "Pépin"]],
  },
  {
    clues: ["Fruit", "Aliment"],
    items: [["Poire", "Forme"]],
  },
  {
    clues: ["Fruit", "Aliment"],
    items: [["Melon", "Cavaillon"]],
  },
  {
    clues: ["Fruit", "Aliment"],
    items: [["Cerise", "Noyau"]],
  },
  {
    clues: ["Légume", "Cuisine"],
    items: [["Carotte", "Orange"]],
  },
  {
    clues: ["Légume", "Cuisine"],
    items: [["Chou-fleur", "Blanc"]],
  },
  {
    clues: ["Légume", "Cuisine"],
    items: [["Poivron", "Rouge"]],
  },
  {
    clues: ["Légume", "Cuisine"],
    items: [["Épinard", "Popeye"]],
  },
  {
    clues: ["Légume", "Cuisine"],
    items: [["Asperge", "Printemps"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Camembert", "Normandie"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Comté", "Jura"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Roquefort", "Bleu"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Brie", "Croûte"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Reblochon", "Tartiflette"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Morbier", "Trait noir"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Chèvre", "Bûche"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Mozzarella", "Italie"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Parmesan", "Râpé"]],
  },
  {
    clues: ["Fromage", "Lait"],
    items: [["Emmental", "Trous"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Pain au chocolat", "Chocolat"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Céréales", "Bol"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Tartine", "Confiture"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Granola", "Avoine"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Porridge", "Flocons"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Œuf à la coque", "Mouillette"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Café au lait", "Tasse"]],
  },
  {
    clues: ["Petit-déjeuner", "Matin"],
    items: [["Brioche", "Moelleuse"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Poêle", "Frire"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Casserole", "Manche"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Passoire", "Égoutter"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Fouet", "Battre"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Spatule", "Retourner"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Louche", "Soupe"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Économe", "Éplucher"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Râpe", "Fromage"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Planche à découper", "Couteau"]],
  },
  {
    clues: ["Cuisine", "Ustensile"],
    items: [["Saladier", "Mélanger"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Menu", "Carte"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Addition", "Payer"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Réservation", "Table"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Entrée", "Premier plat"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Plat du jour", "Ardoise"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Terrasse", "Dehors"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Chef", "Cuisine"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Sommelier", "Vin"]],
  },
  {
    clues: ["Restaurant", "Service"],
    items: [["Maître d'hôtel", "Accueil"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Cardamome", "Gousse"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Paprika", "Hongrie"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Cumin", "Orient"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Cannelle", "Bâton"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Safran", "Cher"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Curcuma", "Jaune"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Piment", "Fort"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Muscade", "Râper"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Vanille", "Gousse"]],
  },
  {
    clues: ["Épice", "Cuisine"],
    items: [["Gingembre", "Racine"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Chat", "Miaou"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Chien", "Aboyer"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Hamster", "Roue"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Cochon d'Inde", "Cage"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Poisson rouge", "Bocal"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Canari", "Jaune"]],
  },
  {
    clues: ["Animal domestique", "Compagnie"],
    items: [["Furet", "Long"]],
  },
  {
    clues: ["Animal sauvage", "Jungle"],
    items: [["Gorille", "Primate"]],
  },
  {
    clues: ["Animal sauvage", "Jungle"],
    items: [["Guépard", "Rapide"]],
  },
  {
    clues: ["Animal sauvage", "Jungle"],
    items: [["Hyène", "Rire"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Orque", "Noir et blanc"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Pieuvre", "Huit bras"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Hippocampe", "Cheval"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Étoile de mer", "Cinq branches"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Crabe", "Pinces"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Homard", "Rouge"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Raie manta", "Ailes"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Phoque", "Banquise"]],
  },
  {
    clues: ["Animal marin", "Océan"],
    items: [["Espadon", "Épée"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Fourmi", "Colonie"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Papillon", "Chenille"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Moustique", "Piqûre"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Coccinelle", "Points"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Guêpe", "Dard"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Mouche", "Bzzz"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Libellule", "Étang"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Sauterelle", "Bondir"]],
  },
  {
    clues: ["Insecte", "Nature"],
    items: [["Scarabée", "Carapace"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Pigeon", "Ville"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Mouette", "Mer"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Paon", "Plumes"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Autruche", "Courir"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Cygne", "Blanc"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Corbeau", "Noir"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Pélican", "Bec"]],
  },
  {
    clues: ["Oiseau", "Voler"],
    items: [["Colibri", "Petit"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Chêne", "Gland"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Sapin", "Noël"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Bouleau", "Écorce blanche"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Palmier", "Tropical"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Olivier", "Olive"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Cerisier", "Japon"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Baobab", "Afrique"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Saule pleureur", "Branches"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Érable", "Canada"]],
  },
  {
    clues: ["Arbre", "Nature"],
    items: [["Séquoia", "Géant"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Rose rouge", "Épine"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Tulipe", "Pays-Bas"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Tournesol", "Soleil"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Marguerite", "Pétales"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Orchidée", "Exotique"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Lavande", "Provence"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Coquelicot", "Rouge"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Lys", "Blanc"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Pivoine", "Bouquet"]],
  },
  {
    clues: ["Fleur", "Jardin"],
    items: [["Jasmin", "Parfum"]],
  },
  {
    clues: ["Montagne", "Nature"],
    items: [["Everest", "Himalaya"]],
  },
  {
    clues: ["Montagne", "Nature"],
    items: [["Mont Blanc", "Alpes"]],
  },
  {
    clues: ["Montagne", "Nature"],
    items: [["Kilimandjaro", "Tanzanie"]],
  },
  {
    clues: ["Montagne", "Nature"],
    items: [["Etna", "Sicile"]],
  },
  {
    clues: ["Montagne", "Nature"],
    items: [["Vésuve", "Pompéi"]],
  },
  {
    clues: ["Montagne", "Nature"],
    items: [["Fuji", "Japon"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Portugal", "Lisbonne"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Italie", "Rome"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Espagne", "Madrid"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Allemagne", "Berlin"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Suisse", "Neutre"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Grèce", "Athènes"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Croatie", "Adriatique"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Islande", "Volcan"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Irlande", "Vert"]],
  },
  {
    clues: ["Pays", "Europe"],
    items: [["Norvège", "Fjords"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Canada", "Érable"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Brésil", "Samba"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Argentine", "Tango"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Mexique", "Sombrero"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Égypte", "Pyramides"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Inde", "Taj Mahal"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Chine", "Grande Muraille"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Japon", "Sushi"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Australie", "Kangourou"]],
  },
  {
    clues: ["Pays", "Monde"],
    items: [["Kenya", "Safari"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Tour de Pise", "Penche"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Colisée", "Rome"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Taj Mahal", "Inde"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Sagrada Família", "Barcelone"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Machu Picchu", "Pérou"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Pyramides de Gizeh", "Égypte"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Stonehenge", "Pierres"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Mont-Saint-Michel", "Normandie"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Arc de Triomphe", "Paris"]],
  },
  {
    clues: ["Monument", "Tourisme"],
    items: [["Big Ben", "Londres"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Corse", "France"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Sicile", "Italie"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Madère", "Portugal"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Majorque", "Baléares"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Ibiza", "Fête"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Santorin", "Grèce"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Maldives", "Atolls"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Île de la Réunion", "Volcan"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Martinique", "Antilles"]],
  },
  {
    clues: ["Île", "Voyage"],
    items: [["Tahiti", "Polynésie"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Réception", "Accueil"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Minibar", "Boissons"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Room service", "Plateau"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Suite", "Luxe"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Check-out", "Départ"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Concierge", "Service"]],
  },
  {
    clues: ["Hôtel", "Séjour"],
    items: [["Peignoir", "Salle de bain"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Terminal", "Hall"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Porte d'embarquement", "Gate"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Duty free", "Boutique"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Turbulence", "Secousses"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Piste d'atterrissage", "Décollage"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Cockpit", "Pilote"]],
  },
  {
    clues: ["Aéroport", "Avion"],
    items: [["Hôtesse de l'air", "Cabine"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Volant", "Tourner"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Clignotant", "Direction"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Ceinture de sécurité", "Boucler"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Coffre", "Bagages"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Pare-brise", "Vitre"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Essuie-glace", "Pluie"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Frein à main", "Stationner"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Rétroviseur", "Derrière"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Klaxon", "Bip"]],
  },
  {
    clues: ["Voiture", "Route"],
    items: [["Plaque d'immatriculation", "Numéro"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Casque intégral", "Visière"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Harley-Davidson", "Américaine"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Moto-cross", "Terre"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Side-car", "Panier"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Béquille", "Stationner"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Accélérateur", "Poignée"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Pot d'échappement", "Bruit"]],
  },
  {
    clues: ["Moto", "Deux roues"],
    items: [["Motard", "Cuir"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Guidon", "Diriger"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Selle", "S'asseoir"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Dérailleur", "Vitesses"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Chaîne", "Pédalier"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["VTT", "Chemin"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Vélib'", "Paris"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Piste cyclable", "Voie"]],
  },
  {
    clues: ["Vélo", "Cyclisme"],
    items: [["Antivol", "Attacher"]],
  },
  {
    clues: ["Train", "Gare"],
    items: [["Quai", "Voie"]],
  },
  {
    clues: ["Train", "Gare"],
    items: [["Contrôleur", "Billet"]],
  },
  {
    clues: ["Train", "Gare"],
    items: [["Wagon", "Voiture"]],
  },
  {
    clues: ["Train", "Gare"],
    items: [["Locomotive", "Moteur"]],
  },
  {
    clues: ["Train", "Gare"],
    items: [["TER", "Région"]],
  },
  {
    clues: ["Train", "Gare"],
    items: [["Ouigo", "Low cost"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Avocat", "Tribunal"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Pharmacien", "Médicament"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Cardiologue", "Cœur"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Dermatologue", "Peau"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Pédiatre", "Enfant"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Radiologue", "Scanner"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Kinésithérapeute", "Rééducation"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Sage-femme", "Naissance"]],
  },
  {
    clues: ["Médecine", "Profession"],
    items: [["Psychologue", "Thérapie"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Stylo", "Écrire"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Crayon", "Mine"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Gomme", "Effacer"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Règle", "Mesurer"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Compas", "Cercle"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Surligneur", "Fluo"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Cahier", "Pages"]],
  },
  {
    clues: ["École", "Fourniture"],
    items: [["Classeur", "Anneaux"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Mathématiques", "Calcul"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Histoire", "Passé"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Géographie", "Carte"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Français", "Grammaire"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Anglais", "Langue"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Physique", "Forces"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Chimie", "Molécule"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Biologie", "Cellule"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["Philosophie", "Réflexion"]],
  },
  {
    clues: ["École", "Matière"],
    items: [["EPS", "Sport"]],
  },
  {
    clues: ["Science", "Concept"],
    items: [["Molécule", "Atomes"]],
  },
  {
    clues: ["Science", "Concept"],
    items: [["Électricité", "Courant"]],
  },
  {
    clues: ["Science", "Concept"],
    items: [["Magnétisme", "Aimant"]],
  },
  {
    clues: ["Science", "Concept"],
    items: [["Évolution", "Darwin"]],
  },
  {
    clues: ["Espace", "Astronomie"],
    items: [["Jupiter", "Géante"]],
  },
  {
    clues: ["Espace", "Astronomie"],
    items: [["Saturne", "Anneaux"]],
  },
  {
    clues: ["Espace", "Astronomie"],
    items: [["Pluton", "Naine"]],
  },
  {
    clues: ["Espace", "Astronomie"],
    items: [["Voie lactée", "Galaxie"]],
  },
  {
    clues: ["Espace", "Astronomie"],
    items: [["Astéroïde", "Rocher"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Napoléon", "Empereur"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Louis XIV", "Roi Soleil"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Jeanne d'Arc", "Orléans"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Jules César", "Rome"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Cléopâtre", "Égypte"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Christophe Colomb", "Amérique"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Marie-Antoinette", "Reine"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Charlemagne", "Empereur"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Gandhi", "Inde"]],
  },
  {
    clues: ["Histoire", "Personnage"],
    items: [["Martin Luther King", "I Have a Dream"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Révolution française", "1789"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Chute du mur de Berlin", "1989"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Débarquement de Normandie", "1944"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Mai 68", "Étudiants"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Première Guerre mondiale", "Tranchées"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Seconde Guerre mondiale", "Hitler"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Renaissance", "Italie"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Révolution industrielle", "Usines"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Découverte de l'Amérique", "1492"]],
  },
  {
    clues: ["Histoire", "Événement"],
    items: [["Conquête spatiale", "Lune"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Zeus", "Foudre"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Poséidon", "Mer"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Hadès", "Enfers"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Athéna", "Sagesse"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Aphrodite", "Amour"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Hercule", "Force"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Achille", "Talon"]],
  },
  {
    clues: ["Mythologie", "Personnage"],
    items: [["Loki", "Malice"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Croix", "Christianisme"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Église", "Messe"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Mosquée", "Islam"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Synagogue", "Judaïsme"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Bouddha", "Bouddhisme"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Coran", "Livre"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Bible", "Ancien Testament"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Pape", "Vatican"]],
  },
  {
    clues: ["Religion", "Symbole"],
    items: [["Ramadan", "Jeûne"]],
  },
  {
    clues: ["Musique", "Instrument"],
    items: [["Batterie", "Baguettes"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Rock", "Guitare"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Techno", "Électronique"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["House", "Club"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Jazz", "Improvisation"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Reggae", "Jamaïque"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Classique", "Orchestre"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Metal", "Saturé"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Disco", "Années 70"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Funk", "Groove"]],
  },
  {
    clues: ["Musique", "Genre"],
    items: [["Country", "Cow-boy"]],
  },
  {
    clues: ["Concert", "Musique"],
    items: [["Rappel", "Encore"]],
  },
  {
    clues: ["Concert", "Musique"],
    items: [["Première partie", "Avant"]],
  },
  {
    clues: ["Concert", "Musique"],
    items: [["Scène", "Artiste"]],
  },
  {
    clues: ["Concert", "Musique"],
    items: [["Enceintes", "Volume"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Bande-annonce", "Trailer"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Scénario", "Histoire"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Réalisateur", "Caméra"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Acteur", "Rôle"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Cascade", "Danger"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Effets spéciaux", "CGI"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Doublage", "Voix"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Sous-titres", "Texte"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Générique", "Noms"]],
  },
  {
    clues: ["Cinéma", "Technique"],
    items: [["Oscar", "Récompense"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Comédie romantique", "Amour"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Film d'horreur", "Peur"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Science-fiction", "Futur"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Western", "Cow-boy"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Thriller", "Suspense"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Comédie musicale", "Chanter"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Documentaire", "Réel"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Film d'action", "Explosion"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Drame", "Triste"]],
  },
  {
    clues: ["Film", "Genre"],
    items: [["Film de guerre", "Soldats"]],
  },
  {
    clues: ["Télévision", "Animateur"],
    items: [["Arthur", "Vendredi tout est permis"]],
  },
  {
    clues: ["Télévision", "Animateur"],
    items: [["Denis Brogniart", "Koh-Lanta"]],
  },
  {
    clues: ["Internet", "Créateur"],
    items: [["McFly et Carlito", "Duo"]],
  },
  {
    clues: ["Internet", "Créateur"],
    items: [["Amixem", "YouTube"]],
  },
  {
    clues: ["Internet", "Créateur"],
    items: [["HugoDécrypte", "Actualité"]],
  },
  {
    clues: ["Internet", "Vocabulaire"],
    items: [["Follower", "Abonné"]],
  },
  {
    clues: ["Internet", "Vocabulaire"],
    items: [["Repost", "Partager"]],
  },
  {
    clues: ["Internet", "Vocabulaire"],
    items: [["Thread", "Fil"]],
  },
  {
    clues: ["Internet", "Vocabulaire"],
    items: [["Spoiler", "Révélation"]],
  },
  {
    clues: ["Internet", "Vocabulaire"],
    items: [["Pseudo", "Nom"]],
  },
  {
    clues: ["Ordinateur", "Informatique"],
    items: [["Écran", "Pixels"]],
  },
  {
    clues: ["Ordinateur", "Informatique"],
    items: [["Disque dur", "Stockage"]],
  },
  {
    clues: ["Ordinateur", "Informatique"],
    items: [["Processeur", "CPU"]],
  },
  {
    clues: ["Ordinateur", "Informatique"],
    items: [["Carte graphique", "GPU"]],
  },
  {
    clues: ["Ordinateur", "Informatique"],
    items: [["Wi-Fi", "Sans fil"]],
  },
  {
    clues: ["Ordinateur", "Informatique"],
    items: [["Corbeille", "Supprimer"]],
  },
  {
    clues: ["Jeu vidéo", "Accessoire"],
    items: [["Manette", "Joystick"]],
  },
  {
    clues: ["Jeu vidéo", "Accessoire"],
    items: [["Casque gaming", "Micro"]],
  },
  {
    clues: ["Jeu vidéo", "Accessoire"],
    items: [["Webcam", "Stream"]],
  },
  {
    clues: ["Jeu vidéo", "Accessoire"],
    items: [["Chaise gaming", "Siège"]],
  },
  {
    clues: ["Jeu vidéo", "Accessoire"],
    items: [["VR", "Casque"]],
  },
  {
    clues: ["Jeu vidéo", "Personnage"],
    items: [["Luigi", "Vert"]],
  },
  {
    clues: ["Jeu vidéo", "Personnage"],
    items: [["Link", "Zelda"]],
  },
  {
    clues: ["Jeu vidéo", "Personnage"],
    items: [["Lara Croft", "Tomb Raider"]],
  },
  {
    clues: ["Sport", "Raquette"],
    items: [["Squash", "Mur"]],
  },
  {
    clues: ["Sport", "Raquette"],
    items: [["Tennis de table", "Ping-pong"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Bodyboard", "Planche"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Plongée", "Bouteille"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Voile", "Bateau"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Kayak", "Pagaie"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Kitesurf", "Aile"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Wakeboard", "Bateau"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Canoë", "Rivière"]],
  },
  {
    clues: ["Sport", "Eau"],
    items: [["Ski nautique", "Traction"]],
  },
  {
    clues: ["Sport", "Montagne"],
    items: [["Randonnée", "Marche"]],
  },
  {
    clues: ["Sport", "Montagne"],
    items: [["Alpinisme", "Sommet"]],
  },
  {
    clues: ["Sport", "Montagne"],
    items: [["Trail", "Course"]],
  },
  {
    clues: ["Sport", "Montagne"],
    items: [["Parapente", "Voile"]],
  },
  {
    clues: ["Vêtement", "Mode"],
    items: [["Sweat", "Capuche"]],
  },
  {
    clues: ["Vêtement", "Mode"],
    items: [["Manteau", "Hiver"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Sneakers", "Baskets"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Escarpins", "Talons"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Mocassins", "Cuir"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Bottes", "Hiver"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Sandales", "Été"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Espadrilles", "Corde"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Crocs", "Sabots"]],
  },
  {
    clues: ["Chaussure", "Mode"],
    items: [["Bottines", "Cheville"]],
  },
  {
    clues: ["Accessoire", "Mode"],
    items: [["Sac à main", "Anse"]],
  },
  {
    clues: ["Accessoire", "Mode"],
    items: [["Montre", "Heure"]],
  },
  {
    clues: ["Accessoire", "Mode"],
    items: [["Bracelet", "Poignet"]],
  },
  {
    clues: ["Accessoire", "Mode"],
    items: [["Collier", "Cou"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Mascara", "Cils"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Rouge à lèvres", "Bouche"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Fond de teint", "Teint"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Eyeliner", "Yeux"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Parfum", "Odeur"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Crème hydratante", "Peau"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Vernis à ongles", "Couleur"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Déodorant", "Aisselles"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Shampoing", "Cheveux"]],
  },
  {
    clues: ["Beauté", "Produit"],
    items: [["Dentifrice", "Dents"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Frange", "Front"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Queue-de-cheval", "Élastique"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Chignon", "Attaché"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Tresse", "Entrelacer"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Dégradé", "Longueurs"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Boucles", "Frisé"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Mèches", "Couleur"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Dreadlocks", "Rasta"]],
  },
  {
    clues: ["Coiffure", "Cheveux"],
    items: [["Mulet", "Court devant"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Cuisine", "Cuisiner"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Salon", "Canapé"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Chambre", "Lit"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Salle de bain", "Douche"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Toilettes", "WC"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Balcon", "Extérieur"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Cave", "Sous-sol"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Grenier", "Toit"]],
  },
  {
    clues: ["Maison", "Pièce"],
    items: [["Garage", "Voiture"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Table", "Manger"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Chaise", "S'asseoir"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Armoire", "Vêtements"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Commode", "Tiroirs"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Bibliothèque", "Livres"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Bureau", "Travailler"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Table basse", "Salon"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Lit", "Dormir"]],
  },
  {
    clues: ["Maison", "Meuble"],
    items: [["Tabouret", "Sans dossier"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Marteau", "Clou"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Tournevis", "Vis"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Perceuse", "Trou"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Scie", "Couper"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Pince", "Serrer"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Clé anglaise", "Écrou"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Cutter", "Lame"]],
  },
  {
    clues: ["Bricolage", "Outil"],
    items: [["Escabeau", "Hauteur"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Tondeuse", "Gazon"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Arrosoir", "Eau"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Tuyau d'arrosage", "Arroser"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Brouette", "Roue"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Pelle", "Creuser"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Râteau", "Feuilles"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Sécateur", "Tailler"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Pot de fleurs", "Plante"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Barbecue", "Grill"]],
  },
  {
    clues: ["Jardin", "Extérieur"],
    items: [["Hamac", "Se reposer"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Serpillière", "Laver"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Javel", "Désinfecter"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Lessive", "Linge"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Adoucissant", "Parfum"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Pelle et balayette", "Poussière"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Plumeau", "Meuble"]],
  },
  {
    clues: ["Nettoyage", "Maison"],
    items: [["Détachant", "Tache"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["Prélèvement", "Automatique"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["Découvert", "Négatif"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["Épargne", "Économiser"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["Crédit", "Emprunt"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["IBAN", "Compte"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["Code secret", "Quatre chiffres"]],
  },
  {
    clues: ["Banque", "Argent"],
    items: [["Distributeur", "Retrait"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Salaire", "Paie"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Impôt", "État"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Budget", "Dépenses"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Dette", "Devoir"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Inflation", "Prix"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Investissement", "Placer"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Bourse", "Actions"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Dividende", "Entreprise"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Intérêt", "Pourcentage"]],
  },
  {
    clues: ["Argent", "Finance"],
    items: [["Économie", "PIB"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Cabine d'essayage", "Vêtement"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Caisse", "Payer"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Ticket de caisse", "Preuve"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Promotion", "Réduction"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Soldes", "Prix"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Panier", "Courses"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Rayon", "Produits"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Vendeur", "Conseil"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Rupture de stock", "Indisponible"]],
  },
  {
    clues: ["Shopping", "Magasin"],
    items: [["Échange", "Retour"]],
  },
  {
    clues: ["Livraison", "Colis"],
    items: [["Point relais", "Retrait"]],
  },
  {
    clues: ["Livraison", "Colis"],
    items: [["Livreur", "Porte"]],
  },
  {
    clues: ["Livraison", "Colis"],
    items: [["Boîte aux lettres", "Courrier"]],
  },
  {
    clues: ["Livraison", "Colis"],
    items: [["Signature", "Réception"]],
  },
  {
    clues: ["Livraison", "Colis"],
    items: [["Emballage", "Carton"]],
  },
  {
    clues: ["Livraison", "Colis"],
    items: [["Étiquette", "Adresse"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Appel vidéo", "Caméra"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Messagerie vocale", "Répondeur"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Lampe torche", "Flash"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["GPS", "Position"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Vibreur", "Silencieux"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Face ID", "Visage"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Mode sombre", "Noir"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Partage de connexion", "Hotspot"]],
  },
  {
    clues: ["Téléphone", "Fonction"],
    items: [["Localisation", "Position"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Portrait", "Visage"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Paysage", "Horizon"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Flash", "Lumière"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Filtre", "Effet"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Retouche", "Modifier"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Objectif", "Lentille"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Trépied", "Stable"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Polaroid", "Instantané"]],
  },
  {
    clues: ["Photo", "Image"],
    items: [["Panorama", "Large"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Roman", "Histoire"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Bande dessinée", "Bulles"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Manga", "Japon"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Dictionnaire", "Définition"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Biographie", "Vie"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Polar", "Enquête"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Fantasy", "Magie"]],
  },
  {
    clues: ["Livre", "Lecture"],
    items: [["Livre audio", "Écouter"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Peinture", "Pinceau"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Sculpture", "Statue"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Dessin", "Crayon"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Photographie", "Appareil"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Graffiti", "Mur"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Origami", "Papier"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Céramique", "Argile"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Mosaïque", "Petits carreaux"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Calligraphie", "Écriture"]],
  },
  {
    clues: ["Art", "Création"],
    items: [["Collage", "Découper"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Louvre", "Joconde"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Orsay", "Impressionnisme"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Centre Pompidou", "Moderne"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Musée Grévin", "Cire"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Prado", "Madrid"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["MoMA", "New York"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["British Museum", "Londres"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Vatican", "Rome"]],
  },
  {
    clues: ["Musée", "Culture"],
    items: [["Guggenheim", "Bilbao"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Espagnol", "Hola"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Coréen", "Séoul"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Italien", "Ciao"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Allemand", "Guten Tag"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Portugais", "Obrigado"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Arabe", "Salam"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Japonais", "Konnichiwa"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Chinois", "Mandarin"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Russe", "Cyrillique"]],
  },
  {
    clues: ["Langue", "Parler"],
    items: [["Néerlandais", "Pays-Bas"]],
  },
  {
    clues: ["Émotion", "Visage"],
    items: [["Rire", "Sourire"]],
  },
  {
    clues: ["Émotion", "Visage"],
    items: [["Amusement", "Drôle"]],
  },
  {
    clues: ["Émotion", "Visage"],
    items: [["Timidité", "Rougir"]],
  },
  {
    clues: ["Émotion", "Visage"],
    items: [["Confusion", "Comprendre"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Mentir", "Faux"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Flirter", "Séduire"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Bouder", "Silence"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Se vanter", "Fierté"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Procrastiner", "Reporter"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Râler", "Se plaindre"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Espionner", "Observer"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Imiter", "Copier"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Négocier", "Marchander"]],
  },
  {
    clues: ["Comportement", "Social"],
    items: [["Pardonner", "Excuser"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Juge", "Tribunal"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Procès", "Audience"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Prison", "Cellule"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Amende", "Payer"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Témoin", "Voir"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Preuve", "Démontrer"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Accusé", "Suspect"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Jury", "Décider"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Plainte", "Police"]],
  },
  {
    clues: ["Justice", "Loi"],
    items: [["Verdict", "Décision"]],
  },
  {
    clues: ["Météo", "Phénomène"],
    items: [["Humidité", "Moite"]],
  },
  {
    clues: ["Météo", "Phénomène"],
    items: [["Cyclone", "Tropical"]],
  },
  {
    clues: ["Météo", "Phénomène"],
    items: [["Mousson", "Asie"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Printemps", "Fleurs"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Été", "Chaud"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Automne", "Feuilles"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Hiver", "Froid"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Vacances d'été", "Juillet"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Rentrée", "Septembre"]],
  },
  {
    clues: ["Saison", "Année"],
    items: [["Changement d'heure", "Horloge"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Very Bad Trip", "Las Vegas"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Maman, j'ai raté l'avion", "Kevin"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Le Loup de Wall Street", "DiCaprio"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Le Père Noël est une ordure", "Thérèse"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Ratatouille", "Rat"]],
  },
  {
    clues: ["Film", "Cinéma"],
    items: [["Les Tuche", "Jeff"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Deadpool", "Rouge"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Cruella", "Dalmatien"]],
  },
  {
    clues: ["Personnage", "Film"],
    items: [["Mufasa", "Simba"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Cordon bleu", "Escalope"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Hot-dog", "Saucisse"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Nuggets", "Poulet"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Omelette", "Œufs"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Purée", "Pommes de terre"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Spaghetti bolognaise", "Sauce tomate"]],
  },
  {
    clues: ["Plat", "Manger"],
    items: [["Poulet rôti", "Four"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Parapluie", "Pluie"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Cintre", "Vêtement"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Sac poubelle", "Déchets"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Ciseaux", "Couper"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Briquet", "Flamme"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Calendrier", "Date"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Porte-clés", "Clés"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Bouillotte", "Chaud"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Tire-bouchon", "Vin"]],
  },
  {
    clues: ["Objet", "Quotidien"],
    items: [["Panier à linge", "Sale"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Professeur", "Élèves"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Médecin", "Patient"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Serveur", "Restaurant"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Photographe", "Appareil"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Cuisinier", "Cuisine"]],
  },
  {
    clues: ["Métier", "Travail"],
    items: [["Agent immobilier", "Appartement"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Photomaton", "Photos"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Boule à facettes", "Disco"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Déguisement", "Costume"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Paillettes", "Briller"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Gobelet rouge", "Plastique"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Cotillons", "Nouvel An"]],
  },
  {
    clues: ["Soirée", "Fête"],
    items: [["Anniversaire", "Bougies"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Barbe", "Raser"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Moustache", "Lèvre"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Tatouage", "Encre"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Piercing", "Trou"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Perruque", "Faux cheveux"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Cicatrice", "Blessure"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Grain de beauté", "Peau"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Taches de rousseur", "Visage"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Bouc", "Menton"]],
  },
  {
    clues: ["Apparence", "Style"],
    items: [["Boucle d'oreille", "Oreille"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Loutre", "Rivière"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Lama", "Cracher"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Sanglier", "Forêt"]],
  },
  {
    clues: ["Animal", "Nature"],
    items: [["Chameau", "Bosse"]],
  },
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

const allCards: readonly Card[] = groups.flatMap((group) =>
  group.items.map(([word, specific]) => ({
    id: slugify(word),
    word,
    forbidden: [specific, ...group.clues] as [string, string, string],
  })),
);

// Keep the first card when editorial additions contain the same target word
// with different accents, punctuation, or casing (all of which share an ID).
const seenCardIds = new Set<string>();
export const cards: readonly Card[] = allCards.filter((card) => {
  if (seenCardIds.has(card.id)) return false;
  seenCardIds.add(card.id);
  return true;
});
