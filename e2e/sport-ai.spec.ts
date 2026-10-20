import { expect, test, type Page } from "@playwright/test";
import type {
  AssistantRequest,
  AssistantResponse,
  Draft,
} from "../supabase/functions/_shared/sport-ai-contract";
import type { SportStore } from "../src/sport/model";

test.use({ serviceWorkers: "block" });
const id = "00000000-0000-0000-0000-000000000001";
const friendId = "00000000-0000-0000-0000-000000000002";
const response: AssistantResponse = {
  message: "Voici une proposition à vérifier.",
  observations: [],
  draft: null,
};
const draft: Draft = {
  name: "Haut du corps proposé",
  kind: "upper",
  questions: [],
  exercises: [
    {
      exerciseId: "bench-press",
      equipment: "dumbbell",
      sets: 3,
      reps: 8,
      restSeconds: 120,
      loadKg: 20,
      superset: null,
    },
  ],
};

function carnet(): SportStore {
  const session = (days: number) => {
    const date = new Date(Date.now() - days * 86400000).toISOString();
    return {
      id: `own-${days}`,
      name: `Séance témoin ${days}`,
      kind: "upper" as const,
      startedAt: date,
      endedAt: date,
      feedback: {
        mood: "good" as const,
        comment: "COMMENTAIRE_PRIVE_NE_PAS_ENVOYER",
        photos: ["data:image/png;base64,PHOTO_PRIVEE_NE_PAS_ENVOYER"],
      },
      exercises: [
        {
          id: `entry-${days}`,
          config: {
            exerciseId: "bench-press",
            equipment: "dumbbell" as const,
            sets: 3,
            reps: 8,
            restSeconds: 120,
            loadKg: 20,
          },
          completedSets: [
            {
              completedAt: date,
              exerciseId: "bench-press",
              equipment: "dumbbell" as const,
              loadKg: 20,
              reps: 8,
            },
          ],
          completedRounds: 1,
          pyramid: false,
          finished: true,
        },
      ],
    };
  };
  return {
    version: 1,
    active: null,
    history: [session(2), session(40)],
    favorites: [],
    templates: [],
  };
}

async function login(page: Page, friends = false) {
  const user = {
    id,
    email: "sport-ai-test@example.com",
    aud: "authenticated",
    role: "authenticated",
  };
  const accessToken =
    [
      { alg: "HS256", typ: "JWT" },
      { sub: id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 },
    ]
      .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
      .join(".") + ".test";
  let remote = carnet();
  const friend = { ...remote.history[0]!, id: "friend-session", name: "Séance amie privée" };
  // Simulate every account/backend endpoint. No hosted account or real key is used.
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
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/save_backup")) {
      remote = route.request().postDataJSON().snapshot as SportStore;
      await route.fulfill({ json: null });
    } else {
      await route.fulfill({
        json: url.pathname.endsWith("/profiles")
          ? url.searchParams.get("id")?.startsWith("in.")
            ? [{ id: friendId, username: "ami_test" }]
            : { id, username: "sport_test" }
          : url.pathname.endsWith("/backups")
            ? { payload: remote, revision: 1 }
            : url.pathname.endsWith("/friendships") && friends
              ? [{ requester: id, recipient: friendId, accepted_at: new Date().toISOString() }]
              : url.pathname.endsWith("/sport_sessions") && friends
                ? [{ user_id: friendId, payload: friend }]
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
  await page.evaluate(
    (snapshot) => localStorage.setItem("antaverse:sport:v1", JSON.stringify(snapshot)),
    remote,
  );
  await page.getByLabel("E-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Me connecter / Créer mon compte", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mon compte Sport", exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Modifier mon pseudo", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "← Mon carnet Sport" }).click();
  await expect(page.getByRole("heading", { name: "Carnet de sport", exact: true })).toBeVisible();
}

async function readStore(page: Page): Promise<SportStore> {
  return page.evaluate(() => JSON.parse(localStorage.getItem("antaverse:sport:v1")!));
}
async function open(page: Page, name = "Préparer ma séance") {
  await page.getByRole("button", { name, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

test("Assistant is optional, consented, private by default and fits small phones in both themes", async ({
  page,
}, testInfo) => {
  const requests: AssistantRequest[] = [];
  await page.route("**/functions/v1/sport-assistant", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: response });
  });
  await login(page);
  for (const [width, theme] of [
    [320, "dark"],
    [390, "light"],
  ] as const) {
    await page.setViewportSize({ width, height: 568 });
    if (theme === "light")
      await page.getByRole("button", { name: "Mode clair", exact: true }).click();
    const trigger = page.getByRole("button", { name: "Préparer ma séance", exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`assistant-home-${width}-${theme}.png`) });
    const before = requests.length;
    const dialog = await open(page);
    await expect(dialog.getByText("Milo · coach IA", { exact: true })).toBeVisible();
    await expect(dialog.getByRole("checkbox", { name: /J’accepte/ })).not.toBeChecked();
    await expect(dialog.getByRole("checkbox", { name: /Joindre/ })).not.toBeChecked();
    await dialog
      .getByRole("textbox", { name: "Votre demande", exact: true })
      .fill("Une séance de 30 minutes avec haltères");
    await expect(dialog.getByRole("button", { name: "Envoyer à l’assistant" })).toBeDisabled();
    expect(requests).toHaveLength(before);
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`assistant-${width}-${theme}.png`) });
    await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
    await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
    await expect(dialog.getByText(response.message, { exact: true })).toBeVisible();
    expect(requests.at(-1)!.context.recentSessions).toEqual([]);
    expect(JSON.stringify(requests.at(-1))).not.toMatch(/COMMENTAIRE_PRIVE|PHOTO_PRIVEE/);
    await dialog.getByText("Les repères de Milo", { exact: true }).click();
    await expect(dialog.getByText(/n’effectue pas de recherche web en direct/)).toBeVisible();
    await expect(dialog.getByRole("link", { name: /ACSM/ })).toHaveAttribute(
      "href",
      "https://acsm.org/resistance-training-guidelines-update-2026/",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

test("A draft is editable, favorites are independent, and starting creates no completed sets", async ({
  page,
}, testInfo) => {
  await page.route("**/functions/v1/sport-assistant", (route) =>
    route.fulfill({ json: { ...response, draft } }),
  );
  await login(page);
  let dialog = await open(page);
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  await dialog
    .getByRole("textbox", { name: "Votre demande", exact: true })
    .fill("Propose une séance haut du corps");
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect(dialog.getByRole("heading", { name: "Brouillon de séance" })).toBeVisible();
  expect((await readStore(page)).active).toBeNull();
  expect((await readStore(page)).templates).toEqual([]);
  await page.setViewportSize({ width: 320, height: 568 });
  await dialog.getByRole("heading", { name: "Brouillon de séance" }).scrollIntoViewIfNeeded();
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("assistant-first-draft-320-dark.png") });
  await dialog.getByRole("spinbutton", { name: "Répétitions (facultatif)", exact: true }).fill("");
  await dialog.getByRole("spinbutton", { name: "kg par haltère", exact: true }).fill("22.5");
  await dialog.getByRole("button", { name: "Enregistrer en favori", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("enregistrée dans vos favoris");
  await dialog.getByRole("spinbutton", { name: "kg par haltère", exact: true }).fill("25");
  await dialog.getByRole("button", { name: "Démarrer cette séance", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const stored = await readStore(page);
  expect(stored.history).toHaveLength(2);
  expect(stored.active!.exercises[0]!.config.loadKg).toBe(25);
  expect(stored.active!.exercises[0]!.completedSets).toEqual([]);
  expect(stored.active!.exercises[0]!.config.reps).toBeNull();
  expect(stored.templates[0]!.exercises[0]!.config.reps).toBeNull();
  expect(stored.templates[0]!.exercises[0]!.config.loadKg).toBe(22.5);
  await page.getByRole("button", { name: "← Accueil", exact: true }).click();
  dialog = await open(page);
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  await dialog
    .getByRole("textbox", { name: "Votre demande", exact: true })
    .fill("Une autre proposition");
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect(
    dialog.getByRole("button", { name: "Démarrer cette séance", exact: true }),
  ).toBeDisabled();
  expect((await readStore(page)).active!.id).toBe(stored.active!.id);
});

test("Text imports keep missing values unresolved until the user completes and verifies them", async ({
  page,
}) => {
  const incomplete: Draft = {
    ...draft,
    questions: ["Quelle charge et quel matériel ?"],
    exercises: [
      {
        exerciseId: "bench-press",
        equipment: null,
        sets: null,
        reps: null,
        restSeconds: null,
        loadKg: null,
        superset: null,
      },
    ],
  };
  await page.route("**/functions/v1/sport-assistant", (route) =>
    route.fulfill({ json: { ...response, draft: incomplete } }),
  );
  await login(page);
  const dialog = await open(page, "Depuis un texte");
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  await dialog
    .getByRole("textbox", { name: "Votre programme", exact: true })
    .fill("Développé couché, réglages à préciser");
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  const start = dialog.getByRole("button", { name: "Démarrer cette séance", exact: true });
  await expect(start).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Enregistrer en favori" })).toBeDisabled();
  await dialog.getByLabel("Matériel").selectOption("barbell");
  await dialog.getByRole("spinbutton", { name: "Séries", exact: true }).fill("3");
  await expect(
    dialog.getByRole("spinbutton", { name: "Répétitions (facultatif)", exact: true }),
  ).toHaveValue("");
  await dialog.getByRole("spinbutton", { name: "Repos (secondes)", exact: true }).fill("120");
  await dialog.getByRole("spinbutton", { name: "kg, barre comprise", exact: true }).fill("40");
  await expect(start).toBeDisabled();
  await dialog.getByRole("button", { name: "J’ai vérifié ce point" }).click();
  await expect(start).toBeEnabled();
  expect((await readStore(page)).active).toBeNull();
});

test("Progress and own-session reviews require selected data and cite only own sessions", async ({
  page,
}, testInfo) => {
  const requests: AssistantRequest[] = [];
  await page.route("**/functions/v1/sport-assistant", async (route) => {
    const request = route.request().postDataJSON() as AssistantRequest;
    requests.push(request);
    await route.fulfill({
      json: {
        ...response,
        observations: [
          {
            text: "Comparaison avec votre séance précédente.",
            sessionIds: [request.context.recentSessions[0]!.id],
          },
        ],
      },
    });
  });
  await login(page, true);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: /^Profil/ }).click();
  let dialog = await open(page, "Comprendre ma progression");
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  await dialog
    .getByRole("textbox", { name: "Votre demande", exact: true })
    .fill("Comprendre mes progrès");
  await expect(dialog.getByRole("button", { name: "Envoyer à l’assistant" })).toBeDisabled();
  await dialog.getByRole("checkbox", { name: "Joindre les données de mon carnet" }).check();
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect(dialog.getByText("Comparaison avec votre séance précédente.")).toBeVisible();
  expect(requests[0]!.context.summary.sessions).toBe(1);
  expect(requests[0]!.context.previousSummary.sessions).toBe(1);
  expect(requests[0]!.context.recentSessions.map((session) => session.id)).toEqual([
    "own-2",
    "own-40",
  ]);
  await page.screenshot({ path: testInfo.outputPath("assistant-progress-320-dark.png") });
  await dialog.getByRole("button", { name: "Fermer l’assistant" }).click();
  await page.setViewportSize({ width: 390, height: 740 });
  await page.getByRole("button", { name: "Mode clair", exact: true }).click();
  dialog = await open(page, "Comprendre ma progression");
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  await dialog.getByRole("checkbox", { name: "Joindre les données de mon carnet" }).check();
  await dialog
    .getByRole("textbox", { name: "Votre demande", exact: true })
    .fill("Comprendre mes progrès");
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect(dialog.getByText("Comparaison avec votre séance précédente.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("assistant-progress-390-light.png") });
  await dialog.getByRole("button", { name: "Fermer l’assistant" }).click();
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await page.getByRole("button").filter({ hasText: "Séance amie privée" }).click();
  await expect(
    page.getByRole("button", { name: "Faire le point sur cette séance", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "← Toutes les séances", exact: true }).click();
  await page.getByRole("button").filter({ hasText: "Séance témoin 2" }).click();
  dialog = await open(page, "Faire le point sur cette séance");
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  await dialog
    .getByRole("checkbox", { name: "Joindre cette séance et mes séances récentes" })
    .check();
  await dialog
    .getByRole("textbox", { name: "Votre demande", exact: true })
    .fill("Compare avec les précédentes");
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect(dialog.getByText("Comparaison avec votre séance précédente.")).toBeVisible();
  expect(requests.at(-1)!.context.focusSessionId).toBe("own-2");
  expect(JSON.stringify(requests)).not.toMatch(/COMMENTAIRE_PRIVE|PHOTO_PRIVEE|friend-session/);
});

test("Errors and offline states preserve text; closing aborts pending answers without changing the carnet", async ({
  page,
  context,
}) => {
  let release = () => {};
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  let aborted = 0;
  page.on("requestfailed", (request) => {
    if (request.url().includes("/functions/v1/sport-assistant")) aborted += 1;
  });
  await page.route("**/functions/v1/sport-assistant", async (route) => {
    requests += 1;
    if (requests === 1)
      await route.fulfill({ status: 429, json: { error: { code: "quota_exceeded" } } });
    else {
      await delayed;
      await route.fulfill({ json: { ...response, draft } }).catch(() => {});
    }
  });
  await login(page);
  const original = await readStore(page);
  let dialog = await open(page);
  await dialog.getByRole("checkbox", { name: /J’accepte/ }).check();
  const input = dialog.getByRole("textbox", { name: "Votre demande", exact: true });
  await input.fill("Une séance simple sans perdre ce texte");
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect(dialog.getByRole("alert")).toContainText("limite de demandes");
  await expect(input).toHaveValue("Une séance simple sans perdre ce texte");
  await context.setOffline(true);
  await expect(dialog.getByText(/Vous êtes hors ligne/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Envoyer à l’assistant" })).toBeDisabled();
  await context.setOffline(false);
  await dialog.getByRole("button", { name: "Envoyer à l’assistant" }).click();
  await expect.poll(() => requests).toBe(2);
  await dialog.getByRole("button", { name: "Fermer l’assistant" }).click();
  release();
  await expect.poll(() => aborted).toBeGreaterThan(0);
  dialog = await open(page);
  await expect(dialog.getByRole("heading", { name: "Brouillon de séance" })).toHaveCount(0);
  expect(await readStore(page)).toEqual(original);
});
