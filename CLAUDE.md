# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session continuity (IMPORTANT — follow every session)

**At the start of every session:** Read `docs/context.md` immediately. It contains the current development state, what's done, and what's next. Do not wait for the user to ask.

**After every git commit:** Update `docs/context.md` to reflect current state and what comes next, then run:
```bash
git add docs/context.md && git commit -m "docs: update context" && git push
```
Do this automatically — do not wait for the user to ask.

**After every code change:** Run `npx expo start --clear` in the background to verify no runtime errors appear in the Metro bundler output. Check for red error screens or bundle failures before reporting the task as done. Do not wait for the user to ask.

## Commands

```bash
npx expo start          # Start dev server (opens QR for Expo Go)
npx expo start --android
npx expo start --ios
npx expo start --clear  # Clear Metro cache (required after .env changes)
npx tsc --noEmit        # Type-check without building
```

There are no tests. There is no linter configured.

## Environment

`.env` is gitignored. Set your Gemini key:
```
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

The `EXPO_PUBLIC_` prefix is required by Expo to expose env vars to the JS bundle. After changing `.env`, always restart with `--clear`.

## Architecture

**Entry:** `index.ts` → `App.tsx` (loads Google Fonts, wraps with `GestureHandlerRootView` + `SafeAreaProvider`) → `src/navigation/index.tsx`

**Navigation — two layers:**
- Root Stack (`RootStackParamList`): Onboarding → Age → Mode → Manual | Quiz → Main → Hourglass
- Bottom Tab (`MainTabParamList`): Dashboard · Figures · Capsule · Community · Settings

Navigation reads AsyncStorage on startup and skips to `Main` if setup is complete (`mode !== null && daysLeft > 0`). Onboarding flow resets to `Main` on completion (`navigation.reset`). `SettingsScreen` can navigate back into `Age`, `Manual`, or `Quiz` to update profile data.

**State — all local:**
- Single AsyncStorage key `@lifecountdown/user` stores the entire `UserData` object (see `src/types.ts`)
- `loadUser()` / `saveUser(partial)` in `src/storage.ts` — `saveUser` merges into existing data, never overwrites wholesale
- Screens reload on focus via `useFocusEffect(useCallback(() => { loadUser().then(...) }, []))`
- **Never use `async` directly in `useFocusEffect`** — it returns a Promise which React Navigation rejects. Use `.then()` instead.

**Theme (`src/theme.ts`):**
- Terracotta palette: `bg #eadfc3`, `surface #f5ecd6`, `fg #3a2e1e`, `accent #b5533c`, `accentFg #f5ecd6`
- Font family name constants (`fonts.serif`, `fonts.serifItalic`, `fonts.body`, `fonts.mono`, etc.) match the `@expo-google-fonts` export names exactly — loaded in `App.tsx`

**Key data flow:**
- `UserData.age` is the integer age entered during onboarding OR derived from `birthdate` via `ageFromBirthdate()`
- `UserData.daysLeft` is pre-computed via `computeDaysLeft(age, targetAge)` and stored — not recalculated live
- `UserData.mode` is `'manual'` or `'ai'`; `confidence` is only meaningful when `mode === 'ai'`
- `capsules: Capsule[]` is stored inline on `UserData`

**Hourglass SVG (`src/components/AnimatedHourglass.tsx`):**
Single unified component used everywhere. Key props:
- `fillPct` (0–1) — how full the top chamber is; 1 = life just started, 0 = all sand at bottom
- `animate` — enables falling grain animation (independent `setInterval` at 16ms)
- `drain` — continuously depletes top→bottom in a loop (Onboarding demo mode)
- `cycleMs` — drain cycle duration (only when `drain=true`)
- `grainMs` — duration of one grain fall cycle (default 1200ms)

Sizes in use: Onboarding=88, Dashboard=110, Result pages=130, HourglassScreen=260.

**Countdown hook (`src/hooks/useCountdown.ts`):**
Returns live `HH:MM:SS` string counting down to midnight. Used in DashboardScreen and both result pages.

**User flow — onboarding:**
1. Age screen (drag or birthday picker)
2. Mode screen (Manual or AI)
3. Manual: pick target age → name input → result summary → Main
4. AI: 6 lifestyle questions → medical conditions input → AI loading → name input → result summary → Main

**Result summary pages** (both Manual and AI) show: hourglass animation, target age, days/months/years remaining, live midnight countdown, quote or AI feedback.

**AI integration (`src/screens/QuizScreen.tsx`):**
- Model: `gemini-2.5-flash` via `@google/generative-ai`
- Prompt includes age, lifestyle answers, optional medical conditions, optional name
- Returns JSON `{ targetAge, confidence, feedback }` parsed via regex `/{[\s\S]*?}/`
- Falls back to `targetAge: 82, confidence: 70` on any error

**Nested ScrollView on Android:**
Birthday drum pickers in `AgeScreen` are vertical ScrollViews inside a vertical outer ScrollView. Fix: outer ScrollView has `scrollEnabled={outerScroll}` state; `onTouchStart` on the drum container sets it `false`, `onTouchEnd`/`onTouchCancel` restores it. Also add `nestedScrollEnabled` to each drum ScrollView.
