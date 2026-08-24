import { expect, test } from "@playwright/test";

test("joue huit tours sans scroll sur mobile", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T12:00:00Z") });
  await page.goto("/sans-le-dire");
  await page.getByRole("link", { name: /^jouer/i }).click();
  await page.getByRole("button", { name: /^équipes/i }).click();
  await page.getByRole("button", { name: /compétition/i }).click();
  await page.getByLabel("Équipe 1").fill("Les Verts");
  await page.getByLabel("Équipe 2").fill("Les Bleus");
  await page.getByRole("button", { name: /lancer la partie/i }).click();
  await expect(page).toHaveURL(/\/partie\/?$/u);
  for (let round = 0; round < 8; round += 1) {
    await expect(page.getByText(`Manche ${round + 1} / 8`)).toBeVisible();
    await expect(page.locator(".word-card h1")).toBeVisible();
    await expect(page.locator(".word-card li")).toHaveCount(3);
    await expect(page.getByLabel(/chronomètre prêt à démarrer/i)).toHaveText("00:45");
    await page.getByRole("button", { name: /je suis prêt/i }).click();
    await expect(page.locator(".word-card h1")).toBeVisible();
    await expect(page.locator(".word-card li")).toHaveCount(3);
    await expect(page.getByRole("button", { name: /trouvé/i })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight))
      .toBe(true);
    if (round === 0) await page.getByRole("button", { name: /trouvé/i }).dblclick();
    await page.clock.fastForward("46:00");
    await expect(page.getByText("Fin du tour !")).toBeVisible();
    await page
      .getByRole("button", { name: round === 7 ? /voir le résultat/i : /équipe suivante/i })
      .click();
  }
  await expect(page.getByRole("heading", { name: /Les Verts.*gagne/i })).toBeVisible();
  await expect(page.getByText("1 — 0")).toBeVisible();
});
