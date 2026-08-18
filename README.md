# AntaVerse

AntaVerse regroupe trois jeux d’ambiance mobiles dans une seule application Next.js :

```text
AntaVerse
├── lanceur et shell partagé
├── Quoi de 9 ?
├── La Relance
└── Sans le dire
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
- `src/games/quoi-de-9/`, `src/games/la-relance/` et `src/games/sans-le-dire/` contiennent les moteurs, données, composants et styles propres à chaque jeu.
- `src/components/` et `src/lib/` contiennent les éléments produit partagés.
- `src/lib/games.ts` est le registre affiché par le lanceur.
- `public/brand/v1/` contient les marques légères du lanceur, tandis que `public/games/` conserve les assets complets propres aux jeux ; `public/icons/` et la PWA appartiennent à AntaVerse.

Les données persistantes restent isolées par les préfixes `qui-des-9:`, `la-relance:` et `sans-le-dire:`.

## Ajouter un jeu

1. Ajouter son module dans `src/games/<identifiant>/` et ses routes dans `src/app/<identifiant>/`.
2. Ajouter ses assets dans `public/games/<identifiant>/`.
3. Enregistrer son nom, sa description, sa route, son icône et sa couleur dans `src/lib/games.ts`.

Le lanceur rend automatiquement une nouvelle carte horizontale sous les jeux existants.
