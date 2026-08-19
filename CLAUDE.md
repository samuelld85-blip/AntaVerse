# AntaVerse — Claude Guide

## Project

AntaVerse is an early-stage, mobile-first Next.js party-game app.

Stack:

* Next.js 16 / React 19 / TypeScript
* Tailwind CSS 4
* Vitest + Playwright
* IndexedDB / localStorage
* Static export deployed on Vercel as a PWA
* Node 22

Structure:

* `src/app/` — routes and application shell
* `src/games/<slug>/` — self-contained game modules
* `src/components/` / `src/lib/` — genuinely shared product code
* `src/lib/games.ts` — game registry used by the launcher
* `public/games/` — game assets
* `public/brand/v1/` — AntaVerse branding
* `scripts/` — content and build tooling

Game persistence must remain namespaced per game.

## Product mindset

This is an early, fast-moving product.

Prioritize:

* shipping working iterations quickly;
* simple implementations;
* good UX;
* reasonable code quality;
* easy future iteration.

Do not treat the project like a fragile enterprise system.

Make reasonable implementation decisions yourself instead of repeatedly asking for confirmation.

Make **technical implementation decisions autonomously**.

Do not reinterpret, replace, or expand explicit product rules, game mechanics, UX flows, or content requirements unless the user asks for alternatives.

When product behavior is explicitly specified, treat it as the source of truth and focus your autonomy on implementation.

You may create, edit, move, rename, refactor or delete code when useful.

However:

* stay proportional to the requested task;
* avoid speculative architecture;
* avoid unnecessary abstractions;
* do not turn small changes into large refactors.

## Scope and context efficiency

Default to **targeted work**, not broad exploration.

For routine or targeted tasks:

1. Start from the files directly implied by the request.
2. Inspect only the directly relevant files, imports, and dependencies.
3. Use targeted search (`Grep` / `Glob`) when the exact location is unknown.
4. Follow imports or dependencies only when needed to understand or safely implement the change.
5. Expand to broader architecture only when genuinely required or when the targeted approach is blocked.

Do **not** scan, map, or read the whole repository by default.

Do **not** perform broad codebase exploration just to confirm that an abstraction, component, or helper does not already exist.

Reuse existing patterns when they are obvious or easy to locate.

Do not spend excessive context searching for theoretical reuse opportunities.

When a search result already identifies the relevant file and code location, open that location directly instead of performing additional broad searches.

For small changes, once enough context is available, edit the relevant implementation directly.

Examples of small targeted work:

* changing a label or copy;
* removing a confirmation screen;
* adjusting a probability;
* modifying one game rule;
* changing a small interaction;
* fixing an obvious local bug;
* updating a specific component;
* changing content or game data.

These tasks should normally require only a small number of relevant files.

## Subagents and Explore

Do **not** spawn subagents for routine or targeted tasks.

Do not use subagents for:

* small UI edits;
* simple bugs;
* content changes;
* game-rule adjustments;
* straightforward refactors;
* changes whose relevant files are already known.

Use Explore or another subagent only when:

* the relevant implementation cannot be located efficiently with targeted search;
* the task genuinely spans several unknown areas of the codebase;
* broad exploration would materially reduce pollution of the main context;
* a complex bug has an unclear source;
* the task is architectural or cross-cutting;
* an architecture audit, codebase audit, duplicate search, or broad review was explicitly requested.

When a subagent is justified:

* keep its mission narrow;
* prefer targeted searches over repository-wide reading;
* return concise findings with exact file paths;
* avoid duplicate exploration between the main agent and subagent.

If an Explore agent configured with a lightweight model such as Haiku is available, prefer it for **genuinely necessary** codebase discovery.

Do **not** invoke Explore merely because it is available.

## Context discipline

Keep the active context focused on the current task.

Do not repeatedly reopen or reread files whose relevant content is already known unless necessary.

Do not collect large amounts of unrelated code “for safety”.

Prefer exact file reads and targeted searches over broad directory exploration.

When enough information is available to implement safely, stop exploring and implement.

For long-running sessions, preserve only information relevant to:

* the current implementation state;
* decisions already made;
* changed files;
* remaining work;
* relevant validation results.

Avoid carrying extensive debugging history once the underlying issue has been understood.

Do not repeat investigations that were already completed earlier in the same task unless new evidence requires it.

## Implementation

When asked to implement something, implement it rather than stopping at a plan.

Preserve intentional product behavior, not accidental implementation details.

If the user provides exact:

* game rules;
* flows;
* labels;
* probabilities;
* mechanics;
* UX behavior;
* visual requirements;

implement those requirements rather than replacing them with what you think would be a better product.

Technical freedom does not imply product-design freedom.

Prefer:

* clear and explicit code;
* existing components and patterns when they are easy to locate;
* small focused components;
* minimal dependencies;
* straightforward data flows.

Reuse existing abstractions when obvious, but do not perform a repository-wide search just to prove that no abstraction already exists.

Refactor nearby code only when it directly simplifies the requested change.

Do not broaden the scope merely because adjacent code could also be improved.

If the requested behavior can be achieved cleanly with a small change, prefer that over introducing a new system.

## Games

Each game should remain primarily self-contained in `src/games/<slug>/`.

Promote something to shared code only when multiple games genuinely need the same behavior.

Do not create global abstractions for a single game merely because they may theoretically be useful later.

When working on a specific game, begin inside that game's module and routes rather than inspecting unrelated games.

Do not use another game's mechanics as a product template unless the task explicitly asks for shared behavior.

Different games should be allowed to have different mechanics when that supports their intended identity.

When adding a new game:

1. create `src/games/<slug>/`;
2. create routes in `src/app/<slug>/`;
3. add assets in `public/games/<slug>/`;
4. register it in `src/lib/games.ts`.

## UI

AntaVerse is primarily used on phones.

For relevant UI changes, preserve:

* mobile usability;
* touch-friendly interactions;
* responsive layout;
* visual consistency with the game's existing design;
* readable text and sensible overflow.

Use existing visual tokens/styles where practical.

Never declare a game's accent color as a bare `:root { --game-accent: ... }`
(or any shared-by-name custom property) in a game's `styles.css`. Next.js
does not unload a previous route's CSS on client-side navigation, so two
games' `:root` blocks defining the same property name collide — whichever
stylesheet loaded last wins for the *entire document*, silently recoloring
another game. Scope it to `:root:has(.brand-mark--<game>)` instead — see
`ARCHITECTURE.md` ("shared-by-NAME custom property") and `palmier/styles.css`
for the pattern.

Use dedicated UX/UI or visual-design skills only when the task actually concerns those areas.

Do not invoke design-oriented skills for trivial implementation changes that do not require design reasoning.

Avoid unnecessary confirmation screens or data-entry steps when an interaction can naturally happen between players in real life.

The phone should support the game, not force players to record every real-world decision inside the app.

## Validation

Validate proportionally to the change.

### Small targeted change

Run only what is directly useful, for example:

* the relevant targeted test;
* `typecheck` when TypeScript behavior may be affected;
* a focused lint/check when appropriate.
For copy-only, label, content, or other non-behavioral edits:
* edit the directly relevant file;
* inspect the targeted diff if useful;
* do not start the dev server, browser preview, Playwright, or other UI validation unless explicitly requested or genuinely necessary.

Do not automatically run the full test suite, full build, or `npm run verify` for a trivial change.

### Medium change

Run:

* relevant tests;
* typecheck;
* lint when appropriate.

### Large or cross-cutting change

Run:

* broader relevant tests;
* lint;
* typecheck;
* build when relevant.

Use `npm run verify` for large changes, releases, significant cross-cutting work, or when specifically useful — **not after every small edit**.

Fix failures caused by your changes.

Do not spend time investigating or fixing unrelated pre-existing failures unless explicitly requested.

If tests represent intentionally replaced product behavior, update those tests to reflect the new intended behavior rather than preserving obsolete behavior.

If a targeted validation is sufficient to establish that a small change works, stop there.

## Content pipeline

Before manually editing generated game content, check whether the relevant source is managed by the scripts/content pipeline.

Do not hand-edit generated artifacts when a source-of-truth/import workflow exists.

Only inspect the broader content pipeline when the requested change actually touches generated or imported content.

## Git

Do not overwrite or revert unrelated user changes.

Use Git as the safety net for fast iteration.

Inspect the diff when useful, especially after multi-file changes.

For a tiny targeted edit, do not perform extensive Git analysis unless there is a reason to suspect unrelated work could be affected.

Do not clean or rewrite unrelated files simply because they appear in the working tree.

## Security

Never commit secrets or API keys.

Keep credentials out of client-side code.

Apply normal proportional security practices without adding unnecessary bureaucracy.

## Completion

A task is complete when:

* the requested behavior works;
* explicit product requirements have been respected;
* no obvious temporary/debug code remains;
* relevant checks pass;
* the change remains coherent with the surrounding product.

For early-stage work, prefer a good working iteration delivered quickly over theoretical perfection.

Do not continue exploring, refactoring, reviewing, or validating after the requested task is already complete unless there is a concrete reason.

Do not add unrelated improvements to make the task appear more complete.

## Long tasks

Only for genuinely large multi-step tasks, establish a short plan first.

Do not produce artificial progress milestones for normal development work.

For long tasks:

* keep the plan short;
* keep progress updates concise;
* avoid repeating previously established context;
* avoid reopening completed areas unless necessary;
* stay focused on the requested outcome.
