# Cloud Architect Quest

A self-contained AWS architecture study game packaged in a minimal native Android WebView.

The complete HTML game is stored losslessly as compressed chunks under `game/chunks/`. The current packaged source is **v8.8**.

The build reconstructs the uploaded file byte-for-byte as `dist/index.html`. The Android sync step performs a byte-for-byte file copy to `android/app/src/main/assets/www/index.html`. It does not inject or rewrite HTML, CSS, JavaScript, viewport settings, or game behavior. The wrapper has no Capacitor/Cordova bridge; it only enables JavaScript and DOM storage before loading the local file.

App icons and the native launch screen remain Android resources outside the game document. The CI workflow caches a stable debug signing key so current test builds can update one another without losing local game progress.

## Quick start

```bash
npm install
npm run dev
```

Create the production web copy with:

```bash
npm run build
```

## Run on Android

The native Android project is included. With Android Studio and the Android SDK installed:

```bash
npm run android:sync
```

Then open the `android/` directory in Android Studio, or build and install on a connected device with:

```bash
npm run android:run
```

Use `android:sync` whenever the web game changes. See [`docs/PLAY_STORE.md`](docs/PLAY_STORE.md) for release preparation and Play Store guidance.

## Project layout

- `game/chunks/` — lossless compressed copy of the canonical self-contained game
- `scripts/build.mjs` — lossless reconstruction of the uploaded HTML
- `scripts/sync-android.mjs` — unchanged byte copy into Android assets
- `assets/splash/` — retained source artwork; the Android launch screen is stored under `android/app/src/main/res/`
- `assets/source/` — original, unmodified source artwork for future asset work
- `android/` — minimal native WebView project
- `docs/PLAY_STORE.md` — native build and release checklist
- `.github/workflows/ci.yml` — web packaging, Android debug build, and downloadable APK artifact on every change

## Current application identity

- Name: **Cloud Architect Quest**
- Android application ID: `com.andrewplotner.cloudquest`
- Web output: `dist/`
- Packaged page: `android/app/src/main/assets/www/index.html`

Review the application ID before the first Play Store release; it becomes the permanent identity of the app.

## Import a future game version

```bash
npm run import:game -- /path/to/updated-game.html
npm run android:sync
```

The import command replaces the committed chunks without modifying the source document. The same workflow is available for replacement splash art with `npm run import:splash -- /path/to/splash.png`.
