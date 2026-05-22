# Fire Adventure/Combat Screen Slice Plan — 2026-05-12

> **For Hermes:** Use subagent-driven-development or a focused implementation worker to execute this plan task-by-task. Keep the slice player-visible and Fire-first.

**Goal:** Build the next visible Isekai Dragons slice: a focused Fire Adventure/Combat screen that proves the Capybara-style route loop with flashy dragon combat and readable stat/skill impact.

**Architecture:** Treat this as a narrow vertical slice, not a broad systems expansion. Reuse existing state/content where possible, add typed route/callout data only where needed, and surface proof in both the app and dashboard/automation artifacts.

**Tech Stack:** Expo / React Native / TypeScript, existing `npm run test:auto`, `npm run typecheck`, local Mission Control dashboard.

---

## Success Contract

A phone reviewer should understand this above the fold without reading Discord:

> “My Fire hatchling is moving through a short route, stopping to fight enemies and choose rewards/skills, triggering visible Fire Breath/Burn/Crit/Block/Dodge/Speed moments, then heading toward a boss and hoard/evolution payoff.”

## Non-goals

- Do not implement all elements.
- Do not build a deep economy/shop.
- Do not retune broad balance without proof.
- Do not add more panels that make the screen scroll before the player sees combat.
- Do not hide progress only in docs; every implemented lane needs visible app/dashboard proof.

## Task 1: Focus the Adventure/Combat Layout

**Objective:** Make the battlefield and route the hero surface.

**Files likely touched:**
- `App.tsx`
- existing style blocks in `App.tsx`
- automation script(s) under `scripts/` if layout proof needs new checks

**Steps:**
1. Identify current Adventure/Combat render section and duplicate route/card surfaces.
2. Collapse the above-fold view into:
   - compact top route strip
   - large dragon/enemy battlefield
   - compact combat HUD
   - one bottom action/recap area
3. Ensure bottom nav does not overlap the action/recap area.
4. Add/adjust source-harness check for no-scroll-first-view / focused combat HUD if not already present.
5. Run `npm run test:auto` and `npm run typecheck`.

**Done when:** The first screen reads as one coherent Fire adventure/combat surface, not stacked prototype panels.

## Task 2: Add the Fire Route Skeleton

**Objective:** Provide a deterministic short Fire route with meaningful stop types.

**Files likely touched:**
- `src/game.ts`
- `src/types.ts`
- `App.tsx`
- automation artifacts/checks under `scripts/`

**Route contract:**
- 5–8 stops.
- Include at least:
  - Battle
  - Skill choice
  - Hoard/relic reward
  - Event choice
  - Rest/recovery or camp
  - Boss / mini-boss

**Steps:**
1. Define typed route stop data if existing data is insufficient.
2. Render route strip with current/next/boss endpoint clarity.
3. Make fight nodes stop at the enemy before resolving.
4. Add a route-plan artifact/check proving stop count and stop-type coverage.
5. Run `npm run test:auto` and `npm run typecheck`.

**Done when:** A reviewer can tell what stop they are at, what comes next, and why the route is advancing.

## Task 3: Make Combat Stats Visible

**Objective:** Show why combat outcomes happened.

**Required visible callouts:**
- Fire Breath
- Burn
- Crit
- Block
- Dodge
- Speed / First Move / Initiative
- Enemy heavy hit or boss warning where relevant

**Files likely touched:**
- `src/game.ts`
- `src/balance.ts` only if a formula hook is truly required
- `App.tsx`
- automation scripts/artifacts

**Steps:**
1. Inspect existing combat result/log shape.
2. Add or reuse deterministic combat event fields for visible callouts.
3. Render callouts near the battlefield, not buried in text below.
4. Keep Reduced Motion informative even when animation is reduced.
5. Add deterministic automation proof for each callout category.
6. Run `npm run test:auto` and `npm run typecheck`.

**Done when:** At least five combat stats/effects have readable proof in battle UI or generated artifacts.

## Task 4: Add First Fire Skill Choice Layer

**Objective:** Let the Fire run start forming a build identity.

**Initial skill pool:**
- Fire Breath
- Burning Claws
- Crit Ignition
- Ash Armor
- Rage Flame
- Inferno Execute
- Hoard Spark
- Wing Rush

**Steps:**
1. Define typed skill data: name, rarity/role, trigger, effect, stat hook, visible copy.
2. Render a focused three-card choice at the route stop.
3. Show current selected/build summary in compact form.
4. Ensure old saves/hydration fallback safely if new durable state is introduced.
5. Add automation proof that the skill data and UI copy are present.
6. Run `npm run test:auto` and `npm run typecheck`.

**Done when:** Skill choices create understandable Fire build directions without adding a full skill tree yet.

## Task 5: Boss / Hoard / Evolution Recap

**Objective:** End the short route with a clear reason to run again.

**Steps:**
1. Add a quick victory/recap card after boss or major route completion.
2. Show what changed:
   - stats
   - skill/build identity
   - hoard/relic reward
   - evolution pressure/progress
3. Link the recap to the Fire evolution promise.
4. Add automation proof for recap labels and reward/evolution fields.
5. Run `npm run test:auto` and `npm run typecheck`.

**Done when:** The run ends with payoff, not just counters changing.

## Verification Packet

Every implementation handoff must include:

- Files changed.
- What is visible on phone.
- `npm run test:auto` result.
- `npm run typecheck` result.
- scoped whitespace check result.
- Any Metro/Expo bundle fetch result if Metro is running.
- One screenshot/storyboard/artifact path if generated.
- Dashboard feed update or doc note created.

## Recommended First Implementation Slice

Start with Tasks 1–3 together only if the implementation stays small. If it begins to sprawl, stop after Task 1 and ship proof before adding route/stats depth.
