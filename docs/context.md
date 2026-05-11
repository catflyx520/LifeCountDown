# Development Context

> Claude reads this automatically at session start. Last updated: 2026-05-04.

## Project

**Life Counter** (formerly Life Countdown) — React Native / Expo app with terracotta theme. Full onboarding + all screens complete and working. App slug: `life-counter`. Monogram: **L/C**.

## What's done

- Complete onboarding flow: Age → Mode → Manual or AI Quiz → Result → Main
- All 5 tabs: Dashboard, Check-in, Capsule, Community, Settings
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

## EAS / Google Play publish setup (ON HOLD — resume after check-in feature)

- EAS CLI installed, logged in
- `eas.json` created (production profile, `app-bundle`)
- EAS Secrets uploaded: all 8 `EXPO_PUBLIC_*` env vars
- Google Play Developer account: ✅ approved
- AAB build: triggered via `eas build --platform android --profile production` (may be ready)
- Play Console app created: "Life Counter", store listing partially filled
- **Remaining**: upload AAB → Internal testing track, add screenshots, finish store listing

## Check-in feature (COMPLETE)

Full check-in system shipped:

- **`src/types.ts`** — `CheckIn` interface + `checkins: CheckIn[]` on `UserData`; `MainTabParamList` replaced `Figures` with `CheckIn`
- **`src/storage.ts`** — `checkins: []` in `defaultUser`
- **`src/screens/CheckInScreen.tsx`** — monthly calendar (mood emoji per cell), mood picker (5 emoji), 5-star rating, intention textarea (200 char), streak counter, save/update/saved states, all dates editable
- **`src/screens/CommunityScreen.tsx`** — Quotes/Figures tab switcher; Figures content (Firestore query, ratio bars, bilingual) moved in from former FiguresScreen
- **`src/navigation/index.tsx`** — `CheckIn` tab replaces `Figures`; `TabIcon` map updated
- **`src/screens/DashboardScreen.tsx`**:
  - Check-in card (not-yet state only): shows below hourglass when not yet checked in today
  - After check-in: card hidden; accent ✓ badge appears to the right of greeting (taps to CheckIn screen)
  - "Days left in month" stat replaces "Today used"
  - Time Capsules card moved from Settings (identical layout)

## Capsule letter opening experience (COMPLETE)

Full ceremonial reveal implemented in `src/screens/CapsuleDetailModal.tsx`:

- **Phase 1 — Sealed view**: dark background (`#1a1410`), 3 concentric pulsing rings (RN Animated loop), seal monogram, `"A letter from past you."` hero text, `"Open Seal →"` button
- **Phase 2 — Ritual**: 24 particles fly from screen edges to center (RN `Animated.ValueXY`), bloom circle expands + fades after 1800ms, skip button fades in at 800ms, auto-advances to letter at 2600ms
- **Phase 3 — Letter**: same dark bg (`#1a1410`) as sealed/ritual, `FadeIn` entrance (Reanimated), metadata grid (sealed date / days waited / age / days then) with dark cells (`#2a1f15`), word-by-word reveal via `FadeInDown.delay(i*28)`, cream text palette
- **Actions**: "Keep on shelf" closes modal; "Burn the letter" shows `Alert.alert` confirmation then deletes capsule from storage via `onBurn` prop
- **CapsuleScreen**: unlocked capsule items now tappable (`Pressable`) → opens modal; full `UserData` loaded on focus; `burnCapsule` handler filters + saves + closes modal

## What to do next

1. Community STREAKS and cohort values — replace with real data once Firebase Auth exists
2. Decide on Firebase Auth (real user accounts) vs staying anonymous
3. `@anthropic-ai/sdk` in dependencies, not yet wired up
4. **Google Play publish** (ON HOLD): upload AAB → Internal Testing track, screenshots, finish store listing
