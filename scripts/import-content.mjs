import { writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { computeAnswerSetFingerprint, normalizeAnswer } from "./content-fingerprint.mjs";
import { findContentDuplicates } from "./content-duplicates.mjs";
import { loadContentLibrary } from "./content-loader.mjs";
import { DIFFICULTY_LABELS, quizQuestionSchema } from "./content-model.mjs";
import { normalizeUnicode, readUtf8Text } from "./text-encoding.mjs";

const sourceArgument = process.argv.find(
  (argument) =>
    !argument.startsWith("--") && [".json", ".csv"].includes(extname(argument).toLowerCase()),
);
if (!sourceArgument) {
  console.error("Usage : npm run content:import -- chemin/fiches.json|csv [--write]");
  process.exit(1);
}

const sourcePath = resolve(sourceArgument);
const text = await readUtf8Text(sourcePath);
const rawRecords =
  extname(sourcePath).toLowerCase() === ".json" ? recordsFromJson(text) : recordsFromCsv(text);
const candidates = normalizeUnicode(rawRecords).map(prepareRecord);
const parsed = [];
const errors = [];
for (const [index, candidate] of candidates.entries()) {
  const result = quizQuestionSchema.safeParse(candidate);
  if (result.success) parsed.push(result.data);
  else {
    errors.push(
      ...result.error.issues.map(
        (issue) => `ligne ${index + 1} · ${issue.path.join(".") || "$"} : ${issue.message}`,
      ),
    );
  }
}
if (errors.length > 0) {
  console.error(
    `Import refusé (${errors.length} erreur(s)) :\n${errors.map((error) => `- ${error}`).join("\n")}`,
  );
  process.exit(1);
}

const library = await loadContentLibrary();
const incomingIds = new Set(parsed.map((question) => question.id));
if (incomingIds.size !== parsed.length) {
  console.error("Import refusé : un même identifiant apparaît plusieurs fois dans le fichier.");
  process.exit(1);
}
const merged = [
  ...library.questions.filter((question) => !incomingIds.has(question.id)),
  ...parsed,
];
const warnings = findContentDuplicates(merged).filter((warning) =>
  warning.questionIds.some((id) => incomingIds.has(id)),
);
for (const warning of warnings) {
  console.warn(
    `AVERTISSEMENT ${warning.type} (${warning.score.toFixed(2)}) : ${warning.questionIds.join(" / ")}`,
  );
}

if (process.argv.includes("--write")) {
  const themeIds = new Set(library.themes.map((theme) => theme.id));
  for (const question of parsed) {
    if (!themeIds.has(question.themeId)) {
      console.error(`Import refusé : thème inconnu ${question.themeId} pour ${question.id}.`);
      process.exit(1);
    }
  }
  for (const theme of library.themes) {
    for (const [level, filename] of [
      [1, "questions.easy.json"],
      [2, "questions.medium.json"],
      [3, "questions.hard.json"],
    ]) {
      const records = merged
        .filter((question) => question.themeId === theme.id && question.difficultyLevel === level)
        .sort((left, right) => left.id.localeCompare(right.id));
      await writeFile(
        resolve("content", "themes", theme.id, filename),
        `${JSON.stringify(records, null, 2)}\n`,
        "utf8",
      );
    }
  }
  console.log(`${parsed.length} fiche(s) importée(s) en UTF-8 NFC.`);
} else {
  console.log(
    `${parsed.length} fiche(s) valide(s), ${warnings.length} avertissement(s). Ajoutez --write pour les enregistrer.`,
  );
}

function recordsFromJson(value) {
  const parsedJson = JSON.parse(value);
  if (Array.isArray(parsedJson)) return parsedJson;
  if (Array.isArray(parsedJson.questions)) return parsedJson.questions;
  throw new Error("Le JSON doit être un tableau ou contenir une propriété questions.");
}

function recordsFromCsv(value) {
  const rows = parseCsv(value);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows
    .slice(1)
    .filter((row) => row.some(Boolean))
    .map((row, index) => {
      const record = Object.fromEntries(
        headers.map((header, column) => [header, row[column] ?? ""]),
      );
      if (record.recordJson) {
        try {
          return JSON.parse(record.recordJson);
        } catch (error) {
          throw new Error(`CSV ligne ${index + 2}, recordJson invalide : ${error.message}`);
        }
      }
      for (const field of ["subthemeIds", "tags", "answers", "sources"]) {
        if (record[field]) record[field] = JSON.parse(record[field]);
      }
      for (const field of [
        "difficultyLevel",
        "editorialDifficultyScore",
        "specificityScore",
        "popularityScore",
        "recallDifficultyScore",
        "answerSetHomogeneityScore",
        "expectedAverageAnswers",
        "observedAverageAnswers",
        "playCount",
        "version",
      ]) {
        if (record[field] !== "" && record[field] !== undefined)
          record[field] = Number(record[field]);
        else delete record[field];
      }
      if (record.timeSensitive !== undefined)
        record.timeSensitive = record.timeSensitive === "true";
      for (const [key, field] of Object.entries(record)) if (field === "") delete record[key];
      return record;
    });
}

function prepareRecord(rawRecord) {
  const record = structuredClone(rawRecord);
  record.language ??= "fr";
  record.status ??= "draft";
  record.sources ??= [];
  record.playCount ??= 0;
  record.timeSensitive ??= false;
  record.version ??= 1;
  const now = new Date().toISOString();
  record.createdAt ??= now;
  record.updatedAt ??= now;
  if ([1, 2, 3].includes(record.difficultyLevel)) {
    record.difficultyLabel = DIFFICULTY_LABELS[record.difficultyLevel];
  }
  if (Array.isArray(record.answers)) {
    record.answers = record.answers.map((answer, index) => ({
      ...answer,
      id: answer.id ?? `${record.id}-answer-${index + 1}`,
      normalized: answer.normalized ?? normalizeAnswer(answer.display ?? ""),
      aliases: answer.aliases ?? [],
      abbreviations: answer.abbreviations ?? [],
      alternativeSpellings: answer.alternativeSpellings ?? [],
      accentInsensitiveVariants: answer.accentInsensitiveVariants ?? [],
      hyphenationVariants: answer.hyphenationVariants ?? [],
      displayOrder: answer.displayOrder ?? index + 1,
      sources: answer.sources ?? record.sources,
    }));
    record.answerSetFingerprint = computeAnswerSetFingerprint(record.answers);
  }
  return record;
}

function parseCsv(value) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quoted) {
      if (character === '"' && value[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/u, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (quoted) throw new Error("CSV invalide : guillemet non fermé.");
  if (field || row.length) {
    row.push(field.replace(/\r$/u, ""));
    rows.push(row);
  }
  return rows;
}
