# Informations à fournir avant publication réelle

Ce document liste exactement ce qu'il faudra fournir avant une soumission
réelle Apple / Google. Rien n'a été inventé pour compléter ces champs — ils
restent `TODO_BEFORE_STORE_RELEASE` dans `src/lib/legal/legal-config.ts` et
s'affichent visiblement comme tels sur les pages légales publiées
(`/legal/mentions-legales`, `/legal/confidentialite`,
`/legal/conditions-utilisation`) tant qu'ils ne sont pas renseignés.

## Identité éditeur

- [ ] Nom légal de l'éditeur (personne physique ou dénomination sociale)
- [ ] Statut juridique réel — **ne pas supposer une société si c'est une
      personne physique / entreprise individuelle**
- [ ] Nom commercial, s'il diffère du nom légal
- [ ] SIREN
- [ ] SIRET
- [ ] Numéro de TVA intracommunautaire, si applicable
- [ ] Adresse professionnelle
- [ ] Pays d'établissement

## Contact

- [ ] Email support (affiché publiquement sur `/support` et dans les CGU)
- [ ] Email dédié "vie privée" (peut être identique au support, à
      décider)
- [ ] Téléphone professionnel, si vous souhaitez en afficher un
- [ ] Directeur de la publication (obligatoire en droit français pour tout
      éditeur de contenu en ligne)

## Hébergeur

- [ ] Adresse officielle actuelle de Vercel Inc. (à vérifier sur
      vercel.com/legal au moment de la publication, pas recopiée de
      mémoire — elle peut changer)
- [ ] Moyen de contact officiel de l'hébergeur à afficher dans les
      mentions légales

## Comptes développeur stores

- [ ] Type de compte Apple Developer Program : individuel ou organisation
- [ ] Statut DSA (Digital Services Act, UE) : trader ou non-trader — voir
      `docs/store/APPLE_APP_STORE_CHECKLIST.md` § DSA. Si trader, les
      coordonnées fournies à Apple deviendront **publiques** sur la fiche
      App Store européenne : à anticiper avant de les saisir.
- [ ] Identité développeur Google Play (vérification d'identité requise
      par Google, modalités à vérifier au moment de l'inscription)

## Dates et versions

- [ ] Date d'effet de la politique de confidentialité et des CGU
- [ ] Numéro de version des documents légaux (actuellement
      `0.1.0-draft` dans `legal-config.ts`, à faire évoluer en `1.0.0`
      lors de la première publication réelle)

## Ce qui n'est PAS demandé maintenant

Ce chantier n'a pas besoin de ces informations pour avancer : le code, les
pages et la documentation fonctionnent avec des placeholders visibles.
Fournissez-les quand vous serez prêt à publier — mettez alors à jour
`src/lib/legal/legal-config.ts`, qui est la seule source à modifier (les
pages légales le lisent automatiquement, aucune duplication à corriger
ailleurs).
