# InnerSignal

A quiet daily practice app for Android. Three affirmations at times you choose — morning, midday, evening — each with a short breathing moment. One evening gratitude prompt. A streak that tracks honest completion. Nothing to scroll.

> Built with Expo SDK 55 / React Native 0.83.6 / TypeScript. Local-first, no backend, no accounts.

---

## What it does

| Time of day | What happens |
|---|---|
| Morning anchor | Affirmation delivered at your chosen time. Tap to read + breathe through it. |
| Midday reset | Second affirmation. Same flow. |
| Evening pause | Third affirmation. Closes out the practice day. |
| Gratitude (evening) | Simple prompt: what are you grateful for today? 1–3 things, your choice. |

Each slot has a **time window**. Before its window opens the row is locked. Once the window passes unread, the row auto-crosses-off (missed — no streak credit). Tapping any crossed-off row opens it in review mode. The gratitude slot stays open from its scheduled time until midnight.

A **streak counter** and **weekly mood arc** give you a shape of your practice over time.

---

## Key features

- **Scheduled notifications** — exact-alarm delivery (Android `SCHEDULE_EXACT_ALARM`) so notifications arrive on time even when the app is closed
- **Affirmation tone system** — choose Iron (Code, Composure, Discipline, Focus, Honour), Sage (Warmth, Stillness, Growth, Resilience), or Balance (both); switching packs replaces the active set while keeping the other intact
- **Custom affirmations** — add your own; custom entries are kept separate from built-in packs and removed by "Start fresh"
- **Affirmation library** — browse all packs, filter by pack or favourites, mark favourites
- **Streak tracking** — counts any day where you completed at least one affirmation slot or wrote a gratitude entry
- **Weekly recap** — mood arc chart, day streak, total affirmations seen, evenings logged, most-seen affirmation (by lifetime seen count)
- **Gratitude journal** — per-entry mood (Heavy / Mixed / Steady / Clear / Resolved), scrollable history with calendar strip
- **Dark mode by default** — full light/dark theming via token system
- **Weekend mode** — optionally skips midday and evening affirmations on Sat/Sun
- **Quiet hours** — suppresses notifications between configurable times
- **Favourites-only mode** — draws daily picks only from saved affirmations
- **Export** — journal and settings export as JSON (affirmations, favourites, and completion records are not included)
- **Private by design** — everything in SQLite on-device; no backend, no analytics, no ads. Data may be included in Android's standard encrypted device backup if the user has backup enabled.

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

### Onboarding
Five-screen flow: Welcome → Name → Tone selection → Schedule + notification permission → Exact alarm setup. The final screen explains why `SCHEDULE_EXACT_ALARM` is needed and links directly to Android's "Alarms & reminders" system settings. A one-shot `AppState` listener reschedules notifications the moment the user returns from system settings, bypassing the normal foreground debounce.

### Notification scheduling
Uses individual `DATE` triggers (not `DAILY`/`WEEKLY` repeating) so past-today times are simply skipped rather than firing immediately as catch-up. Reschedules the next 7 days on every app launch and on every foreground transition (30-second debounce to avoid double-firing at startup). Requires `SCHEDULE_EXACT_ALARM` permission declared in `app.json` and granted by the user via "Alarms & reminders" in system settings.

### Notification tap routing
Current-slot affirmation taps go to **LockScreen** (affirmation preview + "Read & absorb" / "Snooze" choice), then on to **AffirmationMoment**. Past-slot taps (notification delivered in a previous time window, same day) go directly to AffirmationMoment in review-only mode (no streak credit). Notifications from a previous calendar day navigate to **Today** (the notification is stale; no affirmation is shown). Unknown or missing slot values also fall through to Today.

Gratitude notifications always route based on **today's** journal state, regardless of when the notification was delivered — if today's entry is already written they open GratitudeComposer (edit mode), otherwise EveningNotif. The journal entry always saves to `today()`.

### Slot status model
Each affirmation slot has one of four statuses derived purely from current time and completion state — no extra DB columns:
- `pending` — before the slot's time window (locked, non-tappable)
- `next` — inside the active window (tappable, full "I felt it" flow)
- `done` — completed in this window (review-only)
- `missed` — window closed, never read (auto-crossed-off, review-only, no streak credit)

### Daily affirmation selection
Deterministic date+slot hash biased toward lower `seenCount`. Same hash = same pick across the day, including on cold-start from a notification (which calls `refreshDailyAffirmations()` before navigating). Backgrounded app overnight handled by calling refresh on every notification tap.

### Database migrations
Versioned via `PRAGMA user_version`. Current migrations:
- **v1** — deduplicates completions and adds `UNIQUE` index on `(date, slot)`
- **v2** — adds `category` column to `packs` ('iron' / 'sage') for tone switching
- **v3** — adds `is_built_in` column to `affirmations` (1 = seeded, 0 = user-created) so "Start fresh" can delete custom affirmations without touching built-in content

### Store layer
Four Zustand stores: `settingsStore`, `affirmationStore`, `journalStore`, `statsStore`. All loaded on app mount before the navigator renders. Accessible outside React via `.getState()` for notification handlers.

### Startup error handling
If any step in the startup sequence (DB init, seeding, store load, notification scheduling) throws, the splash screen is hidden and a friendly error screen is shown with a "Try again" button. Retry increments a counter that re-triggers the startup effect from scratch. The error message (type + message only, no user data) is written to `console.error` for diagnosis.

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
- Android Studio (for Android SDK + JDK)
- Java 17 (bundled with Android Studio)
- A physical Android device or emulator (API 24+)
- Keystore credentials in `~/.gradle/gradle.properties` (see Signing below)

### Development
```bash
npm install
npx expo start --android
```

### Release build (APK)
```bash
cd android
.\gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Play Store build (AAB)
```bash
cd android
.\gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Signing
Keystore credentials are stored outside the repo in `~/.gradle/gradle.properties` (never committed):
```
RELEASE_STORE_FILE=/path/to/innersignal-release.jks
RELEASE_STORE_PASSWORD=...
RELEASE_KEY_ALIAS=...
RELEASE_KEY_PASSWORD=...
```

The `withReleaseSigning` plugin reads these at build time and injects them into `build.gradle`.

> R8 minification is disabled (`android.enableMinifyInReleaseBuilds=false` in `~/.gradle/gradle.properties`) due to an app-hang issue with the current dependency set. No deobfuscation file is generated; Play Console shows a warning that can be ignored.

---

## Privacy

InnerSignal does not send data to the developer or third parties. No accounts, analytics SDK, crash reporting, or ads. All journal entries, affirmations, and settings live in a local SQLite database. Android may separately include app data in its standard encrypted backup when device backup is enabled — this is an OS-level service under the user's control. Uninstalling the app removes all locally stored data. See [PRIVACY.md](PRIVACY.md) for the full policy.

---

## Version history

| Version | Notes |
|---|---|
| 1.0.27 | First Play Store release. Affirmation notifications route through LockScreen (preview + snooze choice); gratitude notifications always reflect today's journal state; 5-step onboarding with exact-alarm setup screen; startup error handling with retry; custom affirmations tracked separately (Start fresh deletes custom, keeps built-in); privacy policy accessible from Settings; notifications cleared on reset; pre-release audit fixes (dot indicators, null guards, dead code removal) |
| 1.0.21 | Stale affirmation notifications open in review-only mode (no streak credit); gratitude notification routing based on today's journal state |
| 1.0.20 | Notification cold-start fix; lock screen / notification bar tap navigates directly to correct screen; filled heart icons; stats cards navigate to weekly recap; single breathing instruction per phase |
| 1.0.19 | Gratitude row time-gating; affirmation row locking before window; auto-miss on window close; exact alarm scheduling; 7-day rolling DATE triggers |
| 1.0.13 | Initial closed testing release |
