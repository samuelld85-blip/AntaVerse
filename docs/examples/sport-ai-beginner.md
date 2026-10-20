# Assistant Sport — exemples réels sur cinq séances fictives

Modèle : `openai/gpt-6.1-sol`, effort moyen. Réponses obtenues le 20/10/2026 par le même handler que l’application, auprès d’OpenRouter.

Toutes les données ci-dessous sont inventées. Aucun carnet personnel, compte connecté ou service de sauvegarde n’a été utilisé. Les contrôles d’authentification et de quota sont simulés pour cette démonstration ; les réponses du modèle sont réelles et validées par les schémas de l’application.

## Le carnet débutant

Chaque séance est un full body de trois exercices, avec trois séries par exercice. Développé couché : charge totale barre comprise, repos 120 s ; rowing : charge **par haltère**, repos 90 s ; presse : charge machine, repos 120 s. Ces charges illustrent un historique, sans constituer une prescription.

| Séance | Date | Développé couché | Rowing haltères | Presse | Tonnage du carnet |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-03 | 3 × 8 à 20 kg | 3 × 10 à 8 kg/haltère | 3 × 10 à 40 kg | 1 920 kg |
| 2 | 2026-10-06 | 3 × 9 à 20 kg | 3 × 10 à 8 kg/haltère | 3 × 10 à 40 kg | 1 980 kg |
| 3 | 2026-10-10 | 3 × 10 à 20 kg | 3 × 11 à 8 kg/haltère | 3 × 11 à 40 kg | 2 184 kg |
| 4 | 2026-10-13 | 3 × 6 à 25 kg | 3 × 8 à 10 kg/haltère | 3 × 8 à 45 kg | 1 770 kg |
| 5 | 2026-10-17 | 3 × 7 à 25 kg | 3 × 9 à 10 kg/haltère | 3 × 9 à 45 kg | 2 010 kg |

Bilan déterministe : **5 séances, 45 séries, 9 864 kg** selon la convention de tonnage existante (pas de doublement de la charge des haltères). Aucune séance sur la période précédente.

## Le parcours dans l’application

Accueil ou Nouvelle séance → Préparer ma séance / Depuis un texte → choix des données jointes et envoi → conversation + brouillon modifiable → Démarrer cette séance ou Enregistrer en favori. Après la séance, son détail propose Faire le point ; les statistiques proposent Comprendre ma progression. Ouvrir l’assistant ne déclenche aucun appel.

## Préparer ma séance

**Demande utilisateur**

> Je débute. Prépare-moi un full body simple de 30 minutes avec développé couché barre, rowing haltères et presse à cuisses. Tu peux reprendre les charges et répétitions de ma dernière séance : je les confirme pour cette proposition.

**Réponse réelle**

Je reprends les charges et répétitions du 17 octobre que tu as confirmées, avec trois séries par exercice : une poussée, un tirage et un mouvement de jambes. Prévois environ 5 minutes d’échauffement avec des séries légères, puis réalise les exercices dans l’ordre proposé, avec 90 secondes de repos entre les séries : vise environ 30 minutes selon les transitions. Pour cette séance, garde ces paramètres sans chercher l’échec, afin de consolider tes repères techniques.

- Le 17 octobre, tu as consigné trois séries de 7 répétitions au développé couché à 25 kg, de 9 au rowing à 10 kg et de 9 à la presse à cuisses à 45 kg. Les équipements correspondent à ta demande. — Sources : 2026-10-17.

**Brouillon affiché : Full body simple — 30 minutes**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | 90 |
| Rowing | Haltères | 3 | 9 | 10 | 90 |
| Presse à cuisses | Machine | 3 | 9 | 45 | 90 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Ajuster la proposition en conversation

**Demande utilisateur**

> La presse est occupée : remplace uniquement cet exercice par un squat au poids du corps, 2 séries de 10, 90 secondes de repos, sans lest (0 kg). Je confirme ces réglages. Conserve les deux autres exercices. Réponse brève.

**Réponse réelle**

Le brouillon remplace uniquement la presse à cuisses par le squat au poids du corps : 2 séries de 10, 90 secondes de repos, sans lest. Le développé couché barre et le rowing haltères restent inchangés pour conserver tes repères.

**Brouillon affiché : Full body simple — 30 minutes**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | 90 |
| Rowing | Haltères | 3 | 9 | 10 | 90 |
| Squat | Poids du corps | 2 | 10 | 0 | 90 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Importer un programme depuis un texte

**Demande utilisateur**

> Importe ce programme débutant sans ajouter d'exercice : développé couché barre 3 séries de 8 à 20 kg barre comprise, repos 120 secondes ; rowing haltères 3 séries de 10 à 8 kg par haltère, repos 90 secondes. Tous ces réglages sont confirmés. Réponds brièvement.

**Réponse réelle**

Voici le brouillon fidèle à tes réglages confirmés, sans ajout d’exercice. Les charges sont conservées : 20 kg barre comprise et 8 kg par haltère ; aucune écriture automatique n’est effectuée.

**Brouillon affiché : Débutant — Développé couché et rowing**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 8 | 20 | 120 |
| Rowing | Haltères | 3 | 10 | 8 | 90 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Faire le point après la cinquième séance

**Demande utilisateur**

> Milo, qu’est-ce que tu penses de ma dernière séance ? Qu’est-ce que je devrais garder en tête pour la prochaine ?

**Réponse réelle**

Ta séance du 17 octobre garde une structure simple : une poussée, un tirage et un mouvement pour les jambes, avec trois séries chacun. Les répétitions consignées progressent à charges identiques, mais le carnet ne permet pas de vérifier la technique ni l’effort nécessaire. Pour la prochaine, renseigne soigneusement ton ressenti Content/Moyen/Pas content selon les règles du carnet : c’est le repère à conserver pour la suite, plutôt que d’augmenter les charges sur la seule base des chiffres.

- Au développé couché à la barre, tu passes de 3 × 6 répétitions le 13 octobre à 3 × 7 le 17 octobre, toujours à 25 kg. — Sources : 2026-10-13, 2026-10-17.

- Du 13 au 17 octobre, le rowing avec haltère passe de 3 × 8 à 3 × 9 à 10 kg par haltère ; la presse à cuisses passe également de 3 × 8 à 3 × 9, à 45 kg sur machine. — Sources : 2026-10-13, 2026-10-17.

## Comprendre ma progression sur 30 jours

**Demande utilisateur**

> Je débute et j’ai fait ces cinq séances. Est-ce que je suis sur la bonne voie ? Qu’est-ce que tu me conseilles pour la suite ?

**Réponse réelle**

Oui, ton carnet montre un départ cohérent : des séances espacées et davantage de répétitions à charge identique, ce qui est un signe encourageant de progression sur ces exercices. Cela ne permet pas encore de juger ta technique ni de conclure à un gain de muscle. Pour la suite, garde cette routine simple autour de deux séances non consécutives par semaine, sans chercher à augmenter les charges à chaque séance. Note ton ressenti avec Content/Moyen/Pas content : cela aidera à suivre les règles de progression du carnet sans transformer chaque entraînement en test maximal.

- Du 3 au 17 octobre, tes cinq séances sont espacées de trois à quatre jours : ce rythme correspond à un point de départ classique pour débuter en full body. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.

- Entre le 13 et le 17 octobre, à exercice, équipement et charge identiques, tu passes de 6 à 7 répétitions par série au développé couché barre, et de 8 à 9 au rowing haltères ainsi qu’à la presse à cuisses. — Sources : 2026-10-13, 2026-10-17.

- Chaque séance comprend une poussée, un tirage et un exercice de jambes, avec trois séries chacun : une base simple à conserver pour apprendre et comparer tes performances. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.

## Passer du bilan à une séance utilisable

**Demande utilisateur**

> D’accord, prépare ma prochaine séance avec les mêmes trois exercices que la dernière fois. Je confirme la reprise des charges et répétitions de cette dernière séance pour le brouillon. Garde les temps de repos habituels.

**Réponse réelle**

Le brouillon reprend les trois exercices du 17 octobre, avec les charges et répétitions que tu as confirmées, sur trois séries chacun. Garde ces paramètres pour la prochaine séance : cela te donnera un repère comparable sans ajouter d’effort. Les repos habituels ne figurent pas dans le carnet fourni ; je les laisse à compléter plutôt que de les inventer.

- La séance du 17 octobre associe une poussée avec le développé couché, un tirage avec le rowing et un travail des jambes avec la presse à cuisses. — Sources : 2026-10-17.

**Brouillon affiché : Full body — reprise du 17 octobre**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | À préciser |
| Rowing | Haltères | 3 | 9 | 10 | À préciser |
| Presse à cuisses | Machine | 3 | 9 | 45 | À préciser |

- À préciser : Quels sont tes repos habituels entre les séries du développé couché, du rowing et de la presse à cuisses ?

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Préciser les repos puis démarrer dans le carnet

**Demande utilisateur**

> Mes repos : 120 secondes au développé couché, 90 secondes au rowing et 120 secondes à la presse. Je confirme. Complète la séance avec ces temps, sans rien changer d’autre.

**Réponse réelle**

Le brouillon est complété avec tes repos confirmés : 120 secondes au développé couché, 90 secondes au rowing et 120 secondes à la presse à cuisses. Rien d’autre ne change : mêmes exercices, séries, répétitions et charges que le 17 octobre. Tu peux vérifier le brouillon puis le valider dans le carnet.

**Brouillon affiché : Full body — reprise du 17 octobre**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | 120 |
| Rowing | Haltères | 3 | 9 | 10 | 90 |
| Presse à cuisses | Machine | 3 | 9 | 45 | 120 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.
