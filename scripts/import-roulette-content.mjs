/**
 * Import script: Excel reviewed banks → TypeScript content files
 *
 * Usage:
 *   node scripts/import-roulette-content.mjs [path-to-excel]
 *
 * Default path: Downloads/Roulette_du_Chaos_Revue_Technique_V2 (1).xlsx
 * Reads all "Banque - ..." sheets and regenerates the corresponding
 * src/games/roulette-du-chaos/data/content/*.ts files.
 *
 * Fail-fast: exits non-zero if any expected sheet or required column is missing.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT_DIR = resolve(ROOT, "src/games/roulette-du-chaos/data/content");

const EXCEL_PATH =
  process.argv[2] ??
  "C:/Users/Samue/Downloads/Roulette_du_Chaos_Revue_Technique_V2 (1).xlsx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readExcel(path) {
  try {
    return XLSX.read(readFileSync(path));
  } catch (e) {
    fatal(`Cannot read Excel file: ${path}\n${e.message}`);
  }
}

function fatal(msg) {
  console.error(`\n[IMPORT ERROR] ${msg}\n`);
  process.exit(1);
}

function getSheet(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) fatal(`Expected sheet "${name}" not found. Available: ${wb.SheetNames.join(", ")}`);
  return ws;
}

function getRows(ws, sheetName) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (rows.length < 2) fatal(`Sheet "${sheetName}" has no data rows.`);
  return { headers: rows[0], data: rows.slice(1) };
}

function requireCol(headers, colName, sheetName) {
  const needle = colName.trim().toLowerCase();
  // Try exact match first, then "starts with" for columns with trailing annotations
  let idx = headers.findIndex((h) => String(h).trim().toLowerCase() === needle);
  if (idx === -1)
    idx = headers.findIndex((h) => String(h).trim().toLowerCase().startsWith(needle));
  if (idx === -1)
    fatal(
      `Sheet "${sheetName}": required column "${colName}" not found.\nAvailable columns: ${headers.join(" | ")}`,
    );
  return idx;
}

function writeFile(filePath, content) {
  writeFileSync(filePath, content, "utf-8");
  console.log(`  ✓ Written: ${filePath.replace(ROOT, "")}`);
}

function jsonStr(s) {
  // Output as double-quoted string, escaping only what's necessary
  return JSON.stringify(s);
}

// ---------------------------------------------------------------------------
// Bank importers — each returns { count, content: string }
// ---------------------------------------------------------------------------

function importEstimation(wb) {
  const name = "Banque - Estimation";
  const ws = getSheet(wb, name);
  const { headers, data } = getRows(ws, name);
  const iId = requireCol(headers, "ID", name);
  const iQ = requireCol(headers, "Question", name);
  const iA = requireCol(headers, "Réponse numérique", name);
  const iU = requireCol(headers, "Unité", name);

  const entries = data
    .filter((row) => row[iId] && row[iQ] && row[iA] !== "")
    .map((row) => {
      const id = String(row[iId]).trim();
      const question = String(row[iQ]).trim();
      const answer = Number(row[iA]);
      const unit = String(row[iU] ?? "").trim();
      if (isNaN(answer)) fatal(`${name}: row with id=${id} has non-numeric answer "${row[iA]}"`);
      return { id, question, answer, unit: unit || undefined };
    });

  const lines = entries.map((e) => {
    const base = `  { id: ${jsonStr(e.id)}, question: ${jsonStr(e.question)}, answer: ${e.answer}`;
    return e.unit ? `${base}, unit: ${jsonStr(e.unit)} }` : `${base} }`;
  });

  const content = `// Bank for the "Estimation éclair" mini-game (DL6) and T12 "Estimation collective".
// Casual numerical questions anyone can take a guess at — no specialist trivia.

export interface EstimationQuestion {
  id: string;
  question: string;
  answer: number;
  unit?: string;
}

export const ESTIMATION_QUESTIONS: readonly EstimationQuestion[] = [
${lines.join(",\n")},
] as const;
`;
  return { count: entries.length, content };
}

function importSimpleStrings(wb, sheetName, colName, constName, exportedName, header) {
  const ws = getSheet(wb, sheetName);
  const { headers, data } = getRows(ws, sheetName);
  const iCol = requireCol(headers, colName, sheetName);

  const entries = data
    .filter((row) => row[iCol] && String(row[iCol]).trim())
    .map((row) => String(row[iCol]).trim());

  const lines = entries.map((e) => `  ${jsonStr(e)}`);

  const content = `${header}
export const ${constName}: readonly string[] = [
${lines.join(",\n")},
] as const;
`;
  return { count: entries.length, content, exportedName };
}

function importDesignationFragments(wb) {
  const name = "Banque - Désignation légère";
  const ws = getSheet(wb, name);
  const { headers, data } = getRows(ws, name);
  // Col B: "Fragment (inséré dans « Qui serait le plus susceptible de {x} ? »)"
  const iCol = headers.findIndex((h) => String(h).toLowerCase().includes("fragment"));
  if (iCol === -1)
    fatal(
      `Sheet "${name}": column containing "fragment" not found. Headers: ${headers.join(" | ")}`,
    );

  const entries = data
    .filter((row) => row[iCol] && String(row[iCol]).trim())
    .map((row) => String(row[iCol]).trim());

  const lines = entries.map((e) => `  ${jsonStr(e)}`);
  const content = `// Bank for T8 "Désignation" — "Qui serait le plus susceptible de...?" — kept
// light and funny, never humiliating, sexual, discriminatory, medical, or
// traumatic (see spec section 22 / T8).

export const DESIGNATION_PROMPTS: readonly string[] = [
${lines.join(",\n")},
] as const;
`;
  return { count: entries.length, content };
}

function importSpicyDesignation(wb) {
  const name = "Banque - Désignation épicée";
  const ws = getSheet(wb, name);
  const { headers, data } = getRows(ws, name);
  // Col B: "Question complète" — may be a fragment (without "Qui serait...") or a full question.
  // We normalise: if it doesn't start with "Qui", wrap it.
  const iCol = headers.findIndex(
    (h) => String(h).toLowerCase().includes("question") || String(h).toLowerCase().includes("fragment"),
  );
  if (iCol === -1)
    fatal(`Sheet "${name}": no question/fragment column found. Headers: ${headers.join(" | ")}`);

  const entries = data
    .filter((row) => row[iCol] && String(row[iCol]).trim())
    .map((row) => {
      const raw = String(row[iCol]).trim();
      // Normalise: if it's a fragment (doesn't start with "Qui"), wrap it.
      if (/^[Qq]ui\b/.test(raw)) return raw;
      // Wrap fragment with the standard prefix
      return `Qui serait le plus susceptible de ${raw} ?`;
    });

  const lines = entries.map((e) => `  ${jsonStr(e)}`);
  const content = `// Extra bank for T8 "Désignation" — full "Qui serait le plus susceptible
// de... ?" questions, spicier than the light fragments in
// designation-prompts.ts. T8 draws from both pools.

export const SPICY_DESIGNATION_PROMPTS: readonly string[] = [
${lines.join(",\n")},
] as const;
`;
  return { count: entries.length, content };
}

function importMajority(wb) {
  const name = "Banque - Majorité";
  const ws = getSheet(wb, name);
  const { headers, data } = getRows(ws, name);
  const iId = requireCol(headers, "ID", name);
  const iLeft = headers.findIndex((h) => String(h).toLowerCase().includes("gauche"));
  const iRight = headers.findIndex((h) => String(h).toLowerCase().includes("droite"));
  if (iLeft === -1) fatal(`Sheet "${name}": "Option gauche" column not found.`);
  if (iRight === -1) fatal(`Sheet "${name}": "Option droite" column not found.`);

  const entries = data
    .filter((row) => row[iId] && row[iLeft] && row[iRight])
    .map((row) => ({
      id: String(row[iId]).trim(),
      left: String(row[iLeft]).trim(),
      right: String(row[iRight]).trim(),
    }));

  const lines = entries.map(
    (e) => `  { id: ${jsonStr(e.id)}, left: ${jsonStr(e.left)}, right: ${jsonStr(e.right)} }`,
  );

  const content = `// Bank for T2 "Majorité" and T11 "Camp contre camp" — binary preference
// questions the group votes on physically (point left/right). The app just
// displays the question and records which side lost.

export interface MajorityPrompt {
  id: string;
  left: string;
  right: string;
}

export const MAJORITY_PROMPTS: readonly MajorityPrompt[] = [
${lines.join(",\n")},
] as const;
`;
  return { count: entries.length, content };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\nImporting Roulette du Chaos content banks from:\n  ${EXCEL_PATH}\n`);

const wb = readExcel(EXCEL_PATH);

// Validate all expected sheets exist up-front
const EXPECTED_SHEETS = [
  "Banque - Estimation",
  "Banque - Confessions",
  "Banque - Tribunal",
  "Banque - Je n'ai jamais",
  "Banque - Extrêmes",
  "Banque - Désignation légère",
  "Banque - Désignation épicée",
  "Banque - Destin collectif",
  "Banque - Majorité",
  "Banque - Mots interdits",
  "Banque - Mime",
  "Banque - Voix imposée",
  "Banque - Catégories chaîne",
];
const missing = EXPECTED_SHEETS.filter((s) => !wb.SheetNames.includes(s));
if (missing.length) fatal(`Missing sheets: ${missing.join(", ")}`);

const results = [];

// 1. Estimation
{
  const r = importEstimation(wb);
  writeFile(resolve(CONTENT_DIR, "estimation-questions.ts"), r.content);
  results.push({ bank: "Estimation", file: "estimation-questions.ts", count: r.count });
}

// 2. Confessions
{
  const r = importSimpleStrings(
    wb,
    "Banque - Confessions",
    "Question",
    "CONFESSION_QUESTIONS",
    "confession-questions.ts",
    `// Bank for S9 "Confession express" and C10 "Vérité ou pénalité".`,
  );
  writeFile(resolve(CONTENT_DIR, "confession-questions.ts"), r.content);
  results.push({ bank: "Confessions", file: "confession-questions.ts", count: r.count });
}

// 3. Tribunal
{
  const r = importSimpleStrings(
    wb,
    "Banque - Tribunal",
    "Affirmation",
    "VERDICT_STATEMENTS",
    "verdict-statements.ts",
    `// Bank for S10 "Le tribunal" — affirmations about the active player.`,
  );
  writeFile(resolve(CONTENT_DIR, "verdict-statements.ts"), r.content);
  results.push({ bank: "Tribunal", file: "verdict-statements.ts", count: r.count });
}

// 4. Je n'ai jamais
{
  const r = importSimpleStrings(
    wb,
    "Banque - Je n'ai jamais",
    "Affirmation",
    "NEVER_HAVE_I_EVER",
    "never-have-i-ever.ts",
    `// Bank for T9 "Je n'ai jamais express".`,
  );
  writeFile(resolve(CONTENT_DIR, "never-have-i-ever.ts"), r.content);
  results.push({ bank: "Je n'ai jamais", file: "never-have-i-ever.ts", count: r.count });
}

// 5. Extrêmes
{
  const r = importSimpleStrings(
    wb,
    "Banque - Extrêmes",
    "Question",
    "EXTREME_QUESTIONS",
    "extreme-questions.ts",
    `// Bank for T6 "Les extrêmes" — provocative/personal group designation questions.`,
  );
  writeFile(resolve(CONTENT_DIR, "extreme-questions.ts"), r.content);
  results.push({ bank: "Extrêmes", file: "extreme-questions.ts", count: r.count });
}

// 6. Désignation légère
{
  const r = importDesignationFragments(wb);
  writeFile(resolve(CONTENT_DIR, "designation-prompts.ts"), r.content);
  results.push({ bank: "Désignation légère", file: "designation-prompts.ts", count: r.count });
}

// 7. Désignation épicée
{
  const r = importSpicyDesignation(wb);
  writeFile(resolve(CONTENT_DIR, "spicy-designation-prompts.ts"), r.content);
  results.push({ bank: "Désignation épicée", file: "spicy-designation-prompts.ts", count: r.count });
}

// 8. Destin collectif
{
  const r = importSimpleStrings(
    wb,
    "Banque - Destin collectif",
    "Qualificatif",
    "DESTINY_PROMPTS",
    "destiny-prompts.ts",
    `// Bank for F8 "Destin collectif" — neutral qualifiers ("ceux qui...") with no
// sensitive identity traits, only everyday/neutral facts (see spec 24 / F8).`,
  );
  writeFile(resolve(CONTENT_DIR, "destiny-prompts.ts"), r.content);
  results.push({ bank: "Destin collectif", file: "destiny-prompts.ts", count: r.count });
}

// 9. Majorité
{
  const r = importMajority(wb);
  writeFile(resolve(CONTENT_DIR, "majority-prompts.ts"), r.content);
  results.push({ bank: "Majorité", file: "majority-prompts.ts", count: r.count });
}

// 10. Mots interdits
{
  const r = importSimpleStrings(
    wb,
    "Banque - Mots interdits",
    "Mot",
    "FORBIDDEN_WORDS",
    "forbidden-words.ts",
    `// Bank for R6 "Mot interdit" — common filler words, easy to say by accident.`,
  );
  writeFile(resolve(CONTENT_DIR, "forbidden-words.ts"), r.content);
  results.push({ bank: "Mots interdits", file: "forbidden-words.ts", count: r.count });
}

// 11. Mime
{
  const r = importSimpleStrings(
    wb,
    "Banque - Mime",
    "Mot à mimer",
    "MIME_WORDS",
    "mime-words.ts",
    `// Bank for S12 "Mime ou sanction" — words to mime in 20 seconds.`,
  );
  writeFile(resolve(CONTENT_DIR, "mime-words.ts"), r.content);
  results.push({ bank: "Mime", file: "mime-words.ts", count: r.count });
}

// 12. Voix imposée
{
  const r = importSimpleStrings(
    wb,
    "Banque - Voix imposée",
    "Manière de parler",
    "VOICE_STYLES",
    "voice-styles.ts",
    `// Bank for R9 "Voix imposée" — voice styles the active player must use.`,
  );
  writeFile(resolve(CONTENT_DIR, "voice-styles.ts"), r.content);
  results.push({ bank: "Voix imposée", file: "voice-styles.ts", count: r.count });
}

// 13. Catégories chaîne
{
  const r = importSimpleStrings(
    wb,
    "Banque - Catégories chaîne",
    "Catégorie",
    "CHAIN_CATEGORIES",
    "chain-categories.ts",
    `// Bank for DL11 "Mot en chaîne" and T10 "Tour de table" — category themes.`,
  );
  writeFile(resolve(CONTENT_DIR, "chain-categories.ts"), r.content);
  results.push({ bank: "Catégories chaîne", file: "chain-categories.ts", count: r.count });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = results.reduce((sum, r) => sum + r.count, 0);
console.log("\n=== IMPORT SUMMARY ===");
results.forEach((r) => console.log(`  ${r.bank.padEnd(22)} → ${String(r.count).padStart(3)} entrées  (${r.file})`));
console.log(`\n  TOTAL: ${total} entrées importées\n`);
