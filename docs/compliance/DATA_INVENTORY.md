# Inventaire des données — AntaVerse

Dernière vérification technique : 2026-08-20 (voir CLAUDE.md § "Documentation
maintenance" pour les règles de mise à jour). Ce document reflète un audit
réel du code à cette date, pas une hypothèse. À revérifier avant toute
soumission Apple / Google, et à chaque changement touchant au stockage,
réseau, ou SDK tiers.

## Méthode

Audit du code source (`src/`), de `package.json`, de `next.config.ts`, de
`public/manifest.webmanifest`, de `public/sw.js`, de `vercel.json` et de
`.env.example`. Recherches ciblées : `localStorage`, `indexedDB`/`idb`,
`sessionStorage`, `document.cookie`, `window.name`, `fetch(`, `axios`,
`XMLHttpRequest`, SDK d'analytics connus, `navigator.*` (permissions).

## Constat général

AntaVerse est un **export statique Next.js** (`output: "export"` dans
`next.config.ts`), servi sur Vercel. **Aucune requête réseau applicative
n'est émise par le code source vers un serveur d'AntaVerse ou un tiers** —
recherche `fetch(`/`axios`/`XMLHttpRequest` sur `src/` : aucun résultat. Les
seules requêtes réseau observées sont celles, standards, du navigateur pour
charger les pages/assets et celles du Service Worker pour mettre en cache
ces mêmes assets — jamais vers un serveur applicatif ni un tiers. Le Service
Worker (`public/sw.js`) vérifie explicitement l'origine
(`if (url.origin !== self.location.origin) return;`) : il ne cache et ne
sert jamais rien d'un domaine externe.

Aucun SDK d'analytics, de mesure d'audience, de publicité ou de suivi n'est
présent : ni dans `package.json` (dépendances de production : `idb`, `next`,
`react`, `react-dom`, `zod` — voir `docs/compliance/THIRD_PARTY_SERVICES.md`),
ni importé dans le code.

## Tableau des données

| Donnée | Où elle existe | Finalité | Transmise au développeur ? | Stockage | Durée | Base/justification | Suppression |
|---|---|---|---|---|---|---|---|
| Thème choisi (clair/sombre) | `localStorage["antaverse:theme"]` (`src/lib/use-theme-mode.ts`) | Mémoriser la préférence d'affichage | Non — uniquement local | localStorage | Jusqu'à suppression | Exécution du service demandé | Bouton "Effacer mes données locales" ou réglages navigateur |
| Partie en cours — La Relance | `localStorage["la-relance:current-game"]` | Reprendre une partie interrompue | Non | localStorage | Jusqu'à fin de partie / suppression | Exécution du service demandé | Idem |
| Partie en cours — Sans le dire | `localStorage["sans-le-dire:current-game"]` | Idem | Non | localStorage | Idem | Idem | Idem |
| Noms d'équipes — Sans le dire | `localStorage["sans-le-dire:team-names"]` | Pré-remplir les noms d'équipes à la partie suivante | Non | localStorage | Idem | Idem | Idem |
| Partie en cours — Palmier | `localStorage["palmier:current-game"]` | Reprendre une partie | Non | localStorage | Idem | Idem | Idem |
| Partie en cours — Triman | `localStorage["triman:current-game"]` | Reprendre une partie | Non | localStorage | Idem | Idem | Idem |
| Partie en cours — Purple | `localStorage["purple:current-game"]` | Reprendre une partie | Non | localStorage | Idem | Idem | Idem |
| Préférence de révélation — Purple | `localStorage["purple:reveal-mode"]` | Mémoriser une préférence d'animation | Non | localStorage | Idem | Idem | Idem |
| Partie en cours — Roulette du Chaos | `localStorage["roulette-du-chaos:current-game"]` | Reprendre une partie | Non | localStorage | Idem | Idem | Idem |
| Partie en cours — Quoi de 9 (principal) | IndexedDB, base `qui-des-9`, store `games`, clé `current` (`src/games/quoi-de-9/lib/game/persistence.ts`) | Reprendre une partie, avec migration de schéma legacy | Non | IndexedDB | Idem | Idem | Idem |
| Partie en cours — Quoi de 9 (repli) | `localStorage["qui-des-9:current-game"]` | Repli si IndexedDB indisponible | Non | localStorage | Idem | Idem | Idem |
| Partie en cours — Quoi de 9 (dernier repli) | `window.name`, préfixe `qui-des-9-game:` | Dernier repli si IndexedDB et localStorage sont tous deux indisponibles (certains modes de navigation privée WebKit) | Non | `window.name` (survit aux rechargements, pas à la fermeture de l'onglet) | Session du navigateur | Exécution du service demandé | Se vide automatiquement à la fermeture de l'onglet, ou via le bouton d'effacement |
| Réponses / choix en jeu (tous les jeux) | Mémoire + objets ci-dessus | Faire fonctionner la partie | Non | Idem que la partie associée | Idem | Idem | Idem |
| Contenu des jeux (questions, cartes, règles) | `src/games/*/data/`, bundlé au build | Contenu du jeu lui-même, pas une donnée utilisateur | N/A | Fichier statique livré avec l'app | N/A | N/A | N/A |
| Cache applicatif (assets, HTML, JS) | Cache API du Service Worker (`public/sw.js`) | Fonctionnement hors ligne de la PWA | Non | Cache du navigateur | Jusqu'à mise à jour de version ou suppression | Exécution du service demandé | Réglages navigateur ("Effacer les données de site"), ou automatique à chaque nouveau déploiement |
| Indicateur technique de reprise après échec de chargement CSS | `sessionStorage["antaverse:sw-recovery"]` (`src/app/layout.tsx`) | Éviter une boucle de rechargement infinie après un déploiement | Non | sessionStorage | Le temps de la session d'onglet | Exécution du service demandé | Automatique (supprimé dès le chargement réussi) |
| Outil de relecture éditoriale Quoi de 9 | `localStorage["qui-des-9-content-review-<version>"]` (`src/app/quoi-de-9/admin/contenu`) | Outil interne de relecture de contenu | Non | localStorage | N/A | N/A | N/A |
| Journaux techniques de connexion (IP, date/heure, page demandée) | Infrastructure de l'hébergeur (Vercel) | Livraison technique des pages | Oui, mais **par l'hébergeur**, pas par AntaVerse | Hors du contrôle direct d'AntaVerse | Selon la politique de rétention de l'hébergeur | Nécessité technique / intérêt légitime de l'hébergeur | Selon l'hébergeur |

Note sur la dernière ligne : l'éditeur d'AntaVerse ne configure, ne consulte
ni n'exploite ces journaux — ils existent parce que tout hébergeur web les
génère pour livrer des pages. Ils sont documentés ici par honnêteté, pas
parce qu'AntaVerse les traite activement.

## L'outil admin `/quoi-de-9/admin/contenu`

`src/app/quoi-de-9/admin/contenu/page.tsx` appelle `notFound()` si
`process.env.NODE_ENV !== "development"` : cette page **n'existe pas** dans
le build de production / l'export statique livré aux utilisateurs. Elle est
exclue du périmètre de cet audit utilisateur final, mais listée ci-dessus
par exhaustivité (elle utilise `localStorage` en développement local
uniquement).

## Données uniquement locales — confirmation

Tout ce qui figure dans le tableau ci-dessus, à l'exception explicite des
journaux d'hébergement, **reste techniquement sur l'appareil de
l'utilisateur** : aucun appel réseau applicatif ne transmet ces valeurs.
C'est une vérification de code (absence de `fetch`/`axios`/XHR dans `src/`),
pas une supposition.

## Ce qui changerait cette conclusion

Cette conclusion doit être ré-auditée si l'une de ces choses est ajoutée :
outil d'analytics, SDK tiers, backend/API, système de compte, wrapper natif
avec ses propres SDK, publicité. Voir `docs/compliance/THIRD_PARTY_SERVICES.md`
et `docs/compliance/FUTURE_SOCIAL_REQUIREMENTS.md`.
