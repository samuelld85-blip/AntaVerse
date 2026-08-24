// Each game's main identity color, as used by the launcher (game-card.tsx —
// the bottom accent line and arrow). Mirrors each game's own CSS accent
// token (`--<game>-accent`, or `--accent-text`/`--sld-accent`) — keep this
// file in sync with the corresponding game's styles.css when a palette
// changes, instead of hardcoding the color again elsewhere.
import { TEAM_PALETTE } from "./team-palette";

export const QUOI_DE_9_ACCENT = "#16C7E8"; // --accent-text (quoi-de-9/styles.css)
export const LA_RELANCE_ACCENT = TEAM_PALETTE[0]; // no own identity — shared team color 1
export const SANS_LE_DIRE_ACCENT = "#16C7E8"; // --sld-accent (sans-le-dire/styles.css)
export const PURPLE_ACCENT = "#9D4AFA"; // --purple-accent (purple/styles.css)
export const TRIMAN_ACCENT = "#FF5C2B"; // --triman-accent (triman/styles.css)
export const ROULETTE_DU_CHAOS_ACCENT = "#E8452A"; // --rdc-accent (roulette-du-chaos/styles.css)
export const PALMIER_ACCENT = "#FFC940"; // --plm-accent (palmier/styles.css)
export const FUCK_ACCENT = "#10B981"; // --fuck-accent (fuck/styles.css)
export const LA_TRAVERSEE_ACCENT = "#60A5FA"; // --traversee-accent (la-traversee/styles.css)
