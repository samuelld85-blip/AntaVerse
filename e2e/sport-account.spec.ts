import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });
test("Sport account offers a lightweight, scoped sign-in screen", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Mon compte", exact: true })).toHaveCount(0);

  await page.goto("/sport/compte/");
  await expect(page.getByRole("heading", { name: "Retrouvez votre carnet partout" })).toBeVisible();

  // The heavy "portable backup" section is gone from the account panel: no export/import controls.
  const panel = page.locator("main");
  await expect(panel.getByRole("button", { name: "Exporter mon carnet", exact: true })).toHaveCount(0);
  await expect(panel.getByLabel("Importer une sauvegarde")).toHaveCount(0);
  await expect(panel.getByRole("heading", { name: "Une copie à garder" })).toHaveCount(0);

  // "Afficher le mot de passe" toggle removed.
  await expect(panel.getByRole("button", { name: /le mot de passe/ })).toHaveCount(0);

  // Confidentiality link sits at the very bottom of the panel now.
  await expect(
    panel.getByRole("link", { name: "Confidentialité et gestion de vos données" }),
  ).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("sport-account-mobile.png"), fullPage: true });
});
