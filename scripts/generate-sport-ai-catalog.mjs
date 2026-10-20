import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

// The hand-maintained Sport catalogue remains the only source of truth.
const source = new URL("../src/sport/catalog.ts", import.meta.url);
const target = new URL("../supabase/functions/_shared/sport-ai-catalog.json", import.meta.url);
const compiled = ts.transpileModule(await readFile(source, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { exercises } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const catalog = exercises.map(({ id, name, equipment, primary, secondary, pattern }) => ({
  id,
  name,
  equipment,
  primary,
  secondary,
  pattern,
}));
const output = `${JSON.stringify(catalog, null, 2)}\n`;
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8").catch(() => "")) !== output) {
    throw new Error("Catalogue IA périmé : exécutez npm run sport:ai:catalog.");
  }
} else {
  await writeFile(target, output, "utf8");
}
