# Préparation — Data Safety (Google Play Console)

Dernière vérification des exigences stores : 2026-09-08. Basé sur le même
audit que `docs/store/APPLE_PRIVACY_DECLARATION.md` — les deux déclarations
et `/legal/confidentialite` doivent rester cohérentes.

Rappel cible : AntaVerse est utilisée comme PWA installée. Cette déclaration
n'a d'objet que si une build native est soumise à Google Play, et doit
décrire le comportement **de la build soumise**.

## Deux cas selon la build

### Cas A — build sans configuration Supabase

Le client Supabase ne s'initialise jamais. **L'application ne collecte ni ne
partage aucune donnée utilisateur.** Répondre "Non" à la question générale.
Suppression de données : bouton "Effacer mes données locales" sur
`/legal/confidentialite`. Pas de compte.

### Cas B — build avec configuration Supabase (app web de production)

Les jeux et le carnet Sport **sans compte** ne collectent rien. Un
utilisateur qui **crée un compte Sport** transmet des données à Supabase
(sous-traitant). Détail : `docs/compliance/DATA_INVENTORY.md` § "Compte
Sport cloud".

- **L'application collecte-t-elle ou partage-t-elle des données ?** Oui
  (collecte), pour les utilisateurs disposant d'un compte Sport. Pas de
  partage à des fins publicitaires ou d'analyse.
- **Chiffrement en transit ?** Oui — HTTPS/TLS pour toutes les requêtes
  Supabase et OAuth.
- **Moyen de demander la suppression ?** Oui — `/sport/compte` supprime le
  compte et, en cascade, sauvegardes, révisions, séances, amitiés, likes,
  commentaires et abonnements push. Le bouton local efface la copie
  appareil.
- **Compte utilisateur ?** Oui, pour le module Sport uniquement, optionnel.

| Catégorie Google Play | Collectée ? | Partagée ? | Optionnelle ? | Finalité |
| --- | --- | --- | --- | --- |
| Informations personnelles — Adresse e-mail | Oui (compte e-mail) | Non | Oui (le compte est optionnel) | Gestion du compte, connexion, récupération |
| Informations personnelles — Noms d'utilisateur | Oui (pseudo) | Non | Oui | Identification auprès des amis ; liste des joueurs connectés |
| Informations personnelles — ID utilisateur | Oui (UUID de compte) | Non | Oui | Fonctionnement du compte et du partage |
| Santé et fitness | Oui (carnet Sport synchronisé) | Non | Oui | Sauvegarde/restauration ; partage des séances terminées avec les amis acceptés |
| Messages — Autres messages en jeu | Oui (commentaires d'amis sur les séances) | Non | Oui | Fonctionnalité sociale demandée par l'utilisateur |
| Contacts | Non | — | — | Aucun accès au carnet d'adresses |
| Localisation | Non | — | — | — |
| Informations financières | Non | — | — | — |
| Photos et vidéos / Fichiers audio | Non | — | — | — |
| Activité dans l'application | Non | — | — | Aucun analytics |
| Informations sur l'app et les performances | Non | — | — | Aucun SDK de diagnostic |
| Identifiants de l'appareil | Non | — | — | Aucun identifiant d'appareil publicitaire. L'abonnement Web Push est un jeton technique par appareil, non un identifiant de suivi |

Toutes les collectes "Oui" ont pour finalité **le fonctionnement de
l'application** (fonctionnalité de compte et fonctionnalités sociales) ;
aucune n'est destinée à la publicité, au marketing, ou à l'analyse d'usage.

## Cohérence à vérifier avant soumission

Ces réponses doivent correspondre exactement à
`docs/store/APPLE_PRIVACY_DECLARATION.md` et à `/legal/confidentialite`.
Toute divergence signale qu'un des trois documents n'a pas été mis à jour
après un changement de code.

L'intégration Capacitor Android n'ajoute ni analytics ni SDK : elle embarque
l'export statique. Les permissions `INTERNET` et `POST_NOTIFICATIONS`
servent respectivement à la WebView (et, en cas B, aux requêtes Supabase) et
au chronomètre local. `push.ts` n'active pas le Web Push dans la coquille
native.

## Ce qui déclenche une réévaluation obligatoire

Identique à `docs/store/APPLE_PRIVACY_DECLARATION.md` : nouveau champ
synchronisé, extension du social, push natif (FCM), analytics, publicité,
paiement, SDK natif, ou changement de la build de production quant à la
présence de la configuration Supabase.
