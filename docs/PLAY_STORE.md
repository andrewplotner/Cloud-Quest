# Android and Play Store checklist

Cloud Quest uses Capacitor to package the web game as a native Android app.

## Open the Android project

The native Android project is already committed. Install Android Studio and its current Android SDK, then run:

```bash
npm install
npm run android:sync
npm run android:open
```

## Before a production release

1. Replace the placeholder launcher icon and splash artwork.
2. Confirm the application ID in `capacitor.config.ts`; changing it after release creates a different Play Store app.
3. Set a version name and incrementing version code in the Android app module.
4. Add a privacy policy URL and complete Google Play's Data safety form.
5. Test touch, sound, pause/resume, rotation policy, and offline behavior on physical phones.
6. Create and securely back up a release signing key. Never commit it or its passwords.
7. Generate a signed Android App Bundle (`.aab`) from Android Studio and test it through an internal testing track before production.

## Updating the game

After changing anything in `src/`, copy the fresh web build into Android:

```bash
npm run android:sync
```
