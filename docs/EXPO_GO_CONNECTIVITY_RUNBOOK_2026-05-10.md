# Expo Go Connectivity Runbook — 2026-05-10

Owner: Forgehand  
Purpose: non-overlapping engineering support artifact for keeping real-device iPhone validation moving when Expo Go/tunnel links fail. No app behavior, balance, dependencies, live config, or Discord structure changed.

## Why This Exists

Today’s validation loop hit Expo Go connectivity friction:

- Expo tunnel produced `ERR_NGROK_3200` even after a clean tunnel restart.
- Switching to LAN mode produced a usable LAN URL: `exp://192.168.1.183:8081`.
- Current validation depends on fast iPhone checks for dragon-presence changes.

This runbook gives the crew a consistent read-only triage path before interrupting Topnotch or changing implementation files.

## Current Project Connectivity Shape

Inspected files:

- `package.json`
- `app.json`
- `README.md`

Relevant project facts:

- Expo SDK: `~54.0.0`
- Expo Go compatible dependencies remain in `package.json`.
- Start scripts:
  - `npm start` → `expo start`
  - `npm run iphone` → `expo start --tunnel`
  - LAN mode can be started manually with `npx expo start --lan --clear` / `npx.cmd expo start --lan --clear`.
- `app.json` bundles all assets with `assetBundlePatterns: ["**/*"]`, so large added art can affect startup/load time.
- Current local check found something listening on port `8081`:
  - `:::8081 Listen PID=30612`

## Safe Read-Only Checks

Before restarting anything, an engineering agent may run:

```powershell
npm.cmd run typecheck
```

```powershell
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
```

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue
```

These checks do not change the app or live config.

## Recommended Triage Flow

### If Expo Go shows `ERR_NGROK_3200`

Likely cause: stale/expired ngrok tunnel URL or ngrok relay issue.

Recommended path:

1. Prefer LAN mode for same-Wi-Fi iPhone validation.
2. Ask Topnotch to close/reopen Expo Go before scanning the fresh QR.
3. Confirm phone and laptop are on the same Wi-Fi/network.
4. If LAN fails, suspect Windows firewall or network isolation before code issues.

### If LAN mode does not connect

Check:

- Is Metro/Expo listening on port 8081?
- Is the iPhone on the same Wi-Fi as the laptop?
- Is the LAN URL using the current laptop IP?
- Did Windows Firewall prompt for Node/Metro access?
- Is VPN/hotspot/client isolation blocking local device access?

### If the app connects but does not reflect new art/code

Recommended path:

1. Use a clear-cache Expo start command next time:
   - `npx.cmd expo start --lan --clear`
2. Fully close/reopen Expo Go on iPhone.
3. Confirm `npm.cmd run typecheck` still passes.
4. If asset changes are involved, assume cache first before changing code.

## Agent Boundaries

Forgehand may:

- inspect package/config/readme files;
- run `npm.cmd run typecheck`;
- check whether port 8081 is listening;
- document current Expo Go risks and next proof gates.

Forgehand should not:

- stop/restart active Expo servers unless explicitly assigned;
- edit app implementation files owned by Pyraxis;
- alter firewall, live OpenClaw config, Discord routing, dependencies, or public structure.

## Suggested Validation Prompt

When Pyraxis has a candidate open in Expo LAN mode, ask Topnotch:

> Please close Expo Go, reopen it, then scan the fresh LAN QR. If it fails, tell us whether the error is ngrok/tunnel, cannot connect to 192.168.1.183:8081, or a red app error screen.

## Recommended Next Proof Gate

- `npm.cmd run typecheck` after code/art import changes.
- Real iPhone Expo Go smoke test for any visual-feel change.
- For connectivity failures, capture the exact Expo Go error string before changing app code.

## Result

Docs-only runbook produced. No Pyraxis-owned active implementation files were modified.
