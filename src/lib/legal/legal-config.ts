// Source unique des informations d'identité éditeur / support / hébergeur
// utilisées par les pages légales (/legal/*, /support). Ne jamais inventer
// une valeur ici : tout champ inconnu reste TODO_BEFORE_STORE_RELEASE tant
// que l'utilisateur ne l'a pas fourni. Voir docs/compliance/PUBLISHER_INFO_REQUIRED.md
// pour la liste consolidée des champs manquants à fournir avant soumission
// Apple / Google.

export const TODO_BEFORE_STORE_RELEASE = "TODO_BEFORE_STORE_RELEASE" as const;

export interface LegalConfig {
  appName: string;
  /** Nom légal de l'éditeur : personne physique ou dénomination sociale. */
  legalPublisherName: string;
  /** Nom commercial affiché publiquement, s'il diffère du nom légal. */
  commercialName: string;
  /** Forme juridique réelle : "Personne physique / entrepreneur individuel", "SASU", etc. Ne pas supposer une société. */
  legalForm: string;
  siren: string;
  siret: string;
  vatNumber: string;
  address: string;
  country: string;
  supportEmail: string;
  privacyEmail: string;
  /** Requis en France si l'éditeur publie du contenu (loi pour la confiance dans l'économie numérique). */
  publicationDirector: string;
  hostName: string;
  hostAddress: string;
  hostContact: string;
  /** Date d'effet de la politique de confidentialité / des CGU, au format lisible (ex. "20 août 2026"). */
  policyEffectiveDate: string;
  policyVersion: string;
}

export const legalConfig: LegalConfig = {
  appName: "AntaVerse",
  legalPublisherName: TODO_BEFORE_STORE_RELEASE,
  commercialName: TODO_BEFORE_STORE_RELEASE,
  legalForm: TODO_BEFORE_STORE_RELEASE,
  siren: TODO_BEFORE_STORE_RELEASE,
  siret: TODO_BEFORE_STORE_RELEASE,
  vatNumber: TODO_BEFORE_STORE_RELEASE,
  address: TODO_BEFORE_STORE_RELEASE,
  country: TODO_BEFORE_STORE_RELEASE,
  supportEmail: TODO_BEFORE_STORE_RELEASE,
  privacyEmail: TODO_BEFORE_STORE_RELEASE,
  publicationDirector: TODO_BEFORE_STORE_RELEASE,
  // Hébergeur technique déduit de vercel.json / du build statique déployé sur Vercel.
  // L'adresse et le contact officiels doivent être revérifiés sur vercel.com/legal
  // juste avant publication (ils peuvent changer).
  hostName: "Vercel Inc.",
  hostAddress: TODO_BEFORE_STORE_RELEASE,
  hostContact: TODO_BEFORE_STORE_RELEASE,
  policyEffectiveDate: TODO_BEFORE_STORE_RELEASE,
  policyVersion: "0.1.0-draft",
};

export function isTodo(value: string): boolean {
  return value === TODO_BEFORE_STORE_RELEASE;
}

export const MISSING_LEGAL_FIELDS: (keyof LegalConfig)[] = (
  Object.keys(legalConfig) as (keyof LegalConfig)[]
).filter((key) => isTodo(legalConfig[key]));
