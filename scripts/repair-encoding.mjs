import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const windows1252Bytes = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);
const suspicious = /\u00c3|\u00c2|\u00e2\u20ac|\u00c5[\u201c\u201d]|\ufffd/u;

export function repairMojibake(value) {
  let repaired = value;
  for (let pass = 0; pass < 5 && suspicious.test(repaired); pass += 1) {
    const bytes = [];
    for (const character of repaired) {
      const codePoint = character.codePointAt(0);
      const byte = windows1252Bytes.get(codePoint) ?? (codePoint <= 0xff ? codePoint : null);
      if (byte === null) return repaired.normalize("NFC");
      bytes.push(byte);
    }
    try {
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
      if (decoded === repaired) break;
      repaired = decoded;
    } catch {
      break;
    }
  }
  return repaired.normalize("NFC");
}

function repairJson(value) {
  if (typeof value === "string") return repairMojibake(value);
  if (Array.isArray(value)) return value.map(repairJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, repairJson(entry)]),
    );
  }
  return value;
}

const fileArgument = process.argv[2];
if (!fileArgument) {
  console.error("Usage : node scripts/repair-encoding.mjs chemin/fichier.json --write");
  process.exit(1);
}

const path = resolve(fileArgument);
const original = JSON.parse((await readFile(path, "utf8")).replace(/^\ufeff/u, ""));
const repaired = repairJson(original);
const serialized = `${JSON.stringify(repaired, null, 2)}\n`;

if (process.argv.includes("--write")) {
  await writeFile(path, serialized, "utf8");
  console.log(`Encodage réparé et normalisé en NFC : ${fileArgument}`);
} else {
  console.log(serialized);
}
