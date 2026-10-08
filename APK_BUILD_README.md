# Kalam Ki Karigiri — APK Build

This repository is ready to build the Android debug APK with GitHub Actions.

## On an Android phone
1. Create a GitHub repository and upload the **contents of this folder** (not the ZIP itself).
2. Open **Actions**.
3. Select **Build Kalam Ki Karigiri APK**.
4. Tap **Run workflow** → **Run workflow**.
5. When it finishes, open the run and download **Kalam-Ki-Karigiri-debug-apk**.
6. Extract `app-debug.apk` and install it on Android.

No Android Studio is required for this route. The workflow installs Java 17, Android SDK 35 and Gradle 8.9.

### Important
- This is a debug/test APK.
- Provider API credentials belong in server-side environment variables; never put private keys in the Android/WebView bundle.
- Background native playback is reserved for authorized/direct audio URLs. Do not use extracted or ripped YouTube/Spotify streams.
