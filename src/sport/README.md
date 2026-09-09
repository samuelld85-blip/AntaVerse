# Sport — carnet V1

Route `/sport/`, entrée dans l’en-tête du lanceur. Module indépendant des jeux,
avec sauvegarde locale et comptes cloud facultatifs, sans analytics.

- `catalog.ts` : source manuelle des 39 exercices, IDs stables, muscles principaux
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
  futures statistiques sans en afficher en V1.
- `sport-app.tsx` : page d’accueil du carnet et sections séance, catalogue, réglages,
  historique et favoris. `/sport/` reste l’accueil Sport ; les sections utilisent le
  paramètre `section` de l’URL pour conserver un retour navigateur vers cet accueil.
  Les séances
  libres peuvent chaîner deux exercices en superset avec un seul repos par tour, ou
  activer le mode pyramidal pour modifier la charge et les répétitions de chaque série. Un favori
  d’exercice distingue chaque configuration. Une séance favorite copie les réglages
  dans une nouvelle séance, sans réutiliser les séries, dates ou IDs historiques.
  La grille utilise trois colonnes sur téléphone, quatre à partir de 480 px.
  Les thèmes clair et sombre suivent le réglage de session AntaVerse, avec un
  bouton dans l’en-tête Sport. La palette du module associe bleu nuit, cuivre et
  champagne en sombre ; ivoire, bleu ardoise et terre cuite en clair. Les tokens
  de `sport.module.css` portent les surfaces, dégradés, contrastes et états.
- `progression.ts`, `progression-badge.tsx` et `stats-dashboard.tsx` : progression personnelle
  Sport avec XP linéaire par séance, statuts globaux, niveaux par exercice, badges et statistiques
  de charge, volume et muscles. Le profil ami reprend ces mêmes informations depuis Social.
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
à la fois dans un navigateur ; un conflit entre appareils nécessite un choix
explicite, avec export des données avant remplacement.

Configuration et validation en ligne : [CLOUD_SETUP.md](CLOUD_SETUP.md).

Repères de classification consultés :
[ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/)
et [NASM Exercise Library](https://www.nasm.org/workout-exercise-guidance).
Le catalogue est une sélection éditoriale de mouvements usuels, pas un programme
prescrit ; les séances restent entièrement choisies par l’utilisateur.

Validation : `npx vitest run src/sport/model.test.ts`, `npm run typecheck`,
`npm run lint`, `npm run build`, puis `npx playwright test e2e/sport.spec.ts`.
