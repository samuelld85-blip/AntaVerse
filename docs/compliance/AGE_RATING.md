# Classification d'âge — éléments à déclarer

Dernière vérification des exigences stores : 2026-08-20. À revalider juste
avant soumission (questionnaires Apple App Store Connect et Google Play
IARC changent occasionnellement de formulation).

Ce document liste, honnêtement, ce que le contenu réel d'AntaVerse impose de
déclarer — sans chercher à obtenir artificiellement une classification plus
basse. Basé sur l'audit de contenu de
`docs/compliance/ALCOHOL_STORE_AUDIT.md` et une lecture directe des bancs de
contenu de Roulette du Chaos.

## Thèmes présents, par catégorie de questionnaire

| Thème | Présent ? | Où | Détail |
|---|---|---|---|
| Références à l'alcool | **Oui** | Purple, Triman, Roulette du Chaos, Palmier, Fuck, mode Fun de Quoi de 9 et Sans le dire | Mécanique de "gorgées" centrale à 5 jeux sur 8 ; voir `ALCOHOL_STORE_AUDIT.md` |
| Références aux drogues | **Oui, en tant que sujet évoqué** | `roulette-du-chaos/data/content/extreme-questions.ts`, `never-have-i-ever.ts` | Questions du type "qui a testé le plus de substances différentes", "je n'ai jamais consommé une drogue en festival" — évoquées comme sujet de discussion entre adultes, aucune mécanique n'implique de consommation réelle de drogue, ni n'en fait la promotion |
| Contenu sexuel suggestif ou explicite en texte | **Oui** | `extreme-questions.ts`, `never-have-i-ever.ts` | Questions explicites ("partenaires sexuels", "nude", "rapport sexuel") ; texte uniquement, aucune image |
| Langage adulte / grossier | **Oui** | Nom du jeu **Fuck** (`src/lib/games.ts`) | Le titre du jeu est explicitement grossier/adulte, même si son contenu de cartes reste neutre |
| Violence | Non | — | Aucun contenu violent identifié |
| Gambling / simulated gambling | Non | — | Purple et Triman utilisent des mécaniques de hasard (cartes, dés) mais sans mise d'argent réelle ou virtuelle, ni gain/perte monétaire — ce n'est pas un jeu d'argent simulé au sens des politiques stores |
| Contenu généré par les utilisateurs (UGC) | Non applicable aujourd'hui | — | Aucune fonctionnalité de ce type n'existe dans le code ; voir `FUTURE_SOCIAL_REQUIREMENTS.md` |
| Chat / messagerie | Non applicable aujourd'hui | — | Aucune fonctionnalité de ce type n'existe |

## Lecture honnête de la classification probable

Le mélange (alcool en mécanique de jeu + questions explicitement sexuelles +
évocation de drogues récréatives, même sans promotion) place vraisemblablement
AntaVerse dans une tranche **mature / 17+** sur les deux plateformes, pas
dans une tranche "tout public" ou "adolescents". Il ne faut pas essayer
d'obtenir une classification plus basse en minimisant ces éléments dans les
questionnaires : les deux stores peuvent re-classer une application après
coup s'ils jugent la déclaration initiale trop optimiste, ce qui est plus
coûteux (retrait potentiel) qu'une classification correcte dès le départ.

La classification peut légitimement varier par pays/territoire selon les
grilles locales (PEGI-like en Europe pour Google, système Apple par région) —
ce sera déterminé par les questionnaires eux-mêmes au moment de la
soumission, pas par ce document.

## Apple App Store Connect — préparation du questionnaire

Le questionnaire Apple (Age Rating, dans App Store Connect) demande une
fréquence par thème ("Aucun", "Infrequent/Mild", "Frequent/Intense"). Sur la
base de l'audit :

- Alcool, tabac, drogues (références/usage) : à répondre honnêtement en
  "Infrequent/Mild" a minima compte tenu de la mécanique de gorgées centrale
  à plusieurs jeux — à réévaluer précisément question par question au
  moment de remplir le formulaire réel, dont le libellé exact peut différer
  de cette paraphrase.
- Contenu sexuel / nudité : présence de texte suggestif/explicite sans
  image — à déclarer, catégorie exacte à choisir dans le formulaire réel.
- Le reste des catégories (violence, horreur, jeux d'argent simulés,
  contenu généré par les utilisateurs) : "Aucun" sur la base du contenu
  actuel.

## Google Play — préparation du questionnaire IARC

Même logique : le questionnaire IARC (rempli dans Play Console, section
"Classification du contenu") pose des questions factuelles sur la présence
et la fréquence de chaque thème, puis calcule une classification. Préparer
les réponses sur les mêmes bases que ci-dessus : alcool (oui, usage
simulé/évoqué en mécanique de jeu), drogues (oui, évoquées sans usage
simulé), contenu sexuel (oui, texte suggestif/explicite), le reste "non" sur
la base du contenu actuel.

## Ce qui changerait cette classification

Toute nouvelle fonctionnalité touchant ces thèmes (nouveaux bancs de
questions, nouveau jeu à contenu mature, UGC, chat) doit déclencher une
relecture de ce document avant publication d'une mise à jour, pas seulement
avant la première soumission.
