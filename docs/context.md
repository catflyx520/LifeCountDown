# Development Context

> Claude reads this automatically at session start. Last updated: 2026-04-25.

## Project

React Native / Expo life-countdown app with terracotta theme. Full onboarding + all screens complete and working.

## What's done

- Complete onboarding flow: Age → Mode → Manual or AI Quiz → Result → Main
- All 5 tabs: Dashboard, Figures, Capsule, Community, Settings
- AnimatedHourglass SVG component
- AI integration via Gemini (`gemini-2.5-flash`) in QuizScreen
- Full i18n (zh/en) via `useT()` — returns `{ s, lang, setLang }`. All screens fully translated including Dashboard quotes, Capsule unlock options, Community cohort/streaks
- AsyncStorage-based local state (`@lifecountdown/user`)
- Firebase client SDK (`firebase` package), initialized in `src/firebase.ts`
- Firestore seeded: 13 quotes, 12 figures (with `name_zh`), app_config/global
- FiguresScreen: live Firestore data, bilingual names + notes, sorted by died_age, uses `passedAt()` i18n
- CommunityScreen: quotes section live from Firestore; COHORT/STREAKS translated but still static mock values
- Splash screen (`src/components/AppSplash.tsx`): draining hourglass + "life count down", covers app from first frame, fades out 1.5s after fonts load

## Firebase setup

- `src/firebase.ts` — initializes from `EXPO_PUBLIC_FIREBASE_*` env vars, exports `db`
- `.env` has all keys (gitignored) — see `.env.example` for template
- `serviceAccount.json` in project root (gitignored) — admin SDK only, for seed scripts
- Firestore Security Rules: quotes/figures/app_config are read-only from client (update rules if needed)

## Notifications (`src/notifications.ts`)

- `expo-notifications` installed; plugin added to `app.json`
- `rescheduleIfEnabled()` — reads user + lang from AsyncStorage, picks daily quote, schedules
- `requestPermission()`, `cancelDaily()` also exported
- `setNotificationHandler` called at module level (shows alert, no sound)
- Notification content: quote + stats (days left, life %, yrs/mo remaining), bilingual
- Trigger: `SchedulableTriggerInputTypes.DAILY` at user-selected hour (default 9:00)

## Daily quote rotation (`src/storage.ts`)

- `getDailyQuoteIndex(total)` — stores `{ date, index }` in `@lifecountdown/daily-quote`; picks new random index if date changes
- DashboardScreen uses this instead of `days % quotes.length`

## Settings screen notifications card

- Toggle (Off/On) → requests permission on first enable
- Hour picker: 7, 8, 9, 10, 12, 20, 21 — tapping reschedules immediately
- Permission denied message shown if user rejects

## Known Expo Go limitation

`expo-notifications` local scheduled notifications do NOT work in Expo Go on Android (SDK 53+). All notification calls are wrapped in try-catch so the app doesn't crash — the Settings toggle UI works but notifications won't actually fire. To test notifications properly, a **development build** (`expo-dev-client`) is required.

## What to do next

1. Community STREAKS and cohort values — replace with real aggregate data once Firebase Auth + users exist
2. Decide on Firebase Auth (real user accounts) vs staying anonymous
3. `@anthropic-ai/sdk` in dependencies, not yet wired up
4. To test notifications: build a dev build with `expo-dev-client`
