# Prestataires et SDK tiers

Dernière vérification technique : 2026-08-20.

## Méthode

Audit de `package.json` (dépendances de production uniquement — les
`devDependencies` ne sont pas embarquées dans l'application livrée) et
recherche d'imports réels dans `src/`. Distinction stricte entre
**bibliothèque pure** (code exécuté localement, aucune communication
réseau) et **SDK** (communique avec un serveur).

## Dépendances de production réelles

| Paquet | Rôle | Communique avec un serveur ? | Déclaration Apple Privacy / Google Data Safety nécessaire ? |
|---|---|---|---|
| `next` | Framework applicatif (compile-time + runtime React) | Non — export statique, aucun runtime serveur Next côté client | Non |
| `react` / `react-dom` | Bibliothèque d'interface utilisateur | Non | Non |
| `idb` | Enveloppe utilitaire autour de l'API IndexedDB native du navigateur | Non — 100 % local | Non |
| `zod` | Validation de schémas de données | Non — 100 % local | Non |

**Aucune de ces quatre dépendances n'est un SDK au sens où l'entend cet
audit** : ce sont des bibliothèques exécutées entièrement dans le
navigateur/l'appareil de l'utilisateur, sans appel réseau vers un serveur
tiers. Aucune n'a donc à être déclarée comme "collecte de données par un
tiers" dans les formulaires Apple ou Google.

## Analytics, mesure d'audience, publicité, monitoring

**Aucun.** Recherche explicite (imports, `package.json`) de : `@vercel/analytics`,
`@vercel/speed-insights`, Google Analytics/`gtag`, Meta Pixel, PostHog,
Mixpanel, Sentry, Amplitude, Hotjar, Segment — aucun résultat. Confirmé
également par l'absence totale d'appel `fetch`/`axios`/XHR dans `src/`
(voir `docs/compliance/DATA_INVENTORY.md`).

## Hébergement

**Vercel** héberge le build statique (`vercel.json` présent à la racine,
`next.config.ts` configuré en `output: "export"`). Vercel traite
nécessairement les journaux techniques de connexion pour livrer les pages —
voir `docs/compliance/DATA_INVENTORY.md`. Ce n'est pas un SDK intégré au
code de l'application, mais un prestataire d'infrastructure ; ses propres
conditions et sa politique de confidentialité s'appliquent à ce traitement,
indépendamment du code d'AntaVerse.

## Polices et assets externes

Aucune police chargée depuis un CDN externe (pas de `fonts.google.com`, pas
de `@font-face` distant, pas de `next/font/google` dans le code) : la pile
de polices déclarée (`"Space Grotesk", Inter, sans-serif` dans
`src/app/globals.css`) retombe sur les polices système si elles ne sont pas
installées — aucune requête réseau associée.

## Ce qui déclencherait une mise à jour de ce document

L'ajout de tout SDK, script tiers, ou appel réseau vers un domaine externe
doit déclencher une mise à jour immédiate de ce fichier, de
`docs/compliance/DATA_INVENTORY.md`, de `docs/store/APPLE_PRIVACY_DECLARATION.md`
et de `docs/store/GOOGLE_DATA_SAFETY.md` — voir la règle ajoutée dans
CLAUDE.md.
