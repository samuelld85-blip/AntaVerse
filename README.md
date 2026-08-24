# AntaVerse

AntaVerse regroupe neuf jeux d’ambiance mobiles dans une seule application Next.js :

```text
AntaVerse
├── lanceur et shell partagé
├── Quoi de 9 ?
├── La Relance
├── Sans le dire
├── Purple
├── Triman
├── Roulette du Chaos
├── Palmier
├── Fuck
└── La Traversée
```

## Lancer le projet

```bash
npm install
npm run dev
```

La version de production est un export statique compatible Vercel :

```bash
npm run build
npm run preview
```

Les contrôles complets sont disponibles avec `npm run verify` et `npm run test:e2e`.

## Architecture

- `src/app/` contient le lanceur, le shell global et les routes préfixées de chaque jeu.
- `src/games/<identifiant>/` contient le moteur, les données, les composants et les styles propres à chaque jeu ; les neuf modules actuels sont `quoi-de-9`, `la-relance`, `sans-le-dire`, `purple`, `triman`, `roulette-du-chaos`, `palmier`, `fuck` et `la-traversee`.
- `src/components/` et `src/lib/` contiennent les éléments produit partagés.
- `src/lib/games.ts` est le registre affiché par le lanceur.
- `public/brand/games/` contient les logos des jeux utilisés par le lanceur et les écrans de jeu ; `public/brand/` contient les assets de marque AntaVerse ; `public/icons/` et la PWA appartiennent à l’application.

Les données persistantes restent isolées par jeu : localStorage pour les huit jeux concernés, IndexedDB pour Quoi de 9, avec une clé namespacée par partie (`fuck:current-game` ou `la-traversee:current-game`, par exemple).

## Ajouter un jeu

1. Ajouter son module dans `src/games/<identifiant>/` et ses routes dans `src/app/<identifiant>/`.
2. Ajouter ses assets de jeu dans `public/brand/games/` en respectant la convention de nommage existante.
3. Enregistrer son nom, sa description, sa route, son icône et sa couleur dans `src/lib/games.ts`.

Le lanceur rend automatiquement une nouvelle carte horizontale sous les jeux existants.
