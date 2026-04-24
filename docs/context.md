# Development Context

> Claude reads this automatically at session start. Last updated: 2026-04-23.

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

## What to do next

1. Test all screens on device — `npx expo start --clear`
2. Community STREAKS and cohort values — replace with real aggregate data once Firebase Auth + users exist
3. Decide on Firebase Auth (real user accounts) vs staying anonymous
4. `@anthropic-ai/sdk` in dependencies, not yet wired up
