# Development Context

> Claude reads this automatically at session start. Last updated: 2026-04-28.

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
- Dev build working (`expo-dev-client`) — connect physical Android via Wireless Debugging (`adb pair` first, then `adb connect`)

## Branding

- App name: **Life Counter**, monogram **L/C**
- Splash screen (`src/components/AppSplash.tsx`): SVG hourglass wordmark + "Life Counter" + "COUNT WHAT'S LEFT"
- Onboarding top bar: `L/C · v.01`
- Dashboard top bar: `L/C · {date}`
- Settings footer: `L/C · v1.0.0`
- App icons generated via `node scripts/generate-icons.js` using `@resvg/resvg-js`
  - `assets/icon.png` — 1024×1024 with rounded bg
  - `assets/adaptive-icon.png` — 1024×1024 foreground only
  - `assets/notification-icon.png` — 96×96 white hourglass

## Firebase setup

- `src/firebase.ts` — initializes from `EXPO_PUBLIC_FIREBASE_*` env vars, exports `db`
- `.env` has all keys (gitignored) — see `.env.example` for template
- `serviceAccount.json` in project root (gitignored) — admin SDK only, for seed scripts
- Firestore Security Rules: quotes/figures/app_config are read-only from client

## Notifications (`src/notifications.ts`)

- `expo-notifications` installed; plugin configured in `app.json` with white hourglass notification icon
- Works in dev build (`expo-dev-client`), NOT in Expo Go (SDK 53+ limitation)
- Notification format: title (stat hook) + body (1-2 sentences) + quote at bottom
- 8 templates × 2 languages in `src/utils/dailyMessage.ts`, date-seeded random
- Settings: toggle On/Off + hour picker (7-21) + test button (fires in 2s)

## Home Screen Widgets (`src/widgets/`)

- Library: `react-native-android-widget` (requires dev build, not Expo Go)
- 3 widgets registered in `app.json`
- **Architecture**: each widget file exports TWO versions:
  - `DeathCounterWidget` / `YearWidget` / `TodayWidget` — Android widget renderer (FlexWidget/TextWidget)
  - `DeathCounterPreview` / `YearPreview` / `TodayPreview` — in-app preview (View/Text)
  - Both share the same `C` constants object (`as const`) — change one value, both update
- **Key fixes learned**:
  - All inner FlexWidget rows need `width: 'match_parent'` or `flex: 1` spacers won't work
  - Empty FlexWidget children used as color fills need `height: 'match_parent'` — without it Android `wrap_content` = 0 and colors are invisible
  - `justifyContent: 'space-between'` pushes sections to extremes — use sequential layout with explicit `marginBottom` instead
- **To debug widget**: use Widget Preview screen (Dashboard → "Widget Preview →") — shows live preview with real data
- **To update widget on device**: remove from home screen → re-add (hot reload doesn't refresh widgets)
- **To see config changes** (minHeight, etc.): must `npx expo run:android`

## Widget Preview Screen (`src/screens/WidgetPreviewScreen.tsx`)

- Accessible from Dashboard bottom: "Widget Preview →"
- Shows all 3 widgets using the `*Preview` components (same constants as real widgets)
- Use this to iterate on design before rebuilding

## Daily message util (`src/utils/dailyMessage.ts`)

- `buildDailyMessage(user, lang, quote?)` → `{ title, body }`
- Used by both notifications and test button

## What to do next

1. Widget bar visibility confirmed fixed — test on device by removing + re-adding widget
2. Adjust widget font sizes / layout via Widget Preview screen, then sync to widget components
3. Community STREAKS and cohort values — replace with real data once Firebase Auth exists
4. Decide on Firebase Auth (real user accounts) vs staying anonymous
5. `@anthropic-ai/sdk` in dependencies, not yet wired up
