import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "sport*.spec.ts",
  outputDir: "test-results-sport-cloud",
  reporter: "list",
  timeout: 60000,
  use: { baseURL: "http://localhost:4188", trace: "retain-on-failure" },
  projects: [
    { name: "sport-pixel-10-pro", use: { ...devices["Pixel 10 Pro"] } },
    { name: "sport-iphone-17-pro", use: { ...devices["iPhone 17 Pro"] } },
    {
      name: "sport-pixel-10-pro-landscape",
      testMatch: "sport-device.spec.ts",
      use: { ...devices["Pixel 10 Pro landscape"] },
    },
    {
      name: "sport-iphone-17-pro-landscape",
      testMatch: "sport-device.spec.ts",
      use: { ...devices["iPhone 17 Pro landscape"] },
    },
    // Full-height viewports approximate the available PWA space, not OS installation.
    {
      name: "sport-pixel-10-pro-pwa-viewport",
      testMatch: "sport-device.spec.ts",
      use: { ...devices["Pixel 10 Pro"], viewport: { width: 427, height: 952 } },
    },
    {
      name: "sport-iphone-17-pro-pwa-viewport",
      testMatch: "sport-device.spec.ts",
      use: { ...devices["iPhone 17 Pro"], viewport: { width: 402, height: 874 } },
    },
    {
      name: "sport-iphone-17-pro-max",
      testMatch: "sport-device.spec.ts",
      use: { ...devices["iPhone 17 Pro Max"] },
    },
  ],
  webServer: {
    command: "npm run preview -- --port 4188",
    url: "http://localhost:4188",
    reuseExistingServer: false,
  },
});
