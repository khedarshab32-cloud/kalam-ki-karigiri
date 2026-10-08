# Build the APK

## Easiest method — GitHub Actions

1. Create a GitHub repository.
2. Upload this project, including `.github/workflows/build-apk.yml`.
3. Open **Actions → Build Kalam Ki Karigiri APK**.
4. Click **Run workflow**.
5. After the workflow finishes, open the run and download the artifact:
   **Kalam-Ki-Karigiri-debug-apk**.
6. Extract it and install `app-debug.apk` on an Android phone.

The workflow installs Java 17, Android SDK 35 and Gradle 8.9 automatically, so no local Android Studio installation is required.

## Important

This is a debug APK for testing. A Play Store release needs a release keystore, signing configuration, privacy policy, app links/deep links as needed, and final production provider credentials.

The native Media3 service is intentionally restricted to authorized/direct audio URLs. Do not feed it extracted or ripped YouTube/Spotify streams.
