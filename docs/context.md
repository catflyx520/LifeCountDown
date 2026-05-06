# Development Context

> Claude reads this automatically at session start. Last updated: 2026-05-05.

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
- 6 templates × 2 languages in `src/utils/dailyMessage.ts`, date-seeded random
- Templates no longer include daysLeftInMonth (removed — now shown as Dashboard stat)
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
- 6 templates per language (was 8; removed 2 that referenced daysLeftInMonth)

## Dashboard (latest state)

- Top bar: `L/C · {date}`
- Greeting (name inline)
- Hourglass + countdown hero
- Age card: you are X yrs | target or next birthday
- Stats card: Days left in month / Year progress / Life progress (3 StatRows with inline bars)
- Today's note card (daily message from `buildDailyMessage`)
- Time Capsules card: label + `lettersToSelf` sub + big count number (moved from Settings)
- Links: Hourglass →, Widget Preview →

## Large number lineHeight fixes (onboarding clipping)

All large serif numbers had `fontSize === lineHeight` which clipped the top. Fixed:
- `AgeScreen` bigNumber: `lineHeight: 132` (fontSize 120)
- `ManualScreen` bigTarget: `lineHeight: 112` (fontSize 100)
- `ManualScreen` bigAge: `lineHeight: 82` (fontSize 72)
- `QuizScreen` bigAge: `lineHeight: 82` (fontSize 72)

## EAS / Google Play publish setup (in progress)

- EAS CLI installed, logged in
- `eas.json` created (production profile, `app-bundle`)
- EAS Secrets uploaded: all 8 `EXPO_PUBLIC_*` env vars
- Google Play Developer account: registration in progress (payment pending)
- Next step: run `eas build --platform android --profile production` once Play account is ready
- Then: upload AAB to Google Play Console → Internal testing track

## What to do next

1. **Check-in feature** (designed, not yet built) — new tab replacing Figures:
   - Monthly calendar view (mark checked-in days)
   - Daily form: mood selection + satisfaction rating (1–5) + intention text input
   - Data stored as `checkins: CheckIn[]` on `UserData`
   - `CheckIn = { date: string, mood: string, rating: number, intention: string }`
   - Dashboard gets a "Check in →" button linking to the tab

2. **Community screen refactor** — add Quotes/Figures tab switcher:
   - Top tabs: Quotes | Figures
   - Figures content moved from FiguresScreen into Community
   - Figures tab removed from bottom navigation

3. Community STREAKS and cohort values — replace with real data once Firebase Auth exists
4. Decide on Firebase Auth (real user accounts) vs staying anonymous
5. `@anthropic-ai/sdk` in dependencies, not yet wired up
