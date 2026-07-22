# Cloud Architect Quest

A self-contained AWS architecture study game packaged for Android with a minimal Capacitor host.

The complete HTML game is stored losslessly as compressed chunks under `game/chunks/`. The current packaged source is **v9.10**.

See [Read Me: What Is Cloud Quest?](Read-Me-What-Is-Cloud-Quest.pdf) for a visual overview of the game, learning loop, and intended audience.

The build reconstructs the uploaded file byte-for-byte as `dist/index.html`. Capacitor copies that file to `android/app/src/main/assets/public/index.html`, and the sync command verifies that both files remain byte-identical. The project does not inject CSS or JavaScript, rewrite viewport settings, or contain Adventure map overrides.

Capacitor is configured only with the application ID, application name, and web output directory. No Capacitor or Cordova plugins are installed. The Android activity is the standard empty `BridgeActivity` subclass, so all game layout and behavior continue to come from the original HTML.

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
npm run android:open
```

Use `android:sync` whenever the web game changes. It rebuilds the original HTML, runs Capacitor sync, and verifies the packaged copy. You can build, sync, and launch on a connected device with `npm run android:run`.

See [`docs/PLAY_STORE.md`](docs/PLAY_STORE.md) for release preparation and Play Store guidance.

## Project layout

- `game/chunks/` — lossless compressed, base64-encoded copy of the canonical self-contained game
- `Read-Me-What-Is-Cloud-Quest.pdf` — visual product overview and introduction
- `scripts/build.mjs` — lossless reconstruction of the uploaded HTML
- `scripts/verify-android-html.mjs` — byte identity and empty-plugin verification after Capacitor sync
- `capacitor.config.ts` — minimal Capacitor identity and web directory configuration
- `assets/splash/` — retained source artwork; the Android launch screen is stored under `android/app/src/main/res/`
- `assets/source/` — original, unmodified source artwork for future asset work
- `android/` — native Capacitor Android project
- `docs/PLAY_STORE.md` — native build and release checklist
- `.github/workflows/ci.yml` — web packaging, Android debug build, and downloadable APK artifact on every change

## Current application identity

- Name: **Cloud Architect Quest**
- Android application ID: `com.andrewplotner.cloudquest`
- Web output: `dist/`
- Capacitor page: `android/app/src/main/assets/public/index.html`

Review the application ID before the first Play Store release; it becomes the permanent identity of the app.

## Import a future game version

```bash
npm run import:game -- /path/to/updated-game.html
npm run android:sync
```

The import command replaces the committed chunks without modifying the source document. The same workflow is available for replacement splash art with `npm run import:splash -- /path/to/splash.png`.

## Update the launcher icon

The image shown on the phone is controlled by Android resources, not the HTML or Capacitor configuration. In Android Studio, use the **Image Asset** tool for the `android/app` module, select the replacement source image, and regenerate the `ic_launcher`, `ic_launcher_round`, and `ic_launcher_foreground` resources under `android/app/src/main/res/mipmap-*`. Keep the adaptive icon XML files in `mipmap-anydpi-v26` pointed at `@mipmap/ic_launcher_foreground`.
