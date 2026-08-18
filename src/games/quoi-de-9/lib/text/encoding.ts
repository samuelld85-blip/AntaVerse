export const REPRESENTATIVE_FRENCH_STRINGS = [
  "Géographie",
  "Cinéma",
  "Télévision & séries",
  "Cuisine & gastronomie",
  "Mythologie & légendes",
  "L’équipe a trouvé neuf réponses.",
  "Quels sont les neuf pays concernés ?",
  "Cœur",
  "Œuvre",
  "Ça dépend de l’époque.",
] as const;

const SUSPICIOUS_MOJIBAKE = [
  /\u00c3/u,
  /\u00c2(?!\p{L})/u,
  /\u00e2\u20ac\u2122/u,
  /\u00e2\u20ac\u0153/u,
  /\u00e2\u20ac/u,
  /\ufffd/u,
] as const;

export function normalizeText(value: string): string {
  return value.normalize("NFC");
}

export function normalizeUnicodeDeep<T>(value: T): T {
  if (typeof value === "string") return normalizeText(value) as T;
  if (Array.isArray(value)) return value.map(normalizeUnicodeDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        normalizeText(key),
        normalizeUnicodeDeep(nested),
      ]),
    ) as T;
  }
  return value;
}

export function containsSuspiciousMojibake(value: string): boolean {
  return SUSPICIOUS_MOJIBAKE.some((pattern) => pattern.test(value));
}

export function findSuspiciousMojibake(
  value: unknown,
  path: Array<string | number> = [],
): Array<{ path: Array<string | number>; value: string }> {
  if (typeof value === "string") {
    return containsSuspiciousMojibake(value) ? [{ path, value }] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((nested, index) => findSuspiciousMojibake(nested, [...path, index]));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      findSuspiciousMojibake(nested, [...path, key]),
    );
  }
  return [];
}
