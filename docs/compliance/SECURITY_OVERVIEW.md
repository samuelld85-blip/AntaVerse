# Sécurité — vue d'ensemble

Dernière vérification technique : 2026-09-08.

Ce document décrit les mesures réellement en place. Aucune mesure de
sécurité ne garantit une protection absolue ; ce document ne prétend pas le
contraire.

## Surface applicative — base de l'app

- **Pas de backend pour les jeux.** Le cœur d'AntaVerse est un export
  statique Next.js (`output: "export"`) : pour les dix jeux et pour le
  carnet Sport utilisé sans compte, il n'existe aucune API, aucune base de
  données serveur, aucun code serveur. La surface d'attaque classique d'un
  backend n'existe pas pour cette partie.
- **Stockage local par défaut.** Les données de jeu et le carnet Sport
  local vivent dans le navigateur (localStorage, IndexedDB — voir
  `docs/compliance/DATA_INVENTORY.md`).
- **Un backend optionnel : le compte Sport cloud** — voir la section dédiée
  ci-dessous. Il n'est actif que si Supabase est configuré au build et que
  l'utilisateur crée un compte.

## Surface Sport cloud (Supabase)

Périmètre : `src/sport/cloud/*`, `supabase/migrations/*.sql`,
`supabase/functions/send-session-push/`. Actif uniquement quand
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sont
présents au build, sur la route `/sport`, après création d'un compte.

- **Authentification** : Supabase Auth. E-mail/mot de passe (minimum 8
  caractères, sans confirmation d'e-mail) ou OAuth Google/Apple en flux web
  **PKCE**. Le mot de passe est haché côté Supabase et n'apparaît jamais
  dans le client ni dans les sauvegardes.
- **Autorisation** : **Row Level Security activée sur toutes les tables
  exposées.** Un utilisateur ne lit que ses propres sauvegardes/révisions ;
  les séances terminées ne sont lisibles que par un ami accepté (politique
  RLS `sessions_friends` / fonction `shares_session`) ; likes et
  commentaires suivent la même règle d'amitié.
- **Invariants multi-lignes via RPC `security definer`** : `save_backup`
  (comparaison de révision anti-écrasement concurrent, verrou transactionnel
  par utilisateur, validation de taille/forme du snapshot, rotation à 10
  révisions, mise en file des notifications), `accept_friend`,
  `delete_my_account` (supprime `auth.users` → cascade complète),
  `claim_push_jobs` (réservé au rôle `service_role`). Les droits
  `insert/update/delete` directs sont explicitement révoqués sur les tables
  pilotées uniquement par ces RPC.
- **Edge Function `send-session-push`** : jamais appelable depuis le
  navigateur — elle exige un en-tête `x-push-secret` égal à un
  `PUSH_WORKER_SECRET` distinct des clés VAPID. Elle valide que l'amitié est
  toujours active, que la séance existe, et applique une **liste blanche
  d'hôtes** sur l'endpoint push (SSRF) : rejette tout ce qui n'est pas
  `fcm.googleapis.com`, `updates.push.services.mozilla.com`,
  `*.push.apple.com`, `web.push.apple.com`, `*.notify.windows.com`, ainsi
  que tout endpoint avec port, identifiants ou protocole non-HTTPS. Elle ne
  journalise jamais endpoints ni clés ; les abonnements expirés (404/410)
  sont supprimés.
- **Secrets** : le client ne reçoit que l'URL Supabase, la clé *publiable*
  (soumise à la RLS) et la clé VAPID *publique*. Clé service-role, secrets
  OAuth, mot de passe de base, `PUSH_WORKER_SECRET` et clé VAPID *privée*
  vivent dans l'environnement Supabase / Edge Function Secrets, jamais dans
  `NEXT_PUBLIC_*` ni `src/`. Voir `src/sport/CLOUD_SETUP.md`.
- **Contenu utilisateur** : les commentaires d'amis sont contraints en base
  (1–500 caractères) ; l'auteur ou le propriétaire de la séance peut les
  supprimer. Modération, signalement et blocage restent à construire avant
  une soumission store — voir `docs/compliance/FUTURE_SOCIAL_REQUIREMENTS.md`.
- **Tests de sécurité** : `npx vitest run src/sport/cloud` exécute la vraie
  migration SQL dans PGlite avec des rôles distincts et vérifie RLS,
  versions, amitiés et file push ; le test Deno de l'edge function couvre le
  secret requis, l'amitié active, le rejet d'endpoints arbitraires et la
  purge des abonnements expirés.

## Transport

- Le site est servi exclusivement en HTTPS via l'hébergeur (Vercel), qui
  gère la terminaison TLS. Aucune configuration HTTP non chiffrée n'existe
  dans le projet.

## Secrets et clés

- Recherche de `process.env.` dans `src/` : les seules variables lues côté
  client sont les valeurs **publiques** de la couche Sport cloud —
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  (soumise à la RLS), `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` (clé VAPID publique).
  Aucune de ces valeurs n'est un secret. `.env.example` documente ces trois
  variables comme facultatives (aucune n'est requise pour jouer en local).
- **Ne jamais** ajouter au code client (`src/`) ou à une variable
  `NEXT_PUBLIC_*` : la clé service-role Supabase, un secret OAuth, le mot de
  passe de la base, `PUSH_WORKER_SECRET`, ou la clé VAPID privée. Ces
  secrets vivent uniquement dans l'environnement Supabase / Edge Function.
- `.env.local` (non versionné, exclu par `.gitignore`) contient les valeurs
  de développement, jamais lues par ce document par précaution.

## Dépendances

- Dépendances de production : `next`, `react`, `react-dom`, `idb`, `zod`,
  les paquets `@capacitor/*` (conteneur natif) et `@supabase/supabase-js`
  (client du backend Sport) — voir `docs/compliance/THIRD_PARTY_SERVICES.md`.
  Toutes largement utilisées et maintenues. Pas d'audit de vulnérabilités
  automatisé documenté dans ce chantier ; `npm audit` reste l'outil
  standard à exécuter périodiquement.
- L'Edge Function importe côté Deno `@supabase/supabase-js` et `web-push`
  (versions épinglées dans `supabase/functions/send-session-push/index.ts`).

## En-têtes et politique de sécurité du contenu (CSP)

- `next.config.ts` ne définit pas de `headers()` personnalisés ; `poweredByHeader: false`
  est activé (retire l'en-tête `X-Powered-By`). `vercel.json` définit des
  en-têtes de cache (`Cache-Control`) pour le service worker et les assets
  fingerprintés, mais aucune CSP explicite n'est configurée aujourd'hui.
  L'application ne charge aucun script tiers ; la seule origine externe
  contactée est le projet Supabase configuré (XHR/WebSocket depuis
  `src/sport/cloud/`) et, sur redirection explicite, les pages OAuth de
  Google/Apple. L'ajout d'une CSP explicite (avec `connect-src` limité à
  l'origine et à l'URL Supabase) resterait une amélioration de défense en
  profondeur raisonnable pour une future itération.

## Service Worker

- `public/sw.js` limite strictement son périmètre de **cache** à l'origine
  de l'application (`if (url.origin !== self.location.origin) return;`) : il
  ne met en cache et ne sert jamais de ressource d'un domaine tiers.
  Stratégies de cache différenciées par type de ressource (network-first
  pour le HTML/manifest, cache-first pour les assets avec empreinte de
  contenu, stale-while-revalidate pour le reste). Il gère aussi les
  événements `push` / `notificationclick` pour les notifications d'amis
  Sport (afficher la notification, ouvrir `/sport/?social=1`) — sans jamais
  contacter d'origine externe lui-même.

## Surface native

Des projets Capacitor Android (`android/`) et iOS (`ios/`) existent et
emballent le même export statique ; ils ne sont pas la cible de production
(la PWA installée l'est) et restent en maintenance. Toute activation d'un
plugin natif, d'un SDK natif ou d'un push natif (APNs/FCM) créerait une
nouvelle surface à auditer spécifiquement. Voir
`docs/store/NATIVE_PACKAGING_OPTIONS.md` et
`docs/compliance/PERMISSIONS_INVENTORY.md`.
