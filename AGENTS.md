# AGENTS.md

**Intent:** Guide an AI coding agent (e.g., Codex-style) to implement and maintain this app.

## Objectives

1. Ship a working **Expo** app on Android that runs entirely offline.
2. Persist all entities locally in **SQLite** via `expo-sqlite`.
3. Provide two primary flows:

   * **Plan**: create practice (team, start time) and assemble ordered drills with minutes.
   * **Run**: show live, computed schedule (start/end per drill), with a “Next” control.
4. Keep the codebase simple, typed, and testable.

## Guardrails

* **No push notifications or alarms.** Only on-screen times.
* **Local-only** DB; do not add network code.
* Prefer **function components + hooks**.
* Navigation uses **Expo Router** (file-based). ([Expo Documentation][3])

## Milestones & Tasks

### M1 — Foundation

* Initialize project with `create-expo-app`. Ensure it runs on Android. ([Expo Documentation][1])
* Add `expo-sqlite`. Create `/db/schema.sql` with tables in README. ([Expo Documentation][2])
* Implement a thin DB layer: `openDb()`, `migrate()`, and typed repositories:

  * `CategoriesRepo`, `DrillsRepo`, `TeamsRepo`, `PracticesRepo`, `PracticeDrillsRepo`, `TemplatesRepo`, `TemplateDrillsRepo`.
* Add seed script to insert sample data (dev only).

### M2 — Navigation & Screens

* Set up Expo Router folders:

  * `/app/index.tsx` → dashboard (Teams, Drills, Practices, Templates)
  * `/app/drills/` list + create/edit
  * `/app/practice/new` builder (select team, start time; add drills with minutes; drag to reorder)
  * `/app/practice/[id]` run view (timeline table; current drill highlight; “Next” button)

### M3 — Timeline Logic

* Implement `computeSchedule(blocks, startsAtIso)` (see README).
* In run view, render a schedule table and a large “Current/Next” area; show live **clock** and computed **start/end** per drill.

### M4 — Templates

* From any practice, **Save as Template**; **Load Template** into a new practice (clone drill rows and order).

### M5 — Quality

* Add lightweight tests for time math and repositories.
* Implement simple backup/export/import (JSON) via `expo-file-system` (optional).

## Coding Standards

* TypeScript preferred; strict mode if enabled.
* Keep components focused; business rules in `/src/features`.
* Avoid heavy state managers; start with React state + context.

## Acceptance Criteria (excerpt)

* Creating a practice with 3 drills at 6:00 PM for 10/15/20 minutes yields:

  * Drill 1: 6:00–6:10, Drill 2: 6:10–6:25, Drill 3: 6:25–6:45 (local time).
* Restarting the app preserves all entities and practices.
* The app runs in Expo Go on Android and an emulator.

## Web Preview

* Build static PWA with `npx expo export --platform web`.
* `.github/workflows/deploy-web.yml` publishes `dist/` to **GitHub Pages** on pushes to `main`.

## Commands (for the agent)

```bash
# run
npm start

# packages
npx expo install expo-sqlite
```

[1]: https://docs.expo.dev/more/create-expo/?utm_source=chatgpt.com "create-expo-app - Expo Documentation"
[2]: https://docs.expo.dev/versions/latest/sdk/sqlite/?utm_source=chatgpt.com "SQLite - Expo Documentation"
[3]: https://docs.expo.dev/router/introduction/?utm_source=chatgpt.com "Introduction to Expo Router - Expo Documentation"
