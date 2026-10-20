# Milo — rôle, valeur et intégration au carnet

## Mon avis sur les premières réponses

Elles étaient globalement pertinentes sur les faits : comparaisons à exercice et matériel identiques, respect des unités, absence de promesse de gain musculaire. Mais elles faisaient surtout le travail d’un tableau de statistiques. La relecture alignait quatre observations et des conclusions impossibles ; le bilan répétait presque tout l’historique. Cela demandait à l’utilisateur de décider seul de la suite.

Le problème n’était donc pas seulement le prénom ou le ton. La valeur attendue est de transformer une contrainte ou une observation en décision compréhensible, puis en séance utilisable. Les réponses initiales réelles sont conservées dans [l’exemple avant révision](examples/sport-ai-beginner-before-coach.md). Les demandes de cette première démonstration réclamaient aussi explicitement des précautions et des chiffres : elles accentuaient ce travers. Les [nouveaux exemples](examples/sport-ai-beginner.md) emploient des demandes plus naturelles ; ce n’est pas un benchmark comparatif à prompt identique.

## Le rôle retenu

Milo est un coach IA spécialisé dans le carnet de musculation et la préparation physique. Il tutoie, explique simplement, encourage sans félicitations mécaniques et propose une priorité concrète avec sa raison. Il ne se présente pas comme un humain diplômé et n’invente ni expérience professionnelle ni observation de la technique.

Le message vise deux à quatre phrases. Les observations gardent deux ou trois faits utiles, avec les dates des séances propres à l’utilisateur. Une limite n’est rappelée que si elle change la décision : par exemple, ne pas connaître l’effort réel interdit d’affirmer qu’il faut augmenter une charge. La mention générale de prudence reste dans l’interface.

Une relecture utile peut ainsi relever les répétitions supplémentaires à charge identique, puis inviter à noter la difficulté et le ressenti de la prochaine séance. Elle apporte une priorité testable ; elle ne conclut pas que le volume prouve un gain de muscle. Les règles de progression déjà présentes dans le carnet restent la référence.

## À quels moments l’utilisateur s’en sert

| Moment | Besoin | Résultat dans l’application |
| --- | --- | --- |
| Avant la séance, depuis l’accueil ou Nouvelle séance | « J’ai 30 minutes et des haltères » | Brouillon de séance avec exercices et réglages modifiables |
| Programme déjà reçu | Coller un texte au lieu de tout ressaisir | Import fidèle ; les réglages inconnus sont à préciser |
| Préparation en cours | « La presse est occupée » | Le même brouillon est adapté dans la conversation |
| Après une séance, dans son détail | Comprendre un changement et choisir une priorité | Relecture courte, liée aux séances citées |
| Statistiques, sur 30 ou 90 jours | Comprendre une tendance | Bilan puis, sur demande, brouillon de la prochaine séance |

Ce sont des entrées contextuelles vers le même coach. L’utilisateur peut converser pour préciser le résultat, sans devoir ouvrir un chat général et y reconstituer son carnet. Aucun appel ne part à l’ouverture ; un envoi explicite est nécessaire.

## Une séance réelle, pas seulement un texte

Une demande de plan ou d’adaptation doit produire le contrat structuré du carnet. L’éditeur permet de régler les exercices, le matériel, les séries, les répétitions facultatives, la charge, le repos et les supersets. L’utilisateur peut ensuite **Démarrer cette séance** ou **Enregistrer en favori**. Une séance démarrée contient des réglages et aucune série déjà réalisée ; les chronomètres, séries et sauvegardes suivent ensuite le parcours habituel.

Les charges inconnues restent à préciser, et une charge historique exige un exercice et un matériel comparables ainsi que la confirmation de sa reprise. Les champs nécessaires ou questions non résolus empêchent le démarrage et l’enregistrement. Une séance active n’est pas remplacée. Le modèle n’écrit jamais lui-même dans le stockage ou la base.

Le cas le plus intéressant est « bilan → préparation → précision → démarrage ». Le script de démonstration le joue avec cinq séances fictives et vérifie que le dernier brouillon se convertit effectivement en modèle de séance du carnet.

## Ce qui étaye les conseils

Dire au modèle « tu es un expert » définit un rôle ; cela ne crée pas une expertise vérifiée. Le modèle apporte ses connaissances générales, cadrées par une petite base éditoriale explicite, datée et relisible : [`coach-knowledge.json`](../supabase/functions/_shared/coach-knowledge.json). Elle fournit des principes de programmation, fréquence, matériel, effort et récupération, avec leurs limites d’application. Elle s’appuie sur les sources primaires suivantes :

- [ACSM — recommandations de musculation 2026](https://acsm.org/resistance-training-guidelines-update-2026/).
- [NSCA — fréquence des entraînements et récupération](https://www.nsca.com/education/articles/kinetic-select/determination-of-resistance-training-frequency/).
- [HHS — recommandations d’activité physique](https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines).

Leur liste et la date de vérification sont consultables dans le dialogue. Cette base est maintenue manuellement ; le catalogue d’exercices serveur, lui, est généré depuis celui du carnet. Aucun scraping massif ni recherche web en direct n’a été ajouté. Pour ce périmètre et cet usage occasionnel, quelques repères contrôlés évitent d’ajouter de la latence et des sources variables à chaque séance. La base reste une synthèse limitée, pas une bibliothèque scientifique exhaustive. Milo doit reconnaître une incertitude et ne jamais prétendre avoir consulté une publication en direct.

Une recherche documentaire à la demande pourrait servir plus tard pour une question précise hors de ces repères. Elle demanderait des sources sélectionnées, une date, des citations vérifiées et une évaluation propre ; ce n’est pas nécessaire pour importer ou adapter les séances du carnet aujourd’hui.

## Périmètre et limites

Le modèle classe chaque demande : entraînement, hors sujet ou médical. Pour les deux dernières catégories, le serveur remplace toute réponse générée par une redirection fixe sans séance. Une demande mixte ne doit recevoir que la partie sportive. Les [essais réels de périmètre](examples/sport-ai-scope.md) comprennent notamment cuisine, code, finance, changement de rôle, diagnostic, demande mixte et conseil sourcé.

La classification reste faite par un modèle : ces essais ne démontrent pas une impossibilité absolue de contournement. Les validations du schéma, du catalogue, des références de séances, de l’authentification et des quotas sont séparées et déterministes. Le coach ne voit pas les amis, commentaires, photos ou identités du carnet, et n’évalue pas la technique, la santé ou la récupération comme le ferait un entraîneur présent.

## Identité et interface

Milo a un prénom et un petit portrait SVG avec bandeau, dans les couleurs Sport existantes. Le portrait bouge légèrement pendant la préparation de la réponse ; l’animation est désactivée si le système réduit les mouvements. La mention « coach IA » reste visible. Le dialogue respecte les thèmes clair et sombre, les zones sûres, les contrôles tactiles et le retour du focus à la fermeture. Le brouillon apparaît avant le champ de conversation pour rendre l’action concrète prioritaire.

Le modèle retenu est `openai/gpt-6.1-sol` via OpenRouter, avec un effort de raisonnement `medium`. Les appels manuels des exemples utilisent des données inventées et le même handler que l’application ; les tests automatisés simulent les services. L’activation publique exige encore la migration et le déploiement Supabase décrits dans [CLOUD_SETUP.md](../src/sport/CLOUD_SETUP.md).

## Vérifications du 20 octobre 2026

- 70 tests Vitest ciblés : contexte, brouillons, transport client, quota SQL réel dans PGlite et couche cloud Sport.
- 21 tests Deno : assistant et worker push ; vérification de types de l’entrée Edge réussie.
- 34 parcours Playwright Sport réussis dans Chromium et WebKit. Après la dernière simplification du premier écran, les dix cas IA sont rejoués sur les deux navigateurs.
- Build statique PWA et TypeScript réussis ; catalogue serveur à jour. Captures examinées à 320 px en sombre et 390 px en clair, avec consentement et brouillon.
- ESLint ciblé sans erreur. Le lint global rencontre une erreur préexistante dans `qui-de-nous-deux/features/game/game-client.tsx` ; ce fichier n’a pas été modifié.
- Sept échanges réels OpenRouter sur le carnet fictif, dont un brouillon final converti en modèle de séance ; neuf essais réels de périmètre conformes, avec relecture de la demande mixte et du lien de source.
- Aucun motif de clé OpenRouter dans l’export statique ; secrets locaux ignorés par Git. Aucun déploiement Supabase ou test natif effectué.

La branche `codex/sport-ai-assistant` part directement de `main` au commit `bddf3da8be387696e8ed13c8d8bebca154187c14`. Les validations locales ont utilisé Node 24 disponible sur le poste ; le projet conserve sa cible Node 22. Les tests mobiles emploient les moteurs de navigateur, pas un essai physique de la PWA installée, et ne valident pas le Supabase hébergé.
