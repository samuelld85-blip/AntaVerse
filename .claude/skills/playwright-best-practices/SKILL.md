---
name: playwright-best-practices
description: Write, fix, and run AntaVerse's Playwright E2E tests reliably and with minimal token/context overhead. Use when creating or updating E2E tests, validating navigation/setup flows, testing gameplay interactions or responsive/mobile behavior, fixing flaky tests, or updating tests after intentional product changes.
---

# Playwright Best Practices — AntaVerse

## Purpose

Keep AntaVerse Playwright E2E tests reliable, readable, low-noise, and resistant to UI refactors.

AntaVerse is a mobile-first Next.js 16 / React 19 / TypeScript PWA using Playwright for end-to-end validation.

Use this skill when:

- creating or updating E2E tests;
- validating navigation or setup flows;
- testing gameplay interactions;
- testing responsive/mobile behavior;
- fixing flaky Playwright tests;
- updating tests after intentional product changes.

Do not invoke this skill for tasks that do not touch E2E behavior.

When this skill conflicts with `CLAUDE.md`, follow `CLAUDE.md`.

## Android boundary

This skill covers web Playwright tests only. Do not launch Android builds,
emulators, devices, Capacitor checks, APK/AAB checks, or native Android tests as
part of Playwright validation unless the user explicitly requests Android work.

## Context efficiency

When running Playwright from Claude Code, keep output minimal.

Prefer:

`--reporter=line`

or:

`--reporter=dot`

Avoid verbose reporters unless debugging requires them.

Run the smallest relevant test file or test name first.

Do not run the entire E2E suite for a trivial targeted change unless broader coverage is genuinely needed.

`npm run test:e2e` runs `npm run build && playwright test` — it builds the
full static export first, then runs against that production build via
`npm run preview` (port 4173, overridable with `PLAYWRIGHT_PORT`). This
build step is the dominant cost of any E2E run, so batch multiple targeted
tests into one invocation (`playwright test file1 file2`) rather than
re-running the command per file when possible.

## Locator priority

Prefer user-facing and stable locators.

Priority:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()` for non-interactive visible text
5. `getByAltText()`
6. `getByTitle()`
7. `getByTestId()` when a stable explicit test contract is justified
8. CSS selectors only when no better semantic locator exists

Avoid XPath.

Do not select elements by implementation-specific classes when a user-facing locator is available.

## Assertions

Use Playwright web-first assertions.

Prefer:

`await expect(locator).toBeVisible()`

instead of manually reading state and asserting afterward.

Let Playwright auto-wait for UI state changes.

Avoid unnecessary manual polling.

## Avoid hardcoded waits

Do not use `page.waitForTimeout()` as a normal synchronization mechanism.

Prefer waiting for:

- visible UI state;
- URL changes;
- enabled/disabled state;
- text changes;
- expected element appearance/disappearance.

A fixed timeout is acceptable only for a very specific timing behavior where the delay itself is part of what is being tested.

## Test isolation

Each test should be able to run independently.

Do not make one test depend on another test having executed first.

AntaVerse uses localStorage / IndexedDB, so explicitly control persisted state where it matters.

Avoid accidental state leakage between tests.

Use fresh browser contexts or targeted storage setup/cleanup as appropriate.

Do not clear unrelated browser storage globally unless the test specifically requires it.

## Test intended product behavior

Tests should represent the current intended product behavior.

When the user intentionally changes:

- navigation;
- button copy;
- number of games;
- setup flow;
- game rules;
- default theme;
- participant behavior;

update stale tests accordingly.

Do not modify the product merely to satisfy an obsolete test.

If a failing test reflects unrelated pre-existing behavior, report it rather than broadening the task automatically.

## AntaVerse-specific priorities

E2E tests are most valuable for:

- launcher and game entry;
- menu navigation;
- BackButton / QuitGameButton behavior;
- setup players/teams;
- minimum/optional participant logic;
- resume/persistence flows;
- critical game transitions;
- major result flows;
- theme behavior when relevant;
- mobile layout regressions;
- static-export/PWA-critical routes.

Do not try to exhaustively test every content variation or every game rule through Playwright when unit tests are a better fit.

## Gameplay tests

For gameplay flows:

- prefer deterministic setup where possible;
- avoid tests depending on random outcomes;
- seed or control randomness only when the existing architecture supports it cleanly;
- assert visible player-facing outcomes;
- do not bind tests unnecessarily to internal React state.

Use unit tests for pure game-engine rules whenever possible.

Use Playwright for the user-visible flow.

## Mobile-first testing

AntaVerse is primarily used on phones.

`playwright.config.ts` currently defines only two projects, both mobile —
there is no desktop project:

- `mobile-chrome` (`devices["Pixel 7"]`);
- `mobile-safari` (`devices["iPhone 15"]`).

Running `playwright test` with no `--project` flag runs both. For a
targeted change, `--project=mobile-chrome` alone is usually enough;
run both projects when Safari-specific behavior is plausible (WebKit
quirks, PWA install flow, safe-area insets) or for shared/responsive
changes.

Do not automatically multiply every test across many viewport sizes beyond
these two projects — there is no broader device matrix configured.

## Shared components

When changing a shared UI primitive such as:

- Primary Action;
- BackButton;
- QuitGameButton;
- participant setup;
- game-home navigation;

update shared E2E expectations where appropriate.

Prefer a few representative tests over duplicating identical assertions across all seven games unless each game has materially different behavior.

## Test IDs

Use `data-testid` only when semantic locators are insufficient or unstable.

Good use cases:

- canvas-like game elements;
- non-semantic visual controls;
- elements with intentionally changing copy;
- stable gameplay test contracts.

Do not add test IDs everywhere by default.

## Debugging failures

When an E2E test fails:

1. read the actual failure;
2. identify whether the product or the test is stale;
3. reproduce the smallest failing case;
4. inspect the rendered state;
5. fix the root cause or update the obsolete expectation;
6. rerun the targeted test.

Do not immediately rewrite multiple tests based on one unexplained failure.

Do not use arbitrary waits to hide flakiness.

## Validation scope

### Small targeted change

Run:
- the directly affected E2E test if useful.

### Medium flow change

Run:
- affected E2E file(s);
- related targeted tests.

### Large navigation/shared-flow change

Run:
- broader relevant E2E coverage;
- still prefer targeted files before full-suite execution.

Follow `CLAUDE.md` for typecheck/build decisions.

## Output

Keep reporting concise.

For normal work, report:

- relevant E2E files changed;
- targeted tests run;
- pass/fail result;
- unrelated pre-existing failures only if encountered.

Do not paste large Playwright logs unless needed to explain a failure.

## Key principle

AntaVerse E2E tests should validate what a player can actually do, not mirror implementation details.

Prefer semantic locators, web-first assertions, isolated tests, deterministic flows, and targeted low-noise execution.
