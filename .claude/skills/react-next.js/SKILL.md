---
name: react-next.js
description: Apply AntaVerse's React 19 / Next.js 16 conventions — state/effects, rerender optimization, shared component APIs, bundle size, localStorage/IndexedDB persistence, and static-export constraints. Use when creating or significantly changing React components, refactoring shared UI, changing important state/effect logic, investigating unnecessary rerenders, improving startup/bundle performance, or reviewing a meaningful React/Next implementation.
---

# React & Next.js Best Practices — AntaVerse

## Purpose

Keep AntaVerse React / Next.js code simple, efficient, maintainable, and responsive without premature optimization.

AntaVerse is currently:

- Next.js 16;
- React 19;
- TypeScript;
- mobile-first;
- static exported;
- deployed as a PWA;
- mostly local-first with localStorage / IndexedDB;
- without a backend or server-side data layer.

Apply this skill when:

- creating or significantly changing React components;
- refactoring shared UI;
- changing important state/effect logic;
- investigating unnecessary rerenders;
- improving startup or bundle performance;
- reviewing a meaningful React/Next implementation.

Do not invoke heavyweight performance reasoning for trivial copy, CSS, content, or isolated visual changes.

When this skill conflicts with `CLAUDE.md` or `ARCHITECTURE.md`, follow the project documentation.

## Priorities

For AntaVerse, prioritize:

1. simple React state/data flow;
2. avoiding unnecessary effects;
3. avoiding unnecessary rerenders;
4. keeping shared components focused;
5. minimizing unnecessary bundle weight;
6. keeping localStorage / IndexedDB access efficient;
7. preserving fast mobile interactions;
8. avoiding premature micro-optimization.

Server-side optimization is currently low priority because AntaVerse uses static export and has no backend.

## React state and effects

Prefer deriving values directly during render when possible.

Do not create state + effect combinations for values that can be calculated from existing state.

Avoid effects for logic that belongs directly in an event handler.

Prefer functional updates when new state depends on previous state:

`setCount(current => current + 1)`

Keep effect dependencies explicit and primitive when practical.

Do not suppress dependency warnings merely to silence them.

Avoid defining React components inside other components unless there is a clear reason.

## Rerender optimization

Do not use `memo`, `useMemo`, or `useCallback` automatically.

Use them when:

- rendering is meaningfully expensive;
- identity stability actually matters;
- a shared component receives frequently changing parent state;
- profiling or obvious behavior shows unnecessary work.

Avoid optimizing trivial primitives or inexpensive JSX.

For transient values that change frequently but do not need to trigger rendering, consider `useRef`.

Keep state as local as practical.

Do not lift state globally unless multiple consumers genuinely need it.

## Shared components

Avoid components with growing collections of unrelated boolean props.

Prefer clear variants or composition when a shared component develops multiple distinct behaviors.

Example smell:

`<Button primary compact purple setup special />`

Prefer a clear API reflecting actual concepts.

Do not introduce abstraction merely because two implementations look similar.

Follow AntaVerse's shared-first rule only when the conceptual behavior is genuinely shared.

## Bundle size

Keep dependencies minimal.

Avoid importing a large package for functionality easily implemented with the existing stack.

Prefer direct imports when barrel imports cause unnecessary bundle loading.

Consider dynamic import only for genuinely heavy, infrequently used functionality.

Do not dynamically split tiny components without evidence that it helps.

Avoid loading code or assets for features the current screen cannot use when the cost is meaningful.

## Local storage and persistence

AntaVerse relies heavily on local persistence.

For localStorage / sessionStorage:

- avoid repeated reads during the same render path;
- centralize access through `src/lib/local-storage-json.ts`
  (`readJson`/`writeJson`/`removeJson`) — the shared helper used by games
  that keep in-progress state in a single localStorage key (e.g. La
  Relance, Sans le dire);
- preserve namespacing per game;
- preserve schema/version handling where it already exists.

Do not introduce another persistence abstraction unless the task genuinely requires it.

Quoi de 9 does **not** use `local-storage-json.ts` — it persists to
IndexedDB via its own module (`src/games/quoi-de-9/lib/game/persistence.ts`)
with a legacy-schema migration path. This is a different problem, not a
bigger version of the localStorage one, so keep it isolated unless a
broader migration is explicitly requested.

## Rendering

Keep mobile rendering smooth.

Avoid expensive calculations directly inside frequently rerendered components when they can reasonably be precomputed or moved outside.

Hoist truly static values outside components where useful:

- immutable configuration;
- constant arrays;
- regexes;
- static lookup maps.

Do not hoist mutable game/session state.

For repeated lookup-heavy operations, consider `Map` or `Set` only when it meaningfully simplifies or improves the implementation.

## Event listeners

Avoid registering duplicate global listeners.

Always clean up listeners created by effects.

Use passive listeners for scroll/touch listeners when appropriate and when `preventDefault()` is not required.

Do not add global listeners when React event handling is sufficient.

## JavaScript performance

Prefer readability first.

Useful optimizations when relevant:

- early returns;
- avoid repeated expensive computations;
- use `Set` / `Map` for repeated lookups;
- avoid unnecessary sorting solely to find min/max;
- combine iterations only when it improves meaningful hot-path work.

Do not rewrite clear array operations into harder-to-read loops for negligible gains.

## Images and assets

AntaVerse contains many logos and game assets.

Optimize assets when they materially affect:

- initial load;
- mobile bandwidth;
- layout shift;
- PWA install experience.

Do not automatically migrate all existing images to `next/image`.

Preserve static-export compatibility and existing asset conventions unless a clear improvement is needed.

## Static-export constraints

Do not recommend or introduce features that require runtime server behavior unless the task explicitly changes the architecture.

Be cautious with:

- Server Actions;
- dynamic server rendering;
- API routes;
- request-time authentication;
- server caches;
- server-only data fetching.

These are not part of the current AntaVerse architecture.

If a future feature requires a backend, treat that as an architectural change rather than quietly introducing server dependencies.

## Next.js

Use Next.js 16-compatible APIs and patterns.

Respect the current App Router architecture.

Do not introduce Pages Router patterns into new code.

Preserve:

- static export;
- PWA behavior;
- existing routing conventions;
- client/server boundaries.

Do not convert components between client/server modes without a concrete reason.

## Performance investigation

Do not guess at performance problems.

For normal development, prioritize clear code and obvious improvements.

Only perform deeper optimization when:

- the user explicitly asks for performance work;
- mobile interaction visibly lags;
- bundle/load performance is poor;
- profiling or measurements identify a real bottleneck.

Avoid speculative optimization.

## Validation

Keep validation proportional.

For a small React refactor:

- targeted tests if relevant;
- typecheck when useful.

For a shared component or meaningful state change:

- relevant tests;
- typecheck;
- inspect the affected behavior.

For a dedicated performance task:

- measure before and after where practical;
- identify the actual bottleneck;
- report meaningful improvements only.

Do not run a full performance audit for trivial implementation changes.

## Key principle

AntaVerse is an early-stage mobile-first party-game app.

Prefer simple, correct React over clever React.

Optimize real bottlenecks, shared hot paths, and mobile experience without introducing server complexity or premature abstractions.

Refactor le component React de Quoi de 9 dans AntaVerse, vérifie le typecheck et les tests Playwright, puis commit les changements et push sur la branche QA sans modifier la logique IndexedDB ni le layout mobile-first