# Fire Hatchling iPhone Validation Packet — 2026-05-10

Owner: Caldrin / Aurelith  
Purpose: make the current Fire hatchling layered-motion validation fast, focused, and decision-ready before any visible-combat implementation resumes.

## Recommendation

The next best step is **not more code yet**. The active code path already passes typecheck, and the remaining blocker is subjective iPhone feel validation.

Run one short Expo Go/iPhone check focused on the Fire hatchling layered-motion POC, then make the product decision:

- **Pass** → unlock the smallest read-only visible-combat slice from `docs/VISIBLE_COMBAT_INTEGRATION_MAP.md`.
- **Fail** → classify the failure and either reduce motion, request a manual art/seam pass, or park dragon-presence work temporarily.
- **Delayed** → keep work docs/audits only; avoid touching `App.tsx` until validation lands.

## Validation Setup

Use the normal Expo Go path for the current project state.

Suggested commands from project root:

```txt
npm run typecheck
npm run iphone -- --clear
```

If tunnel mode is unreliable, use the current LAN preference from `docs/HERMES_HANDOFF_PACKET.md`:

```txt
npx expo start --lan --clear
```

## Primary Validation Question

Ask immediately after viewing the Fire hatchling in the main den on iPhone:

> Does the Fire hatchling layered motion feel more alive without feeling too busy, sloppy, sticker-like, or like disconnected paper pieces?

## Quick Scoring Rubric

Score each item as **Pass / Borderline / Fail**.

1. **Companion feel** — the dragon feels more alive than the single cutout.
2. **Visual cohesion** — head, wings, body, and tail still read as one creature.
3. **Motion restraint** — movement is subtle, not distracting or floaty.
4. **Seams / ghosting** — no obvious gaps, halos, clipping, or semi-transparent overlay weirdness.
5. **Phone readability** — it looks good at actual iPhone size, not just desktop preview size.
6. **Reduced Motion** — reduced-motion/freeze behavior is calm and acceptable.
7. **Expo Go stability** — no red screen, obvious jank, or asset-load issue.

## Decision Rules

### Unlock visible combat if:

- Companion feel is **Pass**.
- Visual cohesion is **Pass** or only mildly **Borderline**.
- Motion restraint is **Pass**.
- No severe seams/ghosting or Expo Go stability issues appear.

Next implementation slice if unlocked:

- Add a small read-only visible enemy/HP presentation layer.
- Reuse existing `state.autoBattle` data and existing enemy cutouts.
- Do **not** change combat math, rewards, timing, or balance.
- Gate animation by `state.settings.reducedMotion`.
- Proof gate: `npm run typecheck`.

### Iterate dragon presence if:

- It is close, but one category is **Borderline**.
- The issue is specific and fixable: motion too strong, small seam, slight ghosting, etc.

Likely recovery choices:

- Reduce independent motion amplitude.
- Reduce opacity/overlay effects if ghosting is visible.
- Request/source cleaner manual layer art if seams are the main issue.

### Park the rig temporarily if:

- The dragon reads as disconnected pieces.
- It feels worse than the approved single cutout.
- It requires a full art pass before it can be judged fairly.

If parked, return to the stable single-cutout path and move to another playtest-readiness item unless Logan explicitly wants dedicated manual art work.

## Result Capture Template

```md
## Fire Hatchling Layered-Motion iPhone Validation — 2026-05-10

Device / mode:
Expo mode: LAN / tunnel / other
Result: Pass / Borderline / Fail

Scores:
- Companion feel:
- Visual cohesion:
- Motion restraint:
- Seams / ghosting:
- Phone readability:
- Reduced Motion:
- Expo Go stability:

Decision:
- Unlock visible combat / iterate dragon presence / park rig temporarily

Notes:
-
```

## Current Proof

- `npm run typecheck` passed at `2026-05-10T22:53:36Z` during Hermes takeover validation.
- No app behavior, balance, dependencies, live Discord config, or scheduled jobs were changed by this packet.
