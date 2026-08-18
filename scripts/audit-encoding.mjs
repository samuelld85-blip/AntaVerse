import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SUSPICIOUS_MOJIBAKE_PATTERNS } from "./text-encoding.mjs";

const roots = ["src", "scripts", "public", "content", "README.md"];
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".html",
  ".md",
  ".css",
  ".csv",
  ".sql",
]);
async function collectFiles(path, files) {
  try {
    const details = await stat(path);
    if (details.isDirectory()) {
      const entries = await readdir(path);
      await Promise.all(entries.map((entry) => collectFiles(join(path, entry), files)));
    } else if (textExtensions.has(extname(path)) || path === "README.md") {
      files.push(path);
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}

export async function auditEncoding() {
  const files = [];
  await Promise.all(roots.map((root) => collectFiles(root, files)));
  const findings = [];
  for (const file of files.sort()) {
    const bytes = await readFile(file);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (text !== text.normalize("NFC")) {
      findings.push({ file, pattern: "normalisation Unicode non NFC" });
    }
    for (const suspicious of SUSPICIOUS_MOJIBAKE_PATTERNS) {
      if (suspicious.pattern.test(text)) findings.push({ file, pattern: suspicious.label });
    }
  }
  return { filesChecked: files.length, findings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = await auditEncoding();
  if (report.findings.length > 0) {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  console.log(`Encodage UTF-8 valide : ${report.filesChecked} fichiers contrôlés.`);
}
