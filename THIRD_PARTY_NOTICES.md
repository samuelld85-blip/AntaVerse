# Mentions tierces

Dernière vérification technique : 2026-08-20. AntaVerse embarque, dans son
build de production, les bibliothèques suivantes (dépendances de
production réelles de `package.json` — les `devDependencies`, outils de
build/test, ne sont pas distribuées avec l'application).

| Bibliothèque | Licence | Rôle |
|---|---|---|
| [Next.js](https://nextjs.org) | MIT | Framework applicatif |
| [React](https://react.dev) | MIT | Bibliothèque d'interface utilisateur |
| [React DOM](https://react.dev) | MIT | Rendu React pour le navigateur |
| [idb](https://github.com/jakearchibald/idb) | ISC | Enveloppe utilitaire autour d'IndexedDB |
| [Zod](https://zod.dev) | MIT | Validation de schémas de données |

Toutes ces licences (MIT, ISC) sont permissives et n'imposent pas de
republier le code source d'AntaVerse ; elles demandent généralement de
conserver l'avis de copyright et la licence dans les distributions du code
source de la bibliothèque elle-même (déjà satisfait : ce dépôt ne modifie
pas le code source de ces bibliothèques, installées via npm).

## Polices, icônes, images, sons

Aucune police tierce n'est embarquée dans le dépôt à ce jour (pile de
polices système, voir `docs/compliance/THIRD_PARTY_SERVICES.md`). Les
logos, icônes de jeu et images dans `public/brand/` et `public/icons/`
doivent être vérifiés individuellement avant commercialisation — voir
`docs/compliance/IP_CHECKLIST.md`. Aucun son n'est embarqué dans
l'application à ce jour.

## Mise à jour

Ce fichier doit être régénéré si de nouvelles dépendances de production
sont ajoutées à `package.json`, ou si des assets tiers (polices, sons,
images sous licence) sont ajoutés au dépôt.
