import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("sport: optional rest, discard, history editing and deletion", async ({ page }, testInfo) => {
  await page.goto("/sport/");
  await page.getByRole("button", { name: "Démarrer ma séance" }).click();
  await page.getByRole("button", { name: "Développé couché", exact: true }).click();
  await page.getByLabel("Séries", { exact: true }).fill("2");
  await page.getByLabel("Minutes de repos", { exact: true }).fill("1");
  await page.getByLabel("Secondes de repos", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Valider l’exercice" }).click();
  await expect(page.getByRole("timer")).toHaveText("1:30");
  await page.getByLabel("Lancer le repos après chaque série").uncheck();
  await page.getByRole("button", { name: "Série terminée", exact: true }).click();
  await expect(page.getByLabel("1 séries sur 2 effectuées")).toBeVisible();
  await expect(page.getByRole("button", { name: "Passer le repos" })).toHaveCount(0);
  await page.getByRole("button", { name: "Dernière série terminée" }).click();
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Quitter sans enregistrer" }).click();
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Le début de votre carnet" })).toBeVisible();
  await page.getByRole("button", { name: "Commencer une séance", exact: true }).click();
  await page.getByRole("button", { name: "Démarrer ma séance" }).click();
  await page.getByRole("button", { name: "Squat", exact: true }).click();
  await page.getByLabel("Séries", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Valider l’exercice" }).click();
  await page.getByRole("button", { name: "Dernière série terminée" }).click();
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer et terminer" }).click();
  await page.getByRole("button", { name: "Modifier cette séance" }).click();
  await page.getByLabel("Titre", { exact: true }).fill("Jambes du dimanche");
  await page.getByLabel(/^Charge série 1 /).fill("60");
  await page.getByLabel(/^Répétitions série 1 /).fill("8");
  await page.getByRole("button", { name: "Enregistrer les modifications" }).click();
  await expect(
    page.getByRole("heading", { name: "Jambes du dimanche", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Barre · 60 kg · 8 rép.", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sport-edited-history.png"), fullPage: true });
  await page.reload();
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await page.getByRole("button", { name: /Jambes du dimanche/ }).click();
  await page.getByRole("button", { name: "Supprimer cette séance" }).click();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Jambes du dimanche" })).toBeVisible();
  await page.getByRole("button", { name: "Supprimer cette séance" }).click();
  await page.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(page.getByRole("heading", { name: "Le début de votre carnet" })).toBeVisible();
});

test("sport: session, rest, recovery, favorites, history and replay", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ouvrir Sport" }).click();
  await expect(page.getByRole("heading", { name: "Votre séance. À votre rythme." })).toBeVisible({
    timeout: 15000,
  });
  await page.screenshot({ path: testInfo.outputPath("sport-home.png"), fullPage: true });
  await page.getByRole("button", { name: "Mode clair", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("sport-home-light.png"), fullPage: true });
  await page.getByRole("button", { name: "Mode sombre", exact: true }).click();
  await page.getByRole("button", { name: "Push Pull Legs", exact: true }).click();
  await page.getByRole("button", { name: "Démarrer ma séance" }).click();
  await expect(page.getByRole("heading", { name: "Push Pull Legs", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sport-grid.png"), fullPage: true });
  await page.getByRole("button", { name: "Push", exact: true }).click();
  await page.getByRole("searchbox").fill("developpe couche");
  await page.getByRole("button", { name: "Développé couché", exact: true }).click();
  await page.getByLabel("Charge (kg)", { exact: true }).fill("40");
  await expect(page.getByLabel("Minutes de repos", { exact: true })).toHaveValue("2");
  await expect(page.getByLabel("Secondes de repos", { exact: true })).toHaveValue("00");
  await page.getByRole("button", { name: "Valider l’exercice" }).click();
  await page.getByRole("button", { name: "Configuration favorite", exact: true }).click();
  await page.clock.install();
  await page
    .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
    .click();
  await expect(page.getByRole("timer")).toHaveText("2:00");
  await page.clock.fastForward(1000);
  await expect(page.getByRole("timer")).toHaveText("1:59");
  await page.clock.fastForward(60000);
  await expect(page.getByRole("timer")).toHaveText("0:59");
  await page.clock.fastForward(54000);
  await expect(page.getByRole("timer")).toHaveText("0:05");
  await page.clock.fastForward(5000);
  await expect(page.getByRole("timer")).toHaveText("0:00");
  await page.getByRole("button", { name: "Démarrer le chrono", exact: true }).click();
  await page.getByRole("button", { name: "Passer le repos" }).click();
  await page.screenshot({ path: testInfo.outputPath("sport-workout.png"), fullPage: true });
  await page.reload();
  await expect(page.getByLabel("1 séries sur 3 effectuées")).toBeVisible();
  await page.getByRole("button", { name: "Modifier les réglages" }).click();
  await page.getByLabel("Charge (kg)", { exact: true }).fill("45");
  await page.getByRole("button", { name: "Appliquer aux prochaines séries" }).click();
  await page
    .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
    .click();
  await page.getByRole("button", { name: "Passer le repos" }).click();
  await page.getByRole("button", { name: "Dernière série terminée" }).click();
  await expect(page.getByRole("heading", { name: "Prochain exercice" })).toBeVisible();
  await page.getByRole("searchbox").fill("incliné");
  await page.getByRole("button", { name: "Développé incliné", exact: true }).click();
  await page.getByRole("button", { name: "Valider l’exercice" }).click();
  await expect(page.getByRole("button", { name: "Terminer ma séance", exact: true })).toHaveCount(
    0,
  );
  await page.getByText("Options de l’exercice", { exact: true }).click();
  await page.getByRole("button", { name: "Arrêter cet exercice" }).click();
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer et terminer" }).click();
  await expect(page.getByText("1 exercices · 3 séries effectuées")).toBeVisible();
  await expect(page.getByText("Barre · 40 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("Barre · 45 kg", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Séance favorite", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("sport-history.png"), fullPage: true });
  await page.getByRole("button", { name: "Favoris", exact: true }).click();
  await expect(page.getByText(/40 kg.*haltère/)).toHaveCount(0);
  await expect(page.getByText(/Barre · 40 kg/)).toBeVisible();
  await page.getByRole("button", { name: "Démarrer cette séance" }).click();
  await expect(page.getByLabel("0 séries sur 3 effectuées")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("0 séries sur 3 effectuées")).toBeVisible();
});

test("sport: small screen filters, empty session and invalid storage", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/sport/");
  await page.getByRole("button", { name: "Half body", exact: true }).click();
  await page.getByRole("button", { name: "Démarrer ma séance" }).click();
  await page.getByRole("button", { name: "Bas du corps", exact: true }).click();
  await page.getByLabel("Muscle", { exact: true }).selectOption("quads");
  await page.getByLabel("Matériel", { exact: true }).selectOption("barbell");
  await expect(page.getByRole("button", { name: "Squat", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Développé couché/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("sport-320-catalog.png"), fullPage: true });
  await page.getByRole("button", { name: "Mode clair", exact: true }).click();
  await expect(page.locator("main")).toHaveAttribute("data-theme", "light");
  await page.screenshot({ path: testInfo.outputPath("sport-320-light.png"), fullPage: true });
  await page.getByRole("button", { name: "Mode sombre", exact: true }).click();
  await expect(page.locator("main")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Quitter la séance", exact: true }).click();
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Le début de votre carnet" })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("antaverse:sport:v1", "{bad"));
  await page.reload();
  await expect(
    page.getByRole("alert").filter({ hasText: "Impossible de lire le carnet" }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("antaverse:sport:v1"))).toBe("{bad");
});
