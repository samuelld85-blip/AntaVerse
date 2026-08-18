import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";
import { z } from "zod";
import { quizQuestionSchema, themeSchema } from "./content-model.mjs";

const version = "2026.08.17";
const outputDirectory = resolve("content", "schema");
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  writeSchema("question.schema.json", quizQuestionSchema, "Question Qui des 9"),
  writeSchema("theme.schema.json", themeSchema, "Thème Qui des 9"),
]);
console.log(`Schémas JSON exportés, version ${version}.`);

async function writeSchema(filename, schema, title) {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-2020-12" });
  const output = {
    ...jsonSchema,
    $id: `https://qui-des-9.local/schema/${version}/${filename}`,
    title,
    "x-content-version": version,
  };
  await writeFile(
    resolve(outputDirectory, filename),
    await format(JSON.stringify(output), { parser: "json", printWidth: 100 }),
    "utf8",
  );
}
