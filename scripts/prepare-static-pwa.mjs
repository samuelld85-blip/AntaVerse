import { createHash } from "node:crypto";
import { access, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputDirectory = resolve("out");
const excludedRoutePrefixes = ["/404/", "/_not-found/", "/quoi-de-9/admin/"];
const outputFiles = await readdir(outputDirectory, { recursive: true });
const publicOutputFiles = outputFiles
  .map((relativePath) => relativePath.replaceAll("\\", "/"))
  .filter((relativePath) => !isExcluded(`/${relativePath}`));
const routes = publicOutputFiles
  .filter((relativePath) => relativePath === "index.html" || relativePath.endsWith("/index.html"))
  .map(routeForIndexFile)
  .sort();
const assets = new Set([
  ...routes,
  ...publicOutputFiles.filter((relativePath) => relativePath.endsWith(".txt")).map((relativePath) => `/${relativePath}`),
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/app/icon-192.png",
  "/icons/app/icon-512.png",
  "/icons/app/maskable-icon.png",
  "/icons/app/apple-touch-icon.png",
  "/icons/web/favicon-32.png",
  "/icons/web/icon-192.png",
  "/icons/web/apple-touch-icon.png",
]);

for (const route of routes) {
  const routeDirectory = route === "/" ? outputDirectory : resolve(outputDirectory, route.slice(1));
  const htmlPath = resolve(routeDirectory, "index.html");
  const html = await readFile(htmlPath, "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/gu)) {
    const url = match[1]?.replaceAll("\\", "").split("?")[0];
    if (url?.startsWith("/") && !url.startsWith("/admin/")) assets.add(normalizeStaticUrl(url));
  }
}

for (const asset of [...assets]) {
  if (!asset.endsWith(".css")) continue;
  const stylesheet = await readFile(filePathForUrl(asset), "utf8");
  for (const match of stylesheet.matchAll(/url\((?:"|')?([^"')?#]+)(?:"|')?\)/gu)) {
    const url = match[1];
    if (url?.startsWith("/")) assets.add(url);
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

// Le fichier `sw.js` est statique : sans empreinte de build, le navigateur considère le service
// worker comme inchangé et conserve indéfiniment la génération précédente (et son cache).
const buildStampMarker = "// build: ";
const serviceWorkerPath = resolve(outputDirectory, "sw.js");
const serviceWorkerSource = await readFile(serviceWorkerPath, "utf8");
const serviceWorkerBody = serviceWorkerSource.split(buildStampMarker)[0].trimEnd();
await writeFile(
  serviceWorkerPath,
  `${serviceWorkerBody}

${buildStampMarker}${cacheVersion}
`,
  "utf8",
);
console.log(
  `Export statique prêt : ${sortedAssets.length} ressources précachées (${cacheVersion}).`,
);

function filePathForUrl(url) {
  if (url === "/") return resolve(outputDirectory, "index.html");
  if (url.endsWith("/")) return resolve(outputDirectory, url.slice(1), "index.html");
  return resolve(outputDirectory, url.slice(1));
}

function isExcluded(pathname) {
  return excludedRoutePrefixes.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

function routeForIndexFile(relativePath) {
  const directory = dirname(relativePath).replaceAll("\\", "/");
  return directory === "." ? "/" : `/${directory}/`;
}

function normalizeStaticUrl(url) {
  if (url === "/" || url.endsWith("/") || url.split("/").at(-1)?.includes(".")) return url;
  return `${url}/`;
}
