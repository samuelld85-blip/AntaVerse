---
name: ux-review
description: Review AntaVerse screens/flows from the player's point of view — cognitive load, navigation, setup friction, and consistency vs game identity — using Nielsen heuristics and AntaVerse-specific priorities. Use when asked to review or improve a screen/flow, simplify setup or navigation, evaluate whether an interaction is intuitive, identify friction, compare UX alternatives, or review a new game flow.
---

# UX Review — AntaVerse

## Purpose

Review AntaVerse from the player's point of view, not just from the code or visual implementation.

AntaVerse is a mobile-first party-game app used mainly on a shared phone between friends.

The phone should support the game and social interaction, not become the center of attention or force players through unnecessary steps.

Use this skill when the user asks to:

- review or improve a screen or flow;
- simplify setup or navigation;
- evaluate whether an interaction is intuitive;
- identify friction or cognitive overload;
- compare UX alternatives;
- review a new game flow;
- assess launcher, setup, rules, gameplay transitions, or results.

Do not invoke this skill automatically for trivial CSS, copy, or implementation-only changes.

When this skill conflicts with `CLAUDE.md`, `ARCHITECTURE.md`, or explicit product rules, follow those sources.

## Core UX principles

Evaluate primarily through:

- Nielsen usability heuristics;
- cognitive load;
- Hick's Law;
- Gestalt grouping and hierarchy;
- visibility of system/game state;
- consistency;
- error prevention and recovery;
- recognition over recall.

Use these as reasoning tools, not as bureaucracy.

Do not force every issue to cite a formal theory if the UX problem is already obvious.

## AntaVerse priorities

For AntaVerse, prioritize:

1. players understand what to do immediately;
2. setup is fast;
3. minimal typing and data entry;
4. primary action is obvious;
5. the current player/team/state is clear;
6. navigation between menus is predictable;
7. active gameplay stays focused;
8. real-world decisions remain between players when the app does not need to record them;
9. the phone does not interrupt social interaction unnecessarily;
10. each game preserves its own identity.

## Screen-specific review

### Launcher

Check:

- games are easy to scan;
- cards are visually distinguishable;
- descriptions are useful but concise;
- important badges or categories are understandable;
- scrolling remains reasonable;
- no unnecessary legend or chrome competes with the games.

### Game landing page

Check:

- game identity is immediately recognizable;
- `JOUER` is clearly primary;
- secondary actions such as `RÈGLES` remain visible but subordinate;
- resume/current-game state is understandable;
- theme controls do not compete with gameplay actions.

### Setup

Check:

- number of required players/teams is obvious;
- optional participants are clearly optional;
- adding/removing participants is simple;
- minimum requirements are understandable;
- typing is minimized;
- the main launch action remains obvious;
- temporary setup does not create confusing persistence behavior.

### Rules

Check:

- rules can be understood quickly;
- essential mechanics come before edge cases;
- text is appropriate for players standing around a phone;
- the user knows how to return to the relevant menu.

Do not turn rules into documentation-style walls of text.

### Active gameplay

Check:

- current player/team is obvious;
- the next expected action is obvious;
- game state is visible without clutter;
- unnecessary navigation controls are absent;
- players are not asked to log real-world decisions the group can handle themselves;
- transitions between turns/rounds are fast.

Once gameplay starts, avoid adding generic Back controls unless there is a real menu-navigation need.

Leaving a game is a deliberate exit action, not ordinary Back navigation.

### Results / round transitions

Check:

- winner/result/consequence is immediately understandable;
- the next action is obvious;
- result hierarchy is stronger than decorative information;
- replay/continue/end actions appear only when contextually relevant.

## Cognitive load

Reduce unnecessary simultaneous decisions.

Avoid:

- too many equal-weight buttons;
- repeated explanations;
- excessive labels;
- duplicate information;
- asking players to remember hidden state;
- unnecessary confirmation screens;
- forcing users through screens that add no decision.

Prefer:

- one obvious primary action;
- short labels;
- progressive disclosure;
- visible game state;
- sensible defaults.

## Navigation

Explicit navigation should represent real menu hierarchy.

Prefer meaningful destinations such as:

- `Tous les jeux`;
- game name;
- rules/setup parent.

Do not add Back controls to every gameplay state.

Prefer explicit destination routes over generic history navigation when the intended parent is known.

Keep shared navigation controls visually and behaviorally consistent across games.

## Consistency vs game identity

Shared interaction patterns should remain consistent:

- Primary Actions;
- BackButton;
- QuitGameButton;
- participant setup;
- add/remove controls;
- theme selection;
- common navigation behavior.

Do not make all games visually identical.

Consistency applies to interaction language and shared concepts, not to every visual composition.

## Friction review

For each meaningful step, ask:

- Does the player need this screen?
- Does the app need this information?
- Is the next action obvious?
- Could this decision happen naturally between players instead?
- Is there a sensible default?
- Is the user being asked to confirm something with no meaningful risk?
- Does this interaction slow the party down?

Remove friction only when it does not remove useful control or understanding.

## Findings

Prioritize findings as:

### Critical
The flow cannot reasonably be completed or understood.

### Major
The experience creates significant confusion, friction, or repeated mistakes.

### Moderate
The experience works but is noticeably less clear or efficient than it should be.

### Minor
Polish or small clarity improvement.

Do not manufacture severity.

## Review modes

### Quick critique

Use for small screens/components.

Return at most:

- what works;
- 2–3 meaningful problems;
- recommended improvement.

Do not generate a long UX report.

### Full UX review

Use only when explicitly asked for a broad UX audit.

Review the relevant journey from entry to completion and group findings by severity.

### Improvement request

When asked to improve a flow:

1. identify the actual friction;
2. propose the smallest effective change;
3. preserve explicit product/game rules;
4. implement only if the user requested implementation.

Do not redesign the product merely because another UX pattern exists.

## Validation

UX reasoning should be proportional.

For a local change:
- inspect the affected screen/flow only.

For a shared navigation/setup change:
- inspect representative affected games.

For a full UX audit:
- walk the complete relevant journey on mobile.

Use rendered UI when available rather than relying only on source code.

Use `frontend-visual` for rendered visual correctness and `responsive-design` for responsive layout issues.

This skill focuses on whether the experience makes sense to the player.

## Output

For normal work, keep output concise.

Prefer:

- Problem
- Why it matters
- Recommended change

Do not output arbitrary UX scores out of 100.

Do not invent conversion percentages, drop-off rates, or quantitative impact without real data.

Do not turn every review into a formal UX report.

## Key principle

AntaVerse should be understandable within seconds, require minimal phone handling, and keep attention on the people playing together.

A technically correct screen is not good UX if players hesitate, ask what to press, type unnecessarily, or spend more time managing the app than playing the game.