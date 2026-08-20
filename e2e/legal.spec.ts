import { expect, test } from "@playwright/test";

test("launcher footer links to the legal hub, which links to every document", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Informations & support" }).click();
  await expect(page).toHaveURL(/\/legal\/?$/u);
  await expect(page.getByRole("heading", { name: "Informations & support" })).toBeVisible();

  for (const [name, route] of [
    ["Confidentialité", "/legal/confidentialite/"],
    ["Mentions légales", "/legal/mentions-legales/"],
    ["Conditions générales d’utilisation", "/legal/conditions-utilisation/"],
    ["Jeu responsable", "/legal/jeu-responsable/"],
    ["Support", "/support/"],
  ] as const) {
    await page.goto("/legal/");
    await page.getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}?$`, "u"));
  }
});

test("every legal page exposes cross-navigation to the other legal documents", async ({
  page,
}) => {
  await page.goto("/legal/confidentialite/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("confidentialité");
  const nav = page.getByRole("navigation", { name: "Documents légaux" });
  await expect(nav.getByRole("link", { name: "Mentions légales" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Support" })).toBeVisible();
});

test("clearing local data requires an explicit confirmation step", async ({ page }) => {
  await page.goto("/legal/confidentialite/");
  const trigger = page.getByRole("button", { name: "Effacer mes données locales" });
  await trigger.click();
  await expect(page.getByText("irréversible")).toBeVisible();

  const confirm = page.getByRole("button", { name: "Confirmer l’effacement" });
  await confirm.click();
  await expect(page.getByText("Données locales effacées")).toBeVisible();
});

test("legal pages stay usable at 320px without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/legal/jeu-responsable/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
