# Préparation — App Privacy (App Store Connect)

Dernière vérification des exigences stores : 2026-10-20. Document
préparatoire pour remplir le questionnaire "App Privacy" d'App Store
Connect, basé sur l'audit réel du code (`docs/compliance/DATA_INVENTORY.md`,
`docs/compliance/THIRD_PARTY_SERVICES.md`,
`docs/compliance/PERMISSIONS_INVENTORY.md`). **À revalider à chaque ajout de
SDK, de plugin natif, ou de champ synchronisé.**

Rappel cible : AntaVerse est utilisée comme PWA installée. Cette déclaration
n'a d'objet que si une build native est un jour soumise. Elle doit alors
décrire le comportement **de la build soumise** — en particulier si celle-ci
embarque une configuration Supabase (couche compte Sport active) ou non.

## Deux cas selon la build

### Cas A — build sans configuration Supabase

`NEXT_PUBLIC_SUPABASE_URL` absent au build : le client Supabase ne
s'initialise jamais, la couche compte Sport est inerte.

**Aucune donnée n'est collectée par l'éditeur ni par un tiers intégré.**
Aucune requête réseau applicative, aucun SDK de collecte, tout reste dans le
stockage local. Répondre "Non" à toutes les catégories, ATT non applicable.

### Cas B — build avec configuration Supabase (couche compte Sport active)

C'est le cas de l'app web de production. Les jeux et le carnet Sport utilisé
**sans compte** ne collectent toujours rien. Mais un utilisateur qui **crée
un compte Sport** transmet des données à Supabase (sous-traitant) et, s'il
choisit une connexion sociale, à Google ou Apple. Détail exhaustif :
`docs/compliance/DATA_INVENTORY.md` § "Compte Sport cloud".

| Catégorie Apple | Collecte ? | Liée à l'utilisateur ? | Tracking ? | Détail |
| --- | --- | --- | --- | --- |
| Contact Info — Email | **Oui** (si compte e-mail) | Oui | Non | E-mail du compte, géré par Supabase Auth ; sert à la connexion et à la récupération de mot de passe |
| Health & Fitness | **Oui** | Oui | Non | Le carnet Sport synchronisé : séances, exercices, séries, charges, répétitions ; transmis pour les requêtes contextuelles de l’assistant |
| User Content — Autre contenu | **Oui** | Oui | Non | Commentaires laissés par l'utilisateur sur les séances d'amis ; texte saisi pour l’assistant Sport |
| Identifiers — User ID | **Oui** | Oui | Non | Identifiant de compte (UUID Supabase) ; pseudo choisi visible des autres utilisateurs connectés |
| Contacts | Non | — | — | Aucun accès au carnet d'adresses ; les "amis" sont des comptes AntaVerse ajoutés manuellement par pseudo |
| Location | Non | — | — | `navigator.geolocation` non utilisé |
| Financial Info | Non | — | — | Aucun paiement |
| Sensitive Info | Non | — | — | Sans objet |
| Browsing / Search History | Non | — | — | Sans objet |
| Purchases | Non | — | — | Aucune monétisation |
| Usage Data | Non | — | — | Aucun outil de mesure d'usage |
| Diagnostics | Non | — | — | Aucun SDK de crash/perf |
| Other Data | **Oui** | Oui | Non | Graphe d'amitié (qui est ami avec qui) ; abonnement Web Push technique par appareil |

Finalité pour toutes les lignes "Oui" : **App Functionality** (sauvegarde et
restauration du carnet, fonctionnalités sociales, notifications, préparation,
relecture et progression assistées). Ni publicité, ni analytics, ni partage à
des fins de tracking.

Dans une build qui inclut l’assistant Sport, un clic sur Préparer, Relire ou
Progression envoie la demande et le contexte sportif à Supabase, OpenRouter et
au fournisseur du modèle ; l’import est transmis après saisie et un seul envoi.
Le contexte comprend toutes les séances terminées du compte, toutes leurs
séries terminées et les statistiques calculées. Les noms, e-mails, pseudos,
commentaires, photos et données d’amis sont exclus. Le texte libre peut contenir
des identifiants directs que l’application ne peut pas filtrer automatiquement.
Ces traitements et destinataires sont à déclarer pour toute build qui inclut
cette fonction.

## Tracking (ATT)

**Non applicable** dans les deux cas. Aucune donnée n'est partagée avec un
courtier ou un réseau publicitaire ; aucun suivi cross-app ou cross-site.
Le graphe d'amitié sert uniquement la fonctionnalité de partage interne. Le
prompt ATT n'a pas lieu d'être.

## Connexions sociales

Si l'utilisateur choisit Google ou Apple, l'authentification OAuth renvoie
un identifiant et un e-mail au projet Supabase. Aucun SDK Google/Apple n'est
embarqué (redirection navigateur). "Sign in with Apple" est proposé dès
qu'une autre connexion sociale (Google) l'est — exigence Apple à vérifier
si une build native est soumise.

## Cohérence

Ces réponses doivent correspondre à `docs/store/GOOGLE_DATA_SAFETY.md` et au
contenu de `/legal/confidentialite`. Toute divergence signale un document
non mis à jour.

## Ce qui déclenche une réévaluation obligatoire

- Nouveau champ synchronisé vers Supabase, extension du partage social,
  passage d'un push Web à un push natif (APNs).
- Activation de l’assistant Sport ou changement de son fournisseur, modèle,
  contexte ou paramètres de rétention.
- Ajout d'analytics, de publicité, d'un paiement, ou d'un SDK natif.
- Changement de la build de production quant à la présence de la
  configuration Supabase (cas A ↔ cas B).
