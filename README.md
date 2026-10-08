# Kalam Ki Karigiri V7 — Production Music Foundation

**अल्फ़ाज़ • आवाज़ • एहसास**

V7 upgrades the V6 music prototype into a provider-based music architecture while preserving the existing poetry/library UI.

## Included

- Universal provider-normalized music search endpoint
- YouTube official Data API search + official IFrame playback
- Optional Spotify metadata search adapter
- Optional authorized/licensed direct-audio provider feed
- Persistent queue, next/previous, shuffle and repeat modes
- Mini-player and full music screen
- Playlists stored locally for guest mode
- Media Session metadata and lock-screen control hooks for browser/direct audio
- Android Media3 `MediaSessionService` + ExoPlayer background-playback foundation
- PWA service worker/manifest
- Environment-based provider configuration

## Run web app

```bash
npm install
cp .env.example .env
# add YOUTUBE_API_KEY if live YouTube search is desired
npm start
```

Open `http://localhost:3000`.

## Provider configuration

- `YOUTUBE_API_KEY`: server-side YouTube Data API v3 key.
- `SPOTIFY_ACCESS_TOKEN`: optional token for metadata search. Spotify playback is subject to Spotify Premium and current developer policies; unavailable playback is represented as **Open source** rather than faked.
- `AUTHORIZED_TRACKS_URLS`: comma-separated JSON feed URLs containing only audio that the app is authorized/licensed to stream. Each item should provide at least `id,title,artist,streamUrl` and may provide `album,artwork,duration,providerUrl`.

No provider key is embedded in frontend JavaScript.

## Background playback

Browser Media Session controls are implemented for authorized direct audio. YouTube iframe playback remains subject to browser/YouTube autoplay and background restrictions.

For Android, `android-native/` contains the Media3 foundation: `ExoPlayer` + `MediaSessionService` + foreground media-playback service. The final release packaging should host the web UI through Capacitor/WebView while routing authorized audio playback through the native service.

## Legal boundary

This project does **not** download/rip YouTube or Spotify audio, bypass DRM, scrape private APIs, or redistribute copyrighted streams. If a provider supports discovery but does not permit in-app playback, the UI exposes the official provider link.

## Validation performed

- `node --check server.js`
- all inline frontend JavaScript blocks pass `node --check`

The remaining production deployment steps are provider credentials, database/auth deployment, signing the Android app, and integrating the hosted web UI with the native Android bridge.


## Automated checks

```bash
npm run check
npm test
```

`npm test` covers queue transition logic (next, repeat-one, repeat-all, shuffle).


## APK build

A GitHub Actions workflow is included at `.github/workflows/build-apk.yml`. Upload the project to GitHub, run **Build Kalam Ki Karigiri APK**, and download the generated debug APK from the workflow artifact. See `BUILD_APK.md`.
