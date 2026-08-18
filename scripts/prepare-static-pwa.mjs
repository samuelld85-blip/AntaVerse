import { createHash } from "node:crypto";
import { access, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve("out");
const routes = [
  "/",
  "/installer/",
  "/quoi-de-9/",
  "/quoi-de-9/creer/",
  "/quoi-de-9/partie/",
  "/quoi-de-9/regles/",
  "/quoi-de-9/installer/",
  "/la-relance/",
  "/la-relance/equipes/",
  "/la-relance/partie/",
  "/sans-le-dire/",
  "/sans-le-dire/equipes/",
  "/sans-le-dire/partie/",
];
const assets = new Set([
  ...routes,
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/app-icon.svg",
  "/icons/maskable-icon.svg",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/games/quoi-de-9/icons/app-icon.svg",
  "/games/la-relance/icons/logo-mark.png",
  "/brand/v1/sans-le-dire-mark.svg",
]);

for (const route of routes) {
  const routeDirectory = route === "/" ? outputDirectory : resolve(outputDirectory, route.slice(1));
  const htmlPath = resolve(routeDirectory, "index.html");
  const html = await readFile(htmlPath, "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/gu)) {
    const url = match[1]?.replaceAll("\\", "").split("?")[0];
    if (url?.startsWith("/") && !url.startsWith("/admin/")) assets.add(url);
  }
  for (const entry of await readdir(routeDirectory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".txt")) assets.add(`${route}${entry.name}`);
  }
}

// L'outil de revue est utile en développement, mais ses données éditoriales ne doivent pas
// être publiées. Supprime la route et ses chunks exclusifs de l'export statique.
const adminHtmlPath = resolve(outputDirectory, "quoi-de-9", "admin", "contenu", "index.html");
try {
  const adminHtml = await readFile(adminHtmlPath, "utf8");
  const adminAssets = new Set();
  for (const match of adminHtml.matchAll(/\/_next\/static\/[^"'\\<>\s?]+/gu)) {
    adminAssets.add(match[0]);
  }
  for (const url of adminAssets) {
    if (!assets.has(url)) await rm(filePathForUrl(url), { force: true });
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
await Promise.all([
  rm(resolve(outputDirectory, "quoi-de-9", "admin"), { recursive: true, force: true }),
  rm(resolve(outputDirectory, "quoi-de-9", "admin.html"), { force: true }),
]);

for (const relativePath of await readdir(resolve(outputDirectory, "_next", "static"), {
  recursive: true,
})) {
  if (!relativePath.endsWith(".js")) continue;
  const filePath = resolve(outputDirectory, "_next", "static", relativePath);
  const source = await readFile(filePath, "utf8");
  if (source.includes("answerSetFingerprint") || source.includes("Revue documentaire Codex")) {
    const assetUrl = `/_next/static/${relativePath.replaceAll("\\", "/")}`;
    if (assets.has(assetUrl)) {
      throw new Error(`Données éditoriales référencées par le bundle joueur : ${relativePath}`);
    }
    await rm(filePath, { force: true });
  }
}

const sortedAssets = [...assets].sort();
const hash = createHash("sha256");
for (const url of sortedAssets) {
  const filePath = filePathForUrl(url);
  await access(filePath);
  hash.update(url);
  hash.update(await readFile(filePath));
}
const cacheVersion = `antaverse-${hash.digest("hex").slice(0, 12)}`;
const manifest = `self.__ANTAVERSE_CACHE_VERSION = ${JSON.stringify(cacheVersion)};\nself.__ANTAVERSE_PRECACHE = ${JSON.stringify(sortedAssets, null, 2)};\n`;
await writeFile(resolve(outputDirectory, "precache-manifest.js"), manifest, "utf8");
console.log(
  `Export statique prêt : ${sortedAssets.length} ressources précachées (${cacheVersion}).`,
);

function filePathForUrl(url) {
  if (url === "/") return resolve(outputDirectory, "index.html");
  if (url.endsWith("/")) return resolve(outputDirectory, url.slice(1), "index.html");
  return resolve(outputDirectory, url.slice(1));
}
