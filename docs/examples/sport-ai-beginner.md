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

Bilan déterministe : **5 séances, 45 séries, 9 864 kg** selon la convention de tonnage existante (pas de doublement de la charge des haltères).

## Le parcours dans l’application

Accueil ou Nouvelle séance → Préparer ma séance / Depuis un texte → choix des données jointes et envoi → conversation + brouillon modifiable → Démarrer cette séance ou Enregistrer en favori. Après la séance, son détail propose Faire le point ; les statistiques proposent Comprendre ma progression. Ouvrir l’assistant ne déclenche aucun appel.

## Préparer ma séance

**Demande utilisateur**

> Je débute. Prépare-moi un full body simple de 30 minutes avec développé couché barre, rowing haltères et presse à cuisses. Tu peux reprendre les charges et répétitions de ma dernière séance : je les confirme pour cette proposition.

**Réponse réelle**

Je reprends les charges et répétitions du 17 octobre, comme tu les confirmes : tes trois exercices couvrent poussée, tirage et jambes, une base simple pour débuter. Prévois environ 5 minutes d’échauffement avec quelques séries légères, puis réalise le brouillon dans l’ordre avec 90 secondes de repos entre les séries, pour viser 30 minutes selon les transitions. Garde environ 2 répétitions possibles en fin de série plutôt que de forcer jusqu’à l’échec : l’objectif est de répéter cette séance avec une exécution maîtrisée.

- Le 17 octobre 2026, tu as consigné 3 séries de 7 répétitions au développé couché barre à 25 kg, barre comprise. — Sources : 2026-10-17.

- Le 17 octobre 2026, tu as consigné 3 séries de 9 répétitions au rowing haltères à 10 kg par haltère et à la presse à cuisses à 45 kg. — Sources : 2026-10-17.

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

Le brouillon remplace uniquement la presse à cuisses par le squat au poids du corps : 2 × 10, repos de 90 secondes, sans lest. Le développé couché et le rowing restent inchangés : tu conserves ainsi poussée, tirage et jambes malgré la machine occupée.

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

Le brouillon reprend tes réglages confirmés, sans ajout d’exercice. Les charges sont bien notées barre comprise au développé couché et par haltère au rowing.

**Brouillon affiché : Programme débutant**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 8 | 20 | 120 |
| Rowing | Haltères | 3 | 10 | 8 | 90 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Faire le point après la cinquième séance

**Demande utilisateur**

> Milo, qu’est-ce que tu penses de ma dernière séance ? Qu’est-ce que je devrais garder en tête pour la prochaine ?

**Réponse réelle**

Le 17 octobre, tu as ajouté une répétition à chaque série sur les trois exercices, à charges et matériel identiques au 13 octobre : c’est une progression nette des répétitions consignées. Le carnet ne permet toutefois pas de savoir si la technique et l’effort sont restés comparables. Pour la prochaine séance, garde les mêmes charges et cherche d’abord à reproduire ces répétitions avec une exécution maîtrisée, sans forcer l’échec : tu pourras ainsi confirmer ce niveau avant d’envisager une hausse.

- Au développé couché à la barre, tu passes de 3 × 6 le 13 octobre à 3 × 7 le 17 octobre, toujours à 25 kg. — Sources : 2026-10-13, 2026-10-17.

- Du 13 au 17 octobre, le rowing avec haltères et la presse à cuisses passent chacun de 3 × 8 à 3 × 9, respectivement à 10 kg par haltère et 45 kg sur la machine. — Sources : 2026-10-13, 2026-10-17.

## Comprendre ma progression

**Demande utilisateur**

> Je débute et j’ai fait ces cinq séances. Est-ce que je suis sur la bonne voie ? Qu’est-ce que tu me conseilles pour la suite ?

**Réponse réelle**

Oui, ton carnet montre un début cohérent : des séances régulières et davantage de répétitions à charges identiques, notamment entre le 13 et le 17 octobre. Cela indique une progression des performances consignées, sans permettre de juger ta technique ni un gain de muscle. Garde pour l’instant deux séances full body non consécutives par semaine : c’est un point de départ classique pour débuter. Pour la prochaine, le brouillon reprend tes dernières charges et répétitions sans augmentation ; vise une exécution contrôlée, avec environ deux répétitions encore possibles en fin de série, puis renseigne ton ressenti dans le carnet.

- Du 3 au 17 octobre, tes cinq séances sont espacées de trois ou quatre jours : un rythme régulier avec des jours sans musculation entre les séances. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.

- Entre le 13 et le 17 octobre, à exercice et équipement identiques, tu passes de 6 à 7 répétitions par série au développé couché à 25 kg, et de 8 à 9 au rowing à 10 kg par haltère ainsi qu’à la presse à cuisses à 45 kg, sur les trois séries de chaque exercice. — Sources : 2026-10-13, 2026-10-17.

**Brouillon affiché : Full body — consolider les repères**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | 120 |
| Rowing | Haltères | 3 | 9 | 10 | 120 |
| Presse à cuisses | Machine | 3 | 9 | 45 | 120 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Passer du bilan à une séance utilisable

**Demande utilisateur**

> D’accord, prépare ma prochaine séance avec les mêmes trois exercices que la dernière fois. Je confirme la reprise des charges et répétitions de cette dernière séance pour le brouillon. Garde les temps de repos habituels.

**Réponse réelle**

Le brouillon reprend les trois exercices du 17 octobre, avec les mêmes séries, répétitions et charges, comme tu l’as confirmé. Je conserve les 2 minutes de repos déjà prévues dans le brouillon. Pour cette séance, cherche surtout à reproduire les répétitions avec une exécution contrôlée, sans augmenter la charge : cela te donnera un repère comparable.

- Le 17 octobre : développé couché à 25 kg pour 3 × 7, rowing à 10 kg par haltère pour 3 × 9 et presse à cuisses à 45 kg pour 3 × 9. — Sources : 2026-10-17.

**Brouillon affiché : Full body — consolider les repères**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | 120 |
| Rowing | Haltères | 3 | 9 | 10 | 120 |
| Presse à cuisses | Machine | 3 | 9 | 45 | 120 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Préciser les repos puis démarrer dans le carnet

**Demande utilisateur**

> Mes repos : 120 secondes au développé couché, 90 secondes au rowing et 120 secondes à la presse. Je confirme. Complète la séance avec ces temps, sans rien changer d’autre.

**Réponse réelle**

Le brouillon reprend tes repos confirmés : 120 secondes au développé couché, 90 secondes au rowing et 120 secondes à la presse à cuisses. Rien d’autre ne change : les exercices, séries, répétitions et charges restent identiques.

**Brouillon affiché : Full body — consolider les repères**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 7 | 25 | 120 |
| Rowing | Haltères | 3 | 9 | 10 | 90 |
| Presse à cuisses | Machine | 3 | 9 | 45 | 120 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.
