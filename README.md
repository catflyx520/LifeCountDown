# LifeCountDown

A React Native / Expo app that counts down your life.

## Prerequisites

- Node.js
- Expo Go app on your phone (or Android/iOS emulator)

## Setup

**1. Clone and install**
```bash
git clone https://github.com/catflyx520/LifeCountDown.git
cd LifeCountDown
npm install
```

**2. Create `.env`**

Copy `.env.example` to `.env` and fill it in:
```bash
cp .env.example .env
```

Then edit `.env`:
- `EXPO_PUBLIC_FIREBASE_*` — your Firebase web config
- `EXPO_PUBLIC_ESTIMATE_API_URL` — address of the estimate endpoint (optional, see [AI estimate](#ai-estimate-server-side))

Never put an AI API key in an `EXPO_PUBLIC_` variable. Those are compiled into the app and the web page, where anyone can read them.

**3. Start**
```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

## AI estimate (server side)

The quiz asks `api/estimate.mjs` for the estimate. It runs as a Vercel Function and is the only place that holds the Gemini key.

1. In the Vercel project settings, add the environment variable `GEMINI_API_KEY` (no `EXPO_PUBLIC_` prefix), then redeploy.
2. Set `EXPO_PUBLIC_ESTIMATE_API_URL` to `https://<your-site>/api/estimate` for the web build and for the Android build.

Without the endpoint the app uses its built-in basic estimate.

## Firebase (seed data)

If Firestore is empty, run the seed scripts to populate quotes and figures:

1. Download `serviceAccount.json` from Firebase Console → Project Settings → Service accounts → Generate new private key
2. Place it in the project root (it's gitignored)
3. Run:
```bash
node scripts/seed.js
node scripts/seed-users.js
```

## Useful commands

```bash
npx expo start --clear     # Clear Metro cache (run after .env changes)
npx expo start --android   # Android emulator
npx expo start --ios       # iOS simulator
npx tsc --noEmit           # Type check
```
