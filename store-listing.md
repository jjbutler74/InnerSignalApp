# Play Store Listing — InnerSignal

## App title (max 30 chars)
InnerSignal

## Short description (max 80 chars)
Three daily affirmations. One evening gratitude. Nothing to scroll.

(67 characters)

## Full description (max 4000 chars)

InnerSignal is a quiet daily practice, not another feed to scroll.

Three affirmations land at the times you choose — morning, midday, evening — each one a steady reminder you read and breathe through, not skim past. At night, one simple prompt: what are you grateful for today? One thing, or three. That's it.

WHAT'S INSIDE
• Three daily affirmations, timed to your own schedule
• A guided breathing moment with each one
• An evening gratitude practice — 1 to 3 things, your choice
• A streak that tracks honest daily completion, not just app opens
• A weekly mood recap so you can see the shape of your week
• A growing affirmation library, with favorites you can build your own pack from

PRIVATE BY DESIGN
Your practice is private. InnerSignal has no accounts, backend, analytics, crash reporting, or ads. Your entries are stored locally and may be included in Android's encrypted device backup if you have backup enabled. InnerSignal cannot access them.

InnerSignal isn't trying to hold your attention. It's trying to give some of it back.

## Release notes — v1.0.27 (this submission)
InnerSignal's first public release: three scheduled daily affirmations, guided breathing moments, an evening gratitude journal, customizable affirmation styles, streaks, and a weekly mood recap. Your practice stays private, with no accounts, ads, or analytics.

---

# Data Safety form (Play Console → App content → Data safety)

**Does your app collect or share any of the required user data types?**
→ **Yes** (limited — automatically collected by the bundled Firebase SDK; not collected or used by the developer)

InnerSignal itself has no backend, analytics SDK, advertising SDK, or crash-reporting SDK, and does not transmit user data. However, the expo-notifications library bundles the Firebase Cloud Messaging (FCM) SDK, which auto-initializes on every Android app launch and transmits a small amount of data to Google's Firebase servers. You must disclose this in the Play Console Data Safety form.

**Device or other IDs**
- **Collected:** Yes — Firebase generates a per-installation identifier (Firebase Installation ID, a UUID) on first launch and sends it to Firebase servers on subsequent launches for token refresh.
- **Shared with third parties:** Yes — Google (Firebase infrastructure). InnerSignal's developer cannot access this data.
- **Purpose:** App functionality — required by the bundled notification library infrastructure.
- **Optional / can users opt out?** No — this happens automatically at app startup.

**App info and performance**
- **Collected:** Yes — Firebase sends the app version number and Android platform identifier alongside the Installation ID.
- **Shared with third parties:** Yes — Google (Firebase infrastructure).
- **Purpose:** App functionality.
- **Optional / can users opt out?** No.

**Security practices section:**
- **Is data encrypted in transit?** → Yes — Firebase SDK uses TLS for all server communication.
- **Can users request data deletion?** → Yes — Settings → "Start fresh" erases all InnerSignal-controlled data (journal entries, completion history, preferences, favorites, seen counts, and custom affirmations). Built-in affirmation packs remain. Firebase Installation IDs can be reset by uninstalling the app. Uninstalling also removes all locally stored data; Android may retain a backup copy if device backup is enabled.

**Note for a future release:** Firebase data collection can be suppressed by adding `firebase_data_collection_default_enabled = false` to the Android manifest. InnerSignal uses only locally-scheduled notifications (not FCM push), so local notification delivery would not be affected. This would allow the Data Safety form to revert to "No" in v1.0.28.

---

# Content rating questionnaire (IARC, via Play Console → App content → Content rating)

Expected answers for every category — confirm these match as you click through:
- Violence: None
- Sexual content / nudity: None
- Profanity / crude humor: None
- Controlled substances (alcohol/tobacco/drugs): None referenced
- Gambling: None
- User-generated content shared with others: **No** — gratitude journal entries are private and local-only, never shared with or visible to other users
- Location sharing: No
- Personal info shared with third parties: No

Expected result: lowest tier rating (Everyone / 3+ equivalent per region).

---

# App content declarations (Play Console → App content)

- **Privacy policy URL**: https://github.com/jjbutler74/InnerSignalApp/blob/master/PRIVACY.md
- **Ads**: No ads
- **Target audience / age**: General audience (not primarily directed at children)
- **News app**: No
- **COVID-19 app**: No
- **Data safety**: see above
- **Health apps declaration**: Stress Management, Relaxation, Mental Acuity
- **Government app**: No
- **Financial features**: No

---

# Category & pricing

- **App category suggestion**: Health & Fitness, or Lifestyle (either fits; Health & Fitness tends to get more relevant discovery for wellness/affirmation apps)
- **Pricing**: Free
- **Countries**: All countries, or restrict to your actual target markets if you'd rather start narrow

---

# Release track recommendation

Upload the AAB to **Internal testing** first, not Production. That lets you install it via the Play Store mechanism (not just adb) and verify the listing/store page itself before it's ever public. Promote to Production once you're satisfied.
