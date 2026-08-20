import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LA_RELANCE_ACCENT,
  PALMIER_ACCENT,
  PURPLE_ACCENT,
  QUOI_DE_9_ACCENT,
  ROULETTE_DU_CHAOS_ACCENT,
  SANS_LE_DIRE_ACCENT,
  TRIMAN_ACCENT,
} from "./launcher-accents";
import { TEAM_PALETTE } from "./team-palette";

const GAMES_DIR = join(process.cwd(), "src", "games");

/**
 * Each game's own styles.css remains the source of truth for its accent
 * color; launcher-accents.ts hardcodes the same value so the launcher card
 * (an inline style, not a stylesheet a game's CSS could scope into) can use
 * it too. This test is the enforcement that keeps the two from silently
 * drifting apart — see ARCHITECTURE.md / launcher-accents.ts comments.
 */
const GAMES: { game: string; cssVar: string; constant: string }[] = [
  { game: "quoi-de-9", cssVar: "--accent-text", constant: QUOI_DE_9_ACCENT },
  { game: "sans-le-dire", cssVar: "--sld-accent", constant: SANS_LE_DIRE_ACCENT },
  { game: "purple", cssVar: "--purple-accent", constant: PURPLE_ACCENT },
  { game: "triman", cssVar: "--triman-accent", constant: TRIMAN_ACCENT },
  { game: "roulette-du-chaos", cssVar: "--rdc-accent", constant: ROULETTE_DU_CHAOS_ACCENT },
  { game: "palmier", cssVar: "--plm-accent", constant: PALMIER_ACCENT },
];

function stylesheet(game: string): string {
  return readFileSync(join(GAMES_DIR, game, "styles.css"), "utf8");
}

/** The dark/default theme value — the first top-level declaration in the file. */
function baseAccent(css: string, cssVar: string): string | null {
  const match = css.match(new RegExp(`${cssVar}:\\s*(#[0-9a-f]{6})`, "i"));
  return match ? match[1]!.toLowerCase() : null;
}

describe("launcher-accents.ts stays in sync with each game's styles.css", () => {
  for (const { game, cssVar, constant } of GAMES) {
    it(`${game}: ${cssVar} matches its launcher-accents.ts constant`, () => {
      expect(baseAccent(stylesheet(game), cssVar)).toBe(constant.toLowerCase());
    });
  }

  it("la-relance has no own identity — mirrors the shared team palette's first color", () => {
    expect(LA_RELANCE_ACCENT).toBe(TEAM_PALETTE[0]);
  });
});
