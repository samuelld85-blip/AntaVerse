# Accessibilité — bonnes pratiques

Audit rapide, pas une refonte. Objectif : documenter l'état réel et les
points d'attention, pas imposer une conformité WCAG complète à ce stade du
produit.

## Ce qui est déjà en place

- **Contraste et thèmes** : un système clair/sombre complet existe
  (`src/app/globals.css`, `src/lib/use-theme-mode.ts`), avec des jeux de
  couleurs de texte à plusieurs niveaux d'importance (`--text-primary`
  jusqu'à `--text-quaternary`) plutôt qu'une seule couleur de texte pour
  tout.
- **Cible tactile** : les composants d'action partagés (`Button`/`ButtonLink`
  dans `games/shared/components/ui.tsx`, `.install-grid section`,
  `.game-card`) utilisent des zones cliquables généreuses, cohérentes avec
  un usage mobile tactile — pas de vérification systématique en pixels
  menée dans ce chantier.
- **Focus clavier visible** : `:focus-visible { outline: 3px solid
  var(--launcher-accent); outline-offset: 3px; }` dans `globals.css`
  s'applique globalement, y compris aux nouvelles pages légales.
- **Réduction des animations** : `@media (prefers-reduced-motion: reduce)`
  est géré globalement dans `globals.css` (transitions et animations
  réduites à 0.01ms pour les utilisateurs qui le demandent).
- **Labels accessibles** : usage réel de `aria-label` sur les éléments
  interactifs non explicites (ex. `aria-label="Jouer à ${game.name}"` sur
  chaque carte de jeu dans `src/components/game-card.tsx`), et d'attributs
  `aria-hidden="true"` sur les éléments purement décoratifs (icônes,
  émojis).
- **Zoom / taille de texte** : le viewport (`src/app/layout.tsx`) n'impose
  pas `maximum-scale` ni `user-scalable=no` — le zoom utilisateur reste
  possible, ce qui est la bonne pratique par défaut.

## Points d'attention non traités dans ce chantier

- Pas d'audit de lecteur d'écran (VoiceOver/TalkBack) mené sur les écrans
  de jeu eux-mêmes — les pages légales nouvellement créées utilisent une
  structure de titres hiérarchique simple (`h1` puis `h2`/`h3`), sans
  contenu interactif complexe, ce qui limite le risque sur ce périmètre
  précis.
- Pas de vérification automatisée de ratio de contraste chiffré (type
  axe-core) menée sur l'ensemble de l'application.
- Les mini-jeux à réflexe (`roulette-du-chaos/components/mini-games/`,
  ex. `tap-battle.tsx`, `reflex.tsx`) reposent sur la rapidité tactile, ce
  qui peut être un obstacle pour certains utilisateurs — accepté comme un
  choix de conception assumé pour ce type de mini-jeu de soirée, pas un
  défaut à corriger silencieusement.

## Ce que ce chantier a fait pour ses propres pages

Les nouvelles pages légales (`/legal/*`, `/support`) réutilisent
exclusivement les composants et tokens existants (`launcher-shell`,
`launcher-back`, tokens de couleur `--text-*`), héritent donc du même
niveau d'accessibilité que le reste de l'application, sans régression
introduite.
