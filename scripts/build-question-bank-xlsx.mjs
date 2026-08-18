import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "banque-questions-reference");
const outputPath = path.join(outputDir, "Banque de questions - reference.xlsx");
const require = createRequire(path.join(outputDir, "workbook-builder.mjs"));
const { SpreadsheetFile, Workbook } = require("@oai/artifact-tool");
const bundle = JSON.parse(
  await fs.readFile(
    path.join(root, "src", "games", "quoi-de-9", "generated", "content-bundle.json"),
    "utf8",
  ),
);

const categories = new Map();
const themesDir = path.join(root, "content", "themes");
for (const entry of await fs.readdir(themesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const theme = JSON.parse(
    await fs.readFile(path.join(themesDir, entry.name, "theme.json"), "utf8"),
  );
  categories.set(theme.id, { category: theme.category, label: theme.label });
}

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Questions");
sheet.showGridLines = false;

sheet.mergeCells("A1:N1");
sheet.getRange("A1").values = [["Banque de questions — référence"]];
sheet.getRange("A1:N1").format = {
  fill: "#0F766E",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
sheet.getRange("A1:N1").format.rowHeight = 30;

const headers = [
  "Grande catégorie",
  "Thème",
  "Difficulté",
  "Question",
  "Réponse 1",
  "Réponse 2",
  "Réponse 3",
  "Réponse 4",
  "Réponse 5",
  "Réponse 6",
  "Réponse 7",
  "Réponse 8",
  "Réponse 9",
  "Bombe",
];
sheet.getRange("A2:N2").values = [headers];
sheet.getRange("A2:N2").format = {
  fill: "#164E63",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#0E7490" },
};
sheet.getRange("A2:M2").format.rowHeight = 30;

const rows = bundle.questions.map((question) => {
  const theme = categories.get(question.themeId);
  return [
    theme?.category ?? "",
    theme?.label ?? question.themeId,
    question.difficultyLabel,
    question.questionText,
    ...question.answers.map((answer) => answer.display),
    question.bomb?.display ?? "",
  ];
});
const lastRow = rows.length + 2;
sheet.getRange(`A3:N${lastRow}`).values = rows;
sheet.getRange(`A3:N${lastRow}`).format = {
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#E5E7EB" },
};
sheet.getRange(`N3:N${lastRow}`).format = {
  fill: "#111827",
  font: { color: "#FFFFFF", bold: true },
  verticalAlignment: "top",
  wrapText: true,
};

sheet.getRange(`A2:N${lastRow}`).format.borders = {
  preset: "all",
  style: "thin",
  color: "#D1D5DB",
};
sheet.getRange(`A3:M${lastRow}`).format.rowHeight = 34;
sheet.getRange("A:A").format.columnWidth = 25;
sheet.getRange("B:B").format.columnWidth = 31;
sheet.getRange("C:C").format.columnWidth = 14;
sheet.getRange("D:D").format.columnWidth = 54;
sheet.getRange("E:M").format.columnWidth = 22;
sheet.getRange("N:N").format.columnWidth = 28;
sheet.freezePanes.freezeRows(2);
sheet.tables.add(`A2:N${lastRow}`, true, "QuestionsTable");

await fs.mkdir(outputDir, { recursive: true });
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);

const check = await workbook.inspect({
  kind: "table",
  range: "Questions!A1:N8",
  include: "values,formulas",
  tableMaxRows: 8,
  tableMaxCols: 14,
});
console.log(check.ndjson);
const preview = await workbook.render({
  sheetName: "Questions",
  range: "A1:N10",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(outputDir, "preview.png"),
  new Uint8Array(await preview.arrayBuffer()),
);
console.log(outputPath);
