import { readFile } from "node:fs/promises";

export const SUSPICIOUS_MOJIBAKE_PATTERNS = [
  { label: "U+00C3", pattern: /\u00c3/u },
  { label: "U+00C2 isolé", pattern: /\u00c2(?!\p{L})/u },
  { label: "apostrophe mojibake", pattern: /\u00e2\u20ac\u2122/u },
  { label: "guillemet mojibake", pattern: /\u00e2\u20ac\u0153/u },
  { label: "tiret ou guillemet mojibake", pattern: /\u00e2\u20ac/u },
  { label: "caractère de remplacement", pattern: /\ufffd/u },
];

export function normalizeUnicode(value) {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) return value.map(normalizeUnicode);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key.normalize("NFC"),
        normalizeUnicode(nested),
      ]),
    );
  }
  return value;
}

export function findSuspiciousMojibake(value, path = "$") {
  const findings = [];
  if (typeof value === "string") {
    for (const suspicious of SUSPICIOUS_MOJIBAKE_PATTERNS) {
      if (suspicious.pattern.test(value)) findings.push({ path, pattern: suspicious.label });
    }
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((nested, index) =>
      findings.push(...findSuspiciousMojibake(nested, `${path}[${index}]`)),
    );
    return findings;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      findings.push(...findSuspiciousMojibake(nested, `${path}.${key}`));
    }
  }
  return findings;
}

export function assertNoSuspiciousMojibake(value, source = "contenu") {
  const findings = findSuspiciousMojibake(value);
  if (findings.length > 0) {
    const details = findings.map(({ path, pattern }) => `${path}: ${pattern}`).join("\n");
    throw new Error(`Mojibake suspect dans ${source} :\n${details}`);
  }
}

export async function readUtf8Text(path) {
  const bytes = await readFile(path);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\ufeff/u, "");
}

export async function readUtf8Json(path) {
  const parsed = JSON.parse(await readUtf8Text(path));
  const normalized = normalizeUnicode(parsed);
  assertNoSuspiciousMojibake(normalized, path);
  return normalized;
}
