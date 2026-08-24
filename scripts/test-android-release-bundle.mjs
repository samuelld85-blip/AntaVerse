import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const rootDir = resolve(import.meta.dirname, "..");
const bundlePath = join(
  rootDir,
  "android",
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab",
);
const temporaryDirectory = mkdtempSync(join(tmpdir(), "antaverse-android-signing-"));
const keystorePath = join(temporaryDirectory, "ephemeral-upload-test.jks");
const password = randomBytes(24).toString("base64url");

function windowsJdkCandidates() {
  if (process.platform !== "win32" || !process.env.ProgramFiles) return [];
  const microsoft = join(process.env.ProgramFiles, "Microsoft");
  const jdks = existsSync(microsoft)
    ? readdirSync(microsoft)
        .filter((name) => name.startsWith("jdk-"))
        .sort()
        .reverse()
        .map((name) => join(microsoft, name))
    : [];
  return [
    process.env.JAVA_HOME,
    ...jdks,
    join(process.env.ProgramFiles, "Android", "Android Studio", "jbr"),
  ];
}

function findKeytool() {
  const executable = process.platform === "win32" ? "keytool.exe" : "keytool";
  for (const javaHome of windowsJdkCandidates()) {
    const candidate = javaHome && join(javaHome, "bin", executable);
    if (candidate && existsSync(candidate)) return candidate;
  }
  return executable;
}

function run(command, args, environment = process.env) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env: environment,
    shell: false,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} a échoué avec le code ${result.status}.`);
}

try {
  const keytool = findKeytool();
  run(keytool, [
    "-genkeypair",
    "-keystore",
    keystorePath,
    "-storepass",
    password,
    "-keypass",
    password,
    "-alias",
    "antaverse-test",
    "-keyalg",
    "RSA",
    "-keysize",
    "4096",
    "-validity",
    "100",
    "-dname",
    "CN=AntaVerse Ephemeral Test, O=Local Build, C=FR",
  ]);

  const environment = {
    ...process.env,
    ANTAVERSE_ANDROID_KEYSTORE_FILE: keystorePath,
    ANTAVERSE_ANDROID_KEYSTORE_PASSWORD: password,
    ANTAVERSE_ANDROID_KEY_ALIAS: "antaverse-test",
    ANTAVERSE_ANDROID_KEY_PASSWORD: password,
  };
  run(process.execPath, ["scripts/verify-android-release.mjs", "--require-signing"], environment);
  run(process.execPath, ["scripts/run-android-gradle.mjs", "bundleRelease"], environment);
  run(keytool, ["-printcert", "-jarfile", bundlePath]);

  const sizeMiB = (statSync(bundlePath).size / 1024 / 1024).toFixed(2);
  console.log(`AAB release signé et vérifié avec une clé éphémère : ${sizeMiB} Mio.`);
  console.log(
    "Cet AAB de test est supprimé automatiquement : il ne doit pas être envoyé sur Google Play.",
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
  rmSync(bundlePath, { force: true });
}
