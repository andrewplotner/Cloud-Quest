# Cloud Architect Quest

A self-contained AWS architecture study game packaged for Android through [Capacitor](https://capacitorjs.com/).

The complete HTML game is stored losslessly as compressed chunks under `game/chunks/`. The build reconstructs it, then adds mobile viewport and safe-area support plus the Architect Blueprint loading screen without rewriting the uploaded source.

The current packaged source is **v8.5**. Its Adventure world map uses one fixed 2400×680 canvas for route paths, island artwork, status ribbons, and captions. Phones initially show Tutorial Islands and Keyword Coast, while wider desktop windows expose more of the route before scrolling is needed.

Android test builds display their application build number in the Adventure map header. The CI workflow caches a stable debug signing key so builds after 0.4.0 can update one another without losing local game progress.

## Quick start

```bash
npm install
npm run dev
```

Create the production web bundle with:

```bash
npm run build
```

## Run on Android

The native Android project is included. With Android Studio and the Android SDK installed:

```bash
npm run android:sync
npm run android:open
```

Use `android:sync` whenever the web game changes. You can also build, sync, and launch on a connected device with `npm run android:run`.

See [`docs/PLAY_STORE.md`](docs/PLAY_STORE.md) for release preparation and Play Store guidance.

## Project layout

- `game/chunks/` — lossless compressed copy of the canonical self-contained game
- `scripts/build.mjs` — repeatable mobile packaging and splash injection
- `assets/splash/` — in-app loading artwork
- `assets/source/` — original, unmodified source artwork for future asset work
- `capacitor.config.ts` — Android wrapper identity and web bundle location
- `android/` — generated native Android Studio project
- `docs/PLAY_STORE.md` — native build and release checklist
- `.github/workflows/ci.yml` — web packaging, Android debug build, and downloadable APK artifact on every change

## Current application identity

- Name: **Cloud Architect Quest**
- Android application ID: `com.andrewplotner.cloudquest`
- Web output: `dist/`

Review the application ID before the first Play Store release; it becomes the permanent identity of the app.

## Import a future game version

```bash
npm run import:game -- /path/to/updated-game.html
npm run android:sync
```

The import command replaces the committed chunks. The same workflow is available for replacement splash art with `npm run import:splash -- /path/to/splash.png`.
