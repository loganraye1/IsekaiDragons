# Fire Breath Attack Vertical Slice Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a visual-only Fire hatchling fire-breath attack slice that makes existing auto-battle feel alive without changing balance, combat timing, rewards, progression, dependencies, or save schema.

**Architecture:** Keep the slice isolated in `App.tsx` as a read-only presentation layer mounted from `HatchlingJourneyStage` inside `DragonDisplay` children. Drive animation from existing `state.autoBattle.enemyHp` / `defeatedCount` changes and gate all motion with `state.settings.reducedMotion`. Do not modify `src/game.ts`, `src/balance.ts`, combat formulas, reward logic, or auto-battle cadence.

**Tech Stack:** React Native / Expo, TypeScript, existing `Animated` APIs, existing enemy PNG cutouts, existing Fire hatchling layered render, existing auto-battle state.

---

## Source Inputs

- User direction: add life through animations like flapping wings, breathing fire to attack, or clawing; approved moving forward with an organization-style agent workflow.
- Veyra direction: Fire breath should read as chaotic-cute/eager, short and punchy, with buildup → cone → hit feedback → recovery.
- Aurelith decision: approved only as visual presentation combat polish, not a new mechanic/ability/cooldown/player action.
- Forgehand engineering map: implement first slice in `App.tsx`, preferably separate from `LayeredFireHatchling`; use `npm run typecheck` from WSL because `npm.cmd run typecheck` fails in this workspace's WSL shell.

## Hard Guardrails

Do **not** change:

- `src/balance.ts`
- combat damage formulas
- reward formulas
- enemy HP tuning
- auto-battle timing / interval cadence
- progression pacing
- upgrade economy
- quest timing
- new attack buttons or player-choice combat inputs
- new haptics
- dependencies / `package.json`
- save schema / `AutoBattleState`
- live Discord/Hermes/OpenClaw config

## Acceptance Criteria

- Fire hatchling attack reads on iPhone as: mouth/throat buildup, fire breath direction, enemy impact.
- No tester should think damage, speed, rewards, or mechanics changed.
- Enemy art, enemy name, HP bar, and defeated count are visible without crowding the core den UI.
- Reduced Motion shows static enemy + HP/readout and avoids animated cone, shake, streak, flash, or looping motion.
- Fire hatchling identity stays cute/eager, not monstrous or overpowered.
- `npm run typecheck` passes from WSL.

---

### Task 1: Add Auto-Battle Enemy Art Mapping Helper

**Objective:** Map existing auto-battle enemy names/areas to existing enemy cutout assets without changing game data.

**Files:**
- Modify: `App.tsx` near existing `EnemyImageKey` / `enemyImages`

**Step 1: Add helper near enemy image definitions**

Add a pure helper like:

```ts
function getAutoBattleEnemyImageKey(enemyName: string, areaId: AreaId): EnemyImageKey {
  const normalizedName = enemyName.toLowerCase();

  if (normalizedName.includes("slime") || normalizedName.includes("crab")) return "slime";
  if (normalizedName.includes("wisp") || normalizedName.includes("sprite") || normalizedName.includes("spirit")) return "wisp";
  if (normalizedName.includes("boar") || normalizedName.includes("wolf") || normalizedName.includes("stag") || normalizedName.includes("ram")) return "boar";
  if (normalizedName.includes("goblin") || normalizedName.includes("golem") || normalizedName.includes("sentinel")) return "knight";
  if (normalizedName.includes("serpent") || normalizedName.includes("harpy") || normalizedName.includes("drake")) return "manta";
  if (normalizedName.includes("void") || normalizedName.includes("nightmare") || normalizedName.includes("rift")) return "chimera";

  switch (areaId) {
    case "mysticMeadow":
      return "slime";
    case "emberWoods":
      return "boar";
    case "tideCavern":
      return "wisp";
    case "stonebackHills":
      return "boar";
    case "skyRuins":
      return "manta";
    case "voidNest":
      return "chimera";
    default:
      return "slime";
  }
}
```

**Step 2: Verify TypeScript names**

If `AreaId` is not already imported/available in `App.tsx`, use the existing project type import rather than adding new types.

**Step 3: Run proof**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 2: Add Isolated `FireBreathCombatVisual` Component

**Objective:** Create a small read-only component that renders visible enemy, HP, defeated count, and fire breath/hit feedback from existing state.

**Files:**
- Modify: `App.tsx`

**Step 1: Create component near existing auto-battle UI helpers**

Component shape:

```tsx
function FireBreathCombatVisual({ state }: { state: GameState }) {
  const reducedMotion = state.settings.reducedMotion;
  const enemyImageKey = getAutoBattleEnemyImageKey(state.autoBattle.enemyName, state.autoBattle.areaId);
  const enemyHpPercent = Math.max(0, Math.min(100, Math.round((state.autoBattle.enemyHp / state.autoBattle.enemyMaxHp) * 100)));

  return (
    <View pointerEvents="none" style={styles.fireBreathCombatLayer}>
      <View style={styles.fireBreathEnemyCard}>
        <Image source={enemyImages[enemyImageKey]} style={styles.fireBreathEnemyImage} resizeMode="contain" />
        <Text style={styles.fireBreathEnemyName}>{state.autoBattle.enemyName}</Text>
        <View style={styles.fireBreathHpTrack}>
          <View style={[styles.fireBreathHpFill, { width: `${enemyHpPercent}%` }]} />
        </View>
        <Text style={styles.fireBreathEnemyMeta}>Defeated {state.autoBattle.defeatedCount}</Text>
      </View>
      {!reducedMotion ? <View style={styles.fireBreathCone} /> : null}
    </View>
  );
}
```

Initial implementation can be static plus a simple cone; animation comes in Task 3.

**Step 2: Add styles**

Add compact absolute styles with `pointerEvents="none"`, small footprint, and no blocking of HUD/bottom nav. Keep the layer visually below top HUD and above background.

**Step 3: Run proof**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 3: Add Hit-Triggered Animation for Normal Motion Only

**Objective:** Trigger short fire breath and enemy impact feedback when existing auto-battle HP/defeated-count state changes.

**Files:**
- Modify: `App.tsx`

**Step 1: Add animated refs inside `FireBreathCombatVisual`**

Use existing React/React Native APIs already in the file:

```ts
const breathPulse = useRef(new Animated.Value(0)).current;
const hitPulse = useRef(new Animated.Value(0)).current;
const previousEnemyHp = useRef(state.autoBattle.enemyHp);
const previousDefeatedCount = useRef(state.autoBattle.defeatedCount);
```

**Step 2: Trigger only on real state changes**

In `useEffect`, if reduced motion is false and either enemy HP decreased or defeated count changed, run a short sequence:

- 250–350ms buildup/expand
- 300–450ms breath cone
- 180–300ms enemy hit flash/nudge
- reset

Keep it short; no continuous attack loop.

**Step 3: Use animated styles**

Apply opacity/scale/translate transforms to:

- fire cone
- optional mouth/throat glow marker
- enemy card/image hit feedback

**Step 4: Reduced Motion branch**

When `state.settings.reducedMotion` is true:

- no `Animated.sequence`
- no cone animation
- render static enemy + HP/readout only

**Step 5: Run proof**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 4: Mount the Fire Hatchling Vertical Slice in the Journey Screen

**Objective:** Show the visual slice only for Fire hatchling auto-battle presentation in the main journey/den path.

**Files:**
- Modify: `App.tsx` inside `HatchlingJourneyStage` `DragonDisplay` children

**Step 1: Mount component with narrow gate**

Add near `mainDragonInfo` / current journey display children:

```tsx
{element === "fire" && state.dragon.stage === "hatchling" && state.autoBattle ? (
  <FireBreathCombatVisual state={state} />
) : null}
```

If `state.autoBattle` is not nullable by type, omit that guard.

**Step 2: Confirm no interaction interference**

Root view must use `pointerEvents="none"` so dragon tapping, nav, and panels remain interactive.

**Step 3: Run proof**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 5: Add Validation Packet and Workspace Handoff Update

**Objective:** Make subjective iPhone validation explicit and hand off next decision cleanly.

**Files:**
- Create: `docs/FIRE_BREATH_ATTACK_IPHONE_VALIDATION_PACKET_2026-05-10.md`
- Modify: `docs/agents/WORKSPACE.md`
- Modify: `workspace/your/mission-control/data/work-log.json`
- Append: `memory/2026-05-10.md`

**Step 1: Create validation packet**

Question:

> Does the dragon breathing fire at visible enemies make auto-battle feel more alive without making the screen feel too busy, gimmicky, or mechanically changed?

Include Pass / Borderline / Fail rubric from this plan.

**Step 2: Update workspace**

Mark the current chain as:

1. Veyra/Aurelith/Forgehand — fire breath vertical slice direction/prep done.
2. Pyraxis — implement visual-only Fire Breath Combat Visual.
3. Caldrin — iPhone validation packet after implementation.
4. Aurelith — decide keep/iterate/revert after validation.

**Step 3: Log proof**

Add a work-log entry that names changed docs, implementation proof, and next owner.

**Step 4: Run final proof**

Run: `npm run typecheck`

Expected: PASS.

---

## Final Review Gate

After all implementation tasks:

1. Run `npm run typecheck`.
2. Inspect `git diff -- App.tsx docs/FIRE_BREATH_ATTACK_VERTICAL_SLICE_PLAN_2026-05-10.md docs/FIRE_BREATH_ATTACK_IPHONE_VALIDATION_PACKET_2026-05-10.md docs/agents/WORKSPACE.md workspace/your/mission-control/data/work-log.json memory/2026-05-10.md`.
3. On iPhone Expo Go, validate:
   - fire breath reads as attack,
   - UI is not crowded,
   - reduced motion is calm,
   - no gameplay/balance perception changed.
```
