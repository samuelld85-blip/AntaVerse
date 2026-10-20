# Assistant Sport — exemples réels sur cinq séances fictives

Modèle : `openai/gpt-6.1-sol`, effort moyen. Réponses obtenues le 19/10/2026 par le même handler que l’application, auprès d’OpenRouter.

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

> Je débute et voici mes cinq séances fictives. Prépare un full body simple de 30 minutes avec exactement développé couché barre, rowing haltères et presse à cuisses. Reprends les charges et répétitions de la dernière séance, que je confirme pour ce brouillon. Réponds brièvement et explique le choix ; aucune promesse de progression.

**Réponse réelle**

Voici un full body simple d’environ 30 minutes : développé couché pour la poussée, rowing pour le tirage et presse à cuisses pour les jambes. Prévois 5 minutes d’échauffement, puis les séries ci-dessous sans superset. Charges et répétitions reprises comme confirmé ; repos proposés et modifiables. Brouillon à vérifier avant utilisation, sans enregistrement automatique.

- Dans la séance fictive du 17 octobre 2026 : développé couché barre à 25 kg, 3 × 7 ; rowing haltères à 10 kg par haltère, 3 × 9 ; presse à cuisses à 45 kg, 3 × 9. Les 25 kg du développé couché comprennent la barre. — Sources : 2026-10-17.

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

Seule la presse à cuisses est remplacée par le squat au poids du corps : 2 × 10, repos 90 s, sans lest. Développé couché et rowing inchangés : le full body conserve poussée, tirage et jambes. Prévois 5 minutes d’échauffement. Brouillon à vérifier, sans enregistrement automatique.

- Charges et répétitions conservées comme confirmé d’après la séance fictive du 17 octobre 2026 : développé couché à 25 kg, barre comprise, et rowing à 10 kg par haltère. — Sources : 2026-10-17.

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

Brouillon prêt à vérifier : réglages conservés tels que confirmés, sans ajout d’exercice. Aucune importation automatique.

**Brouillon affiché : Programme débutant**

| Exercice | Matériel | Séries | Répétitions | Charge (kg) | Repos (s) |
| --- | --- | --- | --- | --- | --- |
| Développé couché | Barre | 3 | 8 | 20 | 120 |
| Rowing | Haltères | 3 | 10 | 8 | 90 |

L’utilisateur peut modifier les champs, remplacer ou retirer un exercice, demander un ajustement, puis confirmer. Le brouillon ne crée aucune série réalisée.

## Faire le point après la cinquième séance

**Demande utilisateur**

> Fais le point sur ma cinquième séance, comparée à la quatrième à exercice et matériel identiques. Cite les séances et distingue observations et conclusions impossibles. Réponse brève.

**Réponse réelle**

La cinquième séance du 17/10/2026 comporte davantage de répétitions à charges identiques que la quatrième du 13/10/2026. Conclusions impossibles : ces données seules ne prouvent ni gain de force ni gain musculaire ; le volume du carnet n’est pas une mesure complète de la charge réelle ou de la force.

- Du 13/10 au 17/10/2026, développé couché à la barre : 3 × 6 → 3 × 7 à 25 kg, barre comprise. — Sources : 2026-10-13, 2026-10-17.

- Du 13/10 au 17/10/2026, rowing avec haltères : 3 × 8 → 3 × 9 à 10 kg par haltère. — Sources : 2026-10-13, 2026-10-17.

- Du 13/10 au 17/10/2026, presse à cuisses sur machine : 3 × 8 → 3 × 9 à 45 kg. — Sources : 2026-10-13, 2026-10-17.

- Du 13/10 au 17/10/2026 : 9 séries dans chaque séance ; volume enregistré de 1 770 à 2 010 kg, soit +240 kg (+13,6 %). — Sources : 2026-10-13, 2026-10-17.

## Comprendre ma progression sur 30 jours

**Demande utilisateur**

> Explique ma progression sur ces cinq séances de débutant : régularité et évolution des exercices, sans confondre tonnage et gain de force. Il n'y a aucune séance sur la période précédente. Cite tes sources et reste bref.

**Réponse réelle**

Un début régulier, avec davantage de répétitions puis des charges plus élevées. Cela décrit l’évolution de tes performances enregistrées, sans prouver un gain de force ou de muscle. Aucune séance sur les 30 jours précédents : pas de comparaison chiffrée pertinente avec cette période.

- Régularité : 5 séances les 3, 6, 10, 13 et 17 octobre 2026, espacées de 3 à 4 jours. Même structure à chaque fois : 3 exercices, 3 séries chacun, soit 45 séries sur les 30 jours. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.

- Développé couché à la barre : 3×8 à 20 kg le 3 octobre, 3×9 le 6, puis 3×10 le 10. Après passage à 25 kg : 3×6 le 13, puis 3×7 le 17. Les répétitions augmentent à charge identique avant et après la hausse de charge. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.

- Rowing avec haltères : 3×10 à 8 kg par haltère les 3 et 6 octobre, puis 3×11 le 10 ; à 10 kg, 3×8 le 13 puis 3×9 le 17. Presse à cuisses sur machine : même évolution des répétitions, avec 40 kg puis 45 kg. Chaque comparaison porte sur le même exercice et équipement. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.

- Le volume du carnet totalise 9 864 kg sur les 30 jours. Il baisse de 2 184 à 1 770 kg entre les 10 et 13 octobre, malgré des charges plus élevées et moins de répétitions. Ce tonnage n’est ni une mesure complète de la charge réelle ni une preuve de gain ou de perte de force. — Sources : 2026-10-03, 2026-10-06, 2026-10-10, 2026-10-13, 2026-10-17.
