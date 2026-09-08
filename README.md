# AntaVerse

AntaVerse regroupe des jeux d’ambiance mobiles dans une seule application Next.js :

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
├── La Traversée
└── PMU
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

## Cible : la PWA installée

AntaVerse est utilisée aujourd'hui comme la PWA servie par Vercel et installée
sur l'écran d'accueil, sur Android comme sur iOS. C'est la cible de
développement. Les projets Capacitor `android/` et `ios/` existent et leur
configuration a été commencée, mais ils ne font qu'emballer le même export et
restent en maintenance : les contrôles natifs sont opt-in (ne pas lancer les
commandes `android:*` ni de build iOS sauf demande explicite de travail natif
ou de vérification de publication).

```bash
npm run android:check
```

reconstruit, synchronise et compare le contenu embarqué Android. Voir
`docs/store/ANDROID_BUILD_AND_RELEASE.md` pour les APK, signatures et AAB.

## Architecture

L’icône Sport en haut du lanceur ouvre un carnet d’entraînement indépendant des
jeux : séances, repos, configurations favorites et historique local. Son code
se trouve dans `src/sport/`, avec la route `src/app/sport/`. Voir
[`src/sport/README.md`](src/sport/README.md) pour le catalogue et le stockage.

Sport a une couche compte **optionnelle** (`src/sport/cloud/`, Supabase) :
sauvegarde cloud du carnet, amis, notifications push. Elle ne s’active que si
les variables `NEXT_PUBLIC_SUPABASE_*` sont présentes au build et n’est
importée que par le layout `/sport` — aucun jeu ne la touche. Mise en service
et migrations : [`src/sport/CLOUD_SETUP.md`](src/sport/CLOUD_SETUP.md) et
`supabase/`.

- `src/app/` contient le lanceur, le shell global et les routes préfixées de chaque jeu.
- `src/games/<identifiant>/` contient le moteur, les données, les composants et les styles propres à chaque jeu ; le registre complet et à jour se trouve dans `src/lib/games.ts`.
- `src/components/` et `src/lib/` contiennent les éléments produit partagés.
- `src/lib/games.ts` est le registre affiché par le lanceur.
- `public/brand/games/` contient les logos des jeux utilisés par le lanceur et les écrans de jeu ; `public/brand/` contient les assets de marque AntaVerse ; `public/icons/` et la PWA appartiennent à l’application.

Les données persistantes restent isolées par jeu : localStorage pour les jeux concernés, IndexedDB pour Quoi de 9, avec une clé namespacée par partie (`fuck:current-game` ou `la-traversee:current-game`, par exemple). Le carnet Sport suit la même convention (`antaverse:sport:v1`).

## Ajouter un jeu

1. Ajouter son module dans `src/games/<identifiant>/` et ses routes dans `src/app/<identifiant>/`.
2. Ajouter ses assets de jeu dans `public/brand/games/` en respectant la convention de nommage existante.
3. Enregistrer son nom, sa description, sa route, son icône et sa couleur dans `src/lib/games.ts`.

Le lanceur rend automatiquement une nouvelle carte horizontale sous les jeux existants.
