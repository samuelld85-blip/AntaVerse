// Foreground ("ink") to place on top of a game's accent color.
//
// Every game's primary CTA is the same shared button filled with that game's
// accent, so the label color cannot be a fixed value: a light accent
// (Palmier's yellow, Quoi de 9's cyan) needs dark text, everything else reads
// better — and stays on-brand — in white. Rather than each game picking a
// color by eye, the choice is derived here from the accent's WCAG relative
// luminance, and each game's `--game-accent-ink` must match what
// `readableInk()` returns for its accent (enforced by accent-ink.test.ts).

/** Near-black used for dark text on light accents — matches `--ink`. */
export const ACCENT_INK_DARK = "#0b1118";
/** Pure white used for light text on mid and dark accents. */
export const ACCENT_INK_LIGHT = "#ffffff";

/**
 * Relative-luminance cutoff above which an accent counts as "light" and
 * takes dark ink.
 *
 * This is a product rule, not a pure max-contrast rule: on mid-luminance
 * accents (Triman's orange, Sans le dire's emerald, Roulette du Chaos's red)
 * black would technically win the WCAG ratio, but white is the intended
 * brand look. The cutoff sits in the gap between the lightest white-ink
 * accent (emerald #10b981, 0.364) and the darkest dark-ink accent
 * (cyan #16c7e8, 0.468), so both groups clear it with margin.
 */
export const LIGHT_ACCENT_LUMINANCE = 0.42;

function channelLuminance(channel: number): number {
  const ratio = channel / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a `#rrggbb` color. */
export function relativeLuminance(hex: string): number {
  const value = hex.trim().replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return (
    0.2126 * channelLuminance(red) +
    0.7152 * channelLuminance(green) +
    0.0722 * channelLuminance(blue)
  );
}

/** WCAG contrast ratio between two `#rrggbb` colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Dark ink on light accents, white ink on mid and dark accents. */
export function readableInk(accent: string): string {
  return relativeLuminance(accent) > LIGHT_ACCENT_LUMINANCE
    ? ACCENT_INK_DARK
    : ACCENT_INK_LIGHT;
}
