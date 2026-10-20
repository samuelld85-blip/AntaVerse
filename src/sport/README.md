# Sport — carnet V1

Route `/sport/`, entrée dans l’en-tête du lanceur. Module indépendant des jeux,
avec sauvegarde locale et comptes cloud facultatifs, sans analytics.

- `sport-frame.tsx` et `sport.module.css` : fondations visuelles isolées sur les
  routes Sport, partagées avec les écrans de compte. Palette encre/cuivre et
  ivoire/terre cuite, accueil éditorial, navigation basse, anneau du chronomètre,
  journal et profil. Les transitions et les animations des graphiques respectent
  la réduction des mouvements. Les mécaniques et le schéma du carnet sont inchangés.
  `e2e/sport-design.spec.ts` contrôle les thèmes aux largeurs 320/360/375/390/430 px,
  le petit écran de 568 px de haut et l’accès aux actions au-dessus de la navigation.
  `e2e/sport-device.spec.ts` utilise les profils Playwright Pixel 10 Pro et iPhone
  17 Pro/Pro Max : tactile, reprise du repos, saisie numérique, portrait/paysage
  et gabarits plein écran PWA. Les hauteurs réduites et les insets CDP sont des
  stress tests ; ils ne remplacent pas un essai du clavier et des découpes sur
  les appareils physiques. Les spécifications matérielles de référence sont
  celles de [Google](https://store.google.com/product/pixel_10_pro_specs) et
  d’[Apple](https://www.apple.com/iphone-17-pro/specs/) ; les tailles CSS utilisées
  sont celles des profils du Playwright installé, pas les résolutions du panneau.

- `catalog.ts` : source manuelle des 40 exercices, IDs stables, muscles principaux
  et secondaires, zones, matériel et mouvement. Full body, Half body et Push Pull
  Legs sont les trois formats parents. Une séance libre choisit ensuite Upper body /
  Lower body ou Push / Pull / Leg ; ce type réel préfiltre le catalogue, avec une
  option Tout pour ajouter un exercice hors split. Les abdominaux restent accessibles
  dans chaque séance. Les zones expriment un accent principal, pas une isolation.
- `model.ts` : schéma versionné, configurations, séries datées avec matériel,
  charge en kg et répétitions facultatives. Une charge d’haltère désigne **un seul
  haltère**, une barre inclut la barre, le poids du corps utilise le lest ajouté.
  Un superset reste une entrée d’exercice unique, avec deux configurations et un
  tour validé pour chaque mouvement ; le mode pyramidal reste indépendant et conserve
  les variations de charge et de répétitions série par série. Les séries restent
  identifiables par exercice pour les statistiques. Ces unités et IDs permettent de
  futures statistiques sans en afficher en V1. Le catalogue comprend notamment
  l’exercice « Abducteurs en extension » pour l’ouverture vers l’extérieur à la
  machine ou à la poulie.
- `sport-app.tsx` : page d’accueil du carnet et sections séance, catalogue, réglages,
  historique et favoris. `/sport/` reste l’accueil Sport ; les sections utilisent le
  paramètre `section` de l’URL pour conserver un retour navigateur vers cet accueil.
  Les séances
  libres peuvent chaîner deux exercices en superset avec un seul repos par tour, ou
  activer le mode pyramidal pour modifier la charge et les répétitions de chaque série. Un favori
  d’exercice distingue chaque configuration. Un ressenti « Moyen » sur un exercice
  conserve ses réglages de reprise, mais retire une répétition à l’objectif suivant
  (sans jamais descendre sous une répétition). Lors d’un passage Barre → Haltères,
  la charge est automatiquement divisée entre les deux haltères et arrondie au palier
  de 2,5 kg le plus proche. Un ressenti « Content » ajoute une répétition jusqu’à
  10, puis revient à 6 avec +5 kg pour un mouvement polyarticulaire ou +2,5 kg pour
  une isolation ; « Pas content » fait l’inverse à partir de 6 répétitions. Une séance
  favorite copie les réglages
  dans une nouvelle séance, sans réutiliser les séries, dates ou IDs historiques.
  La grille utilise trois colonnes sur téléphone, quatre à partir de 480 px.
  Les thèmes clair et sombre suivent le réglage de session AntaVerse, avec un
  bouton dans l’en-tête Sport. La palette du module associe bleu nuit, cuivre et
  champagne en sombre ; ivoire, bleu ardoise et terre cuite en clair. Les tokens
  de `sport.module.css` portent les surfaces, dégradés, contrastes et états.
- `progression.ts`, `progression-badge.tsx` et `stats-dashboard.tsx` : progression personnelle
  Sport avec XP linéaire par séance, statuts globaux, niveaux par exercice, badges et statistiques
  de charge, volume et muscles. Le tonnage est calculé à partir des séries validées
  (charge × répétitions), et apparaît dans le récapitulatif, l’historique et le profil.
  Le profil ami reprend ces mêmes informations depuis Social.
- `history-editor.tsx` : correction du titre, de la date, du format et des séries,
  ajout/retrait d’exercices. Les favoris restent des copies indépendantes. Une
  suppression d’historique demande confirmation. La sortie de séance entre deux
  exercices propose de conserver les séries ou de quitter sans historique.
- `use-rest-timer.ts` : échéance absolue namespacée et persistée, signal Web Audio à
  5 secondes et à zéro, et synchronisation avec la notification système native. Un
  repos seul ne compte aucune série. Le chronomètre reprend exactement après
  suspension, navigation ou rechargement ; Android affiche un chronomètre dans la
  notification persistante et iOS 16.1+ dans une Live Activity. Sur navigateur,
  une notification PWA silencieuse et cliquable est proposée quand l’API est
  disponible : Android Chromium tente de remplacer la même carte pour afficher
  le temps restant, tandis qu’iOS conserve une seule carte statique pour éviter
  toute rafale de notifications. Une PWA peut être suspendue par le navigateur
  ou le système en arrière-plan ; seule l’intégration native garantit un
  chronomètre mis à jour pendant cette suspension. Le navigateur ne peut pas
  ajouter du texte à côté de l’heure ou des icônes système.
  Saisie séparée minutes/secondes et affichage m:ss. Le lancement automatique
  après une série est facultatif ; le bouton de chrono seul est toujours accessible.

Stockage : `antaverse:sport:v1` dans localStorage, plus `antaverse:sport:rest-timer`
pour l’échéance du repos actif. Une erreur de lecture préserve les données brutes ;
une erreur d’écriture n’empêche pas le chronomètre de fonctionner en mémoire. Les
données restent sur cet appareil jusqu’à effacement via les informations de
confidentialité ou le navigateur.

`cloud/` ajoute les comptes e-mail/mot de passe sans confirmation, Google et Apple
via le navigateur, la sauvegarde Supabase versionnée, les pseudos et les amis.
Le layout `/sport` est le seul à charger ce système : aucune donnée des jeux
d’ambiance n’est synchronisée. La page `/sport/compte` propose récupération de
mot de passe, export/import et suppression du compte. Dans Historique, Social
permet les demandes d’amis et la consultation des séances des amis acceptés.
Les push Web sont facultatifs par appareil. Une seule page Sport est éditable
à la fois dans un navigateur. Un conflit entre appareils suspend la sauvegarde
en ligne, mais le carnet local reste utilisable. Un avertissement repliable permet
de choisir explicitement la version à conserver, avec export facultatif avant
remplacement ; les erreurs de ce choix sont affichées dans cet avertissement.

Configuration et validation en ligne : [CLOUD_SETUP.md](CLOUD_SETUP.md).

Repères de classification consultés :
[ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/)
et [NASM Exercise Library](https://www.nasm.org/workout-exercise-guidance).
Le catalogue est une sélection éditoriale de mouvements usuels, pas un programme
prescrit ; les séances restent entièrement choisies par l’utilisateur.

Validation : `npx vitest run src/sport/model.test.ts`, `npm run typecheck`,
`npm run lint`, `npm run build`, puis `npx playwright test e2e/sport.spec.ts`.

## Assistant Sport (optionnel, compte connecté)

L’assistant aide à préparer une séance à partir des contraintes de l’historique,
à transformer un texte fourni par l’utilisateur en brouillon, à relire une séance
terminée et à observer la progression. Depuis « Nouvelle séance », le seul bouton
« Préparer ma séance à l’aide du coach » ouvre une orientation textuelle facultative.
Aucun appel ne part avant « Créer ma séance personnalisée » : sans texte, Milo utilise le carnet et
la dernière séance terminée pour poursuivre le cycle Push → Pull → Legs ou
Upper → Lower ; avec du texte, cette orientation complète la même base.
La relecture et la progression lancent leur demande au toucher.
Ces actions n’ajoutent pas de carte
Milo à l’accueil et aucun appel ne part depuis une page sans action de l’assistant.
Chaque préparation reste un brouillon modifiable : elle ne démarre ni
n’enregistre une séance sans action distincte de l’utilisateur.

L’assistant est réservé aux utilisateurs connectés et passe par la fonction
serveur Supabase `sport-assistant`. Le modèle fixé est
`openai/gpt-6.1-sol` via OpenRouter, avec un raisonnement de niveau `medium`.
OpenRouter et le fournisseur retenu peuvent traiter la requête. Le contexte
comprend toutes les séances terminées de l’utilisateur, y compris les séances
anciennes, toutes leurs séries terminées et les statistiques qui en sont
calculées. Les noms, adresses e-mail, pseudos, commentaires, photos et données
d’amis sont exclus. La demande saisie peut elle-même contenir des informations
personnelles. Les détails de transmission et les prestataires sont décrits dans
la [politique de confidentialité](../app/legal/confidentialite/page.tsx).
Les demandes et réponses de l’assistant restent en mémoire et ne sont ni
sauvegardées dans le cloud ni ajoutées automatiquement au carnet.

Milo est le coach IA du carnet : il s’appuie sur des repères éditoriaux pour
l’entraînement général, sans prétendre à un diplôme ni à une expertise médicale.
Les repères et leurs sources ACSM, NSCA et HHS sont tenus manuellement dans
[`coach-knowledge.json`](../../supabase/functions/_shared/coach-knowledge.json),
versionnés au 20 octobre 2026 ; ce fichier doit être revérifié lors de ses mises
à jour. Milo n’effectue pas de recherche web en direct. Le catalogue d’exercices
est une source distincte, générée depuis `catalog.ts` par la commande décrite
dans [CLOUD_SETUP.md](CLOUD_SETUP.md).

Le modèle classe la demande dans le même appel que la génération : entraînement,
hors sujet ou médical. Pour les deux dernières catégories, le serveur écarte la
réponse générée et renvoie une redirection fixe sans séance. La demande est bien
transmise au fournisseur ; cette classification par modèle ne constitue pas une
garantie absolue.

La fonction refuse les origines navigateur absentes de
`SPORT_AI_ALLOWED_ORIGINS`, vérifie l’utilisateur Supabase côté serveur et
applique des quotas atomiques par utilisateur et globaux. Sans clé OpenRouter,
la fonction signale que le service est indisponible et ne fait aucun appel
payant. Configuration, rétention des compteurs et vérifications :
[CLOUD_SETUP.md](CLOUD_SETUP.md). Les exemples d’évaluation manuelle sont dans
[`docs/sport-ai-evaluation.md`](../../docs/sport-ai-evaluation.md).
La [revue produit Milo](../../docs/sport-ai-product-review.md) et un exemple
d’évaluation manuelle sur cinq séances fictives de débutant sont disponibles ici :
[`docs/examples/sport-ai-beginner.md`](../../docs/examples/sport-ai-beginner.md).
Le script manuel `scripts/demo-sport-ai.mjs` les régénère depuis
`scripts/fixtures/sport-ai-beginner.json` ; ses appels payants ne font partie
d’aucun test ni build.
