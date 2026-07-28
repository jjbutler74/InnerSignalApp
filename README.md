# InnerSignal

A quiet daily practice app for Android. Three affirmations at times you choose — morning, midday, evening — each with a short breathing moment. One evening gratitude prompt. A streak that tracks honest completion. Nothing to scroll.

> Built with Expo SDK 55 / React Native 0.83.6 / TypeScript. Local-first, no backend, no accounts.

---

## What it does

| Time of day | What happens |
|---|---|
| Morning anchor | Affirmation delivered at your chosen time. Tap to read + breathe through it. |
| Midday reset | Second affirmation. Same flow. |
| Evening post | Third affirmation. Closes out the practice day. |
| Gratitude (evening) | Simple prompt: what are you grateful for today? 1–3 things, your choice. |

Each slot has a **time window**. Before its window opens the row is locked. Once the window passes unread, the row auto-crosses-off (missed — no streak credit). Tapping any crossed-off row opens it in review mode. The gratitude slot stays open from its scheduled time until midnight.

A **13-day streak counter** and **weekly mood arc** give you a shape of your practice over time.

---

## Key features

- **Scheduled notifications** — exact-alarm delivery (Android `SCHEDULE_EXACT_ALARM`) so notifications arrive on time even when the app is closed
- **Affirmation library** — built-in packs (Code, Composure, Discipline, Focus, Honour) plus custom affirmations; filter by pack or favourites
- **Streak tracking** — honest: only counts slots you actually completed in their window
- **Weekly recap** — mood arc chart, day streak, total affirmations seen, evenings logged, standout affirmation of the week
- **Gratitude journal** — per-entry mood (Heavy / Mixed / Steady / Clear / Resolved), scrollable history with calendar strip
- **Dark mode by default** — full light/dark theming via token system
- **Weekend mode** — optionally skips midday and evening affirmations on Sat/Sun
- **Quiet hours** — suppresses notifications between configurable times
- **Favourites-only mode** — draws daily picks only from saved affirmations
- **Export** — full data export as JSON
- **Private by design** — everything in SQLite on-device; no backend, no analytics, no ads

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 55 (managed workflow + CNG prebuild) |
| Language | TypeScript |
| Navigation | React Navigation v7 (native stack) |
| State | Zustand v5 |
| Database | expo-sqlite (SQLite, local) |
| Notifications | expo-notifications with DATE triggers (rolling 7-day window) |
| Audio | expo-audio |
| Fonts | Instrument Serif (display), Geist (sans), Geist Mono |
| Icons | Custom SVG via react-native-svg |
| Build target | Android SDK 36, minSdk 24 |

---

## Architecture notes

### Notification scheduling
Uses individual `DATE` triggers (not `DAILY`/`WEEKLY` repeating) so past-today times are simply skipped rather than firing immediately as catch-up. Reschedules the next 7 days on every app launch. Requires `SCHEDULE_EXACT_ALARM` permission declared in `app.json` and granted by the user via "Alarms & reminders" in system settings.

### Stale notification handling
Notifications delivered on a previous calendar day are detected at tap-time by comparing `notification.date` to today's local date. Stale affirmation notifications open in review-only mode (no streak credit). Stale gratitude notifications open the composer with `targetDate` set to the delivery date, so the entry saves to the correct past day rather than today.

### Slot status model
Each affirmation slot has one of four statuses derived purely from current time and completion state — no extra DB columns:
- `pending` — before the slot's time window (locked, non-tappable)
- `next` — inside the active window (tappable, full "I felt it" flow)
- `done` — completed in this window (review-only)
- `missed` — window closed, never read (auto-crossed-off, review-only, no streak credit)

### Daily affirmation selection
Deterministic date+slot hash biased toward lower `seenCount`. Same hash = same pick across the day, including on cold-start from a notification (which calls `refreshDailyAffirmations()` before navigating). Backgrounded app overnight handled by calling refresh on every notification tap.

### Store layer
Four Zustand stores: `settingsStore`, `affirmationStore`, `journalStore`, `statsStore`. All loaded on app mount before the navigator renders. Accessible outside React via `.getState()` for notification handlers.

---

## Project structure

```
src/
  screens/          # One file per screen
  store/            # Zustand stores
  db/               # SQLite queries, migrations, seed data
  notifications/    # Scheduler, channels
  utils/            # anchorWindow, sound, exactAlarm helpers
  components/       # Screen, Card, Chip, Typography, Icons
  theme/            # ThemeContext, tokens (light/dark)
  navigation/       # navigationRef
  types/            # Shared types, DEFAULT_SETTINGS
plugins/
  withReleaseSigning.js       # Injects keystore config into build.gradle
  withRemovedPermissions.js   # Strips USE_EXACT_ALARM (keeps SCHEDULE_EXACT_ALARM)
assets/             # Icon, splash, notification icon, sounds
```

---

## Build & run

### Prerequisites
- Node 20+
- Android Studio (for Android SDK + JDK at `jbr/`)
- Java 17 (bundled with Android Studio)
- A physical Android device or emulator (API 24+)

### Development
```bash
npm install
npx expo start --android
```

### Release build (APK)
```bash
npx expo prebuild --platform android
cd android
JAVA_HOME="/path/to/Android Studio/jbr" \
ANDROID_HOME="$HOME/AppData/Local/Android/Sdk" \
./gradlew app:assembleRelease -x lint -x test
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Play Store build (AAB)
```bash
./gradlew app:bundleRelease -x lint -x test
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Signing
Keystore credentials are in `~/.gradle/gradle.properties` (outside the repo, never committed):
```
RELEASE_STORE_FILE=...
RELEASE_STORE_PASSWORD=...
RELEASE_KEY_ALIAS=...
RELEASE_KEY_PASSWORD=...
```

> R8 minification is disabled (`android.enableMinifyInReleaseBuilds=false`) due to an app-hang issue with the current dependency set. No deobfuscation file is generated; Play Console shows a warning that can be ignored.

---

## Privacy

No data leaves the device. No accounts. No analytics SDK. No crash reporting. No ads. All journal entries, affirmations, and settings live in a local SQLite database. Uninstalling the app removes everything. See [PRIVACY.md](PRIVACY.md) for the full policy.

---

## Version history

| Version | Notes |
|---|---|
| 1.0.21 | Stale gratitude notifications save to correct past date; stale affirmation notifications open review-only |
| 1.0.20 | Notification cold-start fix; lock screen / notification bar tap navigates directly to correct screen; filled heart icons; stats cards navigate to weekly recap; single breathing instruction per phase |
| 1.0.19 | Gratitude row time-gating; affirmation row locking before window; auto-miss on window close; exact alarm scheduling; 7-day rolling DATE triggers |
| 1.0.13 | Initial closed testing release |
