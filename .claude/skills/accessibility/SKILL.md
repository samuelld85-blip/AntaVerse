---
name: accessibility
description: Review and implement accessibility for AntaVerse UI — semantic HTML, ARIA, keyboard reachability, accessible names, touch targets, colour/contrast, forms, live regions, dialogs, and reduced motion. Use when creating or changing interactive UI, building shared controls, modifying navigation, changing forms/setup screens, creating dialogs/overlays, reviewing accessibility, or preparing a significant release.
---

# Accessibility — AntaVerse

## Purpose

Keep AntaVerse usable for as many players as possible without turning every small UI change into a full accessibility audit.

AntaVerse is a mobile-first Next.js 16 / React 19 / TypeScript party-game PWA.

Use this skill when:

- creating or changing interactive UI;
- building shared controls;
- modifying navigation;
- changing forms/setup screens;
- creating dialogs or overlays;
- reviewing accessibility;
- preparing a significant release.

Do not invoke a full accessibility audit for trivial CSS, copy, content, or isolated visual changes.

When this skill conflicts with `CLAUDE.md`, `ARCHITECTURE.md`, or explicit product behavior, follow the project documentation.

## Core principles

Prefer native HTML semantics before ARIA.

Prefer:

- `<button>` for actions;
- `<a>` for navigation;
- `<label>` associated with inputs;
- semantic headings;
- proper lists when content is a list.

Avoid recreating native behavior with generic `<div>` elements.

Use ARIA only when native semantics are insufficient.

## Keyboard accessibility

Interactive controls should remain keyboard reachable where practical.

Check especially:

- launcher navigation;
- BackButton;
- QuitGameButton;
- Primary Actions;
- participant add/remove controls;
- setup inputs;
- dialogs;
- theme selector;
- game menu controls.

Do not make active gameplay artificially keyboard-heavy if the interaction is fundamentally touch-based, but avoid unnecessarily blocking keyboard use.

Visible focus must remain available.

Do not remove focus outlines without an accessible visible replacement.

## Accessible names

Every interactive control should have a meaningful accessible name.

For icon-only controls such as:

- close;
- remove player;
- quit game;
- navigation icons;

use visible text or an appropriate `aria-label`.

Accessible labels should match visible labels when possible.

Avoid generic labels such as:

- `button`;
- `click here`;
- `action`.

Prefer meaningful intent such as:

- `Quitter la partie`;
- `Supprimer Joueur 3`;
- `Retour à tous les jeux`.

## Touch targets

AntaVerse is primarily used on phones. Important touch controls need
comfortable hit areas (~44×44px), independent of visible icon size.

Full sizing/CSS guidance lives in the `responsive-design` skill — this
skill only adds the accessibility-specific angle: a large-enough hit area
is also what keeps a control operable for users with motor impairments or
imprecise pointing, not just a mobile-ergonomics nicety. Pay particular
attention to remove/add participant controls, `BackButton`,
`QuitGameButton`, small game action icons, and theme controls.

## Colour and contrast

Do not rely on colour alone to communicate important state.

Examples:

Bad:
- red border only = error;
- game state shown only by colour.

Prefer:
- colour + text;
- colour + icon;
- colour + shape/state indicator.

Maintain readable contrast in both dark and light themes.

Game-specific accent colours should preserve identity without making text or controls unreadable.

Do not alter a game's palette unnecessarily when a local contrast adjustment is enough.

## Forms

Setup forms should have:

- proper labels;
- clear field purpose;
- readable error text;
- logical focus order;
- sufficient touch size.

If validation fails, show a visible explanation.

Do not rely only on border colour.

Player/team names should remain understandable to assistive technologies.

## Dynamic game state

When important content changes without navigation, consider whether assistive technology needs notification.

Examples:

- round result;
- active player change;
- validation error;
- game result;
- important status change.

Use live regions only when the update genuinely needs announcement.

Do not make every gameplay animation or counter change a live announcement.

Avoid excessive screen-reader noise.

## Dialogs and overlays

When introducing a modal/dialog:

Prefer native `<dialog>` when appropriate.

Ensure:

- focus moves into the dialog;
- background interaction is blocked when necessary;
- Escape/close behavior works;
- focus returns sensibly after closing.

Do not hand-roll complex focus trapping unless required.

## Images and logos

Decorative images should not create unnecessary screen-reader noise.

Use empty alt text for genuinely decorative images.

Meaningful images should have concise useful alternatives.

Game logos usually do not need verbose descriptions if nearby text already identifies the game.

Avoid duplicate announcements such as:

`Purple logo — Purple — Purple game`

when one clear accessible name is sufficient.

## Motion

AntaVerse uses animations and playful transitions.

Do not remove them by default.

`src/games/shared/game-base.css` already defines a global
`@media (prefers-reduced-motion: reduce)` reset that collapses all
animation/transition duration to near-zero for `*`. New shared or
game-specific animations inherit this automatically — do not fight it
by re-declaring `animation-duration` with higher specificity, and do
not add a redundant per-component `prefers-reduced-motion` rule unless
the effect needs a genuinely different reduced-motion fallback (e.g.
an instant state swap instead of just skipping a transition).

Reduced motion should preserve game understanding and feedback.

## AntaVerse-specific priorities

Focus accessibility effort primarily on:

1. navigation;
2. setup/player entry;
3. shared controls;
4. important gameplay actions;
5. result/state clarity;
6. light/dark contrast;
7. dialogs and destructive actions.

Do not over-engineer accessibility for purely decorative game visuals when they do not block understanding or interaction.

## Validation

Keep validation proportional.

### Small UI change

Check only relevant basics:

- semantic element;
- accessible name;
- focus behavior if affected;
- touch size;
- contrast if colour changed.

### Shared interactive component

For components such as:

- BackButton;
- QuitGameButton;
- Primary Action;
- participant controls;

verify:

- keyboard reachability;
- visible focus;
- accessible label;
- touch target;
- dark/light readability.

### Dedicated accessibility audit or release review

When explicitly requested, perform broader checks:

- keyboard walkthrough;
- semantic structure;
- focus order;
- WCAG-relevant contrast;
- automated scan if tooling already exists;
- screen-reader review where practical.

Do not install new accessibility tooling solely for a small task unless requested.

Do not claim WCAG compliance based only on an automated scan.

## Severity

### Critical

- essential action unreachable;
- important control has no accessible identity;
- keyboard trap;
- content impossible to understand without colour;
- critical text unreadable due to contrast.

### Major

- poor focus behavior;
- small critical touch targets;
- important state not communicated clearly;
- form errors difficult to understand.

### Minor

- semantic improvement;
- decorative alt cleanup;
- non-critical focus polish.

Do not create artificial blockers for minor issues.

## Output

For normal implementation:

- make the relevant accessibility-safe change;
- report only meaningful accessibility considerations;
- do not produce a full WCAG report.

For a dedicated accessibility audit:

- group findings by severity;
- identify affected component/screen;
- explain user impact;
- recommend the smallest effective fix.

## Key principle

AntaVerse should remain fast, playful, and mobile-first while using sound accessibility fundamentals.

Prefer native semantics, clear labels, visible focus, comfortable touch targets, readable contrast, and proportional validation over excessive ARIA or heavy audit ceremony.