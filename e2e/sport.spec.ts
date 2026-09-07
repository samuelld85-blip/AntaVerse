import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function startFreeSession(page: Page, format = "Full body") {
  await page.getByRole("button", { name: /^Séances/ }).click();
  await page.getByRole("button", { name: format, exact: true }).click();
  await page.getByRole("button", { name: "Entraînement libre", exact: true }).click();
  await page.getByRole("button", { name: "Commencer ma séance", exact: true }).click();
}

test("sport: free sessions can record a superset as one exercise", async ({ page }) => {
  await page.goto("/sport/");
  await startFreeSession(page);
  await page.getByRole("searchbox").fill("leg curl");
  await page.getByRole("button", { name: "Leg curl", exact: true }).click();
  await page.getByLabel("Séries", { exact: true }).fill("2");
  await page.getByLabel("Charge (kg)", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Ajouter un superset", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Leg curl", exact: true })).toBeVisible();
  await page.getByRole("searchbox").fill("leg extension");
  await page.getByRole("button", { name: "Leg extension", exact: true }).click();
  await page.getByLabel("Séries", { exact: true }).fill("2");
  await page.getByLabel("Charge (kg)", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Valider l’exercice", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Leg curl \+ Leg extension/ })).toBeVisible();
  await page
    .getByRole("button", { name: "Superset terminé · démarrer le repos", exact: true })
    .click();
  await expect(page.getByRole("timer")).toHaveText("2:00");
  await page.getByRole("button", { name: "Passer le repos", exact: true }).click();
  await page.getByRole("button", { name: "Dernier superset terminé ✓", exact: true }).click();
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page
    .getByRole("button", { name: "Retourner à la liste des exercices", exact: true })
    .click();
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer et terminer", exact: true }).click();
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer la séance", exact: true }).click();
  await expect(page.getByText("1 exercices · 4 séries effectuées", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Leg curl \+ Leg extension/ })).toBeVisible();
});

test("sport: automatic rest, discard, history editing and deletion", async ({ page }, testInfo) => {
  await page.goto("/sport/");
  await startFreeSession(page);
  await page.getByRole("button", { name: "Développé couché", exact: true }).click();
  await page.getByLabel("Séries", { exact: true }).fill("2");
  await page.getByLabel("Minutes de repos", { exact: true }).selectOption("1");
  await page.getByLabel("Secondes de repos", { exact: true }).selectOption("30");
  await page.getByRole("button", { name: "Valider l’exercice" }).click();
  await expect(page.getByRole("timer")).toHaveText("1:30");
  await page
    .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
    .click();
  await expect(page.getByLabel("1 séries sur 2 effectuées")).toBeVisible();
  await expect(page.getByRole("button", { name: "Passer le repos" })).toBeVisible();
  await page.getByRole("button", { name: "Passer le repos" }).click();
  await page.getByRole("button", { name: "Dernière série terminée" }).click();
  await expect(
    page.getByRole("heading", { name: /Comment s’est passé Développé couché/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page.locator("textarea").fill("Bonne sensation sur la dernière série.");
  await page
    .getByRole("button", { name: "Retourner à la liste des exercices", exact: true })
    .click();
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Quitter sans enregistrer" }).click();
  await page.getByRole("button", { name: /^Historique/ }).click();
  await expect(page.getByRole("heading", { name: "Le début de votre carnet" })).toBeVisible();
  await page.getByRole("button", { name: "Commencer une séance", exact: true }).click();
  await page.getByRole("button", { name: "Full body", exact: true }).click();
  await page.getByRole("button", { name: "Entraînement libre", exact: true }).click();
  await page.getByRole("button", { name: "Commencer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Squat", exact: true }).click();
  await page.getByLabel("Séries", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Valider l’exercice" }).click();
  await page.getByRole("button", { name: "Dernière série terminée" }).click();
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page
    .getByRole("button", { name: "Retourner à la liste des exercices", exact: true })
    .click();
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer et terminer" }).click();
  await expect(
    page.getByRole("heading", { name: "Comment s’est passée votre séance ?", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "session.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByAltText("Photo 1 ajoutée")).toBeVisible();
  await page.getByRole("button", { name: "Enregistrer la séance", exact: true }).click();
  await expect(page.getByAltText("Photo de la séance 1")).toBeVisible();
  await page.getByRole("button", { name: "Agrandir la photo 1", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Photo agrandie" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Photo agrandie 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fermer la photo", exact: true }).click();
  await page.getByRole("button", { name: "Modifier cette séance" }).click();
  await page.getByLabel("Titre", { exact: true }).fill("Jambes du dimanche");
  await page.getByLabel(/^Charge série 1 /).fill("60");
  await page.getByLabel(/^Répétitions série 1 /).fill("8");
  await expect(
    page
      .locator("fieldset")
      .filter({ hasText: "Ressenti de la séance" })
      .getByRole("button", { name: "Content", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator("textarea").nth(0).fill("Séance bien enregistrée après coup.");
  await page.locator("textarea").nth(1).fill("Bon contrôle sur le squat.");
  await page.getByRole("button", { name: "Enregistrer les modifications" }).click();
  await expect(
    page.getByRole("heading", { name: "Jambes du dimanche", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Barre · 60 kg · 8 rép.", { exact: true })).toBeVisible();
  await expect(page.getByText("Bon contrôle sur le squat.", { exact: true })).toBeVisible();
  await expect(page.getByAltText("Photo de la séance 1")).toBeVisible();
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await expect(
    page.getByText("Séance bien enregistrée après coup.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sport-edited-history.png"), fullPage: true });
  await page.reload();
  await page.getByRole("button", { name: /^Historique/ }).click();
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
  await expect(page.getByRole("heading", { name: "Carnet de sport", exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page.screenshot({ path: testInfo.outputPath("sport-home.png"), fullPage: true });
  await page.getByRole("button", { name: "Mode clair", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("sport-home-light.png"), fullPage: true });
  await page.getByRole("button", { name: "Mode sombre", exact: true }).click();
  await startFreeSession(page, "Push Pull Legs");
  await expect(page.getByRole("heading", { name: "Push Pull Legs", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sport-grid.png"), fullPage: true });
  await page.getByRole("button", { name: "Push", exact: true }).click();
  await page.getByRole("searchbox").fill("developpe couche");
  await page.getByRole("button", { name: "Développé couché", exact: true }).click();
  await page.getByLabel("Charge (kg)", { exact: true }).fill("40");
  await expect(page.getByLabel("Minutes de repos", { exact: true })).toHaveValue("2");
  await expect(page.getByLabel("Secondes de repos", { exact: true })).toHaveValue("0");
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
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page
    .getByRole("button", { name: "Retourner à la liste des exercices", exact: true })
    .click();
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
  await page.getByRole("button", { name: "Moyen", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer la séance", exact: true }).click();
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

test("sport: recommended sessions are preconfigured and advance automatically", async ({
  page,
}) => {
  await page.goto("/sport/");
  await page.getByRole("button", { name: /^Séances/ }).click();
  await page.getByRole("button", { name: "Push Pull Legs", exact: true }).click();
  await page.getByRole("button", { name: "Séances recommandées", exact: true }).click();
  await page.getByRole("button", { name: "Court 45 min", exact: true }).click();
  await expect(page.getByRole("button", { name: "Push express" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pull express" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Legs express" })).toBeVisible();
  await page.getByRole("button", { name: "Full body", exact: true }).click();
  await page.getByRole("button", { name: "Moyen 60 min", exact: true }).click();
  await expect(page.getByRole("button", { name: "Full body équilibré A" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Full body équilibré B" })).toBeVisible();
  await page.getByRole("button", { name: "Full body équilibré A" }).click();
  await expect(
    page.getByRole("heading", { name: "Full body équilibré A", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Programme de la séance · 7 exercices", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Développé couché", { exact: true })).toHaveCount(1);
  await page.getByLabel("Charge pour Squat", { exact: true }).fill("80");
  await page.getByRole("button", { name: "Terminer ma séance", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Quitter cette séance vide ?", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer ma séance", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Squat", exact: true })).toBeVisible();
  await expect(page.getByLabel("Charge pour Squat", { exact: true })).toHaveValue("80");
  await page
    .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
    .click();
  await page.getByRole("button", { name: "Passer le repos", exact: true }).click();
  await page
    .getByRole("button", { name: "Série terminée · démarrer le repos", exact: true })
    .click();
  await page.getByRole("button", { name: "Passer le repos", exact: true }).click();
  await page.getByRole("button", { name: "Dernière série terminée ✓", exact: true }).click();
  await page.getByRole("button", { name: "Moyen", exact: true }).click();
  await page.getByRole("button", { name: "Passer à l’exercice suivant", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Développé couché", exact: true })).toBeVisible();
  await expect(page.getByText("En cours", { exact: true })).toBeVisible();
});

test("sport: small screen filters, empty session and invalid storage", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/sport/");
  await startFreeSession(page, "Half body");
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

test("sport: statistics turns stored sessions into concise progress insights", async ({ page }) => {
  await page.goto("/sport/");
  await page.evaluate(() => {
    const set = (date: string, loadKg: number) => ({
      completedAt: date,
      equipment: "barbell",
      loadKg,
      reps: 8,
    });
    const workout = (id: string, date: string, loadKg: number) => ({
      id,
      kind: "push",
      startedAt: date,
      endedAt: date,
      exercises: [
        {
          id: `${id}-bench`,
          config: {
            exerciseId: "bench-press",
            equipment: "barbell",
            sets: 3,
            restSeconds: 120,
            loadKg,
            reps: 8,
          },
          completedSets: [set(date, loadKg), set(date, loadKg), set(date, loadKg)],
          finished: true,
        },
      ],
    });
    localStorage.setItem(
      "antaverse:sport:v1",
      JSON.stringify({
        version: 1,
        active: null,
        history: [
          workout("bench-70", "2026-09-03T10:00:00.000Z", 70),
          workout("bench-50", "2026-08-03T10:00:00.000Z", 50),
        ],
        favorites: [],
        templates: [],
      }),
    );
  });
  await page.reload();
  await page.getByRole("button", { name: "Statistiques", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Statistiques", exact: true })).toBeVisible();
  await expect(page.getByText("Exercices les plus pratiqués", { exact: true })).toBeVisible();
  await expect(
    page.getByLabel("Exercices les plus pratiqués").getByText("Développé couché", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("+40 % depuis le départ", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Volume", exact: true }).click();
  await expect(page.getByRole("img", { name: /Volume chargé par séance :/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
