## Basketball Practice Planner (Expo + React Native)

Plan practices, track drills, and run sessions with precise, computed start/end times. Local-only data; offline by default.

### Core Features

* Drill catalog with categories and default durations
* Teams and practices
* Practice builder: order drills and set lengths
* **Computed timeline** based on practice start time
* Templates: save/load favorite drill sequences

### Tech Stack

* **React Native + Expo** (managed workflow)
* **Expo Router** for file-based navigation
* **SQLite (expo-sqlite)** for on-device storage
* TypeScript (optional but recommended)

### Data Model (initial)

* **Category** `{ id, name }`
* **Drill** `{ id, name, defaultMinutes, categoryIds[] }`
* **Team** `{ id, name }`
* **Practice** `{ id, teamId, startsAt }`
* **PracticeDrill** `{ id, practiceId, drillId, minutes, order }`
* **Template** `{ id, name }`
* **TemplateDrill** `{ id, templateId, drillId, minutes, order }`

> Timeline math: given `startsAt` and the ordered `PracticeDrill` rows, compute cumulative offsets to render start/end times per drill.

### Repo Structure

```
/app                 # Expo Router screens
  /(tabs)/
  practice/
  drills/
  teams/
  templates/
  index.tsx
/db
  schema.sql         # DDL + migrations (v1)
/src
  /models            # TS types for entities
  /data              # sqlite helpers, repositories
  /features          # use-cases (createPractice, runPractice, etc.)
  /ui                # shared components
  /utils/time.ts     # timeline computations
assets/
README.md
AGENTS.md
```

### Quick Start

1. **Install Node.js LTS on Windows** (includes npm). ([Node.js][1])
2. **Create the app (Expo)**:

```bash
npx create-expo-app@latest practice-planner
cd practice-planner
npm start
```

This uses `create-expo-app` to scaffold a project (default template includes Expo Router). ([Expo Documentation][2])

3. **Run on Android**

* **Physical device (Expo Go):** With `npm start` running, scan the QR code in **Expo Go**; follow React Native’s “Running on device” guidance. ([React Native][3])
* **Emulator:** Install Android Studio, create an AVD, then press **a** in the Expo terminal to launch on the emulator. (See setup section below.) ([Expo Documentation][4])

### Install SQLite

```bash
npx expo install expo-sqlite
```

See Expo’s official `expo-sqlite` docs for usage and (optional) config-plugin options such as FTS/SQLCipher. ([Expo Documentation][5])

### Minimal Timeline Utility (example)

```ts
// src/utils/time.ts
export type Block = { name: string; minutes: number };
export function computeSchedule(
  blocks: Block[],
  startsAtIso: string
): { name: string; start: Date; end: Date }[] {
  let t = new Date(startsAtIso).getTime();
  return blocks.map(b => {
    const start = new Date(t);
    const end = new Date(t + b.minutes * 60_000);
    t = end.getTime();
    return { name: b.name, start, end };
  });
}
```

### Next Steps

* Implement schema and repositories in `/db` and `/src/data`
* Build **Practice Builder** and **Run Practice** screens
* Add Templates save/load
* Add CSV import/export (later)

[1]: https://nodejs.org/en/download?utm_source=chatgpt.com "Download Node.js®"
[2]: https://docs.expo.dev/more/create-expo/?utm_source=chatgpt.com "create-expo-app - Expo Documentation"
[3]: https://reactnative.dev/docs/running-on-device?utm_source=chatgpt.com "Running On Device - React Native"
[4]: https://docs.expo.dev/get-started/set-up-your-environment/?utm_source=chatgpt.com "Set up your environment - Expo Documentation"
[5]: https://docs.expo.dev/versions/latest/sdk/sqlite/?utm_source=chatgpt.com "SQLite - Expo Documentation"
