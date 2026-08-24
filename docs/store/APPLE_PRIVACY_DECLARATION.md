# Préparation — App Privacy (App Store Connect)

Dernière vérification des exigences stores : 2026-08-24. Document
préparatoire pour remplir le questionnaire "App Privacy" d'App Store
Connect, basé exclusivement sur l'audit réel du code
(`docs/compliance/DATA_INVENTORY.md`, `docs/compliance/THIRD_PARTY_SERVICES.md`).
**À revalider obligatoirement à chaque ajout de SDK ou plugin natif.** La
version Android Capacitor actuelle a été auditée : elle embarque l'export
statique dans l'AAB, sans analytics, crash reporting, identifiant transmis ni
service Capacitor distant configuré. Voir
`docs/compliance/THIRD_PARTY_SERVICES.md` et
`docs/compliance/PERMISSIONS_INVENTORY.md`.

## Conclusion de l'audit actuel

**Aucune donnée n'est collectée par l'éditeur d'AntaVerse aujourd'hui**, au
sens où l'entend le formulaire Apple : rien n'est transmis depuis
l'appareil de l'utilisateur vers un serveur contrôlé par l'éditeur ou par
un tiers intégré au code. Le raisonnement complet :

- Aucune requête réseau applicative (`fetch`/`axios`/XHR) n'existe dans le
  code source, vérifié par recherche exhaustive.
- Aucun SDK (analytics, publicité, crash reporting, etc.) n'est intégré.
- Toutes les données de jeu (prénoms, parties, préférences) restent dans le
  stockage local du navigateur, jamais transmises.
- Pour la PWA, le seul flux de données existant est le trafic HTTP standard
  entre le navigateur de l'utilisateur et l'hébergeur (Vercel), pour livrer
  les pages. Dans l'AAB Android, l'interface et les jeux sont chargés depuis
  les assets embarqués. Aucun de ces flux ne correspond à une collecte de
  données utilisateur par AntaVerse au sens du formulaire Apple.

## Réponses préparatoires, catégorie par catégorie

| Catégorie Apple                               | Collecte ? | Liée à l'utilisateur ? | Utilisée pour le tracking ? | Justification                                                                                   |
| --------------------------------------------- | ---------- | ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| Contact Info (nom, email, téléphone, adresse) | Non        | —                      | —                           | Aucun champ de ce type n'existe dans l'app                                                      |
| Health & Fitness                              | Non        | —                      | —                           | Sans objet                                                                                      |
| Financial Info                                | Non        | —                      | —                           | Sans objet, aucun paiement                                                                      |
| Location                                      | Non        | —                      | —                           | `navigator.geolocation` non utilisé (voir `PERMISSIONS_INVENTORY.md`)                           |
| Sensitive Info                                | Non        | —                      | —                           | Sans objet                                                                                      |
| Contacts                                      | Non        | —                      | —                           | Sans objet                                                                                      |
| User Content (photos, vidéos, contenu généré) | Non        | —                      | —                           | Aucun UGC (voir `FUTURE_SOCIAL_REQUIREMENTS.md`)                                                |
| Browsing History                              | Non        | —                      | —                           | Sans objet                                                                                      |
| Search History                                | Non        | —                      | —                           | Sans objet                                                                                      |
| Identifiers (User ID, Device ID)              | Non        | —                      | —                           | Aucun identifiant généré ou transmis ; les clés de stockage local ne quittent jamais l'appareil |
| Purchases                                     | Non        | —                      | —                           | Aucune monétisation aujourd'hui                                                                 |
| Usage Data (interactions, temps passé)        | Non        | —                      | —                           | Aucun outil de mesure d'usage intégré                                                           |
| Diagnostics (crash logs, performance)         | Non        | —                      | —                           | Aucun SDK de crash reporting                                                                    |
| Other Data                                    | Non        | —                      | —                           | Sans objet                                                                                      |

## Tracking (ATT — App Tracking Transparency)

**Non applicable.** Aucun tracking cross-app ou cross-site n'existe :
aucune donnée n'est partagée avec un tiers à des fins de publicité ou de
mesure cross-app. Le prompt ATT n'a donc pas lieu d'être affiché.

## Pourquoi cette conclusion est raisonnable

Cette conclusion ne repose pas sur une hypothèse mais sur trois vérifications
de code convergentes : (1) absence de toute requête réseau applicative,
(2) absence de tout SDK tiers dans les dépendances de production, (3)
architecture "export statique sans backend" qui rend une collecte serveur
structurellement impossible avec le code actuel. Les trois sont documentées
en détail dans `docs/compliance/DATA_INVENTORY.md`.

## Ce qui déclenche une réévaluation obligatoire

- L'ajout ou l'activation de tout plugin Capacitor, SDK natif ou fichier de
  configuration associé (par exemple analytics, crash reporting, push ou
  `google-services.json`).
- L'ajout d'analytics, de publicité, ou d'un backend applicatif.
- L'ajout d'un compte utilisateur.
