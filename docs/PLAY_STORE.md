# Android and Play Store checklist

Cloud Architect Quest uses a minimal native `android.webkit.WebView` to package the self-contained HTML game as an Android app. There is no Capacitor or Cordova runtime.

## Open the Android project

Install Android Studio and its current Android SDK, then run:

```bash
npm install
npm run android:sync
```

Open the repository's `android/` directory in Android Studio. The sync command reconstructs the canonical HTML and copies its exact bytes to the app assets directory.

## Before a production release

1. Confirm the final public app name and the `applicationId` in `android/app/build.gradle`; changing the ID after release creates a different Play Store app.
2. Review the launcher icon on several Android mask shapes and replace it if needed. The original AWS-branded source art in `assets/source/` is not included in the app package.
3. Confirm publishing rights for all questions, explanations, and artwork, and add an independent/unofficial AWS study-tool disclosure.
4. Set a version name and incrementing version code in the Android app module.
5. Add an in-app privacy-policy link, host the policy at a public URL, and complete Google Play's Data safety form.
6. Test every mode on physical phones, especially touch drag/drop, Android Back, pause/resume, rotation, offline behavior, and saved progress.
7. Create and securely back up a release signing key. Never commit it or its passwords.
8. Generate a signed Android App Bundle (`.aab`) from Android Studio and test it through an internal testing track before production.

## Updating the game

Import the new self-contained file and sync it into the Android assets:

```bash
npm run import:game -- /path/to/updated-game.html
npm run android:sync
```

Neither step injects or rewrites HTML, CSS, JavaScript, viewport rules, or the adventure map. `scripts/sync-android.mjs` also verifies that the packaged asset is byte-identical to `dist/index.html`.
