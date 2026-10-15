# Streak Day — ready-to-upload project

The Android project is in `LoveDay_Android_Project/`. The GitHub Actions workflow is at the repository root in `.github/workflows/build-apk.yml`, which matches the repository structure where the Android project is a folder.

## Upload to the existing GitHub repository

1. Extract this ZIP on your computer.
2. In your repository, replace/update the `LoveDay_Android_Project` folder with the folder from this ZIP.
3. Replace/add the repository-root `.github/workflows/build-apk.yml` from this ZIP.
4. Commit and push to `main` (or `master`), or open **Actions → Build Streak Day APK → Run workflow**.
5. When it succeeds, open the workflow run and download the `Streak-Day-APK` artifact. Extract the downloaded artifact ZIP and install `app-debug.apk` on Android.

## Changes included

- Direct date-of-birth entry as day/month/year fields, including real-date and future-date validation.
- Native Android home-screen widget instead of a draggable always-on-top overlay. Add from the launcher Widgets list; remove it by long-pressing it like a normal widget.
- Custom flame + heart `STREAK DAY` icon for the Android app and web manifest.
- Home-screen widget uses the selected accent color and refreshes its streak count.

## Note about online features

The app still stores test profiles and chats locally on the current device. Cross-device registration, real Google/Facebook sign-in, invitations and chat need a secured backend and OAuth configuration; those are not made live by uploading this source alone.
