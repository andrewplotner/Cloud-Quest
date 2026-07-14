# Android and Play Store checklist

Cloud Architect Quest uses Capacitor as a minimal Android host for the self-contained HTML game. No Capacitor or Cordova plugins are currently installed, and the project adds no page-level CSS, JavaScript, viewport, or Adventure map overrides.

## Open the Android project

Install Android Studio and its current Android SDK, then run:

```bash
npm install
npm run android:sync
npm run android:open
```

The sync command reconstructs the canonical HTML, asks Capacitor to copy it into Android, and fails if the packaged `index.html` differs by even one byte or if an unexpected plugin is present.

## Before a production release

1. Confirm the final public app name and the application ID in `capacitor.config.ts` and `android/app/build.gradle`; changing the ID after release creates a different Play Store app.
2. Review the launcher icon on several Android mask shapes and replace it if needed. The original AWS-branded source art in `assets/source/` is not included in the app package.
3. Confirm publishing rights for all questions, explanations, and artwork, and add an independent/unofficial AWS study-tool disclosure.
4. Set a version name and incrementing version code in the Android app module.
5. Add an in-app privacy-policy link, host the policy at a public URL, and complete Google Play's Data safety form.
6. Test every mode on physical phones, especially touch drag/drop, Android Back, pause/resume, rotation, offline behavior, and saved progress.
7. Create and securely back up a release signing key. Never commit it or its passwords.
8. Generate a signed Android App Bundle (`.aab`) from Android Studio and test it through an internal testing track before production.

## Updating the game

Import the new self-contained file and sync it through Capacitor:

```bash
npm run import:game -- /path/to/updated-game.html
npm run android:sync
```

Neither step rewrites the source document. `scripts/verify-android-html.mjs` proves that Capacitor's packaged HTML is byte-identical to `dist/index.html`.
