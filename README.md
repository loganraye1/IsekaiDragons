# Isekai Dragons

Expo React Native idle dragon RPG prototype.

## Run Locally

Install dependencies, then start Expo:

```bash
npm install
npm start
```

Useful scripts:

```bash
npm run typecheck
npm run ios
npm run android
npm run web
```

## Test In Expo Go

Start the tunnel server:

```bash
npm run iphone
```

Open Expo Go on a device and scan the QR code from the terminal or browser dev tools. Use the in-app Settings panel for save export/import, reduced motion, haptics, and number formatting checks.

## Production Build Later

This project is Expo Go compatible today. For a closed TestFlight-style build later, set up EAS Build, confirm the `ios.bundleIdentifier` and `ios.buildNumber` in `app.json`, then create an iOS build:

```bash
npx eas build --platform ios
```

Before submitting, run:

```bash
npm run typecheck
npx expo-doctor
```

## Balance Values

Game tuning lives in `src/balance.ts` under the `BALANCE` object. It controls evolution costs, upgrade pricing/scaling, quest reward scaling, enemy HP scaling, drop rates, and reincarnation constants.

Current balance version: `0.1.0`.

The first 15-minute target balance is stable and should stay frozen until real device playtesting. Expected result: Drake, Ember Woods, about 8-12 defeats, 1 treasure, 0-1 equipment, and Rebirth locked.

## Art Status

The Fire, Water, and Earth hatchlings in `assets/dragons/` are production-approved for the current visual direction. Use them as the continuity reference before generating Drakes so each evolution feels like the same companion growing up.
