# Évaluation manuelle — assistant Sport

Cette grille sert à relire les réponses avec des données fictives lors d’une
mise à jour du modèle ou du comportement. Ne pas utiliser de carnet réel ni
saisir de clé fournisseur dans les tests automatisés. Les tests d’intégration
doivent mocker le transport et vérifier qu’aucune requête externe ne part.

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
11. Relire une séance ancienne : inclure toutes les séances terminées de
    l’utilisateur et conserver les vraies dates.
12. Progression : utiliser l’historique terminé complet, toutes les séries et
    les statistiques, sans demander une période de 30 ou 90 jours.
13. Comparer un historique sans séances ou avec des données manquantes : ne pas
    inventer de tendance ni de volume.
14. Préparation : appel au toucher du bouton dans « Nouvelle séance » ; aucun
    bloc Milo sur l’accueil.
15. Relecture et progression : le bouton adapté déclenche l’appel ; aucun appel
    depuis une page sans action de l’assistant.
16. Importer un texte : ouvrir le champ de saisie ne transmet rien ; un seul
    envoi transmet le texte et le contexte.
17. Contexte : aucune donnée de nom, e-mail, pseudo, commentaire, photo ou ami ;
    toutes les séances terminées et leurs séries sont incluses.
18. Corps de requête dépassant 2 000 000 octets : erreur claire, aucun appel
    fournisseur, quota non consommé et aucune troncature silencieuse.
19. Corps de requête sous la limite : validation normale, sans supprimer
    silencieusement des séances ou des séries.
20. Vérifier la configuration : champs requis valides avant démarrage ou
    enregistrement, sans case « J’ai vérifié ce point ».

## Contrôles de sécurité et produit

- Une visite, ouverture d’écran ou saisie locale ne déclenche aucun appel.
- Les boutons contextuels exigent un compte valide et déclenchent la demande au
  clic ; l’import n’envoie qu’après le bouton d’envoi. L’origine non autorisée
  est refusée.
- Vérifier séparément le quota minute, le quota journalier utilisateur et le
  quota global, y compris deux appels concurrents autour de la limite.
- Vérifier que le nettoyage retire les compteurs âgés de plus de sept jours et
  que la suppression du compte cascade vers ses compteurs.
- La clé absente donne un état indisponible sans contacter ni facturer le
  fournisseur. Une demande de plus de 2 000 000 octets est refusée clairement,
  sans appeler le fournisseur ni tronquer son contenu. Les erreurs utilisateur
  ne révèlent pas les messages bruts OpenRouter.
- Prompt, réponse, jeton et clé n’apparaissent ni dans les journaux ni dans le
  stockage du carnet. La réponse n’est pas enregistrée automatiquement.

Consigner les défauts reproductibles, le modèle et la date de l’essai dans un
rapport interne sans données personnelles. Ne pas présenter l’assistant comme
un avis médical, un diagnostic, une prescription ou une garantie d’efficacité
sportive ; il fournit une aide générale fondée sur les données disponibles.
