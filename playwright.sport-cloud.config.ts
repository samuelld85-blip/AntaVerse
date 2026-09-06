import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "sport*.spec.ts",
  outputDir: "test-results-sport-cloud",
  reporter: "list",
  timeout: 60000,
  use: { baseURL: "http://localhost:4188", trace: "retain-on-failure" },
  projects: [
    { name: "sport-chrome", use: { ...devices["Pixel 7"] } },
    { name: "sport-safari", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: "npm run preview -- --port 4188",
    url: "http://localhost:4188",
    reuseExistingServer: false,
  },
});
