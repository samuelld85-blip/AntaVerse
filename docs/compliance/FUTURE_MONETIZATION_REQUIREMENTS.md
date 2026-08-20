# Exigences futures — monétisation

**Statut aujourd'hui : non applicable.** AntaVerse ne contient aucun
mécanisme d'achat, d'abonnement, de paiement ou de publicité — recherche
confirmée dans le code et les dépendances (`package.json`). Aucune CGV n'est
donc créée dans ce chantier (voir la distinction CGU/CGV documentée dans
`docs/compliance/`).

## Pourquoi ce document existe maintenant

Le jour où une monétisation réelle est décidée, plusieurs obligations
s'ajouteront selon la forme choisie :

- **Achat unique / jeux premium** : politique Apple In-App Purchase (aucun
  système de paiement externe non conforme ne peut se substituer à IAP pour
  du contenu numérique consommé dans l'app iOS) ; équivalent Google Play
  Billing côté Android.
- **Abonnement** : affichage clair du prix, de la périodicité, des
  conditions de renouvellement et d'annulation, avant tout engagement ;
  gestion de l'abonnement via les plateformes (App Store/Play Store) plutôt
  qu'un système de paiement propriétaire, sauf exception encadrée par les
  politiques en vigueur au moment du lancement.
- **Publicité** : nécessiterait un SDK publicitaire (aujourd'hui absent),
  donc une mise à jour complète de `docs/compliance/THIRD_PARTY_SERVICES.md`,
  de la politique de confidentialité, de la déclaration Apple Privacy et de
  Google Data Safety, ainsi qu'un réexamen ATT (App Tracking Transparency)
  côté Apple si un tracking cross-app est impliqué.
- **Droit de rétractation / contenu numérique** : en droit européen de la
  consommation, l'achat de contenu numérique implique des règles
  spécifiques sur le droit de rétractation (souvent renoncé explicitement
  par l'utilisateur au moment de l'achat pour un accès immédiat) — à
  documenter précisément dans de futures CGV.
- **Garanties consommateurs** : ne pas exclure par contrat des garanties
  légales impératives.
- **Facturation et TVA** : selon le pays de l'éditeur et celui de
  l'acheteur, des règles de TVA intracommunautaire ou de TVA sur services
  numériques peuvent s'appliquer — sujet fiscal à traiter avec un
  professionnel au moment de la décision, hors périmètre de ce chantier.

## Ne pas construire cela maintenant

Rien de ce qui précède ne doit être implémenté avant qu'une monétisation
réelle soit décidée. Ce document sert de checklist de démarrage pour ce
futur chantier séparé, pas de spécification actuelle.
