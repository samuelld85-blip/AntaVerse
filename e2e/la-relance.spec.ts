import { expect, test } from "@playwright/test";

test("joue cinq manches uniques et affiche le bon résultat sur mobile", async ({ page }) => {
  await page.goto("/la-relance");
  await page.getByRole("link", { name: /^jouer/i }).click();

  await page.getByLabel("Équipe 1").fill("Les Verts");
  await page.getByLabel("Équipe 2").fill("Les Bleus");
  await page.getByRole("button", { name: /lancer la partie/i }).click();

  await expect(page).toHaveURL(/\/partie\/?$/u);
  await expect(page.getByText("Manche 1 / 5")).toBeVisible();
  await expect(page.getByRole("button", { name: /c’est parti/i })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight))
    .toBe(true);

  const seenThemes = new Set<string>();
  for (let round = 0; round < 5; round += 1) {
    const theme = (await page.locator(".theme-stage h1").textContent())?.trim();
    expect(theme).toBeTruthy();
    seenThemes.add(theme!);

    const winner = round < 3 ? "Les Verts" : "Les Bleus";
    await page.getByRole("button", { name: new RegExp(`${winner}\\s+gagne`, "i") }).click();
    await expect(
      page.getByRole("heading", { name: new RegExp(`Point pour ${winner}`, "i") }),
    ).toBeVisible();

    if (round < 4) {
      await page.getByRole("button", { name: /thème suivant/i }).click();
      await expect(page.getByText(`Manche ${round + 2} / 5`)).toBeVisible();
    } else {
      await page.getByRole("button", { name: /voir le résultat/i }).click();
    }
  }

  expect(seenThemes.size).toBe(5);
  await expect(page.getByRole("heading", { name: /Les Verts remporte la partie/i })).toBeVisible();
  await expect(page.locator(".score-value").nth(0)).toHaveText("3");
  await expect(page.locator(".score-value").nth(1)).toHaveText("2");
});
