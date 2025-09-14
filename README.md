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
  index.tsx          # home page
/db                  # (future) schema and migrations
/src                 # (future) models, data, features, ui, utils
README.md
AGENTS.md
```

### Quick Start

1. **Install dependencies**

```bash
npm install
```

2. **Run on Android or web**

```bash
npm start       # then press 'a' for Android, or 'w' for web
```

### Web Preview (PWA)

On pushes to `main`, GitHub Actions builds the web app and deploys it to **GitHub Pages**.
This makes it easy to open the app on a phone via a URL without installing anything.

To export locally:

```bash
npx expo export --platform web
```

The static site is emitted to `dist/` and can be served with any static server.

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
