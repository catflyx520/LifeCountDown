# Development Context

> Claude reads this automatically at session start. Last updated: 2026-04-27.

## Project

**Life Counter** (formerly Life Countdown) — React Native / Expo app with terracotta theme. Full onboarding + all screens complete and working. App slug: `life-counter`. Monogram: **L/C**.

## What's done

- Complete onboarding flow: Age → Mode → Manual or AI Quiz → Result → Main
- All 5 tabs: Dashboard, Figures, Capsule, Community, Settings
- AnimatedHourglass SVG component
- AI integration via Gemini (`gemini-2.5-flash`) in QuizScreen
- Full i18n (zh/en) via `useT()` — all screens fully translated including onboarding quotes, Dashboard quotes, Capsule unlock options, Community cohort/streaks
- AsyncStorage-based local state (`@lifecountdown/user`)
- Firebase client SDK (`firebase` package), initialized in `src/firebase.ts`
- Firestore seeded: 13 quotes, 12 figures (with `name_zh`), app_config/global
- FiguresScreen: live Firestore data, bilingual names + notes, sorted by died_age
- CommunityScreen: quotes section live from Firestore; cohort/streaks still static mock values
- Dev build working (`expo-dev-client`) — connect physical Android via Wireless Debugging

## Branding

- App name: **Life Counter**, monogram **L/C**
- Splash screen (`src/components/AppSplash.tsx`): SVG hourglass wordmark + "Life Counter" + "COUNT WHAT'S LEFT"
- Onboarding top bar: `L/C · v.01`
- Dashboard top bar: `L/C · {date}`
- Settings footer: `L/C · v1.0.0`
- App icons generated via `node scripts/generate-icons.js` → replaces `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `notification-icon.png`
- Icon generation uses `@resvg/resvg-js` (no compilation needed)

## Firebase setup

- `src/firebase.ts` — initializes from `EXPO_PUBLIC_FIREBASE_*` env vars, exports `db`
- `.env` has all keys (gitignored) — see `.env.example` for template
- `serviceAccount.json` in project root (gitignored) — admin SDK only, for seed scripts
- Firestore Security Rules: quotes/figures/app_config are read-only from client

## Notifications (`src/notifications.ts`)

- `expo-notifications` installed; plugin configured in `app.json` with white hourglass notification icon
- Works in dev build (`expo-dev-client`), NOT in Expo Go (SDK 53+ limitation)
- `rescheduleIfEnabled()` — reads user + lang from AsyncStorage, schedules daily notification
- Notification format (matches LC design):
  - **title**: short stat hook (e.g. "12,045 days left." / "人生进度 33.2%。")
  - **body**: 1-2 sentences, clean and direct
  - **quote**: appended at bottom as `"..." — AUTHOR`
- 8 templates × 2 languages, date-seeded random (same message all day)
- Settings: toggle On/Off + hour picker (7-21) + "发送测试通知" test button (fires in 2s)

## Daily quote rotation (`src/storage.ts`)

- `getDailyQuoteIndex(total)` — stores `{ date, index }` in `@lifecountdown/daily-quote`
- DashboardScreen uses this for daily random quote

## Home Screen Widgets (`src/widgets/`)

- Library: `react-native-android-widget` (requires dev build)
- 3 widgets registered in `app.json`:
  - `DeathCounterWidget` (4×2): L/C monogram, days, months, life progress bar, daily quote
  - `YearWidget` (2×2): day of year / 365 + progress bar
  - `TodayWidget` (2×2): today's % used + progress bar
- Task handler: `src/widgets/widgetTaskHandler.ts`
- **To add widgets:** long-press home screen → Widgets → search "L/C" or "Life Counter"

## Daily message util (`src/utils/dailyMessage.ts`)

- `buildDailyMessage(user, lang, quote?)` → `{ title, body }`
- Used by both notifications and test button

## What to do next

1. Test widgets on physical device after `npx expo run:android`
2. Test notifications: Settings → Daily Reminder ON → send test → go to home screen
3. Community STREAKS and cohort values — replace with real data once Firebase Auth exists
4. Decide on Firebase Auth (real user accounts) vs staying anonymous
5. `@anthropic-ai/sdk` in dependencies, not yet wired up
