import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function fitsPhone(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function reachable(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  await button.scrollIntoViewIfNeeded();
  const clear = await button.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return Boolean(hit && el.contains(hit));
  });
  expect(clear, `${name} must not be covered by the navigation dock`).toBe(true);
}

for (const width of [320, 360, 375, 390, 430]) {
  for (const theme of ["dark", "light"] as const) {
    test(`Sport design: ${width}px ${theme} home and training`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 740 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/sport/");
      await expect(
        page.getByRole("heading", { name: "Carnet de sport", exact: true }),
      ).toBeVisible();
      if (theme === "light")
        await page.getByRole("button", { name: "Mode clair", exact: true }).click();
      const start = page.getByRole("button", { name: /^Séances/ });
      const box = await start.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(width === 320 ? 568 : 740);
      expect(await start.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
      await fitsPhone(page);
      await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
      await start.click();
      await page.getByRole("button", { name: "Entraînement libre", exact: true }).click();
      await reachable(page, "Commencer ma séance");
      await page.getByRole("button", { name: "Commencer ma séance", exact: true }).click();
      await fitsPhone(page);
      await page.getByRole("button", { name: "Développé couché", exact: true }).click();
      await fitsPhone(page);
      await page.screenshot({ path: testInfo.outputPath("configuration.png"), fullPage: true });
      await page.getByRole("button", { name: "Valider l’exercice", exact: true }).click();
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await expect(
        page.getByRole("heading", { name: "Développé couché", exact: true }),
      ).toBeInViewport();
      await reachable(page, "Série terminée · démarrer le repos");
      await fitsPhone(page);
      await page.screenshot({ path: testInfo.outputPath("workout.png") });
      await page
        .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
        .click();
      await reachable(page, "Passer le repos");
      await page.getByRole("button", { name: "Passer le repos", exact: true }).click();
      await page
        .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
        .click();
      await page.getByRole("button", { name: "Passer le repos", exact: true }).click();
      await page.getByRole("button", { name: "Dernière série terminée ✓", exact: true }).click();
      await fitsPhone(page);
      await page.screenshot({ path: testInfo.outputPath("feedback.png"), fullPage: true });
    });
  }
}

for (const theme of ["dark", "light"] as const) {
  test(`Sport design: ${theme} journal, profile, favorites and account`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/auth/v1/settings", (route) => route.fulfill({ json: { external: {} } }));
    await page.addInitScript(() => {
      const config = {
        exerciseId: "bench-press",
        equipment: "barbell",
        sets: 3,
        restSeconds: 120,
        loadKg: 60,
        reps: 8,
      };
      const workout = (day: string, loadKg: number) => ({
        id: `session-${day}`,
        name: "Force · haut du corps",
        kind: "push",
        startedAt: `2026-10-${day}T10:00:00.000Z`,
        endedAt: `2026-10-${day}T11:00:00.000Z`,
        feedback: { mood: "good", comment: "Une séance solide, de bonnes sensations." },
        exercises: [
          {
            id: `entry-${day}`,
            config: { ...config, loadKg },
            pyramid: false,
            completedRounds: 3,
            finished: true,
            feedback: { mood: "good", comment: "Un mouvement bien contrôlé." },
            completedSets: Array.from({ length: 3 }, () => ({
              completedAt: `2026-10-${day}T10:30:00.000Z`,
              equipment: "barbell",
              exerciseId: "bench-press",
              loadKg,
              reps: 8,
            })),
          },
        ],
      });
      localStorage.setItem(
        "antaverse:sport:v1",
        JSON.stringify({
          version: 1,
          active: null,
          history: [workout("16", 60), workout("12", 55)],
          favorites: [config],
          templates: [
            {
              id: "favorite",
              name: "Force du haut du corps",
              kind: "push",
              exercises: [{ config }],
            },
          ],
        }),
      );
    });
    await page.goto("/sport/");
    await expect(page.getByRole("heading", { name: "Carnet de sport", exact: true })).toBeVisible();
    if (theme === "light")
      await page.getByRole("button", { name: "Mode clair", exact: true }).click();
    await page.getByRole("button", { name: /^Historique/ }).click();
    await fitsPhone(page);
    await page.screenshot({ path: testInfo.outputPath("journal.png"), fullPage: true });
    await page
      .getByRole("button", { name: /Force · haut du corps/ })
      .first()
      .click();
    await page.screenshot({ path: testInfo.outputPath("session-detail.png"), fullPage: true });
    await page.getByRole("button", { name: "Modifier cette séance", exact: true }).click();
    await fitsPhone(page);
    await page.screenshot({ path: testInfo.outputPath("history-editor.png"), fullPage: true });
    await page.getByRole("button", { name: "Profil", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Mon profil", exact: true })).toBeVisible();
    await fitsPhone(page);
    await page.screenshot({ path: testInfo.outputPath("profile.png"), fullPage: true });
    await page.getByRole("button", { name: "Favoris", exact: true }).click();
    await fitsPhone(page);
    await page.screenshot({ path: testInfo.outputPath("favorites.png"), fullPage: true });
    await page.getByRole("button", { name: "Social", exact: true }).click();
    await fitsPhone(page);
    await page.screenshot({ path: testInfo.outputPath("social.png"), fullPage: true });
    await page
      .getByRole("link", { name: "Me connecter pour retrouver mes amis", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Retrouvez votre carnet partout" }),
    ).toBeVisible();
    expect(
      await page
        .locator("main")
        .evaluate((el) => (el.closest("[data-theme]") as HTMLElement)?.dataset.theme),
    ).toBe(theme);
    await fitsPhone(page);
    await page.screenshot({ path: testInfo.outputPath("account.png"), fullPage: true });
  });
}
