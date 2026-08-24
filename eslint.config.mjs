import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "out/**",
    "coverage/**",
    "playwright-report/**",
    "android/.gradle/**",
    "android/**/build/**",
    "android/app/src/main/assets/**",
    "android/capacitor-cordova-android-plugins/**",
  ]),
]);
