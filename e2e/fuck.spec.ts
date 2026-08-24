import { expect, test } from "@playwright/test";

test("sets up Fuck, reveals cards, records the result, and hands off the role", async ({ page }) => {
  await page.goto("/fuck");
  await page.getByRole("link", { name: /^jouer/i }).click();

  await page.getByRole("textbox", { name: "Nom du joueur 1" }).fill("Alice");
  await page.getByRole("textbox", { name: "Nom du joueur 2" }).fill("Bob");
  await page.getByRole("textbox", { name: "Nom du joueur 3" }).fill("Chloé");
  await page.getByRole("button", { name: /lancer la partie/i }).click();

  await expect(page).toHaveURL(/\/fuck\/partie\/?$/u);
  await expect(page.getByRole("heading", { name: /à bob de deviner/i })).toBeVisible();
  await page.getByRole("button", { name: /voir la carte/i }).click();
  await expect(page.locator(".fuck-card").first()).toBeVisible();
  await page.getByRole("button", { name: /le maître a gagné/i }).click();
  await expect(page.getByRole("heading", { name: /à chloé de deviner/i })).toBeVisible();
  await expect(page.getByText("1 / 52")).toBeVisible();

  for (let index = 0; index < 2; index += 1) {
    await page.getByRole("button", { name: /voir la carte/i }).click();
    await page.getByRole("button", { name: /le maître a gagné/i }).click();
  }
  await expect(page.getByRole("heading", { name: /alice choisit le prochain maître/i })).toBeVisible();
  await page.getByRole("button", { name: /chloé/i }).click();
  await expect(page.getByText(/maître du jeu : chloé/i)).toBeVisible();
});

test("keeps the Fuck setup usable at 320px without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/fuck/joueurs");
  await expect(page.getByRole("heading", { name: /ajoutez/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
