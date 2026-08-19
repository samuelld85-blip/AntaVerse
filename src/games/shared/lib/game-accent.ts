// Shared 3-tier convention for a game's own visual identity (distinct from
// the shared team-color palette in ./team-palette — a game's accent is
// never used to represent a specific team).
//
//   main  — CTAs, badges, borders, strong accents: the game's identity color.
//   dark  — tinted/secondary surfaces, deep gradient stops, subtle active states.
//   light — highlights, glow, hover states, bright gradient stops.
//
// Each game defines its own CSS variables following this naming pattern in
// its styles.css `:root` (and `html[data-theme="light"]` override):
//   --<game>-accent, --<game>-accent-dark, --<game>-accent-light
// e.g. Sans le dire: --sld-accent / --sld-accent-dark / --sld-accent-light.
//
// This type only documents the contract — components read a game's CSS
// variables directly, there is no runtime registry to keep in sync.
export interface GameAccent {
  main: string;
  dark: string;
  light: string;
}
