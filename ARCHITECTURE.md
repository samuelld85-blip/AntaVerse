# Architecture

AntaVerse is a small collection of party games — **Quoi de 9 ?**, **La
Relance**, **Sans le dire**, **Purple**, **Triman** — served from one Next.js
app and exported statically. This document describes the layers that exist
today, the boundaries between them, and the rules a future contributor (human
or AI) should follow when adding or changing code. It reflects the current
scale of the app (five games, a handful of contributors) — it is deliberately
not an attempt to future-proof for a scale AntaVerse doesn't have yet.

## Layers

```
src/
  app/            → routing shell (Next.js App Router pages)
  components/      → app-shell UI (home page, cross-game chrome)
  lib/             → app-wide, game-agnostic utilities
  games/
    shared/        → infrastructure used by 2+ games, never by only one
    la-relance/     ┐
    quoi-de-9/      │
    sans-le-dire/   ├─ one folder per game, self-contained
    purple/         │
    triman/         ┘
```

### `src/app` — routing shell

Only route definitions (`page.tsx`, `layout.tsx`) and the thin glue that
wires a URL to a game's `features/*` screen. A page under `app/la-relance/*`
should import from `games/la-relance/*` and render it — it should not contain
game logic itself.

### `src/components` — app shell UI

Components that only make sense at the "AntaVerse home page" level: the game
picker (`game-card.tsx`), the cross-game home link, the home page's theme
selector, PWA/service-worker registration. Nothing here knows about a
specific game's rules, scoring, or state shape. `game-home-nav.tsx` is the
one acknowledged wart: it's shell-level (used from every game's home page)
but hand-written with Tailwind classes even on the two games that don't use
Tailwind elsewhere. It works today because Tailwind only _generates_ classes
it finds referenced in scanned source, and this component's classes happen
to be common enough utilities. It's flagged here rather than fixed because
"fixing" it would mean introducing a second styling convention just for one
component, which is worse than the current small inconsistency.

### `src/lib` — app-wide, game-agnostic utilities

Pure, generic helpers with no knowledge of any game's rules:

- `games.ts` — the registry of games shown on the home page (id, name,
  route, theme). Only ever imported by `app/page.tsx`.
- `random.ts` — `shuffle()`, a generic Fisher-Yates shuffle.
- `local-storage-json.ts` — `readJson`/`writeJson`/`removeJson`, a tiny
  "JSON in one localStorage key" helper.
- `use-theme-mode.ts` — the dark/light theme-mode hook shared by every
  theme selector in the app (home page and in-game).

Anything added here must have zero knowledge of any specific game. If a
helper needs to know a game's data shape, it belongs under `games/shared` or
inside that game's own folder instead.

### `src/games/shared` — infrastructure shared by 2+ games

Components and helpers used by more than one game, with no single-game
assumptions baked in:

- `components/ui.tsx` — `Button`, `ButtonLink`.
- `components/back-button.tsx`, `components/theme-selector.tsx` — shared
  in-game chrome.
- `components/page-shell.tsx` — the "back button + brand mark" header shell
  used by La Relance and Sans le dire (parameterized by `homeHref` and a
  `brand` slot so each game still supplies its own logo/link).
- `components/resume-game-card.tsx` — the "resume your in-progress game"
  card, generic over a minimal `{ status, teams: [{name}, {name}] }` shape
  so each game passes its own `loadCurrentGame` and resume URL.
- `lib/two-team-setup.ts` — team-color palette, name-cleaning, id
  generation and two-team creation, shared by La Relance and Sans le dire.
- `lib/team-palette.ts` — `TEAM_PALETTE`, the ordered team-color list every
  team game (Quoi de 9, La Relance, Sans le dire) indexes into so a team's
  position always maps to the same color everywhere.
- `lib/game-accent.ts` — documents the `main`/`dark`/`light` convention a
  game's own CSS accent variables should follow (`--<game>-accent`,
  `--<game>-accent-dark`, `--<game>-accent-light`). A type/doc only — each
  game still owns its own values in its `styles.css`.
- **`components/ui.tsx` (`.button--primary`), `game-base.css` (`.eyebrow`,
  `.theme-selector-button.is-selected`) consume a shared-by-NAME custom
  property, `--game-accent` (+`-dark`/`-light`/`-glow`), instead of a
  hardcoded color — this is what makes them "shared but themeable".** Every
  game's own `styles.css` redefines these four properties to point at that
  game's own accent variables. **This redefinition must never be a bare
  `:root { --game-accent: ... }`.** `:root` is `<html>` — one scope for the
  whole document — and Next.js's App Router does **not** unload a previous
  route's CSS `<link>` on client-side navigation (confirmed empirically:
  navigating `/` → `/palmier` → `/triman` via `<Link>` leaves both games'
  stylesheets present in `<head>` at once). Two `:root` blocks defining the
  same property name collide, and CSS cascade order — last `<link>` inserted
  wins — decides the value for the *entire document*, independent of which
  route is actually showing. A game whose stylesheet happens to load after
  another's would silently repaint that other game's topline/CTA/theme-toggle
  in its own color. The fix: scope the redefinition to
  `:root:has(.brand-mark--<game>)` (or the game's own unique brand-mark
  class), so the declaration is conditioned on that game's markup actually
  being mounted in the DOM — true per-route isolation — rather than on
  stylesheet load order. See `palmier/styles.css` for the pattern and full
  rationale in its comment. **Never add a new `:root { --game-accent: ... }`
  rule anywhere; always use the `:has()`-scoped form.** Every other per-game
  variable (`--plm-trunk`, `--rdc-jackpot`, ...) is uniquely named per game
  and does not need this — the risk is specific to names reused verbatim
  across multiple games' stylesheets.
- Known residual risk, not fixed (out of scope for the above): Quoi de 9
  does not import `game-base.css` and keeps its own parallel `:root` block
  with some of the *same* generic names (`--ink`, `--text`, `--muted`,
  `--lime`, ...) as `game-base.css`'s shared design tokens — by design, per
  "Quoi de 9 deliberately does not use most of this folder" below. If its
  stylesheet and another game's are simultaneously loaded (same client-side
  navigation mechanism as above), whichever loaded last could in principle
  win for those shared-name tokens. Not currently a game-*accent* bug (Quoi
  de 9 has no `--game-accent` declaration at all), and not exercised by
  today's navigation paths in testing — flagged here rather than fixed,
  since resolving it means reconciling Quoi de 9's intentionally separate
  design-token universe with `game-base.css`'s, which is a larger change
  than this file's existing "don't force Quoi de 9 into the shared shape"
  stance invites.
- `lib/launcher-accents.ts` — each game's main accent as a plain constant,
  imported by `lib/games.ts` for the launcher card so that color isn't
  hardcoded a second time outside the game's own styles.css.
- `components/participant-card.tsx`, `components/add-participant-button.tsx`
  (+ `components/participant-setup.css`) — the shared visual system for
  every participant-setup screen (team cards and player cards): badge, side
  bar, tinted gradient, name field, and remove button. Team games pass a
  `TEAM_PALETTE` color by index; individual games pass their own game
  accent — same component, different color source.
- `lib/participant-list.ts` + `lib/use-player-fields.ts` — the shared
  player-list convention for individual games (Purple, Triman, Roulette du
  Chaos, Palmier): a screen may pre-fill more fields than the game's
  minimum requires, and removability is derived from each field's current
  index versus `minPlayers`, not from the total count — so entries beyond
  the minimum are removable immediately (including on first render) and the
  first `minPlayers` entries never are, regardless of what gets added or
  removed later. `participant-list.ts` holds the pure, tested logic;
  `use-player-fields.ts` is the thin `useState` wrapper each setup form
  calls.

Everything in this folder is here because it is used, unmodified in
behavior, by at least two games today — not because it might be useful
someday. **Quoi de 9 deliberately does not use most of this folder**: its
team model, persistence, and styling genuinely differ (see below), and
forcing it into these shapes would either break it or add parameters/branches
whose only purpose is accommodating one outlier. Don't add a game-specific
branch to a `games/shared` file to fit a new game — see "Adding a fourth
game" below.

### `src/games/<name>` — one game, self-contained

Each game owns:

- `components/` — game-specific chrome that isn't shared (e.g. each game's
  own `brand.tsx`, since the logo image, alt text, and dimensions are
  genuinely different per game).
- `data/` — the game's static content (question banks, card decks, themes).
- `features/setup` and `features/game` — the actual screens and client
  logic.
- `lib/game/` — the game's rules engine: `types.ts`, `engine.ts` (pure
  state-transition functions), `persistence.ts` (save/load the in-progress
  game). This is where each game's _rules_ live, and it is expected to be
  different game to game — that's the point of having three games.

Quoi de 9 additionally has `lib/i18n` (a handful of shared strings for that
game only) and `generated/` (build-time generated content). These are
Quoi de 9-specific and not part of any shared layer.

## Coupling found, and what was done about it

This section records the actual audit findings — both the ones that were
fixed and the ones that were deliberately left alone, with the reasoning,
so a future change doesn't accidentally "fix" something that was already
considered and rejected.

**Fixed — genuine duplication extracted:**

- Three copies of the same dark/light theme-mode `useSyncExternalStore` hook
  (home page selector, shared in-game selector, Quoi de 9's selector) were
  extracted into `lib/use-theme-mode.ts`. All three call sites were passing
  a different server-render snapshot (`"dark"` vs `"light"`), which the
  extracted hook keeps as a required parameter — this was the one place a
  behavioral detail had to be preserved explicitly rather than assumed away.
- La Relance and Sans le dire each had their own byte-identical `shuffle`,
  `cleanTeamName`, `createId`/`TEAM_COLORS`, and two-team-construction code
  in their engines. Extracted to `lib/random.ts` (generic) and
  `games/shared/lib/two-team-setup.ts` (shared, but explicitly two-games,
  not app-wide — it assumes a two-team game).
- Both games' localStorage persistence modules had identical
  read-parse-validate-or-clear and write/remove logic around a single JSON
  blob. Extracted to `lib/local-storage-json.ts`; each game's own
  `isGameState` schema-validator function stayed local, since that's the one
  genuinely game-specific part.
- `page-shell.tsx` and `resume-game-card.tsx` were byte-identical between La
  Relance and Sans le dire except for one or two per-game strings (a home
  route, a resume route). Extracted to `games/shared/components/`,
  parameterized by exactly the values that differed; each game keeps a
  thin wrapper file so call sites elsewhere don't change.

**Looked at and deliberately left alone:**

- **`Team` / `TeamIndex` types across all three games.** La Relance and
  Sans le dire's shapes match; Quoi de 9's `Team` also carries a `turnOrder`
  field and a different id scheme. Unifying all three would mean either
  adding an unused field to two games' types or loosening Quoi de 9's, for
  no reduction in actual code — rejected.
- **`assertStatus`-style guards inside each engine.** Same shape, different
  error message text and call sites (up to ~27 per engine, including
  Quoi de 9 which isn't part of any shared abstraction here anyway).
  Unifying would mean passing a message string to every call site or
  silently changing the thrown text — that's added complexity for a
  four-line function. Rejected.
- **`brand.tsx` (La Relance vs Sans le dire).** Same JSX shape, but the
  image path, alt text, width/height, and href are all different — a
  shared component would need almost as many props as there are
  differences, for two call sites. Not extracted; each game keeps its own.
- **Audio/haptic feedback.** La Relance has none, Quoi de 9 has three bare
  `navigator.vibrate` calls, Sans le dire has a combined
  vibration-plus-Web-Audio-tone `feedback()` helper. These aren't the same
  behavior at different maturity levels — they're three different design
  choices. Forcing a shared interface would mean either adding vibration to
  La Relance (a product change, out of scope) or stripping Sans le dire's
  tone generation down to the lowest common denominator. Rejected.
- **Score formatting.** Quoi de 9 has `formatScore`/`formatSignedScore` for
  its point system; the other two games display raw integers. No shared
  behavior exists to extract.
- **Purple and Triman's player model vs. `two-team-setup.ts`.** Purple
  (2–12 players) and Triman (an open-ended player list) are both N-player,
  circular-turn games, not fixed two-team games — their `Player[]` shapes and
  setup flows (add/remove rows) don't fit the shared two-team helpers, so
  each engine builds its players locally (`createPlayers` in Purple's
  `lib/game/engine.ts`, the equivalent in Triman's). Neither uses
  `two-team-setup.ts`. They do reuse `page-shell.tsx`, `back-button.tsx`,
  `theme-selector.tsx`, `ui.tsx`, `lib/random.ts`'s `shuffle`, and
  `lib/local-storage-json.ts` as-is — those pieces were already generic
  enough to take a fourth and fifth caller with no changes.
- **`resume-game-card.tsx` generalized from two teams to any game shape.**
  It originally took a fixed `{ status, teams: [{name},{name}] }` shape.
  Purple and Triman both needed to resume an N-player game with no
  "finished" status (both are infinite), which that shape couldn't express.
  Rather than each writing its own bespoke resume card (as Purple briefly
  did), the shared component was generalized to `<T extends object>` plus a
  `summary(game) => ReactNode` render prop supplied by the caller — La
  Relance and Sans le dire's wrappers pass a two-name summary, Purple and
  Triman pass a joined player-name list. The "finished" check now reads
  `status` defensively at runtime (via a loose cast) since the generic type
  can't require a property only some games have.
- **Design tokens (`:root` CSS variables).** La Relance and Sans le dire
  each define a `:root` block of design tokens (colors, spacing) with a
  large overlapping subset, but each also has game-specific accent tokens
  the other doesn't. Fully unifying the token files was judged higher-risk
  (any accidental token rename affects visuals across two games at once)
  than the payoff of removing some duplicate lines, and was left as-is.
  `game-base.css` already holds the truly shared structural rules; token
  values were not moved.

## Rules for future contributors

1. **A file goes in `games/shared` only once it is actually used, unchanged
   in behavior, by two or more games.** Never create a shared abstraction
   for a single current use case "because a second game will probably need
   it later."
2. **Prefer the Rule of Three, but don't wait for three when two are already
   byte-identical and low-risk to parameterize** (as with `page-shell.tsx`
   and `resume-game-card.tsx` here). Do wait for three — or just leave
   things separate — when the shapes only _look_ similar (same JSX
   structure, different data/behavior underneath), as with `brand.tsx` and
   the audio/haptics code.
3. **Quoi de 9 is allowed to be architecturally different.** It uses
   Tailwind where the other two hand-write CSS; it persists to IndexedDB
   with schema migration where the other two use a single localStorage key;
   its team/scoring model is richer. Don't try to fold it into
   `games/shared` abstractions sized for the other two games — that
   pressure is what created most of the coupling this audit found and
   fixed elsewhere in the codebase's history. If Quoi de 9 needs something
   from `games/shared`, either the shared piece is already generic enough
   to take it as-is, or it doesn't belong there.
4. **A shared abstraction should reduce total code, not just move it.** If
   extracting something requires adding parameters, branches, or generics
   whose only job is to accommodate one caller's difference from the
   others, that's a sign the behavior isn't actually equivalent — keep it
   local instead.
5. **Game rules stay inside each game's `lib/game/`.** Nothing in
   `components/`, `games/shared/`, or `src/lib` should import from another
   game's `lib/game/`, and nothing in `src/lib` or `games/shared` should
   import from any game's `lib/game/` at all — those directions of
   dependency would mean generic code has started encoding one game's
   rules.

## Adding a fourth game

1. Create `src/games/<name>/` with the same internal shape as an existing
   game (`components/`, `data/`, `features/`, `lib/game/`).
2. Add a route under `src/app/<name>/` that renders the game's
   `features/*` screens.
3. Register it in `src/lib/games.ts` so it appears on the home page.
4. Reuse what already fits from `games/shared` and `src/lib` as-is —
   `use-theme-mode`, `random.ts`'s `shuffle`, `ui.tsx`'s `Button`/
   `ButtonLink`, and (if the new game is a two-team game) `two-team-setup.ts`
   and `page-shell.tsx`/`resume-game-card.tsx`.
5. If the new game doesn't fit an existing shared piece — a different
   number of teams, a different persistence strategy, different
   feedback — write it locally inside the new game's folder first. Only
   promote something to `games/shared` once the same need shows up
   unchanged in a second place, per the rules above.
