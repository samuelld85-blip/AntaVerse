# AntaVerse — Référentiel UX/UI des jeux

Ce document conserve les enseignements de l’audit des quatre jeux OneShot
ajoutés en septembre 2026 : EthnoGuessr, Interpol, Bac Enchaîné et Pifomètre.
Il sert de référence avant toute nouvelle interface de jeu ou toute évolution
du shell partagé. Les règles produit explicites et les mécaniques demandées
restent prioritaires.

## Principes non négociables

### Parcours

- Le parcours nominal doit être lisible sans explication : accueil → règles si
  nécessaire → configuration → partie → résultat/fin.
- Une action de configuration ne doit pas devenir un écran de confirmation si
  elle peut être faite naturellement entre les joueurs.
- Le bouton d’action principal doit être visible sans faire défiler sur un
  téléphone courant.
- Une partie interrompue doit proposer une reprise claire, sans écraser une
  sauvegarde valide ni provoquer d’écran d’erreur au retour.
- La persistance reste isolée par jeu et par clé namespacée.

### Mobile et responsive

Auditer au minimum 320, 360, 375, 390 et 430 px de largeur, avec des hauteurs
courtes de téléphone. Vérifier particulièrement :

- aucun titre, logo, bouton ou texte ne déborde ;
- les zones tactiles restent confortables et séparées ;
- les listes longues défilent dans une zone maîtrisée sans pousser le CTA hors
  écran ;
- les espaces vides sont intentionnels et équilibrent l’écran ;
- les safe areas, le clavier virtuel et l’orientation portrait ne masquent pas
  l’action en cours ;
- les cartes, cartes géographiques et panneaux de jeu ont une hauteur utile,
  pas une hauteur `100%` par défaut qui crée une grande zone morte.

### États à concevoir systématiquement

Pour chaque écran interactif, prévoir et vérifier : initial, chargement, focus,
sélectionné, actif, désactivé, erreur, vide, succès, reprise et fin de partie.
Utiliser du contenu réaliste : noms longs, nombre maximal de joueurs, libellés
longs et données partiellement sauvegardées.

### Accessibilité et interactions

- Chaque champ possède un label réellement associé et un `id` stable.
- Les contrôles personnalisés (radio, choix de mode, combobox) fonctionnent au
  clavier et au tactile, avec état sélectionné visible et navigation cohérente.
- Une combobox expose son option active (`aria-activedescendant` ou équivalent)
  et accepte les flèches, Entrée et Échap.
- Les modales/lightboxes gèrent Échap, le focus entrant et la restitution du
  focus à la fermeture ; cliquer l’image ne doit pas fermer accidentellement
  son conteneur.
- Un élément annoncé comme bouton doit être réellement activable au clavier.
  Pour une carte pointer-only, fournir une alternative accessible (par exemple
  la recherche de pays) plutôt que de simuler une fausse interaction clavier.
- Les couleurs ne doivent pas être le seul signal d’état ; vérifier le
  contraste en clair et en sombre.

## Règles de cohérence visuelle

- Les fondations communes vivent dans les primitives partagées : shell,
  boutons, champs, cartes, badges, thème et rythme d’espacement.
- Une règle commune aux nouveaux jeux doit être explicitement scopée, par
  exemple `.one-shot-player-form`, afin de ne pas modifier silencieusement les
  jeux historiques déjà réglés.
- Ne jamais déclarer un accent partagé au niveau `:root` dans une feuille de
  jeu. Utiliser le marqueur de route, par exemple
  `:root:has(.brand-mark--interpol)` ou `:root:has(.pifometre-logo)`.
- Chaque jeu doit avoir un accent identifiable, une variante lisible en clair
  et en sombre, et un logo qui reste lisible à petite taille.
- Le mode clair doit être conçu indépendamment du mode sombre : shell, cartes,
  bordures, ombres, texte et accent doivent tous être contrôlés.
- Les titres display peuvent être expressifs, mais doivent toujours accepter
  le retour à la ligne ou réduire leur taille sur petits écrans.
- Préférer une hiérarchie claire et peu de composants simultanés à des effets
  décoratifs qui concurrencent l’action.

## Leçons concrètes des quatre OneShot

| Jeu          | Risque découvert                                                                                          | Garde-fou à conserver                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| EthnoGuessr  | Carte trop haute, recherche peu exploitable au clavier, sauvegarde obsolète pouvant faire tomber la route | Vue carte bornée et centrée, recherche clavier complète, validation des données et récupération après rendu |
| Interpol     | Badge de manche étiré et formulaires trop serrés                                                          | Badge compact aligné au début, formulaire OneShot partagé et espacement visible                             |
| Bac Enchaîné | Configuration des joueurs sans rythme suffisamment explicite                                              | Espacement partagé, scroll maîtrisé et `id` stable pour chaque joueur                                       |
| Pifomètre    | Titre débordant, thème clair absent, accent trop proche de Bac, choix custom souris-first                 | Titre responsive, `ThemeSelector`, accent dédié et navigation clavier avec roving tabindex                  |

## Note d’intégration OneShot

Ces notes évaluent l’intégration dans AntaVerse avant puis après les correctifs
de l’audit. Elles portent sur le parcours, le shell partagé, la cohérence
visuelle, le responsive et les états d’interface ; elles ne notent pas la
qualité intrinsèque des mécaniques.

| Jeu          | Avant audit | Après correctifs | Lecture rapide                                                                                       |
| ------------ | ----------: | ---------------: | ---------------------------------------------------------------------------------------------------- |
| EthnoGuessr  |        6/10 |           8,5/10 | Très bonne identité, mais plusieurs risques structurels sur la carte, la reprise et l’accessibilité. |
| Interpol     |      8,5/10 |             9/10 | Intégration la plus proche du niveau cible ; surtout du polissage de densité et d’alignement.        |
| Bac Enchaîné |      7,5/10 |           8,5/10 | Parcours clair et action lisible ; le formulaire avait besoin d’un vrai rythme partagé.              |
| Pifomètre    |      5,5/10 |           8,5/10 | Plus gros écart visuel initial : débordement, thème manquant, accent et contrôles custom.            |

La note « après correctifs » reste une note d’intégration heuristique : elle ne
remplace pas un test avec plusieurs joueurs sur appareils réels.

## Checklist avant de déclarer un jeu intégré

- [ ] Le jeu est présent dans `src/games/<slug>/`, ses routes et ses assets.
- [ ] Il est enregistré dans `src/lib/games.ts` avec logo, couleur et route.
- [ ] Son shell possède un marqueur de marque stable pour le scoping CSS.
- [ ] L’accueil, les règles, la configuration, la partie et la fin ont été
      parcourus avec du contenu réel.
- [ ] Les états reprise, chargement, erreur et partie terminée ont été testés.
- [ ] Les boutons, champs, choix custom et modales sont utilisables au tactile
      et au clavier quand le contexte le permet.
- [ ] Le clair et le sombre ont été inspectés séparément.
- [ ] Les largeurs 320/360/375/390/430 px ont été vérifiées, avec une hauteur
      courte et des noms longs.
- [ ] Aucune mécanique, règle, probabilité ou persistance existante n’a été
      changée par une correction purement visuelle.
- [ ] `npm run typecheck`, les tests pertinents, le lint et le build PWA sont
      passés selon le niveau de risque.

## Notes de validation

L’audit OneShot a été réalisé par revue ciblée du code et inspection rendue des
écrans principaux. Cela établit des problèmes visibles et structurels, pas une
preuve de satisfaction utilisateur. Avant une mise en production, compléter
par un passage sur appareils réels Android/iOS, notamment avec clavier virtuel,
zoom texte, reprise après mise en veille et rotation accidentelle.
