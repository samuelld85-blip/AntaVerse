# Checklist Google Play

> Cette checklist concerne uniquement une préparation ou une publication
> Android explicitement demandée. Les tests et vérifications Android cochés ou
> listés ici ne doivent pas être relancés dans le travail courant par défaut.

Dernière vérification des exigences stores : 2026-08-24 — **à revalider sur
la Play Console Help et les Google Play Developer Program Policies juste
avant toute soumission réelle**, notamment les exigences de vérification
d'identité développeur et le target API level, qui évoluent régulièrement.

## Compte développeur

- [ ] Ouvrir un compte Google Play Developer
- [ ] Compléter la vérification d'identité développeur exigée par Google
      (modalités à vérifier au moment de l'inscription — elles ont évolué
      plusieurs fois ces dernières années)
- [ ] Renseigner les informations développeur avec l'identité réelle de
      l'éditeur — voir `docs/compliance/PUBLISHER_INFO_REQUIRED.md`

## Build

- [x] Packaging Capacitor Android intégré, avec export statique embarqué
      et fonctionnement hors connexion
- [x] Pipeline Android App Bundle (`.aab`) compilé et signé avec une clé de
      test éphémère ; voir `docs/store/ANDROID_BUILD_AND_RELEASE.md`
- [x] Package name défini dans le code : `com.antaverse.app`
- [ ] Confirmer que `com.antaverse.app` est le choix définitif et disponible
      dans la Play Console avant le premier upload
- [x] `versionCode` / `versionName` définis et stratégie documentée
- [x] Configuration de signature externe au dépôt et contrôle des secrets
- [ ] Créer et sauvegarder la vraie clé d'upload, puis activer Play App
      Signing dans la console
- [x] Target/compile API 36, exigence applicable aux nouvelles apps à partir
      du 31 août 2026 d'après la documentation Google vérifiée ce jour
- [x] Test émulateur API 36 sans réseau + test instrumenté Android
- [ ] Tester sur un échantillon d'appareils réels avant publication

## Store listing

- [ ] Titre, short description, full description — brouillons dans
      `docs/store/STORE_METADATA_DRAFT.md`, à finaliser
- [ ] Captures d'écran, icône, feature graphic
- [ ] Catégorie
- [ ] Publier une URL HTTPS absolue pour le support (`/support`)
- [ ] Publier une URL HTTPS absolue pour la confidentialité
      (`/legal/confidentialite`)

## App Content

- [ ] Remplir le formulaire Data Safety à partir de
      `docs/store/GOOGLE_DATA_SAFETY.md`
- [ ] Remplir le questionnaire de classification de contenu IARC à partir
      de `docs/compliance/AGE_RATING.md`
- [ ] Déclarer le public cible (Target Audience) de façon cohérente avec
      la classification IARC obtenue et le contenu réel (alcool, thèmes
      matures) — ne pas déclarer un public plus jeune que ce que le
      contenu justifie
- [ ] Déclaration publicité : "Non" sur la base du code actuel (aucun SDK
      publicitaire — voir `docs/compliance/THIRD_PARTY_SERVICES.md`)
- [ ] App access : confirmer qu'aucune fonctionnalité n'est restreinte
      derrière un compte (pas de compte de test nécessaire)
- [ ] Suppression de compte : sans objet aujourd'hui, aucun compte
      n'existe (voir CLAUDE.md § comptes utilisateurs de la demande
      d'origine) — si des comptes sont introduits plus tard, prévoir un
      chemin de suppression in-app et une ressource web publique
      équivalente
- [x] Audit du manifeste natif : permission `INTERNET` seulement côté
      AntaVerse ; voir `docs/compliance/PERMISSIONS_INVENTORY.md`

## Alcool

- [ ] Consulter la politique Google Play "Tobacco & Alcohol" en vigueur au
      moment de la soumission
- [ ] **Traiter, avant soumission, la recommandation de
      `docs/compliance/ALCOHOL_STORE_AUDIT.md`** — les mécaniques
      identifiées à risque (pot non plafonné de Purple, cascade non bornée
      de Palmier, instruction "CUL SEC" de Palmier) sont les points cités
      explicitement par la politique Google (consommation excessive /
      compétition de consommation)
- [ ] Ne jamais présenter favorablement une consommation excessive ou une
      compétition de consommation dans les visuels ou le texte de la
      fiche store (voir `docs/store/STORE_METADATA_DRAFT.md`)
- [ ] Ne jamais cibler les mineurs avec le contenu lié à l'alcool — cohérent
      avec `/legal/jeu-responsable` et la classification d'âge retenue
