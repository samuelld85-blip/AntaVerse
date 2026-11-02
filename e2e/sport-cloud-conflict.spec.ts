import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("Sport keeps local data without any conflict prompt after login", async ({ page }, testInfo) => {
  const id = "00000000-0000-0000-0000-000000000001";
  const user = { id, email: "sport-test@example.com", aud: "authenticated", role: "authenticated" };
  const accessToken =
    [
      { alg: "HS256", typ: "JWT" },
      { sub: id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 },
    ]
      .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
      .join(".") + ".test";
  const local = {
    version: 1,
    active: null,
    history: Array.from({ length: 13 }, (_, index) => ({
      id: `session-${index}`,
      name: `Séance locale ${index + 1}`,
      kind: "full",
      startedAt: "2026-10-01T10:00:00.000Z",
      endedAt: "2026-10-01T11:00:00.000Z",
      exercises: [],
    })),
    favorites: [],
    templates: [],
  };
  const remote = structuredClone(local);
  remote.history[0]!.name = "Séance sur un autre téléphone";
  let uploads = 0;
  // All account traffic is simulated: never sign in or write to the hosted service.
  await page.route("**/auth/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({
      json: path.endsWith("/settings")
        ? { external: {} }
        : path.endsWith("/user")
          ? user
          : {
              access_token: accessToken,
              refresh_token: "test-refresh-token",
              token_type: "bearer",
              expires_in: 3600,
              user,
            },
    });
  });
  await page.route("**/rest/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/save_backup")) {
      uploads += 1;
      await route.fulfill({ status: 503, json: { message: "Temporary failure" } });
    } else {
      await route.fulfill({
        json: path.endsWith("/profiles")
          ? { id, username: "sport_test" }
          : path.endsWith("/backups")
            ? { payload: remote, revision: 1 }
            : [],
      });
    }
  });
  await page.goto("/sport/compte/");
  await expect(page.getByRole("heading", { name: "Retrouvez votre carnet partout" })).toBeVisible();
  test.skip(
    (await page
      .getByText("Les comptes en ligne ne sont pas encore disponibles.", { exact: false })
      .count()) > 0,
    "Requires a cloud-configured build",
  );
  await page.evaluate((snapshot) => {
    localStorage.setItem("antaverse:sport:v1", JSON.stringify(snapshot));
  }, local);
  await page.getByLabel("E-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Me connecter / Créer mon compte", exact: true }).click();
  await page.getByRole("link", { name: "← Mon carnet Sport" }).click();
  await expect(page.getByRole("heading", { name: "Carnet de sport", exact: true })).toBeVisible();
  // Local data is uploaded over the differing cloud copy; no pause panel is shown.
  await expect.poll(() => uploads).toBeGreaterThan(0);
  await expect(page.locator("details").filter({ hasText: "Sauvegarde en ligne en pause" })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("sport-local-wins-home.png"), fullPage: true });
  await page.getByRole("button", { name: /^Historique/ }).click();
  await expect(page.getByRole("heading", { name: "Historique", exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("antaverse:sport:v1")!).history),
  ).toEqual(local.history);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("sport-local-wins-usable.png"), fullPage: true });
});
