import { expect, test } from "@playwright/test";

// Pins Math.random to a small constant so the whole run is deterministic:
// - createGame: activePlayerIndex = floor(0.081 * 3) = 0 -> Alice starts.
// - spinWheel: pickWeightedCategory rolls 0.081 * 100 = 8.1, past JACKPOT's
//   weight-8 slot into DISTRIBUE (weight 15), and pickEvent picks index
//   floor(0.081 * 12) = 0 of its 12 events -> "d1" (Petit cadeau). It's a
//   freeDistributeEvent: it narrates the outcome directly (no target picker —
//   the table self-organizes who drinks), so the turn advances on "Continuer"
//   alone rather than a player pick + confirm.
const FIXED_RANDOM = 0.081;

test("plays one full turn: spin, land on an event, resolve it, advance to the next player", async ({
  page,
}) => {
  await page.addInitScript((value) => {
    Math.random = () => value;
  }, FIXED_RANDOM);

  await page.goto("/roulette-du-chaos");
  await page.getByRole("link", { name: /^jouer/i }).click();
  await expect(page).toHaveURL(/\/joueurs\/?$/u);

  const names = ["Alice", "Bob", "Chris"];
  for (const [index, name] of names.entries()) {
    await page.getByLabel(`Nom du joueur ${index + 1}`).fill(name);
  }
  await page.getByRole("button", { name: /lancer la partie/i }).click();

  await expect(page).toHaveURL(/\/partie\/?$/u);
  await expect(page.getByRole("heading", { name: "Alice" })).toBeVisible();

  await page.getByRole("button", { name: /tourner la roue/i }).click();

  // Wheel spin (CSS transition) + category reveal pause before the event
  // card appears — give it plenty of room.
  await expect(page.getByRole("heading", { name: "Petit cadeau" })).toBeVisible({ timeout: 8_000 });
  await expect(
    page.getByText("Distribue 2 gorgées : à un seul joueur, ou 1 + 1 entre deux joueurs."),
  ).toBeVisible();

  await expect(page.getByText("Distribue 2 gorgées — gérez entre vous.")).toBeVisible();
  await page.getByRole("button", { name: /continuer/i }).click();

  // nextPlayerIndex(0, 3) -> 1 -> Bob is up next.
  await expect(page.getByRole("heading", { name: "Bob" })).toBeVisible();
  await expect(page.getByRole("button", { name: /tourner la roue/i })).toBeEnabled();
});
