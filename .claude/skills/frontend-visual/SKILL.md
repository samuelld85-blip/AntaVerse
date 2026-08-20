---
name: frontend-visual
description: Visual QA for AntaVerse's rendered UI — composition, spacing, alignment, mobile responsiveness, game identity, and interaction states, verified against the actual rendered browser output rather than source/build evidence alone. Use after a rendered interface exists, when asked to audit or fix visual quality, compare against a reference screenshot, or verify a UI change actually looks right on phone.
---

# Frontend Visual QA — AntaVerse

## Purpose

Audit the interface AntaVerse users actually see.

Build success, typecheck, DOM presence, and generated screenshots are supporting signals only. They do not prove visual quality.

AntaVerse is a mobile-first Next.js 16 / React 19 / TypeScript party-game PWA. The primary visual target is phone portrait.

Use this skill after a rendered interface exists.

When this skill conflicts with `CLAUDE.md` or `ARCHITECTURE.md`, follow the project documentation.

Do not redesign unrelated UI during visual QA.

## Default behavior

For normal AntaVerse implementation tasks, use visual QA proportionally.

If the user asks only for an audit:
- inspect;
- report findings;
- do not edit source.

If the user explicitly asks to fix or improve the UI:
- inspect;
- fix the relevant issues;
- re-check the affected rendered result.

Do not install dependencies, restart servers, deploy, commit, or push unless separately authorized.

Prefer the existing local app at `http://localhost:3000` when available.

## What to inspect

Focus on what users can actually perceive.

### Core visual quality

Check:
- composition;
- hierarchy;
- spacing;
- alignment;
- typography;
- wrapping;
- clipping;
- image/logo rendering;
- visual balance;
- button centering;
- excessive empty space;
- inconsistent component sizing.

### Mobile responsiveness

Check when relevant:
- 320px;
- 375px;
- affected intermediate widths;
- larger widths only when the task concerns them.

Look for:
- horizontal overflow;
- controls outside the viewport;
- oversized logos;
- broken rows;
- crowded headers;
- excessive vertical space;
- Primary Actions unnecessarily below the fold;
- bottom controls hidden by browser chrome;
- inconsistent touch targets.

Use the separate responsive-design skill when the issue is primarily responsive architecture.

### State and journey

For UI whose appearance changes during interaction, inspect the relevant states.

Examples:
- setup;
- active game;
- round result;
- game result;
- modal/open/closed;
- selected/unselected;
- dark/light mode;
- loading/error/recovery where applicable.

Do not judge the wrong state.

### Game identity

Verify that visual harmonization does not accidentally erase each game's identity.

Preserve:
- game palette;
- logo;
- accent;
- intentional gameplay hierarchy.

Shared components should look coherent across AntaVerse without forcing every game into the same composition.

## Evidence levels

Use the strongest practical evidence needed for the claim.

### Rendered browser evidence

Preferred for visual conclusions.

Use:
- visible browser inspection;
- screenshots that are actually opened and inspected;
- Playwright/browser inspection where appropriate.

### DOM/layout evidence

Useful for:
- geometry;
- overflow;
- visibility;
- computed layout;
- responsive state.

DOM evidence explains visual problems but does not replace inspecting the rendered interface.

### Source/build/test evidence

Useful only as supporting evidence.

Do not say:
- "the UI is correct because the build passed";
- "the button is centered because the CSS says align-items:center";
- "the screenshot looks correct" if the screenshot was never inspected.

## AntaVerse-specific visual checks

Pay particular attention to:

- logo size and placement;
- launcher cards;
- game landing navigation;
- `BackButton`;
- `QuitGameButton`;
- `Primary Action`;
- theme selector;
- participant cards;
- add/remove participant controls;
- score/status areas;
- game action buttons;
- cards/dice/roulette visuals;
- round/result hierarchy;
- light/dark contrast;
- game accent isolation.

Common AntaVerse visual defects include:

- logo taking too much vertical space;
- button text not vertically centered;
- same shared control looking slightly different between games;
- participant-card glow being too strong;
- duplicate visual emphasis;
- game status cluttering the header;
- incorrect game accent after client-side navigation;
- long player names breaking layout;
- action rows wrapping awkwardly;
- excessive empty space during gameplay;
- important action falling below the fold.

### Diagnosing "wrong game accent" specifically

If a game's primary CTA, theme-selector button, or other shared element is
visibly rendered in *another* game's color, this is almost always the
`--game-accent` cross-route leak: Next.js's App Router does not unload a
previous route's CSS on client-side navigation, so a bare
`:root { --game-accent: ... }` rule in any game's `styles.css` wins for
the whole document once loaded. Confirm by checking whether the visited
game order matches the wrong color, then check that game's `styles.css`
for a `:root { --game-accent` rule that isn't scoped to
`:root:has(.brand-mark--<game>)`. See `ARCHITECTURE.md` ("shared-by-NAME
custom property") and the `responsive-design` skill for the fix pattern.

## Shared-component rule

When the same visible defect exists across multiple games, identify whether the cause is a shared component or shared CSS.

If genuinely shared:
- fix once in the shared primitive;
- verify representative games.

If game-specific:
- keep the fix local.

Do not copy the same visual patch into multiple game stylesheets without checking for a shared source.

## Visual reference tasks

When the user provides a screenshot or says something should match another screen:

1. inspect the reference;
2. identify the specific visible relationships that matter;
3. compare the rendered AntaVerse result at the same approximate viewport;
4. fix the meaningful differences only.

Compare things such as:
- relative size;
- alignment;
- spacing;
- hierarchy;
- position;
- density;
- visual weight.

Do not chase exact pixel parity unless the user explicitly asks for it.

Do not reinterpret a visual request as permission for a broader redesign.

## Validation scope

Keep validation proportional to the change.

### Small visual fix

Examples:
- reduce one logo;
- center one label;
- change spacing;
- fix one button.

Inspect:
- the affected screen;
- the affected viewport;
- the changed component.

Stop when the issue is clearly resolved.

### Shared visual component change

Examples:
- Primary Action;
- BackButton;
- participant card;
- launcher navigation.

Inspect:
- the shared component;
- a small representative sample of affected games;
- mobile layout;
- dark/light mode when relevant.

Do not automatically inspect every state of all seven games unless the change realistically affects them all.

### Broad UX/UI audit

Only for explicitly broad requests.

Inspect representative:
- launcher;
- game landing;
- setup;
- active gameplay;
- results;
- dark/light modes;
- relevant mobile widths.

## Interaction verification

If the visible issue concerns an interactive control, trigger it when practical.

Examples:
- button opens correct screen;
- modal opens/closes;
- theme selector changes mode;
- navigation reaches intended destination;
- game action changes visible state.

A control looking clickable does not prove that it works.

Do not perform destructive or unrelated actions merely for visual QA.

## Severity

### Critical
- core gameplay visually unusable;
- important content hidden or clipped;
- essential action unreachable;
- major overlap;
- wrong game state presented.

### Major
- significant layout imbalance;
- bad wrapping;
- inconsistent shared component;
- poor touch usability;
- important UI confusing or visually broken.

### Minor
- small spacing inconsistency;
- minor alignment issue;
- cosmetic polish defect.

Do not turn minor polish into artificial release blockers.

## Reporting

For a normal task, keep the report short.

Report:
- what was inspected;
- what was fixed, if authorized;
- relevant viewport/state;
- meaningful remaining issue, if any.

Do not produce a long QA dossier for a trivial visual change.

For a dedicated visual audit, report findings as:

- severity;
- screen/component;
- viewport/state;
- visible problem;
- impact;
- recommended fix.

Use screenshots only when they materially help explain a finding.

## Completion

A visual change is complete when:

- the actual rendered result has been inspected;
- the requested visual issue is resolved;
- no obvious regression was introduced nearby;
- mobile usability remains intact;
- shared components remain coherent;
- game identity remains preserved;
- validation was proportional to the task.

Do not continue visual exploration after the requested issue is clearly resolved unless there is a concrete reason.

## Key principle

AntaVerse visual QA must judge the interface players actually see on the phone.

Rendered evidence matters more than theoretical CSS correctness.

Keep checks focused, visual, mobile-first, and proportional so QA improves quality without consuming excessive context or slowing small iterations.