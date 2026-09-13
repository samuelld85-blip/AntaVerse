#!/usr/bin/env node
// Rebuilds EthnoGuessr's real-photo content pool from Wikidata + Wikimedia
// Commons: for every country in src/games/ethnoguessr/lib/geo/countries.ts,
// find a man and a woman actually born there, with a free-licensed Commons
// photo, then write src/games/ethnoguessr/data/duos.ts and
// public/games/ethnoguessr/CREDITS.md. Downloaded images go to
// public/games/ethnoguessr/duos/<wikidata-qid>.<ext> — the filename never
// gives away who the person is before the in-game reveal.
//
// Run from the repo root: `node scripts/ethnoguessr/fetch-duos.mjs`
// Takes 10-20 minutes (hundreds of Wikidata/Commons requests, deliberately
// paced, plus image downloads with 429 backoff — Commons rate-limits bursts
// of anonymous downloads).
//
// Sourcing rules (see the comment atop the generated duos.ts for why):
// - P19 (place of birth) -> P17 (country), never P27 (citizenship) — P27
//   also catches naturalized citizens and consorts-by-marriage, which
//   misrepresents the country for this game (e.g. Shakira -> P27 Spain
//   despite being born in Colombia).
// - Born after 1950 (P569) — guarantees the linked image is an actual
//   photograph, not a painting/statue of someone who predates photography.
// - Occupation isn't "politician" (Q82955) — avoids current heads of
//   state/government and other political figures.
// - Sitelink count between MIN_SITELINKS and MAX_SITELINKS — legitimate
//   (has a Wikipedia article) but deliberately obscure, so a round is
//   guessed from the photo, not recognized by name/face.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const COUNTRIES_TS = path.join(REPO_ROOT, "src/games/ethnoguessr/lib/geo/countries.ts");
const DUOS_TS = path.join(REPO_ROOT, "src/games/ethnoguessr/data/duos.ts");
const DUOS_DIR = path.join(REPO_ROOT, "public/games/ethnoguessr/duos");
const CREDITS_MD = path.join(REPO_ROOT, "public/games/ethnoguessr/CREDITS.md");

const UA = "AntaVerseEthnoGuessrContentBot/0.2 (contact: samuelld85@gmail.com)";
const MALE = "Q6581097";
const FEMALE = "Q6581072";
const MIN_SITELINKS = 1;
const MAX_SITELINKS = 12;
const CANDIDATES_PER_GENDER = 80;
const PICKS_PER_GENDER = 1;
const THUMB_WIDTH = 640;

function readCountryList() {
  const src = fs.readFileSync(COUNTRIES_TS, "utf8");
  const re = /\{ id: "(\d{3})", name: "([^"]+)"/g;
  const list = [];
  let match;
  while ((match = re.exec(src))) list.push({ id: match[1], name: match[2] });
  return list;
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

async function sparql(query) {
  const url = "https://query.wikidata.org/sparql?" + new URLSearchParams({ query, format: "json" });
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
  if (!res.ok) throw new Error(`SPARQL HTTP ${res.status}`);
  return res.json();
}

async function fetchIsoToQidMap() {
  const data = await sparql("SELECT ?country ?isoNumeric WHERE { ?country wdt:P299 ?isoNumeric. }");
  const map = new Map();
  for (const row of data.results.bindings) {
    const code = pad3(parseInt(row.isoNumeric.value, 10));
    if (!map.has(code)) map.set(code, row.country.value.split("/").pop());
  }
  return map;
}

async function candidatesFor(qid) {
  const query = `
SELECT ?person ?gender ?image WHERE {
  ?person wdt:P19 ?place;
          wdt:P21 ?gender;
          wdt:P18 ?image;
          wdt:P569 ?dob.
  ?place wdt:P17 wd:${qid}.
  FILTER(?gender IN (wd:${MALE}, wd:${FEMALE}))
  FILTER(?dob > "1950-01-01"^^xsd:dateTime)
  MINUS { ?person wdt:P106 wd:Q82955. }
}
LIMIT ${CANDIDATES_PER_GENDER}`;
  const data = await sparql(query);
  return data.results.bindings.map((b) => ({
    qid: b.person.value.split("/").pop(),
    gender: b.gender.value === `http://www.wikidata.org/entity/${MALE}` ? "man" : "woman",
    image: decodeURIComponent(b.image.value.split("Special:FilePath/")[1]),
  }));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function wbgetentities(ids) {
  const url =
    "https://www.wikidata.org/w/api.php?" +
    new URLSearchParams({ action: "wbgetentities", ids: ids.join("|"), props: "labels|sitelinks", languages: "fr|en", format: "json" });
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return res.json();
}

function stripHtml(html) {
  return (html ?? "").replace(/<[^>]+>/g, "").trim();
}

async function imageInfoBatch(filenames) {
  const titles = filenames.map((f) => `File:${f}`).join("|");
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({ action: "query", titles, prop: "imageinfo", iiprop: "url|extmetadata|size|mime", iiurlwidth: String(THUMB_WIDTH), format: "json" });
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const data = await res.json();
  const out = {};
  for (const page of Object.values(data.query?.pages ?? {})) {
    const info = page.imageinfo?.[0];
    if (!page.title || !info) continue;
    const filename = page.title.replace(/^File:/, "");
    const meta = info.extmetadata ?? {};
    out[filename] = {
      url: info.thumburl ?? info.url,
      mime: info.mime,
      license: meta.LicenseShortName?.value ?? meta.License?.value ?? "unknown",
      artist: stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? ""),
    };
  }
  return out;
}

async function downloadWithRetry(url, destPath, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
      return;
    }
    if (res.status === 429 && attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
}

function cleanArtist(raw) {
  if (!raw || /unknown author/i.test(raw)) return "Auteur inconnu";
  let text = raw.split(/\n|(?<=\.)\s(?=[A-Z])/)[0].trim();
  const half = Math.floor(text.length / 2);
  if (half > 3 && text.slice(0, half) === text.slice(half)) text = text.slice(0, half);
  const LIMIT = 60;
  if (text.length > LIMIT) {
    const cut = text.slice(0, LIMIT);
    const lastSpace = cut.lastIndexOf(" ");
    text = (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + "…";
  }
  return text.trim() || "Auteur inconnu";
}

function jsStringLiteral(value) {
  return JSON.stringify(value);
}

async function main() {
  fs.mkdirSync(DUOS_DIR, { recursive: true });
  const countries = readCountryList();
  console.error(`Mapping ${countries.length} countries to Wikidata QIDs...`);
  const qidByIso = await fetchIsoToQidMap();

  const perCountry = [];
  for (const country of countries) {
    const qid = qidByIso.get(country.id);
    if (!qid) continue;
    try {
      const candidates = await candidatesFor(qid);
      const men = candidates.filter((c) => c.gender === "man");
      const women = candidates.filter((c) => c.gender === "woman");
      if (men.length && women.length) perCountry.push({ ...country, qid, men, women });
      console.error(`${country.name}: ${men.length} men, ${women.length} women candidates`);
    } catch (err) {
      console.error(`FAILED ${country.name}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  const allQids = perCountry.flatMap((c) => [...c.men, ...c.women].map((p) => p.qid));
  const entityInfo = {};
  console.error(`Resolving labels/sitelinks for ${new Set(allQids).size} candidates...`);
  for (const batch of chunk([...new Set(allQids)], 50)) {
    const data = await wbgetentities(batch);
    for (const [qid, entity] of Object.entries(data.entities ?? {})) {
      entityInfo[qid] = {
        label: entity.labels?.fr?.value ?? entity.labels?.en?.value ?? null,
        sitelinkCount: Object.keys(entity.sitelinks ?? {}).length,
      };
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  function pick(list) {
    return list
      .map((p) => ({ ...p, ...entityInfo[p.qid] }))
      .filter((p) => p.label && p.sitelinkCount >= MIN_SITELINKS && p.sitelinkCount <= MAX_SITELINKS)
      .slice(0, PICKS_PER_GENDER)[0];
  }

  const selection = perCountry
    .map((c) => ({ countryId: c.id, countryName: c.name, man: pick(c.men), woman: pick(c.women) }))
    .filter((c) => c.man && c.woman);

  console.error(`Resolving Commons license info for ${selection.length * 2} files...`);
  const files = [...new Set(selection.flatMap((c) => [c.man.image, c.woman.image]))];
  const fileInfo = {};
  for (const batch of chunk(files, 40)) {
    Object.assign(fileInfo, await imageInfoBatch(batch));
    await new Promise((r) => setTimeout(r, 150));
  }

  const final = selection.map((c) => ({
    countryId: c.countryId,
    countryName: c.countryName,
    man: { name: c.man.label, qid: c.man.qid, file: c.man.image, ...fileInfo[c.man.image] },
    woman: { name: c.woman.label, qid: c.woman.qid, file: c.woman.image, ...fileInfo[c.woman.image] },
  }));

  console.error(`Downloading ${final.length * 2} photos to ${path.relative(REPO_ROOT, DUOS_DIR)}...`);
  let downloaded = 0;
  for (const country of final) {
    for (const role of ["man", "woman"]) {
      const person = country[role];
      const ext = person.mime === "image/png" ? "png" : "jpg";
      person.filename = `${person.qid}.${ext}`;
      const destPath = path.join(DUOS_DIR, person.filename);
      if (!fs.existsSync(destPath)) {
        await downloadWithRetry(person.url, destPath);
        await new Promise((r) => setTimeout(r, 200));
      }
      downloaded++;
      if (downloaded % 40 === 0) console.error(`  ${downloaded}/${final.length * 2}`);
    }
  }

  const tsLines = [
    "// Generated by scripts/ethnoguessr/fetch-duos.mjs — see",
    "// public/games/ethnoguessr/CREDITS.md for full attribution.",
    "//",
    "// Each round shows a real man and a real woman born in the same country —",
    "// not a couple, not a claim about their ethnicity, just two people from that",
    "// place. Both are deliberately non-famous (a handful of Wikipedia interwiki",
    "// links at most, no current heads of state/government, born after 1950 so",
    "// the picture is an actual photo): the round is guessed from the photos",
    "// alone, so a recognizable face would let players answer by name recall",
    "// instead. Their names and photo credits are only shown after the guess is",
    "// scored, on the result screen.",
    "export interface DuoPerson {",
    "  name: string;",
    "  imageSrc: string;",
    "  credit: string;",
    "  creditUrl: string;",
    "}",
    "",
    "export interface DuoRound {",
    "  id: string;",
    "  countryId: string;",
    "  man: DuoPerson;",
    "  woman: DuoPerson;",
    "}",
    "",
    "export const DUO_ROUNDS: readonly DuoRound[] = [",
  ];
  const creditsLines = [
    "# Crédits photo — EthnoGuessr",
    "",
    "Chaque photo vient de Wikimedia Commons et reste sous sa licence d'origine.",
    "",
  ];

  function personLiteral(p) {
    const credit = `${cleanArtist(p.artist)} — ${p.license}`;
    const creditUrl = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(p.file)}`;
    return {
      lines: [
        `      name: ${jsStringLiteral(p.name)},`,
        `      imageSrc: ${jsStringLiteral(`/games/ethnoguessr/duos/${p.filename}`)},`,
        `      credit: ${jsStringLiteral(credit)},`,
        `      creditUrl: ${jsStringLiteral(creditUrl)},`,
      ],
      creditLine: `- ${p.name} — ${cleanArtist(p.artist)}, ${p.license} — [source](${creditUrl})`,
    };
  }

  for (const country of final) {
    const man = personLiteral(country.man);
    const woman = personLiteral(country.woman);
    tsLines.push(
      "  {",
      `    id: ${jsStringLiteral(country.countryId)},`,
      `    countryId: ${jsStringLiteral(country.countryId)},`,
      "    man: {",
      ...man.lines,
      "    },",
      "    woman: {",
      ...woman.lines,
      "    },",
      "  },",
    );
    creditsLines.push(`## ${country.countryName}`, man.creditLine, woman.creditLine, "");
  }

  tsLines.push(
    "];",
    "",
    "const DUO_BY_ID = new Map(DUO_ROUNDS.map((duo) => [duo.id, duo]));",
    "",
    "export function getDuo(id: string): DuoRound | undefined {",
    "  return DUO_BY_ID.get(id);",
    "}",
    "",
  );

  fs.writeFileSync(DUOS_TS, tsLines.join("\n"));
  fs.writeFileSync(CREDITS_MD, creditsLines.join("\n"));
  console.error(`Done: ${final.length} countries, ${final.length * 2} photos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
