# AntaVerse — Codex project guidance

## Project

AntaVerse is an early-stage, mobile-first Next.js party-game app.

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Vitest and Playwright
- IndexedDB/localStorage persistence
- Static PWA export for Vercel
- Optional Supabase backend for the Sport module only (accounts, cloud
  backup, friends, web push)
- Node 22

Key locations:

- `src/app/` — routes and application shell
- `src/games/<slug>/` — self-contained game modules
- `src/sport/` — Sport training-log module (independent of the games);
  `src/sport/cloud/` is the optional Supabase account layer
- `src/components/` and `src/lib/` — genuinely shared product code
- `src/lib/games.ts` — launcher game registry
- `supabase/` — Sport cloud migrations and the `send-session-push` edge function
- `public/games/` and `public/brand/v1/` — game and brand assets
- `scripts/` — build and content tooling

Read `README.md` for setup and repository orientation. Read `ARCHITECTURE.md` only for architectural or cross-cutting work; do not load it for trivial changes.

Persistence must stay namespaced per game.

**Deployment target: the installed PWA.** AntaVerse is used today as the
Vercel-served PWA installed to the home screen on Android and iOS. Build,
test, and design for that. Capacitor Android and iOS scaffolding exists and
its setup has been started, but the native app-store builds are not the
current target — do not bend a change to satisfy the real Apple/Google
native apps. Native packaging is maintenance-only and opt-in.

## Product and implementation mindset

This is a fast-moving product. Prefer working iterations, simple implementations, good mobile UX, reasonable maintainability, and easy future changes. Do not introduce enterprise process or speculative architecture.

Explicit user requirements are authoritative for game rules, mechanics, flows, probabilities, labels, content, UX behavior, and visuals. Do not reinterpret or redesign them unless alternatives are requested.

When asked to implement, implement the change rather than stopping at a plan. Make reasonable technical decisions autonomously. Keep changes focused, use existing patterns, and avoid unrelated cleanup, abstractions, dependencies, or refactors.

## Scope and exploration

For normal tasks:

1. Start with files directly implied by the request.
2. Use targeted search (`rg`/`rg --files`) when needed.
3. Follow direct imports and dependencies only as required.
4. Broaden exploration only when the source of the problem is unclear or the task is architectural/cross-cutting.

Do not map the whole repository, inspect unrelated games, or search for hypothetical reuse. Stop exploring when enough context exists to implement safely. Do not repeatedly reread known files.

Avoid subagents for routine edits, simple bugs, content changes, game-rule changes, or targeted refactors. Use additional agents only for genuinely unclear, broad, architectural, or explicitly requested work.

## Game boundaries

Keep each game primarily inside `src/games/<slug>/` and its routes inside `src/app/<slug>/`. Promote code to shared locations only when multiple games genuinely use it. When adding a game, normally add its module, routes, assets, and registry entry in `src/lib/games.ts`.

Do not inspect or modify other games unless the task requires it.

The Sport module (`src/sport/`, route `/sport`) is separate from the games.
Its optional cloud layer (`src/sport/cloud/`, Supabase) only initialises when
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set at
build and only on the `/sport` layout. No game or shared launcher code may
import from `src/sport/cloud/` or initialise Supabase; only the Sport carnet
is ever synced. Never place a service-role key, OAuth secret, DB password, or
VAPID private key in `NEXT_PUBLIC_*` or client code. Changes to what the cloud
stores/sends/exposes must be reflected in `src/sport/README.md`,
`src/sport/CLOUD_SETUP.md`, `docs/compliance/*`, `docs/store/*`, and
`/legal/confidentialite`.

## UI

AntaVerse is mobile-first. Preserve touch usability, readable text, responsive layout, sensible overflow, safe areas, and each game's existing visual identity. Prefer existing tokens and components. Design the phone experience for real party play and avoid forcing unnecessary data entry.

Use UX/design tooling only when the task actually needs design reasoning. For UI changes, verify the affected viewport or state when practical.

## Validation

### Native (Capacitor Android + iOS) validation is opt-in

The Capacitor Android and iOS packages are maintenance-only; the installed PWA
is the real target. Do not run native build, verification,
emulator/device/simulator, instrumented, APK, AAB, or Xcode tests by default,
and do not include them in routine validation or `npm run verify`. Run
`android:check`, `android:test:*`, `android:apk:debug`, `android:bundle`, or
any iOS build only when native work or a store-release check is explicitly
requested. Normal UI/gameplay changes are validated against the PWA.

### Sport cloud validation is opt-in

Cloud tests are not in `npm run verify`. When touching `src/sport/cloud/` or
`supabase/`, run `npx vitest run src/sport/cloud` (executes the real SQL
migration in PGlite), the deno test for `send-session-push`, and
`npx playwright test --config=playwright.sport-cloud.config.ts`.

Validation must match risk:

- Tiny copy, label, or style change: inspect the diff; run no full suite by default.
- Normal behavior change: run relevant targeted tests and TypeScript; run lint when useful.
- Large or cross-cutting change: run broader tests, TypeScript, lint, and build when justified.

Available project commands include `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run verify`.

Do not investigate unrelated pre-existing failures. If an intentional product change invalidates an old test, update that test to describe the new behavior.

Before editing generated content, identify its source-of-truth or import pipeline. Do not manually edit generated output when a clear pipeline owns it.

## Git and security

Preserve unrelated working-tree changes. Do not reset, overwrite, clean, push, merge, publish, deploy, or modify remote branches unless explicitly requested. Inspect targeted diffs before handoff.

Never commit secrets or API keys. Keep credentials out of client-side code and apply proportional security practices.

## Completion

Stop when the requested behavior is implemented, explicit requirements are respected, no obvious temporary/debug code remains, and proportionate validation is complete. Do not continue broad refactoring or polishing without a concrete reason.
