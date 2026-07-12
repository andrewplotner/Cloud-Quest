# Cloud Quest

A touch-first HTML5 game designed to run in a browser and ship as an Android app through [Capacitor](https://capacitorjs.com/).

The starter game is already playable: steer the glider by dragging, collect stars, avoid storm clouds, and chase a locally saved high score. It is intentionally dependency-light so the game can evolve without being tied to a large framework.

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

- `src/game.ts` — canvas game loop, controls, scoring, and rendering
- `src/style.css` — responsive phone-first presentation
- `capacitor.config.ts` — Android wrapper identity and web bundle location
- `android/` — generated native Android Studio project
- `docs/PLAY_STORE.md` — native build and release checklist
- `.github/workflows/ci.yml` — type-check and production build on every change

## Current application identity

- Name: **Cloud Quest**
- Android application ID: `com.andrewplotner.cloudquest`
- Web output: `dist/`

Review the application ID before the first Play Store release; it becomes the permanent identity of the app.
