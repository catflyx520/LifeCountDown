# Development Context

> Claude reads this automatically at session start. Last updated: 2026-04-22.

## Project

React Native / Expo life-countdown app with terracotta theme. Full onboarding + all screens complete and working.

## What's done

- Complete onboarding flow: Age → Mode → Manual or AI Quiz → Result → Main
- All 5 tabs: Dashboard, Figures, Capsule, Community, Settings
- AnimatedHourglass SVG component
- AI integration via Gemini (`gemini-2.5-flash`) in QuizScreen
- i18n support (zh/en) via `useT()` hook which returns `{ s, lang, setLang }`
- AsyncStorage-based local state (`@lifecountdown/user`)
- Firebase client SDK installed (`firebase` package), initialized in `src/firebase.ts`
- Firestore seeded: 13 quotes, 12 figures, app_config/global
- **FiguresScreen**: live Firestore data, bilingual notes, sorted by died_age
- **CommunityScreen**: COHORT/STREAKS still static mock; quotes section now live from Firestore

## Firebase setup

- `src/firebase.ts` — initializes app from `EXPO_PUBLIC_FIREBASE_*` env vars, exports `db`
- `.env` has all Firebase keys (gitignored)
- `serviceAccount.json` in project root (gitignored) — used only for seed scripts
- Seed scripts: `node scripts/seed.js` (quotes + figures), `node scripts/seed-users.js` (users template)

## What to do next

1. Test FiguresScreen and CommunityScreen on device/emulator with `npx expo start --clear`
2. Decide on Community STREAKS and ANON_LETTERS: replace with real user aggregate data, or keep mock until users exist?
3. Decide: add Firebase Auth for real user accounts?
4. `@anthropic-ai/sdk` is in dependencies but not wired up — future use TBD
