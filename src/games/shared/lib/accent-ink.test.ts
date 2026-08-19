import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const GAMES_DIR = join(process.cwd(), "src", "games");
const GAMES = [
  "palmier",
  "triman",
  "roulette-du-chaos",
  "sans-le-dire",
  "purple",
  "la-relance",
  "quoi-de-9",
];

function stylesheet(game: string): string {
  return readFileSync(join(GAMES_DIR, game, "styles.css"), "utf8");
}

/**
 * Resolves the `--game-accent-ink` a game's stylesheet applies in a theme:
 * dark theme uses the base declaration in :root:has(...), light theme
 * overrides it in html[data-theme="light"]:has(...).
 */
function declaredInk(css: string, theme: "dark" | "light"): string | null {
  if (theme === "light") {
    const lightMatch = css.match(
      /html\[data-theme="light"\][^{]*:has\([^)]+\)[^{]*\{[^}]*?--game-accent-ink:\s*(#[0-9a-f]{6})/i,
    );
    if (lightMatch) return lightMatch[1]!.toLowerCase();
  }

  const darkMatch = css.match(
    /:root:has\([^)]+\)[^{]*\{[^}]*?--game-accent-ink:\s*(#[0-9a-f]{6})/i,
  );
  return darkMatch ? darkMatch[1]!.toLowerCase() : null;
}

describe("--game-accent-ink universal rule", () => {
  it("dark theme: all games use white (#ffffff)", () => {
    for (const game of GAMES) {
      expect(declaredInk(stylesheet(game), "dark")).toBe("#ffffff");
    }
  });

  it("light theme: all games use dark gray (#222222)", () => {
    for (const game of GAMES) {
      expect(declaredInk(stylesheet(game), "light")).toBe("#222222");
    }
  });
});

describe("game palettes cannot leak into the theme selector", () => {
  it("styles the selector from its own tokens only", () => {
    const css = readFileSync(
      join(GAMES_DIR, "shared", "components", "theme-selector.css"),
      "utf8",
    );
    const consumed = [...css.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]!);
    expect(new Set(consumed)).toEqual(
      new Set([
        "--ts-fg",
        "--ts-fg-muted",
        "--ts-line",
        "--ts-line-active",
        "--ts-surface",
        "--ts-surface-active",
      ]),
    );
    expect(css).not.toMatch(/--game-accent|--plm-|--triman-|--rdc-|--sld-|--purple-|--violet/);
  });

  it("is not restyled by any game stylesheet", () => {
    for (const game of GAMES) {
      expect(stylesheet(game)).not.toMatch(/\.theme-selector/);
    }
  });
});
