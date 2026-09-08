# Prestataires et SDK tiers

Dernière vérification technique : 2026-09-08.

## Méthode

Audit de `package.json` (dépendances de production uniquement — les
`devDependencies` ne sont pas embarquées dans l'application livrée) et
recherche d'imports réels dans `src/`. Distinction stricte entre
**bibliothèque pure** (code exécuté localement, aucune communication
réseau) et **SDK** (communique avec un serveur).

## Dépendances de production réelles

| Paquet                                   | Rôle                                                                               | Communique avec un serveur ?                                  | Déclaration Apple Privacy / Google Data Safety nécessaire ? |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| `next`                                   | Framework applicatif (compile-time + runtime React)                                | Non — export statique, aucun runtime serveur Next côté client | Non                                                         |
| `react` / `react-dom`                    | Bibliothèque d'interface utilisateur                                               | Non                                                           | Non                                                         |
| `idb`                                    | Enveloppe utilitaire autour de l'API IndexedDB native du navigateur                | Non — 100 % local                                             | Non                                                         |
| `zod`                                    | Validation de schémas de données                                                   | Non — 100 % local                                             | Non                                                         |
| `@capacitor/core` / `@capacitor/android` / `@capacitor/ios` | Pont et conteneur natif Android/iOS ; sert les fichiers statiques et expose le chronomètre système local | Non — aucun service distant Capacitor n'est configuré | Non |
| `@supabase/supabase-js` | **SDK** du backend Sport : Auth (e-mail/mot de passe, OAuth Google/Apple), base PostgreSQL (carnet, amis, likes/commentaires), abonnements Web Push | **Oui** — mais uniquement importé par `src/sport/cloud/`, uniquement si Supabase est configuré au build, uniquement sur `/sport`, et sans effet tant qu'aucun compte n'est créé | **Oui** dès que la couche compte est activée en production — voir `docs/store/APPLE_PRIVACY_DECLARATION.md` et `GOOGLE_DATA_SAFETY.md` |

À l'exception de `@supabase/supabase-js`, **aucune de ces dépendances n'est
un SDK de collecte** : ce sont des bibliothèques exécutées entièrement dans
le navigateur/l'appareil, sans appel réseau vers un serveur tiers.

## Supabase — le backend du module Sport

Prestataire : **Supabase** (base PostgreSQL managée, service
d'authentification, Edge Functions Deno). Utilisé **uniquement** par la
couche compte optionnelle du module Sport (`src/sport/cloud/`, `supabase/`).

- **Activation** : conditionnée à `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` au build, à la route `/sport`, et à
  la création d'un compte par l'utilisateur. Un build sans ces variables
  n'initialise jamais le client Supabase.
- **Ce qui transite** : voir le tableau détaillé dans
  `docs/compliance/DATA_INVENTORY.md` § "Compte Sport cloud". En résumé :
  identité de connexion (e-mail ou identité Google/Apple), pseudo, carnet
  Sport et ses 10 dernières révisions, relations d'amitié, likes/commentaires
  d'amis sur des séances terminées, abonnements Web Push.
- **Région** : choisie à la création du projet Supabase (préférer l'UE pour
  ce public). L'éditeur doit renseigner la région retenue et vérifier les
  garanties de transfert avant activation en production —
  `/legal/confidentialite` § 7.
- **Sous-traitance / e-mails** : les e-mails de récupération de mot de passe
  passent par le SMTP de production configuré par l'éditeur dans Supabase.
- **Edge Function `send-session-push`** : s'exécute côté Supabase avec la
  clé service-role, authentifiée par un secret de worker, jamais appelée
  depuis le navigateur. Elle relaie les notifications vers les services push
  des navigateurs (voir ci-dessous).
- **Secrets** : le client ne reçoit que l'URL Supabase, la clé *publiable*
  et la clé VAPID *publique*. Clé service-role, secrets OAuth, mot de passe
  de base et clé VAPID privée restent côté serveur — jamais dans
  `NEXT_PUBLIC_*` ni `src/`.

## Connexions sociales — Google et Apple

Si l'utilisateur choisit « Continuer avec Google » ou « Continuer avec
Apple », une authentification OAuth web (PKCE) a lieu avec le fournisseur
choisi, qui renvoie un identifiant et une adresse e-mail à Supabase Auth.
Ces boutons n'apparaissent que si le fournisseur est configuré côté
Supabase. Aucun SDK Google/Apple n'est embarqué dans l'app ; il s'agit d'une
redirection navigateur. Les politiques de Google et d'Apple s'appliquent à
ce traitement.

## Services de push des navigateurs

Un abonnement Web Push est acheminé par le service push du navigateur de
l'utilisateur (`fcm.googleapis.com`, `updates.push.services.mozilla.com`,
`*.push.apple.com`, `*.notify.windows.com`). L'edge function n'envoie que
vers cette liste blanche. Ce sont des relais techniques, pas des SDK
intégrés.

## Analytics, mesure d'audience, publicité, monitoring

**Aucun.** Recherche explicite (imports, `package.json`) de : `@vercel/analytics`,
`@vercel/speed-insights`, Google Analytics/`gtag`, Meta Pixel, PostHog,
Mixpanel, Sentry, Amplitude, Hotjar, Segment — aucun résultat. Le seul appel
réseau applicatif du dépôt est le client Supabase, confiné à
`src/sport/cloud/` (voir plus haut) ; il ne fait ni mesure d'audience ni
suivi. Aucun `fetch`/`axios`/XHR ailleurs dans `src/`
(voir `docs/compliance/DATA_INVENTORY.md`).

## Hébergement

**Vercel** héberge le build statique (`vercel.json` présent à la racine,
`next.config.ts` configuré en `output: "export"`). Vercel traite
nécessairement les journaux techniques de connexion pour livrer les pages —
voir `docs/compliance/DATA_INVENTORY.md`. Ce n'est pas un SDK intégré au
code de l'application, mais un prestataire d'infrastructure ; ses propres
conditions et sa politique de confidentialité s'appliquent à ce traitement,
indépendamment du code d'AntaVerse.

Dans la version Android packagée, l'interface et les jeux sont servis depuis
les assets inclus dans l'AAB et ne dépendent pas de Vercel au lancement. Les
journaux de livraison Vercel ne concernent donc pas l'usage hors ligne de ce
bundle. Une navigation volontaire vers une future URL publique externe de
support ou de confidentialité repasserait naturellement par son hébergeur.

## Polices et assets externes

Aucune police chargée depuis un CDN externe (pas de `fonts.google.com`, pas
de `@font-face` distant, pas de `next/font/google` dans le code) : la pile
de polices déclarée (`"Space Grotesk", Inter, sans-serif` dans
`src/app/globals.css`) retombe sur les polices système si elles ne sont pas
installées — aucune requête réseau associée.

## Historique et déclencheurs

**2026-09** : ajout de Supabase (Auth + PostgreSQL + Edge Functions) comme
backend du module Sport, avec connexions OAuth Google/Apple optionnelles et
relais Web Push. Répercuté dans `docs/compliance/DATA_INVENTORY.md`,
`PERMISSIONS_INVENTORY.md`, `SECURITY_OVERVIEW.md`,
`FUTURE_SOCIAL_REQUIREMENTS.md`, `docs/store/APPLE_PRIVACY_DECLARATION.md`,
`docs/store/GOOGLE_DATA_SAFETY.md` et `/legal/confidentialite`.

L'ajout de tout SDK, script tiers, prestataire, ou appel réseau vers un
domaine externe supplémentaire doit déclencher une mise à jour immédiate de
ce fichier et des documents ci-dessus — voir la règle dans CLAUDE.md.
