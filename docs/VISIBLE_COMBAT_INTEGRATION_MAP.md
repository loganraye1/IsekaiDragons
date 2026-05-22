# Visible Combat Integration Map

Purpose: prepare the next Pyraxis/engineering task after dragon-presence validation without starting visible-combat implementation early.

Status: inspection-only map. No code changes made.

## Inspected Files

- `docs/POLISH_SPRINT_PLAN_2026-05-09.md`
- `docs/PLAYTEST_SUMMARY_2026-05-09.md`
- `docs/PRODUCT_REVIEW_2026-05-09.md`
- `docs/FIRST_IPHONE_PLAYTEST_CHECKLIST.md`
- `docs/LAYERED_DRAGON_RIG_PLAN.md`
- `App.tsx`
- `src/game.ts`
- `src/types.ts`
- `src/content.ts`
- `src/balance.ts`
- `package.json`
- `assets/dragons/*`
- `assets/enemies/*`

## Likely Integration Points

### Primary visible-combat target

`App.tsx`

- `HatchlingJourneyStage(...)` renders the main living-den screen through `DragonDisplay`.
- `AdventurePanelContent(...)` shows the bottom-sheet Adventure panel.
- `AutoBattleSummary(...)` is the compact panel version of current auto-battle status.
- `AutoBattlePanel(...)` already exists as an absolute HUD-style combat panel, but does not appear to be mounted in the current `DragonDisplay` journey UI.
- Existing unused styles suggest a previous or partial visible-combat scene:
  - `hatchlingMotionLayer`
  - `enemyMotionLayer`
  - `enemyImageInside`
  - `enemyGlow`
  - `attackStreak`

### State / combat data

`src/game.ts`

- `applyAutoBattleAction(state)` is the core auto-battle tick.
- `createAutoBattle(areaId, defeatedCount)` sets enemy name/hp.
- `getBattleDamage(state)` computes current hit damage.
- `getBattleRewardEssence(state)` computes reward.
- `getDragonPower(state)` feeds combat display power.

`src/types.ts`

- `AutoBattleState` currently has:
  - `areaId`
  - `enemyName`
  - `enemyHp`
  - `enemyMaxHp`
  - `defeatedCount`

### Enemy art available

`App.tsx` already has:

- `enemyImages`
- `EnemyImageKey`

Available enemy cutouts:

- `assets/enemies/bouncy-slime-cutout.png`
- `assets/enemies/briar-boar-cutout.png`
- `assets/enemies/willow-wisp-cutout.png`
- `assets/enemies/ruin-knight-cutout.png`
- `assets/enemies/sky-manta-cutout.png`
- `assets/enemies/rift-chimera-cutout.png`

Current `autoBattle.enemyName` values are broader strings like `Slime`, `Forest Imp`, and `Ember Wolf`, so a visual pass likely needs a safe helper that maps `enemyName` / `areaId` to an `EnemyImageKey`, with a sensible fallback.

## Main Risks

- `App.tsx` is very large, so the safest change is adding a small isolated component rather than broad architecture changes.
- Auto battle updates on the `autoQuestAction` interval, not continuously. Animation should react to state changes, not imply a faster combat system.
- Do not change `src/balance.ts` or combat formulas.
- Enemy names do not map 1:1 to existing enemy art.
- Absolute positioning may conflict with existing HUD, bottom nav, loot popups, return-presence overlays, and small iPhone screens.

## Reduced-Motion Considerations

Use `state.settings.reducedMotion` as the gate.

Recommended behavior:

- Normal motion: subtle enemy idle, small dragon/enemy hit nudge, brief attack streak or flash on HP decrease.
- Reduced motion: static enemy image plus HP bar/text only; no looping idle, streak, or shake.
- Keep haptics unchanged unless explicitly adding feedback later.

## Smallest Safe Implementation Slice

After dragon-presence validation allows visible-combat work, add a read-only visual layer inside `DragonDisplay` children from `HatchlingJourneyStage`, likely near the existing HUD/main info.

Recommended slice:

1. Mount existing `AutoBattlePanel` or a new tiny `VisibleAutoBattleScene`.
2. Show current enemy cutout using a helper:
   - `getAutoBattleEnemyImageKey(state.autoBattle.enemyName, state.autoBattle.areaId)`
3. Render:
   - enemy cutout
   - enemy name
   - HP bar
   - defeated count
   - hit/reward text
4. Add only presentation animation keyed by:
   - `state.autoBattle.enemyHp`
   - `state.autoBattle.defeatedCount`
5. Do not change `src/game.ts`, `src/balance.ts`, or reward/damage math.

## Suggested Proof Gate

After implementation:

```txt
npm.cmd run typecheck
```

Then iPhone Expo validation question:

> Do visible enemies, HP, and hit/defeat feedback make auto-battle feel more alive without feeling too busy?
