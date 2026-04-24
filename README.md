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

Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

Then edit `.env`:
- `EXPO_PUBLIC_GEMINI_API_KEY` — get from [Google AI Studio](https://aistudio.google.com)
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` — get from [Anthropic Console](https://console.anthropic.com)
- Firebase keys are already filled in `.env.example`

**3. Start**
```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

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
