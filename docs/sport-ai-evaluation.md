# Évaluation manuelle — assistant Sport

Cette grille sert à relire les réponses avec des données fictives avant
l’activation d’OpenRouter. Ne pas utiliser de carnet réel ni saisir de clé
fournisseur dans les tests automatisés. Les tests d’intégration doivent mocker
le transport et vérifier qu’aucune requête externe ne part.

## 20 cas fonctionnels

1. Préparer avec équipement complet, durée disponible et historique : brouillon
   modifiable, sans démarrage ni enregistrement automatique.
2. Préparer avec seulement poids du corps : aucune suggestion exigeant du matériel.
3. Préparer avec un exercice explicitement exclu par la contrainte utilisateur.
4. Préparer avec durée très courte : la proposition tient dans le temps indiqué.
5. Préparer avec aucun historique : l’assistant ne prétend pas connaître le niveau.
6. Importer un texte avec des noms d’exercices exacts du catalogue.
7. Importer un texte avec une description ambiguë : demander confirmation,
   sans inventer silencieusement un exercice ou ses réglages.
8. Importer un texte qui propose une série irréaliste : conserver un brouillon
   modifiable et exprimer l’incertitude, sans prétendre à une validation médicale.
9. Relire une séance terminée complète : observations liées à cette séance.
10. Relire une séance avec répétitions manquantes : les signaler comme inconnues.
11. Relire une séance très ancienne explicitement sélectionnée : incluse dans le
    contexte sans déplacer ses dates ou la présenter comme récente.
12. Progression 30 jours avec un historique fourni : période et unités explicites.
13. Progression 90 jours avec assez de données : utiliser la comparaison à 90 jours.
14. Comparer une période sans séances : ne pas inventer de tendance ni de volume.
15. Comparer des périodes avec données manquantes : signaler la limite.
16. Dossier avec plus de 12 séances récentes : contexte borné comme prévu.
17. Séance contenant plus de 80 séries validées : contexte borné et réponse prudente.
18. Exercice hors catalogue : ne pas attribuer d’ID ou de caractéristiques inventés.
19. Suggestion de suivi contextuel : pertinente et aucun nouvel appel avant envoi
    explicite par l’utilisateur.
20. Texte contenant un nom, une adresse ou un détail privé : rappel de transmission
    visible et aucune répétition inutile de ces éléments dans la réponse.

## Contrôles de sécurité et produit

- Une visite, ouverture d’écran ou saisie locale ne déclenche aucun appel.
- L’envoi exige un compte valide et un clic explicite ; l’origine non autorisée
  est refusée.
- Vérifier séparément le quota minute, le quota journalier utilisateur et le
  quota global, y compris deux appels concurrents autour de la limite.
- Vérifier que le nettoyage retire les compteurs âgés de plus de sept jours et
  que la suppression du compte cascade vers ses compteurs.
- La clé absente donne un état indisponible sans contacter ni facturer le
  fournisseur. Les erreurs utilisateur ne révèlent pas les messages bruts
  OpenRouter.
- Prompt, réponse, jeton et clé n’apparaissent ni dans les journaux ni dans le
  stockage du carnet. La réponse n’est pas enregistrée automatiquement.

Consigner les défauts reproductibles, le modèle et la date de l’essai dans un
rapport interne sans données personnelles. Ne pas présenter l’assistant comme
un avis médical, un diagnostic, une prescription ou une garantie d’efficacité
sportive ; il fournit une aide générale fondée sur les données disponibles.
