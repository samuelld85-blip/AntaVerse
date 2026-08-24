import { expect, test } from "@playwright/test";

test("lists the ten games vertically and opens each game", async ({ page }) => {
  await page.goto("/");

  const cards = page.getByRole("link", { name: /^jouer à /i });
  await expect(cards).toHaveCount(10);
  await expect(cards.nth(0)).toContainText("Quoi de 9 ?");
  await expect(cards.nth(1)).toContainText("La Relance");
  await expect(cards.nth(2)).toContainText("Sans le dire");
  await expect(cards.nth(3)).toContainText("Purple");
  await expect(cards.nth(4)).toContainText("Triman");
  await expect(cards.nth(5)).toContainText("Roulette du Chaos");
  await expect(cards.nth(6)).toContainText("Palmier");
  await expect(cards.nth(7)).toContainText("Fuck");
  await expect(cards.nth(8)).toContainText("La Traversée");
  await expect(cards.nth(9)).toContainText("PMU");

  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top),
  );
  for (let index = 0; index < boxes.length - 1; index += 1) {
    expect(boxes[index]).toBeLessThan(boxes[index + 1]!);
  }

  for (const [name, route] of [
    ["Quoi de 9 ?", "/quoi-de-9/"],
    ["La Relance", "/la-relance/"],
    ["Sans le dire", "/sans-le-dire/"],
    ["Purple", "/purple/"],
    ["Triman", "/triman/"],
    ["Roulette du Chaos", "/roulette-du-chaos/"],
    ["Palmier", "/palmier/"],
    ["Fuck", "/fuck/"],
    ["La Traversée", "/la-traversee/"],
    ["PMU", "/pmu/"],
  ] as const) {
    await page.goto("/");
    await page.getByRole("link", { name: `Jouer à ${name}` }).click();
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}?$`, "u"));
    await expect(page.getByRole("link", { name: /accueil AntaVerse/i })).toBeVisible();
  }
});

test("launcher remains usable at 320px without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /choisissez votre jeu/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("opens a game after the network is disabled", async ({ page, context, browserName }) => {
  test.skip(
    browserName === "webkit",
    "L’émulation hors ligne de Playwright WebKit ne transmet pas les requêtes au service worker.",
  );

  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, {
    timeout: 20_000,
  });

  await context.setOffline(true);
  try {
    await page.getByRole("link", { name: "Jouer à Triman" }).click();
    await expect(page).toHaveURL(/\/triman\/?$/u);
    await page.getByRole("link", { name: /^jouer/i }).click();
    await expect(page).toHaveURL(/\/triman\/joueurs\/?$/u);
    await expect(page.getByRole("heading", { name: /ajoutez/i })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
