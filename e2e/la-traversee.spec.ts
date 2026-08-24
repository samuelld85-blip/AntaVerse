import { expect, test } from "@playwright/test";

test("installe La Traversée, choisit la ligne centrale et révèle une étape", async ({ page }) => {
  await page.goto("/la-traversee");
  await page.getByRole("link", { name: /^jouer/i }).click();
  await page.getByRole("textbox", { name: "Nom du joueur 1" }).fill("Alice");
  await page.getByRole("textbox", { name: "Nom du joueur 2" }).fill("Bob");
  await page.getByRole("textbox", { name: "Nom du joueur 3" }).fill("Chloé");
  await page.getByRole("button", { name: /lancer la partie/i }).click();

  await expect(page).toHaveURL(/\/la-traversee\/partie\/?$/u);
  await expect(page.getByRole("heading", { name: /choisis ton départ/i })).toBeVisible();
  await expect(page.locator(".traversee-endpoint .is-active")).toHaveCount(0);
  await expect(page.locator(".traversee-draw-pile")).toBeVisible();
  await page.locator(".traversee-endpoint").first().getByRole("button").click();
  await expect(page.getByRole("heading", { name: /plus ou moins/i })).toBeVisible();
  await expect(page.locator(".traversee-endpoint .is-active")).toHaveCount(1);
  await expect(page.locator(".traversee-actions button").nth(0)).toContainText("Moins");
  await expect(page.locator(".traversee-actions button").nth(1)).toContainText("Plus");
  await page.getByRole("button", { name: /plus/i }).click();
  await expect(page.locator(".traversee-feedback")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
});

test("garde le plateau de La Traversée dans la fenêtre mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/la-traversee/joueurs");
  await expect(page.getByRole("heading", { name: /ajoutez/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("reste sans scroll sur un grand mobile récent", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/la-traversee/joueurs");
  await page.getByRole("textbox", { name: "Nom du joueur 1" }).fill("Alice");
  await page.getByRole("textbox", { name: "Nom du joueur 2" }).fill("Bob");
  await page.getByRole("textbox", { name: "Nom du joueur 3" }).fill("Chloé");
  await page.getByRole("button", { name: /lancer la partie/i }).click();
  await expect(page).toHaveURL(/\/la-traversee\/partie\/?$/u);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
});
