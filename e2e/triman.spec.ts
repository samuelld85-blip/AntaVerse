import { expect, test } from "@playwright/test";

// Rolls are random in the real app, so this test pins Math.random to a
// constant that always produces a die value of 3 (and, for the initial
// starting-player draw, picks index 1 out of 4 players). That makes the
// whole run deterministic: the very first search roll is a double 3, which
// both crowns a Triman and — once active play begins — keeps triggering the
// Triman rule plus the doubles rule on every subsequent roll.
const FIXED_RANDOM = (3 - 1 + 0.5) / 6; // -> die value 3, and index 1 of 4 players

test("finds the Triman, stacks the Triman and doubles rules, and keeps the roller active", async ({
  page,
}) => {
  await page.addInitScript((value) => {
    Math.random = () => value;
  }, FIXED_RANDOM);

  await page.goto("/triman");
  await page.getByRole("link", { name: /^jouer/i }).click();
  await expect(page).toHaveURL(/\/joueurs\/?$/u);

  const names = ["Alice", "Bob", "Chris", "Dana"];
  await page.getByRole("button", { name: /ajouter un joueur/i }).click();
  for (const [index, name] of names.entries()) {
    await page.getByLabel(`Nom du joueur ${index + 1}`).fill(name);
  }
  await page.getByRole("button", { name: /lancer la partie/i }).click();

  await expect(page).toHaveURL(/\/partie\/?$/u);
  await expect(page.getByText("Recherche du Triman")).toBeVisible();
  // Index 1 of the entered order is Bob.
  await expect(page.getByRole("heading", { name: "Bob" })).toBeVisible();

  // First roll: a double 3 while searching immediately crowns Bob.
  await page.getByRole("button", { name: /lancer les dés/i }).click();
  await expect(page.getByText("Bob devient le Triman !")).toBeVisible();
  await page.getByRole("status").click();

  await expect(page.getByText("Triman : Bob")).toBeVisible();
  // Play resumes with the player after the new Triman: Chris.
  await expect(page.getByRole("heading", { name: "Chris" })).toBeVisible();

  // Chris rolls another double 3: the Triman rule (Bob drinks) and the
  // doubles rule (Chris drinks and distributes) both fire, so Chris stays active.
  await page.getByRole("button", { name: /lancer les dés/i }).click();
  await expect(page.getByText("Bob boit 1 gorgée")).toBeVisible();
  await expect(page.getByText(/Chris boit 3 gorgées et en distribue 3/u)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chris" })).toBeVisible();
  await expect(page.getByText("Retapez pour relancer")).toBeVisible();
});
