import { expect, test } from "@playwright/test";

test("lists the three games vertically and opens each game", async ({ page }) => {
  await page.goto("/");

  const cards = page.getByRole("link", { name: /^jouer à /i });
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText("Quoi de 9 ?");
  await expect(cards.nth(1)).toContainText("La Relance");
  await expect(cards.nth(2)).toContainText("Sans le dire");

  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top),
  );
  expect(boxes[0]).toBeLessThan(boxes[1]!);
  expect(boxes[1]).toBeLessThan(boxes[2]!);

  for (const [name, route] of [
    ["Quoi de 9 ?", "/quoi-de-9/"],
    ["La Relance", "/la-relance/"],
    ["Sans le dire", "/sans-le-dire/"],
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
