import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function start(page: Page) {
  await page.goto("/sport/");
  await page.getByRole("button", { name: /^Séances/ }).tap();
  await page.getByRole("button", { name: "Entraînement libre", exact: true }).tap();
  await page.getByRole("button", { name: "Commencer ma séance", exact: true }).tap();
  await page.getByRole("button", { name: "Développé couché", exact: true }).tap();
}

async function unobscured(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  // Centre the target in the usable viewport, as a user scrolling past the floating dock can do.
  await button.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  expect(
    await button.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    }),
  ).toBe(true);
}

test("Sport device: touch, rest, interruption and both themes", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  await page.getByRole("button", { name: "Valider l’exercice", exact: true }).tap();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(
    page.getByRole("heading", { name: "Développé couché", exact: true }),
  ).toBeInViewport();
  await fits(page);
  await page.screenshot({ path: testInfo.outputPath("device-workout-dark.png"), scale: "css" });
  await page.clock.install({ time: new Date("2026-10-19T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-19T12:01:00Z"));
  await unobscured(page, "Série terminée · démarrer le repos");
  await page.getByRole("button", { name: "Série terminée · démarrer le repos", exact: true }).tap();
  await page.clock.fastForward(3000);
  await expect(page.getByRole("timer")).toHaveText("1:57");
  await page.reload();
  await expect(page.getByLabel("1 séries sur 3 effectuées")).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText("1:57");
  await unobscured(page, "Passer le repos");
  await page.getByRole("button", { name: "Passer le repos", exact: true }).tap();
  await page.getByRole("button", { name: "Mode clair", exact: true }).tap();
  await expect(page.locator("main")).toHaveAttribute("data-theme", "light");
  await fits(page);
  await page.screenshot({ path: testInfo.outputPath("device-workout-light.png"), scale: "css" });
});

test("Sport device: numeric entry with a constrained keyboard viewport", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  const size = page.viewportSize()!;
  // A reduced content height stresses keyboard overlap without pretending to emulate an OS keyboard.
  if (size.height > 600)
    await page.setViewportSize({ width: size.width, height: Math.max(360, size.height - 300) });
  await page.getByLabel("Charge (kg)", { exact: true }).tap();
  await page.getByLabel("Charge (kg)", { exact: true }).fill("42.5");
  await fits(page);
  await unobscured(page, "Valider l’exercice");
  await page.getByRole("button", { name: "Valider l’exercice", exact: true }).tap();
  await expect(page.getByRole("heading", { name: "Développé couché", exact: true })).toBeVisible();
  await fits(page);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("antaverse:sport:v1")!).active.exercises[0].config.loadKg,
    ),
  ).toBe(42.5);
  await page.screenshot({ path: testInfo.outputPath("constrained-height.png"), scale: "css" });
});

test("Sport device: safe-area inset stress", async ({ page, context, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "CDP inset override is Chromium-only; Safari cutouts require a physical device",
  );
  const cdp = await context.newCDPSession(page);
  // Stress values, not a claim about the exact cutout of a particular handset.
  await cdp.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { top: 59, bottom: 34, left: 0, right: 0 },
  });
  await page.goto("/sport/");
  await page.getByRole("button", { name: /^Séances/ }).tap();
  const insets = await page.locator("main").evaluate((el) => ({
    top: parseFloat(getComputedStyle(el).paddingTop),
    bottom: innerHeight - document.querySelector("nav")!.getBoundingClientRect().bottom,
  }));
  expect(insets.top).toBeGreaterThanOrEqual(59);
  expect(insets.bottom).toBeGreaterThanOrEqual(34);
  await fits(page);
  await cdp.detach();
});
