import { expect, test } from "@playwright/test";

test("sets up players, plays guesses, and can pass once eligible on mobile", async ({ page }) => {
  await page.goto("/purple");
  await page.getByRole("link", { name: /^jouer/i }).click();

  await expect(page).toHaveURL(/\/joueurs\/?$/u);
  await page.getByLabel("Joueur 1").fill("Samuel");
  await page.getByLabel("Joueur 2").fill("Emma");
  await page.getByRole("button", { name: /commencer la partie/i }).click();

  await expect(page).toHaveURL(/\/partie\/?$/u);
  const turnName = page.locator(".purple-turn-name");
  await expect(turnName).toBeVisible();
  const startingPlayer = (await turnName.textContent())?.trim();
  expect(["Samuel", "Emma"]).toContain(startingPlayer);

  const pile = page.locator(".purple-stat--pile .purple-stat-value");
  const deckCount = page.locator(".purple-stats .purple-stat").nth(2).locator(".purple-stat-value");
  await expect(deckCount).toHaveText("52");

  // Skubrum draws 3 cards at once — confirm the multi-card reveal renders
  // exactly 3 playing cards and consumes exactly 3 cards from the deck.
  await page.locator(".guess-button--skubrum").click();
  await expect(page.locator(".playing-card")).toHaveCount(3, { timeout: 5_000 });
  await expect(deckCount).toHaveText("49");

  // Keep guessing RED (fastest reveal) until this player is allowed to pass,
  // then confirm the pile is preserved and the turn hands off to the other player.
  let passed = false;
  for (let attempt = 0; attempt < 60 && !passed; attempt += 1) {
    const passButton = page.locator(".pass-button");
    if (await passButton.isVisible().catch(() => false)) {
      const pileBeforePass = (await pile.textContent())?.trim();
      await passButton.click();
      await expect(pile).toHaveText(pileBeforePass!);
      await expect(turnName).not.toHaveText(startingPlayer!);
      passed = true;
      break;
    }
    await page.locator(".guess-button--red").click();
    await page.waitForTimeout(850);
  }

  expect(passed).toBe(true);
});

test("purple stays usable at 320px without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/purple/joueurs");
  await expect(page.getByRole("heading", { name: /ajoutez/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
