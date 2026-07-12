# Android and Play Store checklist

Cloud Architect Quest uses Capacitor to package the self-contained HTML game as a native Android app.

## Open the Android project

The native Android project is already committed. Install Android Studio and its current Android SDK, then run:

```bash
npm install
npm run android:sync
npm run android:open
```

## Before a production release

1. Confirm the final public app name and the application ID in `capacitor.config.ts`; changing the ID after release creates a different Play Store app.
2. Review the launcher icon on several Android mask shapes and replace it if needed. The original AWS-branded source art in `assets/source/` is not included in the app package.
3. Confirm publishing rights for all questions, explanations, and artwork, and add an independent/unofficial AWS study-tool disclosure.
4. Set a version name and incrementing version code in the Android app module.
5. Add an in-app privacy-policy link, host the policy at a public URL, and complete Google Play's Data safety form.
6. Test every mode on physical phones, especially touch drag/drop, Android Back, pause/resume, rotation, offline behavior, and saved progress.
7. Create and securely back up a release signing key. Never commit it or its passwords.
8. Generate a signed Android App Bundle (`.aab`) from Android Studio and test it through an internal testing track before production.

## Updating the game

Replace `game/index.html` with the new self-contained HTML version, then rebuild and copy it into Android:

```bash
npm run android:sync
```

The build preserves the uploaded source file and injects the mobile viewport, safe-area rules, and Architect Blueprint loading screen into `dist/index.html`.
