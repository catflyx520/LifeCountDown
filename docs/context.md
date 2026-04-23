# Development Context

> Paste this file to Claude at the start of a new session to resume where we left off.

## Project

React Native / Expo life-countdown app with terracotta theme. Full onboarding + all screens are complete and working.

## What's done (fully built)

- Complete onboarding flow: Age → Mode → Manual or AI Quiz → Result → Main
- All 5 tabs: Dashboard, Figures, Capsule, Community, Settings
- AnimatedHourglass SVG component
- AI integration via Gemini (`gemini-2.5-flash`) in QuizScreen — returns targetAge, confidence, feedback
- i18n support (zh/en)
- AsyncStorage-based local state (`@lifecountdown/user`)
- `@anthropic-ai/sdk` is in dependencies but not yet wired up anywhere (future use)

## What's in progress — Firebase integration

- `firebase-admin` added as devDependency in `package.json`
- `scripts/seed.js` — seeds Firestore `quotes` collection with bilingual stoic quotes (en/zh), fields: text{en,zh}, author, source, type, tags, active, weight
- `scripts/seed-users.js` — seeds Firestore `users` collection with a `_template` document structure for future real user sign-ups
- `serviceAccount.json` is gitignored (credentials file, never committed)

## CommunityScreen current state

All data is **hardcoded mock** right now:
- `COHORT` — static stats (avg life expectancy, sleep, screen time, exercise)
- `STREAKS` — fake percentages (94%, 61%, 38%, 12%)
- `ANON_LETTERS` — 4 hardcoded fake capsule previews
- Footer shows "mock preview" note

## What to do next

1. Get `serviceAccount.json` from Firebase console and place it in project root (gitignored)
2. Run `node scripts/seed.js` to populate Firestore quotes collection
3. Run `node scripts/seed-users.js` to create users collection template
4. Wire CommunityScreen to real Firestore data — replace hardcoded arrays with live queries
5. Decide: add Firebase Auth for real user accounts, or keep anonymous?
