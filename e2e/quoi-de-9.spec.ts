import { expect, test } from "@playwright/test";

test("defaults to light mode and persists the selected appearance", async ({ page }) => {
  await page.goto("/quoi-de-9");

  const lightMode = page.getByRole("button", { name: /mode clair/i });
  const darkMode = page.getByRole("button", { name: /mode sombre/i });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(lightMode).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight))
    .toBe(true);

  await darkMode.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight))
    .toBe(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await expect(lightMode).toBeEnabled();
  await lightMode.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(lightMode).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: /mode clair/i })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("creates a local game and reaches theme selection", async ({ page }) => {
  await page.goto("/quoi-de-9");
  await page.getByRole("link", { name: /nouvelle partie/i }).click();
  await expect(page.getByRole("heading", { name: /composez vos équipes/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /lancer la partie/i })).toBeEnabled();
  await page.getByRole("button", { name: /lancer la partie/i }).click();
  await expect(page).toHaveURL(/\/partie\/?$/u, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /répond/i })).toBeVisible();
  await page.getByRole("button", { name: /j’ai le téléphone/i }).click();
  await expect(page.getByRole("button", { name: /choisir le thème adverse/i })).toBeEnabled();
  await expect(page.getByRole("button", { name: /au hasard/i })).toBeEnabled();
});

test("keeps typographic apostrophes in team names", async ({ page }) => {
  await page.goto("/quoi-de-9/creer");
  const launchButton = page.getByRole("button", { name: /lancer la partie/i });
  await expect(launchButton).toBeEnabled({ timeout: 15_000 });
  const teamName = page.getByLabel("Équipe A", { exact: true });
  await teamName.fill("L’équipe d’Anaïs");
  await expect(teamName).toHaveValue("L’équipe d’Anaïs");
  await launchButton.click();

  await expect(page).toHaveURL(/\/partie\/?$/u, { timeout: 15_000 });
  await expect(page.getByText("L’équipe d’Anaïs", { exact: true }).first()).toBeVisible();
});

test("shows the original French question on results and after refresh", async ({ page }) => {
  await page.goto("/quoi-de-9/creer");
  await expect(page.getByRole("button", { name: /lancer la partie/i })).toBeEnabled({
    timeout: 15_000,
  });
  await page.getByLabel("Équipe A", { exact: true }).fill("Équipe Rouge");
  await page.getByLabel("Équipe B", { exact: true }).fill("Équipe Bleue");
  await page.getByRole("button", { name: /lancer la partie/i }).click();
  await expect(page).toHaveURL(/\/partie\/?$/u, { timeout: 15_000 });
  await page.getByRole("button", { name: /j’ai le téléphone/i }).click();
  await page.getByRole("button", { name: /au hasard/i }).click();
  await page.getByRole("button", { name: /facile/i }).click();
  await page.getByRole("button", { name: /afficher la question/i }).click();

  const question = page.locator("h1");
  const questionText = (await question.textContent())?.trim();
  expect(questionText).toBeTruthy();
  expect(questionText).not.toMatch(/\u00c3|\u00c2|\u00e2\u20ac|\ufffd/u);

  await page.getByRole("button", { name: /démarrer/i }).click();
  await page.getByRole("button", { name: /terminer exceptionnellement/i }).click();

  await expect(page.getByRole("heading", { name: questionText! })).toBeVisible();
  await expect(page.getByText(/0\/9 trouvées/i)).toBeVisible();
  await page.getByRole("button", { name: /^corriger$/i }).click();
  await expect(page.getByText(/score sera recalculé/i)).toBeVisible();
  await page.locator(".answer-choice").first().click();
  await page.getByRole("button", { name: /mettre à jour/i }).click();
  await expect(page.getByText(/1\/9 trouvées/i)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: questionText! })).toBeVisible();
  await expect(page.getByText("Équipe Rouge", { exact: true }).first()).toBeVisible();
});

test("shows a black bomb banner on the second question of an équipe", async ({ page }) => {
  await page.goto("/quoi-de-9/creer");
  await expect(page.getByRole("button", { name: /lancer la partie/i })).toBeEnabled({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: /lancer la partie/i }).click();
  await expect(page).toHaveURL(/\/partie\/?$/u, { timeout: 15_000 });

  for (let turn = 1; turn <= 2; turn += 1) {
    await openQuestion(page);
    await expect(page.getByRole("button", { name: /^bombe :/i })).toHaveCount(0);
    await page.getByRole("button", { name: /démarrer/i }).click();
    await page.getByRole("button", { name: /terminer exceptionnellement/i }).click();
    await page.getByRole("button", { name: /tour suivant/i }).click();
  }

  await openQuestion(page);
  const bomb = page.getByRole("button", { name: /^bombe :/i });
  await expect(bomb).toBeVisible();
  await expect(bomb.locator("..")).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(bomb).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(bomb).not.toContainText(/200|points/i);

  const bombHelp = page.getByRole("button", { name: "Pourquoi cette bombe ?" });
  await bombHelp.click();
  await expect(bombHelp).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("status")).toBeVisible();

  await page.getByRole("button", { name: /démarrer/i }).click();
  await bomb.click();
  await expect(bomb).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("-200", { exact: true })).toBeVisible();
});

async function openQuestion(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /j[’']ai le téléphone/i }).click();
  await page.getByRole("button", { name: /au hasard/i }).click();
  await page.getByRole("button", { name: /facile/i }).click();
  await page.getByRole("button", { name: /afficher la question/i }).click();
}

test("keeps the published app shell available offline", async ({ page, context, browserName }) => {
  test.skip(
    browserName === "webkit",
    "L’émulation hors ligne de Playwright WebKit ne transmet pas les requêtes au service worker.",
  );
  await page.goto("/quoi-de-9");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, {
    timeout: 20_000,
  });

  await context.setOffline(true);
  try {
    await page.getByRole("link", { name: /installer sur ce téléphone/i }).click();
    await expect(page.getByRole("heading", { name: /installez AntaVerse/i })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
