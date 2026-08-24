# Audit critique — contenu alcool et politique des stores

Dernière vérification des exigences stores : 2026-08-24. Les politiques
Apple et Google évoluent régulièrement — à revalider juste avant toute
soumission réelle sur les pages officielles (App Review Guidelines §1.4.3,
Google Play Alcohol content policy).

**Ce document n'est pas un avis juridique.** C'est un audit de code (contenu
réellement présent dans `src/games/`), confronté aux politiques publiques
des deux stores, pour éclairer une décision produit.

## Ce que disent les stores, en substance

- **Apple** (App Review Guidelines 1.4.3) : les apps facilitant la vente ou
  la consommation excessive d'alcool, de tabac ou de drogues sont
  interdites ; le contenu lié à l'alcool doit être classé de façon adéquate
  et ne peut pas cibler les mineurs.
- **Google Play** (politique Tobacco & Alcohol) : interdit le contenu qui
  fait la promotion de la consommation excessive ou dangereuse d'alcool, ou
  qui présente favorablement le "binge drinking" / les compétitions de
  consommation ; le contenu alcool doit être classé correctement (IARC) et
  ne peut cibler les mineurs.

Un simple disclaimer « buvez avec modération » **ne suffit pas** si une
mécanique de jeu est, en elle-même, structurée comme une compétition de
consommation ou une incitation à boire une grande quantité d'un coup — c'est
le point le plus important de cet audit.

## Jeux inventoriés

Registre réel (`src/lib/games.ts`) : 10 jeux, dont 7 marqués
`drinkingGame: true` (Purple, Triman, Roulette du Chaos, Palmier, Fuck,
La Traversée et PMU) et 2 avec un mode "Fun" optionnel à gorgées (Quoi de 9,
Sans le dire) en plus de leur mode Compétition sans alcool. La Relance n'a
aucun contenu alcool.

---

## Classification par mécanique

Ce document évalue le risque basé sur les politiques publiques, pas comme une
certitude juridique absolue. Les sections 🔴 ci-dessous décrivent des
mécaniques qui présentent un **risque suffisamment sérieux pour justifier une
action avant soumission**, selon notre lecture des exigences Apple/Google.
Seuls les reviewers officiels (Apple Review, Google Play) trancheront au final.

### 🔴 Risque sérieux à traiter avant soumission

**Purple — le mécanisme central du jeu (`src/games/purple/`).**

> Règle réelle (`src/app/purple/regles/page.tsx`) : "Chaque carte réussie
> ajoute 1 gorgée au pot commun... Une carte ratée fait boire tout le pot au
> joueur en cours." Le pot n'a pas de plafond dans le code
> (`src/games/purple/features/game/game-client.tsx`, `game.pile`) : il
> grandit tant que les tirages réussissent, et celui qui échoue boit
> **la totalité accumulée en une seule fois**.

C'est la mécanique classique dite du "pot qui grimpe" : elle peut, par
construction, aboutir à faire boire une quantité importante d'un coup à une
seule personne, sans plafond annoncé. C'est précisément le type de
mécanique que les deux politiques citent (consommation excessive en une
fois, mise en scène compétitive de "qui écope du gros pot"). C'est le jeu
entier, pas un seul événement rare — donc pas contournable par une simple
reformulation de texte.

_Solution produit minimale, à valider avec vous avant toute mise en œuvre :_
un plafond visible sur le pot (ex. "le pot ne dépasse jamais 6 gorgées, le
surplus est offert au groupe entier plutôt qu'à une seule personne"), ou
transformer "boire tout le pot" en "distribuer le pot" comme le fait déjà
Roulette du Chaos pour ses événements à forte valeur. **Aucune mécanique
n'a été modifiée dans ce chantier** — ce choix vous appartient.

**Palmier — carte As, "Cascade" (`src/games/palmier/data/card-rules.ts`).**

> "Tout le monde boit en cascade. Le joueur actif commence à boire. Le
> joueur suivant peut s'arrêter uniquement après lui, et ainsi de suite."

C'est la mécanique dite "waterfall" : chaque joueur ne peut s'arrêter que
lorsque le précédent s'arrête, sans durée plafonnée dans le texte — la durée
réelle dépend de combien de temps le premier joueur choisit de boire, ce qui
en fait une mécanique ouverte plutôt que bornée.

_Solution produit minimale :_ fixer une durée ou un nombre de gorgées
explicite dans le texte de la règle (ex. "chacun boit au maximum 3 gorgées
avant de pouvoir s'arrêter"), pour que la règle elle-même porte une limite
plutôt que de reposer sur le bon sens du groupe.

**Palmier — 4ᵉ Roi, carte "CUL SEC" (`src/games/palmier/data/card-rules.ts`).**

> `getKingRule(4)` : titre "TU AS FAIT TOMBER LE PALMIER", corps **"CUL SEC !"**
> — instruction explicite de terminer une boisson d'un trait.

Un événement rare (un seul par partie, au 4ᵉ Roi tiré) mais une instruction
littérale et sans ambiguïté de "cul sec", explicitement le type de formulation
que la politique alcool de Google cite comme signal de consommation
dangereuse.

_Solution produit minimale :_ remplacer l'instruction par une pénalité
bornée en gorgées (cohérente avec le reste du jeu, ex. "bois 4 gorgées")
plutôt qu'une injonction à finir un verre entier.

---

### 🟠 À reformuler (risque modéré, correctif de texte suffisant)

**Triman — règle "Double" (`src/games/triman/lib/game/rules.ts`).**

> Sur un double au dé : "boit N gorgées et en distribue N", N pouvant
> atteindre 6 (double six) — jusqu'à 6 gorgées personnelles + 6 distribuées
> sur un seul lancer.

C'est un plafond net (6 est le maximum possible avec deux dés), donc borné
et prévisible — mais la combinaison la plus élevée mérite d'être vérifiée
lors d'un futur passage en revue éditorial, sans urgence.

**PMU — mises et gains (`src/games/pmu/`).**
Chaque joueur choisit une mise bornée de 1 à 5 gorgées. Un pari perdant fait
prendre cette mise ; un pari gagnant permet d'en distribuer le double, soit
jusqu'à 10 gorgées. La perte individuelle est plafonnée à 5, mais le gain à
distribuer est plus élevé que dans plusieurs autres jeux : conserver une
répartition entre plusieurs personnes et éviter toute formulation permettant
d'imposer les 10 à une seule personne.

**Roulette du Chaos — catégorie JACKPOT (`data/events/jackpot.ts`).**
Événements rares distribuant jusqu'à 8–9 gorgées, mais **toujours en mode
"distribue"** (réparties entre plusieurs joueurs, "gérez entre vous"), avec
des plafonds explicites sur plusieurs événements ("maximum 3 par personne",
"maximum 2 gorgées maximum"). Le commentaire du fichier source lui-même
précise l'intention : _"Never punishes with more than the group can
handle."_ Risque plus faible que Purple/Palmier car ce n'est jamais une
seule personne qui absorbe le total, et l'intention de conception est déjà
alignée avec les politiques des stores.

**Roulette du Chaos — bancs de contenu `never-have-i-ever.ts` et
`extreme-questions.ts`.**
Contiennent des références explicites à l'alcool ("grosse cuite",
"ivre le plus vite", "tient le mieux l'alcool") mêlées à des références à
des drogues récréatives et à du contenu sexuel explicite. Rien n'y
glorifie la consommation excessive comme un objectif à atteindre — ce sont
des questions de type "qui, parmi vous" ou des affirmations "je n'ai
jamais" — mais la densité de ce contenu justifie une classification d'âge
élevée assumée plutôt que minimisée. Voir `docs/compliance/AGE_RATING.md`.
Ce point n'est pas un risque _alcool_ à proprement parler, il est documenté
ici parce que le contenu est mélangé dans les mêmes bancs.

---

### 🟢 Faible risque

- **Roulette du Chaos — catégorie SUBIS** (`data/events/subis.ts`) :
  pénalités individuelles bornées (2 à 4 gorgées), pas de mécanique de
  compétition.
- **Roulette du Chaos — catégorie DISTRIBUE** (`data/events/distribue.ts`) :
  distribution entre plusieurs joueurs, quantités bornées (2 à 5 gorgées),
  jamais une seule personne ne boit un total non plafonné.
- **Palmier — cartes numérotées 2 à 10, J, Q** (`card-rules.ts`) : gorgées
  fixes et bornées (1 à 4), mini-jeux sociaux (mime, catégories, rimes) —
  cohérent avec un jeu de soirée classique.
- **Quoi de 9 — mode Fun, difficultés 1 et 2** (`fun-rewards.ts`) :
  plafonds bas (3 gorgées max en difficulté 1, 4 en difficulté 2).
- **Triman — règles de somme (7, 9, 11) et réflexes** (`rules.ts`) :
  1 à 3 gorgées, bornées, mécaniques de réflexe classiques (dernier à poser
  le doigt/poing boit) sans compétition de vitesse de consommation.
- **La Traversée** (`src/games/la-traversee/`) : une erreur fait boire le
  nombre d'étapes tentées, avec un plafond technique explicite de 6
  (`MAX_ROUND_GUESSES`). La pénalité est bornée et ne met pas en scène une
  vitesse de consommation.
- **`mime-words.ts` / `voice-styles.ts`** : mimes/imitations mentionnant
  "être bourré" comme thème à jouer (ex. "marcher droit en étant
  complètement bourré") — évoquent l'ivresse comme sujet comique/social,
  n'instruisent aucune consommation réelle.
- **`verdict-statements.ts`** : une phrase-jugement sur la sobriété du
  groupe, purement déclarative, aucune instruction de consommation.

### ⚠️ À examiner (donnée insuffisante pour trancher seul)

**Quoi de 9 — mode Fun, difficulté 3** (`fun-rewards.ts`,
`calculateFunSips`) : à la difficulté la plus haute, la fonction retourne
`effectiveCorrectAnswers` directement, soit jusqu'à 9 gorgées pour un seul
tour réussi à 100 %. Le code ne précise pas ici si ces gorgées sont bues par
une seule personne ou réparties dans l'équipe qui répond — cette
distinction change la classification. À vérifier dans l'écran de jeu
(`src/games/quoi-de-9/features/game/`) avant de trancher ; non modifié dans
ce chantier.

---

## Recommandation d'ensemble

Ne pas soumettre l'application aux stores sans traiter au minimum les deux
points 🔴 les plus structurels : **le pot non plafonné de Purple** et **la
cascade non bornée de Palmier**. Ce sont des mécaniques centrales (tout
Purple, et l'une des cartes les plus mémorables de Palmier), donc un simple
avertissement en page "Jeu responsable" ne suffira probablement pas à lui
seul à sécuriser la revue — les politiques citées ciblent explicitement la
mécanique de jeu, pas seulement le texte marketing autour.

Le "CUL SEC" de Palmier est plus simple à corriger : remplacer l'instruction
par une quantité bornée resterait fidèle à l'esprit "le palmier tombe, c'est
la fin de la partie" sans le mot-signal que les politiques ciblent
explicitement.

**Aucune de ces mécaniques n'a été modifiée dans ce chantier** —
conformément à la consigne de ne jamais changer silencieusement une
mécanique de jeu importante. Une décision produit reste à prendre avec
vous ; voir le résumé final pour la recommandation consolidée.
