# AntaVerse — Project Operating Guide

## 0. Project context

AntaVerse is a Next.js 16 (App Router) mobile-first web app that bundles several party/group games behind one shared launcher shell.

```text
AntaVerse
├── shared launcher & shell
├── Quoi de 9 ?
├── La Relance
└── Sans le dire
```

**Stack**: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Zod · react-hook-form · idb (IndexedDB) · Vitest (unit) · Playwright (e2e) · ESLint · Prettier. Node 22.x. Production build is a static export deployed on Vercel, wrapped as a PWA (service worker, installable).

**Structure**:
- `src/app/` — launcher, global shell, and each game's routes (prefixed by game slug).
- `src/games/<slug>/` — one folder per game: `components/`, `data/`, `features/`, `generated/`, `lib/`, `styles.css`. Each game is self-contained (own engine, content, i18n, persistence).
- `src/components/` and `src/lib/` — shared product-level building blocks.
- `src/lib/games.ts` — the registry the launcher renders cards from.
- `public/brand/v1/` — launcher-level branding; `public/games/` — per-game assets; `public/icons/` + PWA manifest belong to AntaVerse itself.
- `scripts/` — content pipeline (schema export, bundling, editorial/playability audits, encoding checks, question import) and static PWA prep.
- Persisted data (IndexedDB/localStorage) is namespaced per game (e.g. `qui-des-9:`, `la-relance:`, `sans-le-dire:`) — never let one game's storage bleed into another's.

**Adding a new game**:
1. New module in `src/games/<slug>/`, routes in `src/app/<slug>/`.
2. Assets in `public/games/<slug>/`.
3. Register name, description, route, icon, color in `src/lib/games.ts` — the launcher auto-renders a new card.

**Key commands**:
```bash
npm run dev              # local dev server
npm run build             # prebuild (encoding/content checks + bundling) then static export
npm run preview           # serve the static export locally
npm run lint               # eslint
npm run typecheck          # tsc --noEmit
npm run test                # vitest run
npm run test:watch          # vitest watch mode
npm run test:e2e             # build + playwright
npm run format / format:check # prettier
npm run verify                # encoding + content:validate + lint + typecheck + test + build (full gate)
```
Content-specific scripts (`content:*`, `questions:*`, `encoding:check`) touch the question/content pipeline in `scripts/` — check there before hand-editing generated JSON in any `games/*/generated/` or `games/*/data/` folder.

---

## 1. Core mindset

This project is in an early, fast-moving product phase.
The priority is to:

- build quickly;
- iterate often;
- test ideas;
- improve the product continuously;
- keep the codebase reasonably clean while moving fast.

Do not behave as if this were a fragile enterprise production system.
You have broad freedom to modify the codebase when doing so clearly improves the application, implementation quality, maintainability, or user experience.
Use good judgment.
Prefer making sensible decisions yourself over constantly asking for confirmation.

## 2. Autonomy

You are encouraged to:

- create new files;
- delete obsolete files;
- rename files;
- move files;
- reorganize folders;
- refactor existing code;
- replace poor implementations;
- simplify architecture;
- introduce reusable components;
- improve naming;
- improve types;
- consolidate duplicated logic;
- install a dependency when it provides clear value;
- change internal implementation details;
- improve UI implementation when required by the task.

You do not need to preserve weak architecture simply because it already exists.
The current implementation is not sacred.
However, avoid unnecessary rewrites when a smaller and cleaner change solves the problem just as well.

## 3. Understand before editing

Before substantial work:

1. Inspect the relevant parts of the codebase.
2. Understand the current implementation.
3. Identify existing components, utilities, conventions, and patterns.
4. Determine whether the requested feature should reuse, extend, refactor, or replace existing code.
5. Then implement.

Do not blindly add new abstractions without checking whether equivalent functionality already exists.
For larger tasks, briefly establish the implementation approach before changing many files.

## 4. Build, don't just advise

When given an implementation task, the default behavior is: **implement it completely**.
Do not stop after:

- describing what should be done;
- producing a plan;
- identifying files;
- suggesting code;
- completing only the easiest part.

Continue through the implementation until the requested feature or change is meaningfully complete.
Make reasonable assumptions when details are unspecified.
Only ask the user when a decision would materially change the product and cannot reasonably be inferred.

## 5. Prefer simplicity

Favor:

- simple architecture;
- clear code;
- small reusable components;
- explicit logic;
- understandable naming;
- minimal dependencies;
- predictable data flows.

Avoid:

- premature abstraction;
- unnecessary layers;
- excessive indirection;
- giant generic systems for tiny problems;
- duplicated implementations;
- speculative architecture for hypothetical future needs.

A small project should feel like a small project.

## 6. Reuse before duplication

Before creating something new, check whether an existing component, hook, utility, type, style, service, game mechanic, data structure, or helper can be reused or reasonably extended.
If several implementations solve essentially the same problem, prefer consolidating them.
Do not create near-duplicate files simply to avoid touching existing code.

Within AntaVerse specifically, check `src/games/<slug>/` for existing per-game engines/components before introducing shared abstractions, and check `src/components/` / `src/lib/` before duplicating something across games — if two games need the same thing, that's a signal to promote it to shared code.

## 7. Refactoring is allowed

Refactoring is part of normal development.
When implementing a feature, you may clean nearby code if doing so:

- simplifies the implementation;
- removes duplication;
- improves readability;
- makes future iterations easier;
- fixes an obvious architectural inconsistency.

Keep refactors proportional to the task.
Do not turn every small request into a complete architecture rewrite.

## 8. Delete dead weight

The project should stay compact.
When clearly safe, remove: unused components, obsolete implementations, abandoned experiments, duplicate utilities, dead code, unused imports, unused assets, outdated temporary files, unnecessary generated artifacts.

Do not keep old implementations "just in case" when Git already provides history.

## 9. Dependencies

Dependencies are allowed when justified.
Before adding one, consider whether:

- the project already has an equivalent dependency;
- the functionality is trivial enough to implement directly;
- the package is maintained and appropriate;
- it meaningfully simplifies the implementation.

Do not reinvent substantial, well-solved functionality purely to avoid a dependency.
Do not install libraries for tiny conveniences.

## 10. UI and product work

When implementing interfaces:

- preserve visual consistency;
- reuse the existing design language (Tailwind tokens, each game's `styles.css`, shared `components/`);
- maintain responsive behavior;
- avoid arbitrary styling values when design tokens or shared styles exist;
- make interfaces feel intentional rather than merely functional.

When a dedicated UX/UI, visual design, or brand skill is available and relevant, use it.
Functional implementation and visual quality are both part of completion.

## 11. Mobile-first behavior

AntaVerse is primarily a mobile experience (games played on phones, installable as a PWA). Treat mobile as the primary target unless the task specifies otherwise. Check:

- common phone viewport sizes;
- touch targets;
- overflow;
- scrolling;
- text wrapping;
- modal behavior;
- keyboard interactions when relevant;
- responsive layout;
- offline/PWA behavior (service worker, install prompt) where relevant.

Desktop support should remain reasonable but should not compromise the primary mobile experience.

## 12. Code quality

Write code that another capable developer could understand without needing Claude to explain it.
Prefer: strong typing where appropriate; descriptive names; short focused functions; clear component responsibilities; useful comments only where behavior is non-obvious.

Avoid comments that merely restate the code.
Do not intentionally introduce technical debt for trivial speed gains.
At the same time, do not over-engineer early-stage features.

## 13. Validation loop

After meaningful changes, validate the implementation using the tools available in the project:

1. `npm run format` (or `format:check`);
2. `npm run lint`;
3. `npm run typecheck`;
4. `npm run test` (relevant tests, or the full suite for broader changes);
5. `npm run build` for changes likely to affect the build (routing, content pipeline, PWA).

`npm run verify` runs the full gate (encoding + content validation + lint + typecheck + test + build) — use it before considering a larger change done.

Fix issues caused by your changes.
For larger changes, inspect the final diff for: accidental edits; duplicated code; forgotten debug code; unused files; inconsistent naming; unnecessary complexity.

Do not consider code complete merely because it was written.

## 14. Bugs

When fixing bugs:

1. investigate the actual cause;
2. avoid blindly patching symptoms;
3. understand why the bug occurs;
4. implement the smallest robust fix;
5. verify nearby behavior that could be affected.

If several attempted fixes fail, reassess the underlying assumptions instead of stacking additional patches.

## 15. Preserve product intent, not accidental implementation

Distinguish between product behavior that matters and implementation details that happen to exist today.
Preserve intentional user-facing behavior unless the task asks to change it.
Feel free to replace internal implementation details when a better approach exists.

## 16. Scope discipline

Stay focused on the requested outcome.
You may improve adjacent code when useful, but avoid unrelated changes.
If you discover a major unrelated issue:

- mention it;
- fix it only if it is trivial and clearly safe;
- otherwise leave it for a separate task.

## 17. Token and context efficiency

Use context deliberately.
Do not repeatedly read the entire repository when only a few files are relevant.
Prefer:

1. locate the relevant architecture;
2. inspect targeted files;
3. follow imports and dependencies as necessary;
4. expand scope only when needed.

Use subagents for broad exploration when available, especially for: architecture discovery; duplicate detection; codebase audits; large searches; independent reviews.

Keep the main context focused on implementation decisions.

## 18. Use the right level of reasoning

Routine implementation should remain efficient.
Use deeper architectural reasoning for: major refactors; shared systems; complex bugs; structural changes; migrations; decisions affecting many future features.

Do not spend heavyweight reasoning on trivial edits.

## 19. Git awareness

Treat Git as the safety net that enables fast iteration.
Before large destructive changes, understand the current repository state.
Avoid accidentally overwriting unrelated uncommitted user work.
Do not revert user changes simply because they differ from what you would have implemented.
When reviewing your work, use the diff to understand exactly what changed.

## 20. Security basics

Even during rapid prototyping:

- never hardcode secrets (see `.env.example` for expected env vars — real values stay in `.env`, never committed);
- never commit API keys;
- avoid exposing private credentials client-side;
- validate untrusted input where appropriate (Zod schemas are already used across the content pipeline — follow that pattern);
- avoid obviously unsafe dependencies or patterns.

Apply proportional security rather than enterprise bureaucracy.

## 21. Completion standard

A task is complete when:

- the requested behavior exists;
- the implementation is coherent with the rest of the project;
- obvious duplication has been avoided;
- no temporary/debug code remains;
- relevant validation passes (lint, typecheck, tests, build);
- the application remains buildable;
- the result is usable, not merely scaffolded.

For early-stage product work, favor working, polished-enough iterations delivered quickly over theoretical perfection.

## 22. Default decision rule

When uncertain between:
A. asking the user about a minor implementation decision
and
B. making a reasonable professional decision and continuing
→ **prefer B.**

When uncertain between:
A. preserving mediocre existing code
and
B. improving it as part of the task without creating unnecessary complexity
→ **prefer B.**

When uncertain between:
A. designing for hypothetical future requirements
and
B. building the cleanest solution for the product that exists today
→ **prefer B.**

Move fast, use judgment, keep the codebase clean, and finish what you start.

## 23. Progress milestones on long tasks

For any task substantial enough to involve multiple steps or take a while (a real feature, a multi-file refactor, a migration, a longer debugging session — not a quick edit), break the work into a rough step plan first, then post a short progress ping at roughly 25%, 50%, and 75% of the way through.

Each ping is one line, nothing more — e.g. "25% — schema updated, moving to the API layer." No recap of everything done so far, no re-explanation of the plan, no formatting. Just enough for the user to know it's progressing and roughly where.

Base the percentage on how much of the planned work is done (steps/files/checks completed out of the total), not on a clock — there's no reliable way to track literal elapsed minutes mid-task, so treat "25% in five minutes" as "25% of the plan," not a timer. Skip this entirely for short, single-step tasks; don't invent milestones where there's nothing meaningful to report.
