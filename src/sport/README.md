# Sport — carnet V1

Route `/sport/`, entrée dans l’en-tête du lanceur. Module indépendant des jeux,
sans backend, dépendance supplémentaire ou analytics.

- `catalog.ts` : source manuelle des 32 exercices, IDs stables, muscles principaux
  et secondaires, zones, matériel et mouvement. Full body, Half body et Push Pull
  Legs sont les trois formats. Haut/bas et push/pull/legs sont des filtres facultatifs
  du catalogue, sans écran intermédiaire. Les abdominaux sont accessibles
  dans chaque séance. Les zones expriment un accent principal, pas une isolation.
- `model.ts` : schéma versionné, configurations, séries datées avec matériel,
  charge en kg et répétitions facultatives. Une charge d’haltère désigne **un seul
  haltère**, une barre inclut la barre, le poids du corps utilise le lest ajouté.
  Ces unités et IDs permettent de futures statistiques sans en afficher en V1.
- `sport-app.tsx` : séance, catalogue, réglages, historique et favoris. Un favori
  d’exercice distingue chaque configuration. Une séance favorite copie les réglages
  dans une nouvelle séance, sans réutiliser les séries, dates ou IDs historiques.
  La grille utilise trois colonnes sur téléphone, quatre à partir de 480 px.
  Les thèmes clair et sombre suivent le réglage de session AntaVerse, avec un
  bouton dans l’en-tête Sport. La palette du module associe bleu nuit, cuivre et
  champagne en sombre ; ivoire, bleu ardoise et terre cuite en clair. Les tokens
  de `sport.module.css` portent les surfaces, dégradés, contrastes et états.
- `history-editor.tsx` : correction du titre, de la date, du format et des séries,
  ajout/retrait d’exercices. Les favoris restent des copies indépendantes. Une
  suppression d’historique demande confirmation. La sortie de séance entre deux
  exercices propose de conserver les séries ou de quitter sans historique.
- `use-rest-timer.ts` : échéance absolue en mémoire, signal Web Audio à 5 secondes
  et à zéro. Un repos seul ne compte aucune série. Recharger réinitialise seulement
  le repos ; les séries sont sauvegardées immédiatement. Le son en arrière-plan ou
  écran verrouillé dépend du navigateur : aucun service natif n’est ajouté.
  Saisie séparée minutes/secondes et affichage m:ss. Le lancement automatique
  après une série est facultatif ; le bouton de chrono seul est toujours accessible.

Stockage : `antaverse:sport:v1` dans localStorage. Aucun compteur de repos n’est
persisté. Une erreur de lecture préserve les données brutes ; une erreur d’écriture
est visible et permet de réessayer. Les données restent sur cet appareil jusqu’à
effacement via les informations de confidentialité ou le navigateur. Pas de
synchronisation entre appareils ni d’édition concurrente entre plusieurs onglets.

Repères de classification consultés :
[ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/)
et [NASM Exercise Library](https://www.nasm.org/workout-exercise-guidance).
Le catalogue est une sélection éditoriale de mouvements usuels, pas un programme
prescrit ; les séances restent entièrement choisies par l’utilisateur.

Validation : `npx vitest run src/sport/model.test.ts`, `npm run typecheck`,
`npm run lint`, `npm run build`, puis `npx playwright test e2e/sport.spec.ts`.
