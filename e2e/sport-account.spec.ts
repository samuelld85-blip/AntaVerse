import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });
test("Sport account stays scoped to Sport and supports a portable backup without configuration", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Mon compte", exact: true })).toHaveCount(0);
  await page.goto("/sport/compte/");
  await expect(page.getByRole("heading", { name: "Retrouvez votre carnet partout" })).toBeVisible();
  await expect(
    page.getByText("Les comptes en ligne ne sont pas encore disponibles.", { exact: false }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter mon carnet", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^antaverse-sport-.*\.json$/);
  await page
    .getByLabel("Importer une sauvegarde")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":999}'),
    });
  await expect(page.getByText(/Fichier invalide/)).toBeVisible();
  const snapshot = {
    version: 1,
    active: null,
    history: [
      {
        id: "restored",
        kind: "full",
        name: "Ma séance récupérée",
        startedAt: "2026-09-06T10:00:00.000Z",
        endedAt: "2026-09-06T11:00:00.000Z",
        exercises: [],
      },
    ],
    favorites: [],
    templates: [],
  };
  await page
    .getByLabel("Importer une sauvegarde")
    .setInputFiles({
      name: "sport.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(snapshot)),
    });
  await page.getByRole("button", { name: "Confirmer la restauration" }).click();
  await page.getByRole("link", { name: "← Mon carnet Sport", exact: true }).click();
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await expect(page.getByRole("button", { name: /Ma séance récupérée/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Social", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sport-social-guest.png"), fullPage: true });
  await page.getByRole("link", { name: "Me connecter pour retrouver mes amis" }).click();
  await expect(
    page.getByRole("button", { name: "Exporter mon carnet", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("sport-account-mobile.png"), fullPage: true });
});
