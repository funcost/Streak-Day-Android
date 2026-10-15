# Streak Day (Android)

Android WebView app for keeping a relationship/friendship streak. The app assets live in `app/src/main/assets/www/`.

## Build from GitHub Actions

If this folder is inside your repository as `LoveDay_Android_Project/`, keep the repository-root workflow at `.github/workflows/build-apk.yml` (included beside this folder in the ready ZIP). Push to `main`/`master`, or open **Actions → Build Streak Day APK → Run workflow**. When it finishes, download the `Streak-Day-APK` artifact and extract the APK inside it.

You can also open this folder in Android Studio and sync Gradle to build locally.

## Implemented in this update

- Date of birth uses three direct-entry fields (day/month/year), so you can type a year like 2006 directly instead of tapping back through years. Invalid dates and future dates are rejected.
- Replaced the draggable system overlay with a standard Android home-screen widget. Add it by long-pressing an empty area of the home screen → **Widgets** → **Streak Day**, then place it in a 2×2-sized space. Remove it like any other widget by long-pressing it and choosing **Remove**. No overlay permission or background overlay service is used.
- Added a custom `STREAK DAY` flame/heart app icon.
- Widget displays the names, relationship symbol, streak count, and selected accent color. Its day count refreshes through Android's normal widget update cycle.

## Important limitations

This remains a local prototype, not a production multi-user service. Profiles, invitations and chat are stored in WebView local storage on that device; another device will not see them. Google/Facebook buttons are placeholders until real OAuth and a backend are configured. Do not use a real password in this prototype. Cross-device account authentication, invitation delivery and chat require a backend (for example Firebase Authentication + Firestore with appropriate security rules).
