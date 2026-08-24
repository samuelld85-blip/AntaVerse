# Préparation — Data Safety (Google Play Console)

Dernière vérification des exigences stores : 2026-08-24. Basé sur le même
audit que `docs/store/APPLE_PRIVACY_DECLARATION.md` — les deux déclarations
doivent rester cohérentes entre elles et avec
`/legal/confidentialite`.

## Réponses préparatoires

- **Votre application collecte-t-elle ou partage-t-elle des types de
  données utilisateur requis ?** Non, sur la base de l'audit actuel :
  aucune requête réseau applicative, aucun SDK de collecte, aucune donnée
  transmise à l'éditeur (voir `docs/compliance/DATA_INVENTORY.md`).
- **Toutes les données utilisateur collectées par votre application
  sont-elles chiffrées en transit ?** Sans objet : aucune donnée
  utilisateur n'est transmise par l'application elle-même. Le trafic de
  livraison des pages (hébergement) est en HTTPS.
- **Proposez-vous aux utilisateurs un moyen de demander la suppression de
  leurs données ?** Oui, mais localement : le bouton "Effacer mes données
  locales" sur `/legal/confidentialite` supprime les données stockées sur
  l'appareil. Il n'existe pas de suppression "côté serveur" à proposer,
  puisque l'éditeur ne détient aucune donnée utilisateur — voir la section
  "Compte utilisateur" ci-dessous.
- **Compte utilisateur ?** Non — aucun système de compte n'existe dans le
  code (voir CLAUDE.md § 13 de la demande d'origine). Les questions du
  formulaire relatives à la suppression de compte sont sans objet.

## Tableau par catégorie Google Play

| Catégorie                                                       | Collectée ?                                                                              | Partagée avec un tiers ? | Optionnelle ? | Finalité déclarée                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------ | ------------- | ------------------------------------------------------------------- |
| Localisation                                                    | Non                                                                                      | —                        | —             | —                                                                   |
| Informations personnelles                                       | Non                                                                                      | —                        | —             | —                                                                   |
| Informations financières                                        | Non                                                                                      | —                        | —             | —                                                                   |
| Santé et fitness                                                | Non                                                                                      | —                        | —             | —                                                                   |
| Messages                                                        | Non                                                                                      | —                        | —             | —                                                                   |
| Photos et vidéos                                                | Non                                                                                      | —                        | —             | —                                                                   |
| Fichiers audio                                                  | Non                                                                                      | —                        | —             | —                                                                   |
| Stockage                                                        | Non (au sens "transmis à un tiers") — le stockage local existe mais reste sur l'appareil | Non                      | —             | Fonctionnement de l'application (parties sauvegardées, préférences) |
| Activité dans l'application                                     | Non                                                                                      | —                        | —             | —                                                                   |
| Informations sur l'application et les performances (crash logs) | Non                                                                                      | —                        | —             | Aucun SDK de diagnostic intégré                                     |
| Identifiants de l'appareil ou autres identifiants               | Non                                                                                      | —                        | —             | Aucun identifiant généré ou transmis                                |

## Chiffrement en transit

Le site est servi exclusivement en HTTPS (géré par l'hébergeur). Aucune
donnée applicative n'est de toute façon transmise à un serveur (voir
ci-dessus), donc la question du chiffrement en transit de données
utilisateur est en grande partie sans objet pour l'usage réel qu'en fait
AntaVerse.

## Cohérence à vérifier avant soumission

Ces réponses doivent correspondre exactement à celles saisies dans
`docs/store/APPLE_PRIVACY_DECLARATION.md` et au contenu de
`/legal/confidentialite` — les trois documents partagent la même
conclusion d'audit, il ne devrait donc jamais y avoir de divergence
factuelle entre eux. Toute divergence future signale que l'un des trois
documents n'a pas été mis à jour après un changement de code.

L'intégration Capacitor Android ne change pas les réponses : elle embarque
l'export statique localement, n'ajoute ni analytics ni backend, et ne transmet
aucune partie ou préférence. La permission Android `INTERNET` est une capacité
de WebView, pas la preuve d'une collecte ; la déclaration doit décrire le
comportement effectif du code et être réauditée avant chaque release.

## Ce qui déclenche une réévaluation obligatoire

Identique à `docs/store/APPLE_PRIVACY_DECLARATION.md` : ajout d'un SDK
natif, d'analytics, de publicité, d'un backend, ou d'un compte utilisateur.
