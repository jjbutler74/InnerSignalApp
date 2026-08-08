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
→ **No**

InnerSignal stores app data locally in SQLite and does not transmit it to the developer or third parties. It has no backend, analytics SDK, advertising SDK, or crash-reporting SDK. Android may include app data in its standard encrypted backup when the user has device backup enabled; this is an operating-system service controlled by the user. Confirm the final Data Safety answers against the production AAB and Google Play's current system-service guidance before submission.

If Play Console still prompts for a security practices section:
- **Is data encrypted in transit?** → N/A / not applicable, no data is transmitted
- **Can users request data deletion?** → Yes — Settings → "Start fresh" erases journal entries, completion history, preferences, favorites, seen counts, and custom affirmations. Built-in affirmation packs remain. Uninstalling removes the app's local data; Android may retain a backup if device backup is enabled.

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
