# Sécurité — vue d'ensemble

Dernière vérification technique : 2026-08-20.

Ce document décrit les mesures réellement en place. Aucune mesure de
sécurité ne garantit une protection absolue ; ce document ne prétend pas le
contraire.

## Surface applicative

- **Pas de backend.** AntaVerse est un export statique Next.js
  (`output: "export"` dans `next.config.ts`) : il n'existe aucune API,
  aucune base de données serveur, aucun code exécuté côté serveur pour
  cette application. La surface d'attaque classique d'un backend (injection,
  authentification, autorisation, fuite de base de données) n'existe donc
  pas pour AntaVerse aujourd'hui.
- **Pas de compte utilisateur.** Aucune authentification, aucun mot de
  passe, aucune session serveur à protéger.
- **Stockage strictement local.** Toutes les données de jeu vivent dans le
  navigateur de l'utilisateur (localStorage, IndexedDB — voir
  `docs/compliance/DATA_INVENTORY.md`), jamais sur un serveur d'AntaVerse.

## Transport

- Le site est servi exclusivement en HTTPS via l'hébergeur (Vercel), qui
  gère la terminaison TLS. Aucune configuration HTTP non chiffrée n'existe
  dans le projet.

## Secrets et clés

- Recherche de `process.env.` dans `src/` : aucune clé sensible exposée
  côté client identifiée. `.env.example` confirme explicitement qu'aucune
  variable d'environnement n'est requise pour l'usage actuel de
  l'application ("No environment variable is required for local play").
  `.env.local` (non versionné, exclu par `.gitignore`) peut contenir des
  valeurs locales de développement, jamais lues par ce document par
  précaution.
- Aucun secret ni clé d'API privée ne doit jamais être ajouté au code
  client (`src/`) : toute clé nécessitant de rester secrète appartiendrait
  à un futur backend, qui n'existe pas aujourd'hui.

## Dépendances

- Dépendances de production limitées à quatre paquets (`next`, `react`,
  `react-dom`, `idb`, `zod` — voir `docs/compliance/THIRD_PARTY_SERVICES.md`),
  toutes des bibliothèques largement utilisées et maintenues. Pas d'audit
  de vulnérabilités automatisé documenté dans ce chantier ; `npm audit`
  reste l'outil standard à exécuter périodiquement, en dehors du périmètre
  de ce document.

## En-têtes et politique de sécurité du contenu (CSP)

- `next.config.ts` ne définit pas de `headers()` personnalisés ; `poweredByHeader: false`
  est activé (retire l'en-tête `X-Powered-By`). `vercel.json` définit des
  en-têtes de cache (`Cache-Control`) pour le service worker et les assets
  fingerprintés, mais aucune CSP explicite n'est configurée aujourd'hui.
  Comme l'application ne charge aucun script ni ressource tierce (voir
  `docs/compliance/THIRD_PARTY_SERVICES.md`), le risque d'injection de
  script tiers est faible par construction, mais l'ajout d'une CSP
  explicite resterait une amélioration de défense en profondeur
  raisonnable pour une future itération — non traitée dans ce chantier
  pour rester proportionné à la demande initiale.

## Service Worker

- `public/sw.js` limite strictement son périmètre à l'origine de
  l'application (`if (url.origin !== self.location.origin) return;`) : il
  ne met en cache et ne sert jamais de ressource d'un domaine tiers.
  Stratégies de cache différenciées par type de ressource (network-first
  pour le HTML/manifest, cache-first pour les assets avec empreinte de
  contenu, stale-while-revalidate pour le reste) — voir le fichier source
  pour le détail, commenté en français.

## Surface native future

Un futur wrapper natif (voir `docs/store/NATIVE_PACKAGING_OPTIONS.md`)
introduirait une nouvelle surface (permissions natives, stockage natif,
éventuels SDK natifs) qui devra faire l'objet d'un audit de sécurité dédié
au moment de sa mise en œuvre — hors périmètre de ce document.
