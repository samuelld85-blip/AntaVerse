# Inventaire des données — AntaVerse

Dernière vérification technique : 2026-09-08 (voir CLAUDE.md § "Documentation
maintenance" pour les règles de mise à jour). Ce document reflète un audit
réel du code à cette date, pas une hypothèse. À revérifier avant toute
soumission Apple / Google, et à chaque changement touchant au stockage,
réseau, ou SDK tiers.

## Deux régimes de données

Depuis l'ajout du module **Sport** et de sa couche compte cloud (2026-09),
il faut distinguer deux régimes :

1. **Base de l'app** — les dix jeux, plus le carnet Sport utilisé **sans
   compte**. Aucune requête réseau applicative, tout reste sur l'appareil,
   rien n'atteint l'éditeur ni un tiers. C'est le régime décrit dans la
   majeure partie de ce document.
2. **Compte Sport cloud (optionnel)** — `src/sport/cloud/`, actif seulement
   si un projet Supabase est configuré **au build**
   (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`),
   uniquement sur la route `/sport`, et seulement si l'utilisateur crée un
   compte. Ce régime **transmet** un ensemble défini de données à Supabase
   (et, au choix de l'utilisateur, à Google ou Apple pour la connexion). Il
   est détaillé dans sa propre section plus bas.

## Méthode

Audit du code source (`src/`), de `package.json`, de `next.config.ts`, de
`public/manifest.webmanifest`, de `public/sw.js`, de `vercel.json` et de
`.env.example`. Recherches ciblées : `localStorage`, `indexedDB`/`idb`,
`sessionStorage`, `document.cookie`, `window.name`, `fetch(`, `axios`,
`XMLHttpRequest`, SDK d'analytics connus, `navigator.*` (permissions).

## Constat général (régime "base de l'app")

AntaVerse est un **export statique Next.js** (`output: "export"` dans
`next.config.ts`), servi sur Vercel. **En dehors de la couche compte Sport
cloud décrite plus bas, aucune requête réseau applicative n'est émise par le
code source vers un serveur d'AntaVerse ou un tiers.** Le seul appel réseau
applicatif du dépôt est le client Supabase, importé exclusivement par
`src/sport/cloud/` et jamais initialisé sans configuration Supabase au build
ni hors de la route `/sport`. Recherche `fetch(`/`axios`/`XMLHttpRequest` sur
`src/` hors `src/sport/cloud/` : aucun résultat. Les autres requêtes réseau
observées sont celles, standards, du navigateur pour charger les
pages/assets et celles du Service Worker pour mettre en cache ces mêmes
assets. Le Service Worker (`public/sw.js`) vérifie explicitement l'origine
(`if (url.origin !== self.location.origin) return;`) : il ne cache et ne
sert jamais rien d'un domaine externe (il relaie en revanche les événements
`push` / `notificationclick` pour les notifications Sport).

Aucun SDK d'analytics, de mesure d'audience, de publicité ou de suivi n'est
présent : ni dans `package.json`, ni importé dans le code. Les dépendances
Capacitor ajoutées servent uniquement de conteneur et de pont local (voir
`docs/compliance/THIRD_PARTY_SERVICES.md`). `@supabase/supabase-js` est le
seul SDK communiquant avec un serveur — voir le même document et la section
"Compte Sport cloud" ci-dessous.

La version Android Capacitor embarque ce même export statique dans l'AAB. Elle
ne contacte pas Vercel pour charger l'interface ou les jeux et désactive le
Service Worker PWA, devenu inutile dans ce contexte. Les données de partie
restent dans le stockage local de la WebView Android. Les sauvegardes cloud et
le transfert Android de ces données sont explicitement désactivés dans le
manifeste et ses règles d'extraction.

## Tableau des données

Ajout Sport — 2026-09-08 : `localStorage["antaverse:sport:v1"]` contient la séance
en cours, les séances terminées datées, les séries validées (matériel, charge,
répétitions facultatives) et les configurations/séances favorites. Le repos actif
est séparément persisté dans `localStorage["antaverse:sport:rest-timer"]` sous la
forme d’une échéance Unix en millisecondes, afin de reprendre le même compte à
rebours après suspension ou rechargement. Ces données restent sur l’appareil, sans
transmission, jusqu’à effacement par le bouton des informations de confidentialité
ou le navigateur. Le réglage sonore reste en mémoire.

| Donnée                                                           | Où elle existe                                                                                            | Finalité                                                                                                             | Transmise au développeur ?                       | Stockage                                                                 | Durée                                                                             | Base/justification                                    | Suppression                                                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Partie en cours — La Relance                                     | `localStorage["la-relance:current-game"]`                                                                 | Reprendre une partie interrompue                                                                                     | Non                                              | localStorage                                                             | Jusqu'à fin de partie / suppression                                               | Exécution du service demandé                          | Idem                                                                                             |
| Partie en cours — Sans le dire                                   | `localStorage["sans-le-dire:current-game"]`                                                               | Idem                                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Noms d'équipes — Sans le dire                                    | `sessionStorage["sans-le-dire:team-names"]`                                                               | Rejouer immédiatement avec les mêmes équipes                                                                         | Non                                              | sessionStorage                                                           | Session Sans le dire ; effacé au retour à l'accueil ou à la fermeture de l'onglet | Exécution de la partie demandée                       | Automatique à la fin de session, ou bouton « Effacer mes données locales »                       |
| Partie individuelle — Sans le dire                               | `localStorage["sans-le-dire:solo-current-game"]`                                                          | Reprendre une partie individuelle interrompue                                                                        | Non                                              | localStorage                                                             | Jusqu'à fin de partie / suppression                                               | Exécution du service demandé                          | Idem                                                                                             |
| Partie en cours — Palmier                                        | `localStorage["palmier:current-game"]`                                                                    | Reprendre une partie                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Triman                                         | `localStorage["triman:current-game"]`                                                                     | Reprendre une partie                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Purple                                         | `localStorage["purple:current-game"]`                                                                     | Reprendre une partie                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Roulette du Chaos                              | `localStorage["roulette-du-chaos:current-game"]`                                                          | Reprendre une partie                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Fuck                                           | `localStorage["fuck:current-game"]`                                                                       | Reprendre une partie                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — La Traversée                                   | `localStorage["la-traversee:current-game"]`                                                               | Reprendre une partie                                                                                                 | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — PMU                                            | `localStorage["pmu:current-game"]`                                                                        | Reprendre une partie et ses mises                                                                                    | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Quoi de 9 (principal)                          | IndexedDB, base `qui-des-9`, store `games`, clé `current` (`src/games/quoi-de-9/lib/game/persistence.ts`) | Reprendre une partie, avec migration de schéma legacy                                                                | Non                                              | IndexedDB                                                                | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Quoi de 9 (repli)                              | `localStorage["qui-des-9:current-game"]`                                                                  | Repli si IndexedDB indisponible                                                                                      | Non                                              | localStorage                                                             | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Partie en cours — Quoi de 9 (dernier repli)                      | `window.name`, préfixe `qui-des-9-game:`                                                                  | Dernier repli si IndexedDB et localStorage sont tous deux indisponibles (certains modes de navigation privée WebKit) | Non                                              | `window.name` (survit aux rechargements, pas à la fermeture de l'onglet) | Session du navigateur                                                             | Exécution du service demandé                          | Se vide automatiquement à la fermeture de l'onglet, ou via le bouton d'effacement                |
| Réponses / choix en jeu (tous les jeux)                          | Mémoire + objets ci-dessus                                                                                | Faire fonctionner la partie                                                                                          | Non                                              | Idem que la partie associée                                              | Idem                                                                              | Idem                                                  | Idem                                                                                             |
| Contenu des jeux (questions, cartes, règles)                     | `src/games/*/data/`, bundlé au build                                                                      | Contenu du jeu lui-même, pas une donnée utilisateur                                                                  | N/A                                              | Fichier statique livré avec l'app                                        | N/A                                                                               | N/A                                                   | N/A                                                                                              |
| Cache applicatif (assets, HTML, JS)                              | Cache API du Service Worker (`public/sw.js`)                                                              | Fonctionnement hors ligne de la PWA                                                                                  | Non                                              | Cache du navigateur                                                      | Jusqu'à mise à jour de version ou suppression                                     | Exécution du service demandé                          | Réglages navigateur ("Effacer les données de site"), ou automatique à chaque nouveau déploiement |
| Échéance du repos Sport actif                                    | `localStorage["antaverse:sport:rest-timer"]` (`src/sport/use-rest-timer.ts`)                               | Reprendre le compte à rebours et synchroniser l’affichage système                                                                      | Non                                              | localStorage                                                             | Jusqu’à l’arrêt ou l’expiration du repos                                     | Exécution du service demandé                          | Automatique à l’arrêt/expiration, ou bouton d’effacement des données locales |
| Indicateur technique de reprise après échec de chargement CSS    | `sessionStorage["antaverse:sw-recovery"]` (`src/app/layout.tsx`)                                          | Éviter une boucle de rechargement infinie après un déploiement                                                       | Non                                              | sessionStorage                                                           | Le temps de la session d'onglet                                                   | Exécution du service demandé                          | Automatique (supprimé dès le chargement réussi)                                                  |
| Outil de relecture éditoriale Quoi de 9                          | `localStorage["qui-des-9-content-review-<version>"]` (`src/app/quoi-de-9/admin/contenu`)                  | Outil interne de relecture de contenu                                                                                | Non                                              | localStorage                                                             | N/A                                                                               | N/A                                                   | N/A                                                                                              |
| Journaux techniques de connexion (IP, date/heure, page demandée) | Infrastructure de l'hébergeur (Vercel)                                                                    | Livraison technique des pages                                                                                        | Oui, mais **par l'hébergeur**, pas par AntaVerse | Hors du contrôle direct d'AntaVerse                                      | Selon la politique de rétention de l'hébergeur                                    | Nécessité technique / intérêt légitime de l'hébergeur | Selon l'hébergeur                                                                                |

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

## Données uniquement locales — confirmation (régime "base de l'app")

Tout ce qui figure dans le tableau ci-dessus, à l'exception explicite des
journaux d'hébergement, **reste techniquement sur l'appareil de
l'utilisateur** : aucun appel réseau applicatif ne transmet ces valeurs.
C'est une vérification de code (absence de `fetch`/`axios`/XHR dans `src/`
hors `src/sport/cloud/`), pas une supposition. Les données transmises par la
couche compte Sport cloud sont listées séparément ci-dessous.

## Compte Sport cloud (Supabase) — régime optionnel

Source auditée : `src/sport/cloud/*`, `supabase/migrations/*.sql`,
`supabase/functions/send-session-push/index.ts`, `src/app/legal/confidentialite`.

**Conditions d'activation cumulatives** : (1) `NEXT_PUBLIC_SUPABASE_URL` et
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` définis au build ; (2) code exécuté
sous le layout `/sport` ; (3) l'utilisateur crée un compte. Sans compte, le
carnet Sport reste dans le régime local ci-dessus. Aucun jeu n'initialise
Supabase. Seul le **carnet Sport** est synchronisé : rien des jeux d'ambiance.

| Donnée | Où | Finalité | Destinataire(s) | Stockage / durée | Base | Suppression |
| --- | --- | --- | --- | --- | --- | --- |
| E-mail du compte (si connexion e-mail) | Supabase Auth (`auth.users`) | Authentification, récupération de mot de passe | Supabase (sous-traitant) ; SMTP configuré par l'éditeur pour les e-mails de récupération | Jusqu'à suppression du compte | Exécution du service demandé (compte) | `/sport/compte` → suppression du compte (cascade) |
| Mot de passe | Supabase Auth, haché côté serveur (jamais dans les sauvegardes ni le client) | Authentification | Supabase | Idem compte | Idem | Idem |
| Identité Google / Apple (si connexion sociale) | OAuth web PKCE ; identifiant fournisseur + e-mail renvoyés à Supabase Auth | Authentification sans mot de passe | Google **ou** Apple (au choix de l'utilisateur) + Supabase | Idem compte | Consentement (choix du bouton) | Idem ; révocable aussi côté fournisseur |
| Pseudo | `public.profiles.username` | Identifier l'utilisateur auprès de ses amis ; liste publique des joueurs Sport connectés (pseudo + id, **sans e-mail**) | Supabase ; visible par tout utilisateur connecté | Idem compte | Exécution du service | Modifiable dans `/sport/compte` ; supprimé avec le compte |
| Carnet Sport (séances datées, exercices, séries, matériel, charges, répétitions, configs et séances favorites, séance active) | `public.backups.payload` (JSON) | Sauvegarde et restauration multi-appareils | Supabase | Jusqu'à suppression du compte | Exécution du service demandé | Suppression du compte, ou effacement local + non-reconnexion |
| 10 révisions précédentes du carnet | `public.backup_versions` | Restauration / résolution de conflit | Supabase | Fenêtre glissante de 10 révisions | Idem | Idem ; purge automatique au-delà de 10 |
| Séances **terminées** individualisées | `public.sport_sessions` | Partage avec les amis acceptés | Supabase ; **amis acceptés uniquement** (RLS) | Idem compte ; suivent corrections/suppressions d'historique | Partage demandé par l'utilisateur | Corriger/supprimer la séance, retirer l'ami, supprimer le compte |
| Relations d'amitié (demandeur, destinataire, date d'acceptation) | `public.friendships` | Gérer les demandes et l'accès aux séances | Supabase ; les deux participants | Jusqu'au retrait d'ami ou suppression de compte | Exécution du service | Retirer l'ami ; cascade à la suppression de compte |
| « J'aime » sur une séance partagée (auteur, séance, date) | `public.session_likes` | Réaction sociale | Supabase ; propriétaire de la séance + amis communs | Jusqu'au retrait, suppression de la séance ou du compte | Exécution du service demandé | L'auteur retire son like ; cascade |
| Commentaire sur une séance partagée (texte 1–500 car., auteur, date) — **UGC** | `public.session_comments` | Réaction sociale | Supabase ; propriétaire de la séance + amis communs | Jusqu'à suppression | Exécution du service demandé | L'auteur, ou le propriétaire de la séance, supprime le commentaire ; cascade |
| Abonnement Web Push (endpoint, clés `p256dh`/`auth`) | `public.push_subscriptions` ; navigateur | Envoyer une notification « un ami a terminé une séance » | Supabase ; service push du navigateur (Google/Mozilla/Apple/Microsoft selon le navigateur) | Jusqu'à désactivation, déconnexion de l'appareil, ou expiration (nettoyée sur 404/410) | Consentement (permission navigateur) | Bouton Social « désactiver », déconnexion, réglages navigateur |
| File de tâches push + événements de séance | `public.push_jobs`, `public.session_events` | Livraison différée / anti-doublon des notifications | Supabase (interne, non exposé aux clients) | `push_jobs` purgées après 7 jours ; `session_events` conservés pour dédoublonnage | Exécution du service | Cascade à la suppression de compte |
| Adresse IP de l'appareil | Vue par Supabase (et les services OAuth / push) comme par tout serveur contacté | Acheminement des requêtes | Supabase / fournisseurs concernés | Selon la rétention du prestataire | Nécessité technique | Hors contrôle direct d'AntaVerse |

Notes :

- Le contenu des notifications se limite au pseudo de l'ami et au fait
  qu'une séance est terminée — **aucun détail d'exercice**.
- `push.ts` refuse volontairement de s'activer dans la coquille native
  Capacitor : le Web Push ne cible que la PWA installée.
- L'edge function `send-session-push` s'exécute avec la clé service-role
  Supabase, s'authentifie par un secret de worker (jamais appelable depuis
  le navigateur) et n'envoie que vers une liste blanche d'hôtes push. Elle
  ne journalise jamais les endpoints ni les clés.
- Suppression de compte : `public.delete_my_account()` supprime la ligne
  `auth.users`, ce qui cascade vers profil, sauvegardes, révisions, séances,
  amitiés, likes, commentaires et abonnements.

## Ce qui a changé cette conclusion / ce qui la changerait encore

**Changé (2026-09)** : ajout du module Sport et de sa couche compte cloud
Supabase — premier backend, premier système de compte, premières
fonctionnalités sociales/UGC, premier Web Push. Documenté ci-dessus et dans
`THIRD_PARTY_SERVICES.md`, `PERMISSIONS_INVENTORY.md`, `SECURITY_OVERVIEW.md`,
`FUTURE_SOCIAL_REQUIREMENTS.md`, `docs/store/APPLE_PRIVACY_DECLARATION.md`,
`docs/store/GOOGLE_DATA_SAFETY.md` et `/legal/confidentialite`.

**À ré-auditer** si l'une de ces choses est ajoutée : outil d'analytics, SDK
tiers supplémentaire, nouvelle table ou nouveau champ synchronisé, extension
du partage social, monétisation, publicité, wrapper natif avec ses propres
SDK, push natif (APNs / FCM). Pour Android, ré-auditer à chaque ajout de
plugin Capacitor ou modification du manifeste.
