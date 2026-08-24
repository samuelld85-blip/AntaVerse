import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = resolve(import.meta.dirname, "..");
const androidDir = join(rootDir, "android");
const tasks = process.argv.slice(2);

if (tasks.length === 0 || tasks.some((task) => !/^[A-Za-z][A-Za-z0-9:]*$/.test(task))) {
  console.error("Usage: node scripts/run-android-gradle.mjs <GradleTask> [GradleTask...]");
  process.exit(1);
}

function firstExisting(candidates) {
  return candidates.find((candidate) => candidate && existsSync(candidate));
}

function microsoftJdks() {
  if (process.platform !== "win32" || !process.env.ProgramFiles) return [];

  const parent = join(process.env.ProgramFiles, "Microsoft");
  if (!existsSync(parent)) return [];

  return readdirSync(parent)
    .filter((name) => name.startsWith("jdk-"))
    .sort()
    .reverse()
    .map((name) => join(parent, name));
}

function supportedJavaHome(candidates) {
  for (const candidate of candidates) {
    if (
      !candidate ||
      !existsSync(join(candidate, "bin", process.platform === "win32" ? "java.exe" : "java"))
    )
      continue;
    const probe = spawnSync(
      join(candidate, "bin", process.platform === "win32" ? "java.exe" : "java"),
      ["-version"],
      {
        encoding: "utf8",
        shell: false,
      },
    );
    const output = `${probe.stdout ?? ""}\n${probe.stderr ?? ""}`;
    const major = Number(output.match(/version ["'](?:1\.)?(\d+)/)?.[1]);
    if (major >= 17 && major <= 24) return candidate;
  }
  return undefined;
}

const environment = { ...process.env };

if (process.platform === "win32") {
  const javaHome = supportedJavaHome([
    environment.JAVA_HOME,
    ...microsoftJdks(),
    environment.ProgramFiles && join(environment.ProgramFiles, "Android", "Android Studio", "jbr"),
  ]);
  const androidSdk = firstExisting([
    environment.ANDROID_HOME,
    environment.ANDROID_SDK_ROOT,
    environment.LOCALAPPDATA && join(environment.LOCALAPPDATA, "Android", "Sdk"),
  ]);

  if (!javaHome) {
    console.error(
      "JDK compatible introuvable (Java 17 à 24). Installez un JDK 21 ou définissez JAVA_HOME.",
    );
    process.exit(1);
  }
  if (!androidSdk) {
    console.error("Android SDK introuvable. Ouvrez Android Studio ou définissez ANDROID_HOME.");
    process.exit(1);
  }

  environment.JAVA_HOME = javaHome;
  environment.ANDROID_HOME = androidSdk;
  environment.ANDROID_SDK_ROOT = androidSdk;
  environment.Path = `${join(javaHome, "bin")};${join(androidSdk, "platform-tools")};${environment.Path ?? ""}`;
}

const wrapper = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const result = spawnSync(wrapper, [...tasks, "--stacktrace"], {
  cwd: androidDir,
  env: environment,
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
