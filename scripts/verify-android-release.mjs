import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const androidDir = join(rootDir, "android");
const outDir = join(rootDir, "out");
const nativeWebDir = join(androidDir, "app", "src", "main", "assets", "public");
const requireSigning = process.argv.includes("--require-signing");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  const path = join(rootDir, relativePath);
  if (!existsSync(path)) {
    fail(`${relativePath} est introuvable.`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function expectMatch(content, pattern, message) {
  if (!pattern.test(content)) fail(message);
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) files.push(relative(directory, absolute).replaceAll("\\", "/"));
    }
  };
  visit(directory);
  return files.sort();
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function parseProperties(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return separator === -1
          ? [line, ""]
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

const packageJson = JSON.parse(read("package.json") || "{}");
const capacitorConfig = read("capacitor.config.ts");
const buildGradle = read("android/app/build.gradle");
const variablesGradle = read("android/variables.gradle");
const manifest = read("android/app/src/main/AndroidManifest.xml");
const serviceWorkerRegistration = read("src/components/service-worker-registration.tsx");

expectMatch(
  capacitorConfig,
  /appId:\s*["']com\.antaverse\.app["']/,
  "Le Capacitor appId doit rester com.antaverse.app.",
);
expectMatch(
  capacitorConfig,
  /webDir:\s*["']out["']/,
  "Capacitor doit embarquer le dernier export statique depuis out/.",
);
expectMatch(
  capacitorConfig,
  /loggingBehavior:\s*["']production["']/,
  "Les logs Capacitor doivent utiliser le mode production.",
);
expectMatch(
  capacitorConfig,
  /webContentsDebuggingEnabled:\s*false/,
  "Le débogage WebView doit rester désactivé dans l'app distribuée.",
);
expectMatch(
  capacitorConfig,
  /allowMixedContent:\s*false/,
  "Le contenu mixte HTTP/HTTPS doit rester interdit.",
);

expectMatch(
  buildGradle,
  /applicationId\s+["']com\.antaverse\.app["']/,
  "L'applicationId Android doit rester com.antaverse.app.",
);
expectMatch(
  buildGradle,
  new RegExp(`versionName\\s+["']${packageJson.version?.replaceAll(".", "\\.")}["']`),
  "versionName Android doit correspondre à package.json.",
);
const versionCode = Number(buildGradle.match(/versionCode\s+(\d+)/)?.[1]);
if (!Number.isInteger(versionCode) || versionCode < 1)
  fail("versionCode Android doit être un entier positif.");

const compileSdk = Number(variablesGradle.match(/compileSdkVersion\s*=\s*(\d+)/)?.[1]);
const targetSdk = Number(variablesGradle.match(/targetSdkVersion\s*=\s*(\d+)/)?.[1]);
if (compileSdk < 36)
  fail("compileSdkVersion doit être au moins 36 pour la soumission prévue en 2026.");
if (targetSdk < 36)
  fail("targetSdkVersion doit être au moins 36 pour la soumission prévue en 2026.");

expectMatch(
  manifest,
  /android:allowBackup="false"/,
  "Les sauvegardes Android des parties locales doivent rester désactivées.",
);
expectMatch(
  manifest,
  /android:usesCleartextTraffic="false"/,
  "Le trafic HTTP non chiffré doit rester interdit.",
);
expectMatch(
  manifest,
  /android:screenOrientation="portrait"/,
  "L'activité principale doit rester en portrait, comme la PWA.",
);
const permissions = [...manifest.matchAll(/<uses-permission\s+android:name="([^"]+)"/g)].map(
  (match) => match[1],
);
if (permissions.join(",") !== "android.permission.INTERNET") {
  fail(
    `Permissions Android inattendues (${permissions.join(", ") || "aucune"}) : réauditer la confidentialité avant release.`,
  );
}

expectMatch(
  serviceWorkerRegistration,
  /Capacitor\.isNativePlatform\(\)/,
  "Le Service Worker PWA doit rester désactivé dans le bundle natif.",
);

if (!existsSync(join(rootDir, "resources", "icon.png")))
  fail("La source d'icône resources/icon.png est introuvable.");
for (const icon of [
  "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
  "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png",
  "android/app/src/main/res/drawable-port-xxxhdpi/splash.png",
]) {
  if (!existsSync(join(rootDir, icon))) fail(`Asset Android manquant : ${icon}.`);
}

const exportedFiles = listFiles(outDir);
const nativeFiles = listFiles(nativeWebDir);
const capacitorGeneratedFiles = new Set(["cordova.js", "cordova_plugins.js"]);
const copiedNativeFiles = nativeFiles.filter((file) => !capacitorGeneratedFiles.has(file));
if (exportedFiles.length === 0) fail("out/ est vide : lancez npm run android:sync.");
if (exportedFiles.join("\n") !== copiedNativeFiles.join("\n")) {
  fail("Le contenu Android n'est pas synchronisé avec out/ : lancez npm run android:sync.");
} else {
  for (const file of exportedFiles) {
    const webPath = join(outDir, file);
    const nativePath = join(nativeWebDir, file);
    if (
      statSync(webPath).size !== statSync(nativePath).size ||
      digest(webPath) !== digest(nativePath)
    ) {
      fail(`Le fichier natif diffère du dernier export : ${file}.`);
      break;
    }
  }
}

if (requireSigning) {
  const propertiesPath = join(androidDir, "keystore.properties");
  const properties = existsSync(propertiesPath)
    ? parseProperties(readFileSync(propertiesPath, "utf8"))
    : {
        storeFile: process.env.ANTAVERSE_ANDROID_KEYSTORE_FILE,
        storePassword: process.env.ANTAVERSE_ANDROID_KEYSTORE_PASSWORD,
        keyAlias: process.env.ANTAVERSE_ANDROID_KEY_ALIAS,
        keyPassword: process.env.ANTAVERSE_ANDROID_KEY_PASSWORD,
      };
  for (const key of ["storeFile", "storePassword", "keyAlias", "keyPassword"]) {
    if (!properties[key] || /CHANGE_ME|TODO/i.test(properties[key]))
      fail(`Valeur de signature absente ou factice : ${key}.`);
  }
  const storeFile =
    properties.storeFile &&
    (existsSync(properties.storeFile)
      ? properties.storeFile
      : join(androidDir, properties.storeFile));
  if (storeFile && !existsSync(storeFile)) {
    fail(`Clé de signature introuvable : ${properties.storeFile}.`);
  }
}

if (failures.length) {
  console.error("\nVérification Android échouée :");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Android prêt : ${exportedFiles.length} fichiers web vérifiés, target API ${targetSdk}, version ${packageJson.version} (${versionCode}).`,
);
if (!requireSigning)
  console.log(
    "Signature non exigée pour ce contrôle (utilisez npm run android:bundle pour un AAB publiable).",
  );
