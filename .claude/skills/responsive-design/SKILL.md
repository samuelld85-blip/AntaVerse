---
name: responsive-design
description: Implement and fix AntaVerse's responsive, mobile-first CSS — breakpoints, overflow, viewport units, safe areas, touch targets, and the `--game-accent` cross-route scoping rule. Use when fixing horizontal scroll, overlap, clipped content, awkward spacing, hard-to-tap controls, or any layout issue on phone-sized viewports.
---

# Responsive Design — AntaVerse

## Purpose

Keep AntaVerse responsive, mobile-first, and comfortable on phones without horizontal scroll, overlap, clipped content, awkward spacing, or hard-to-tap controls.

AntaVerse is a mobile-first Next.js 16 / React 19 / TypeScript party-game PWA.

Primary target:
- phone portrait;
- shared-phone party usage;
- fast interactions;
- readable game state;
- minimal unnecessary scrolling during gameplay.

When this skill conflicts with `CLAUDE.md` or `ARCHITECTURE.md`, follow the project documentation.

Do not redesign unrelated UI while fixing responsive issues.

## Principles

### Mobile-first

Base styles should work from approximately 320px upward.

Prefer simple mobile layouts first, then enhance larger screens when useful.

Do not rewrite stable existing CSS merely to enforce a theoretical responsive pattern.

### Breakpoints

Add breakpoints when content actually stops fitting well.

Prefer intrinsic layouts before adding media queries:
- flex wrapping;
- Grid;
- `minmax()`;
- `auto-fit`;
- `clamp()`;
- `min()` / `max()`.

Avoid arbitrary breakpoint proliferation.

If an issue comes from a genuinely shared component, fix the shared component once.

If it affects only one game, keep the fix local.

### Preserve game identity

Do not force all games into identical layouts.

Preserve:
- game palettes;
- logos;
- accents;
- intended gameplay hierarchy;
- game-specific visual identity.

Share responsive behavior only when it is genuinely common.

### `--game-accent` scoping (critical, easy to break during responsive fixes)

Every game's `src/games/<slug>/styles.css` redefines the shared-by-name
custom property `--game-accent` (+ `-dark`/`-light`/`-glow`/`-ink`) consumed
by shared primitives (`components/ui.tsx`, `game-base.css`). Because
Next.js's App Router does not unload a previous route's CSS on client-side
navigation, a bare `:root { --game-accent: ... }` in any game's stylesheet
silently recolors whichever *other* game's shared UI is currently mounted,
once both stylesheets have loaded in the same session.

When touching a game's `styles.css` for a responsive fix:
- never introduce or reintroduce a bare `:root { --game-accent: ... }` rule;
- the existing pattern scopes it to `:root:has(.brand-mark--<game>)` (see
  `palmier/styles.css`) — keep new/edited rules inside that scope;
- if a responsive change needs a new per-game CSS variable, name it
  uniquely per game (e.g. `--plm-trunk`, `--rdc-jackpot`), not a shared name.

See `ARCHITECTURE.md` (search "shared-by-NAME custom property") for the
full rationale.

### Overflow

Avoid accidental horizontal scrolling.

Check especially:
- long player/team names;
- logos;
- action rows;
- cards;
- scoreboards;
- navigation controls;
- participant cards;
- long labels.

Useful CSS fixes include:
- `min-width: 0;`
- `overflow-wrap: anywhere;`
- `overflow-x: auto;`

Do not hide layout problems globally with `overflow-x: hidden` unless clipping is intentional.

### Mobile viewport

For full-height mobile layouts, avoid relying blindly on `100vh`.

Use `dvh` / `svh` where appropriate.

Do not mechanically replace working viewport units without a real reason.

### Safe areas

For controls close to device edges, account for notches/home indicators when needed with:
- `env(safe-area-inset-top)`
- `env(safe-area-inset-right)`
- `env(safe-area-inset-bottom)`
- `env(safe-area-inset-left)`

Only add safe-area spacing where relevant.

### Touch targets

Important controls should have comfortable touch areas, roughly 44×44px minimum.

Pay particular attention to:
- `BackButton`;
- `QuitGameButton`;
- add/remove participant controls;
- Primary Actions;
- game action buttons;
- icon-only controls.

The visible icon does not need to be 44px if its tappable area is larger.

### Touch over hover

Important functionality must never depend only on hover.

Hover can enhance desktop behavior but must not be required on phones.

### Forms

Player/team inputs should remain easy to use on phones.

Prefer input text around 16px or larger to avoid unwanted iOS zoom.

Long names must not break surrounding controls.

### Typography and spacing

Use `clamp()` when fluid sizing genuinely improves large titles, logos, or spacing.

Do not make every text size fluid.

During active gameplay, prioritize fitting essential content naturally within the phone viewport.

Menus and legal pages may scroll normally.

### Images and logos

Preserve:
- aspect ratio;
- transparency;
- visual balance.

Do not stretch assets.

Do not automatically migrate images to another system solely for responsiveness.

Optimize large assets only when it materially improves the app.

## AntaVerse-specific checks

For the full list of common AntaVerse visual/layout defects to watch for
(oversized logos, Primary Action below the fold, overcrowded headers,
long names breaking layout, bottom controls hidden by browser chrome,
etc.), see the `frontend-visual` skill's "AntaVerse-specific visual
checks" — that skill owns the defect checklist since it's framed from the
QA/inspection angle. This skill owns *fixing* them once found.

Priority order when fixing:
1. gameplay remains usable;
2. no clipped important content;
3. no accidental horizontal scroll;
4. essential controls remain reachable;
5. text is readable;
6. touch targets are comfortable;
7. layout remains visually balanced;
8. larger-screen polish.

## Validation

Keep validation proportional to the task.

### Small targeted fix

Examples:
- logo too large;
- one button misaligned;
- one row wrapping badly.

Check only:
- affected viewport(s);
- no overflow/overlap;
- directly affected interaction.

Do not run a full responsive audit.

### Medium layout change

Check representative widths such as:
- 320px;
- 375px;
- 768px;

plus any directly affected breakpoint.

### Full responsive audit or major shared-layout refactor

Check:
- 320px;
- 375px;
- 768px;
- 1024px;
- 1440px;

and, when relevant:
- landscape;
- 200% zoom;
- installed/mobile PWA behavior.

Do not claim real-device validation unless it actually happened.

## Severity

### Critical

- gameplay unusable;
- important content clipped;
- horizontal scroll in core flow;
- essential action inaccessible;
- major overlap.

### Major

- poor wrapping;
- touch targets too small;
- important content unnecessarily below the fold;
- hover-only interaction;
- strong visual imbalance.

### Minor

- cosmetic spacing;
- non-critical breakpoint inconsistency;
- optional fluid-type improvement.

Do not create artificial release blockers for minor issues.

## Implementation notes

AntaVerse currently uses:
- Next.js 16;
- React 19;
- TypeScript;
- Tailwind CSS 4 in the app shell and admin/content pages;
- handwritten `styles.css` per game (every game module has one), plus
  shared handwritten CSS in `src/games/shared/` (`game-base.css`,
  `participant-setup.css`, `theme-selector.css`);
- static export (`output: "export"` in `next.config.ts`);
- PWA deployment.

Therefore:
- use Tailwind only where the local file already uses Tailwind (mostly
  `src/app/` shell and admin pages);
- use the existing handwritten-CSS pattern for game gameplay UI — this is
  the default for `src/games/<slug>/`, not an exception;
- do not migrate styling systems just for responsiveness;
- preserve static-export compatibility;
- avoid unnecessary dependencies;
- reuse existing shared primitives when appropriate;
- respect the `--game-accent` scoping rule above when editing any
  `styles.css`.

## Documentation

Do not update `HOW_ANTAVERSE_WORKS.md` for ordinary responsive fixes.

Only consider documentation changes for a significant new shared responsive architecture or major cross-app layout change.

## Output

For normal responsive implementation:
- make the requested change;
- report the main files changed;
- mention only the relevant viewport(s) checked;
- report remaining limitations only if meaningful.

Do not generate a large responsive report for a trivial adjustment.

## Key principle

AntaVerse is a phone-first party-game app.

Responsive design should make gameplay natural on a shared phone, not merely make a desktop interface fit onto a smaller screen.

Prefer simple, robust layouts and proportional validation over exhaustive audits.