# Development Context

> Claude reads this automatically at session start. Last updated: 2026-04-23.

## Project

React Native / Expo life-countdown app with terracotta theme. Full onboarding + all screens complete and working.

## What's done

- Complete onboarding flow: Age → Mode → Manual or AI Quiz → Result → Main
- All 5 tabs: Dashboard, Figures, Capsule, Community, Settings
- AnimatedHourglass SVG component
- AI integration via Gemini (`gemini-2.5-flash`) in QuizScreen
- i18n support (zh/en) via `useT()` hook which returns `{ s, lang, setLang }`
- AsyncStorage-based local state (`@lifecountdown/user`)
- Firebase client SDK (`firebase` package), initialized in `src/firebase.ts`
- Firestore seeded: 13 quotes, 12 figures, app_config/global
- FiguresScreen: live Firestore data, bilingual notes, sorted by died_age
- CommunityScreen: quotes section live from Firestore; COHORT/STREAKS still static mock
- Splash screen (`src/components/AppSplash.tsx`): draining hourglass + "life count down" text, fades out 1.5s after fonts load

## Firebase setup

- `src/firebase.ts` — initializes from `EXPO_PUBLIC_FIREBASE_*` env vars, exports `db`
- `.env` has all keys (gitignored) — see `.env.example` for template
- `serviceAccount.json` in project root (gitignored) — admin SDK only, for seed scripts
- Firestore Security Rules: quotes/figures/app_config are read-only from client

## What to do next

1. Test app on device/emulator: `npx expo start --clear`
2. Community STREAKS and anonymous capsules — replace with real user data once Auth is added
3. Decide on Firebase Auth (real user accounts) vs staying anonymous
4. `@anthropic-ai/sdk` in dependencies, not yet wired up
