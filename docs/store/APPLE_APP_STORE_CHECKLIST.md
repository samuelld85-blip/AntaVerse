# Checklist Apple App Store

Dernière vérification des exigences stores : 2026-08-20 — **à revalider sur
developer.apple.com et App Store Connect Help juste avant toute soumission
réelle**, les exigences (versions Xcode minimum, formulaires, libellés)
évoluent régulièrement.

## Compte développeur

- [ ] Ouvrir un compte Apple Developer Program
- [ ] Décider individuel vs organisation — voir
      `docs/compliance/PUBLISHER_INFO_REQUIRED.md` pour l'identité réelle à
      utiliser (ne pas déclarer une organisation si l'éditeur est une
      personne physique)
- [ ] Accepter les accords développeur Apple en vigueur au moment de
      l'inscription
- [ ] Configurer les informations fiscales et bancaires **uniquement si**
      une monétisation est activée (voir
      `docs/compliance/FUTURE_MONETIZATION_REQUIREMENTS.md`) — sans objet
      aujourd'hui

## DSA (Digital Services Act, Union européenne)

- [ ] Déterminer le statut "trader" ou "non-trader" de l'éditeur pour
      l'Union européenne
- [ ] Si trader : préparer les coordonnées exigées par Apple (elles
      deviennent **publiques** sur la fiche App Store européenne — à
      anticiper avec l'éditeur avant de les saisir, voir
      `docs/compliance/PUBLISHER_INFO_REQUIRED.md`)
- [ ] Rassembler les documents justificatifs nécessaires selon le statut
      retenu

## Build

- [ ] Choisir et mettre en œuvre une stratégie de packaging natif (voir
      `docs/store/NATIVE_PACKAGING_OPTIONS.md`) — non fait dans ce
      chantier
- [ ] Vérifier la version Xcode / SDK iOS minimum exigée par Apple au
      moment de la soumission (change à chaque cycle iOS)
- [ ] Définir le bundle identifier
- [ ] Définir la version et le build number, et une stratégie
      d'incrémentation cohérente pour les mises à jour futures
- [ ] Mettre en place la signature (certificats, provisioning profiles)

## Metadata

- [ ] Nom, subtitle, description, mots-clés, catégorie, promotional text
      — brouillons dans `docs/store/STORE_METADATA_DRAFT.md`, à finaliser
- [ ] Captures d'écran — voir contraintes de ton dans
      `docs/store/STORE_METADATA_DRAFT.md`
- [ ] App icon au format requis
- [ ] Support URL → `/support`
- [ ] Privacy URL → `/legal/confidentialite`
- [ ] Marketing URL, si souhaitée
- [ ] Mention de copyright, avec le nom légal réel de l'éditeur

## App Review

- [ ] Rédiger des notes de revue expliquant honnêtement le contenu lié à
      l'alcool (voir brouillon dans `docs/store/STORE_METADATA_DRAFT.md`)
      et le fonctionnement hors ligne
- [ ] Confirmer qu'aucun compte de test n'est nécessaire (pas de système
      de compte)
- [ ] Vérifier le comportement hors ligne du wrapper natif final avant
      soumission (hérité du Service Worker existant, mais à re-tester dans
      le contexte du wrapper)
- [ ] **Traiter, avant soumission, la recommandation de
      `docs/compliance/ALCOHOL_STORE_AUDIT.md`** sur les mécaniques à
      risque de rejet (pot non plafonné de Purple, cascade non bornée de
      Palmier, instruction "CUL SEC" de Palmier)

## Privacy

- [ ] Remplir le questionnaire App Privacy à partir de
      `docs/store/APPLE_PRIVACY_DECLARATION.md`
- [ ] Vérifier les permissions natives réellement demandées par le
      wrapper final par rapport à `docs/compliance/PERMISSIONS_INVENTORY.md`
- [ ] Confirmer l'absence de tracking (ATT non applicable aujourd'hui, à
      revérifier si un SDK est ajouté)
- [ ] Si le wrapper natif utilise des "Required Reason APIs", produire le
      Privacy Manifest requis par Apple (obligation introduite après la
      version PWA actuelle — à vérifier au moment du packaging natif)

## Age Rating

- [ ] Remplir le questionnaire Age Rating à partir de
      `docs/compliance/AGE_RATING.md`, sans chercher une classification
      plus basse que ce que le contenu réel justifie

## Export compliance

- [ ] Répondre aux questions chiffrement/export lors de la soumission
      (AntaVerse n'implémente aucune cryptographie propriétaire au-delà de
      ce que fournit HTTPS/le système d'exploitation — à confirmer à
      nouveau au moment exact de la soumission, la question porte sur le
      binaire final, pas sur ce document)

## Content rights

- [ ] Confirmer que l'éditeur possède les droits nécessaires sur tout le
      contenu des jeux — voir `docs/compliance/IP_CHECKLIST.md`

## Paiements

- [ ] Sans objet aujourd'hui (voir
      `docs/compliance/FUTURE_MONETIZATION_REQUIREMENTS.md`). Si des achats
      numériques sont introduits plus tard, analyser l'obligation
      d'utiliser Apple In-App Purchase avant d'intégrer tout système de
      paiement.
