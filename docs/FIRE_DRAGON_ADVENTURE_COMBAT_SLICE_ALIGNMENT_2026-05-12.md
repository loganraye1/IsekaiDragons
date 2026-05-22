# Fire Dragon Adventure Combat Slice Alignment — 2026-05-12

Source: Topnotch Discord alignment, 2026-05-12 16:02 MDT.

## Decision

Align the next major product push around one polished, replayable **Fire Dragon Adventure Combat Slice**.

This is the project north star for the current Capybara Go-inspired pivot:

> Make one short Fire starter adventure path feel awesome before spreading effort across more elements, menus, or deep economy.

## Mission Fit

This supports the Dragonforge mission of building cool games by prioritizing a playable fantasy proof over scattered systems.

The slice should prove:

1. **Adventure momentum** — the player moves through a clear short route of stops.
2. **Flashy readable battle** — combat looks alive, fast, and understandable on phone.
3. **Impactful stats** — ATK, DEF, Block, Dodge, Crit, Crit Damage, Speed, etc. visibly change outcomes.
4. **Skill/build identity** — choices create a recognizable Fire dragon build during the run.
5. **Evolution promise** — the player sees how the Hatchling can become a Drake, Dragon, and Ancient monster.
6. **Dragon originality** — hoard, scales, claws, breath, ash armor, rage, relics, and ancient bloodline language replace generic RPG flavor.

## Target Player Experience

A first-session player should be able to say:

> “I picked a Fire hatchling, pushed through a dangerous route, made a few build choices, watched my dragon breathe fire and trigger cool combat moments, beat a boss, got hoard/evolution progress, and can already imagine what this dragon becomes.”

## Proposed Slice Shape

### 1. Starter Commitment

- Default focus: Fire egg / Fire hatchling.
- Other elements can remain visible as future promise, but Fire gets the full first pass.
- Fire fantasy pillars: Burn, Rage, Ash Armor, Crit Ignition, Fire Breath, Hoard-Fueled Flame, Volcanic Evolution.

### 2. Adventure Path

- 5–8 stops in one short route.
- Stop types:
  - Battle
  - Skill choice
  - Hoard/relic reward
  - Event choice
  - Rest/recovery
  - Mini-boss / boss
- Keep a compact top progress strip visible during run/combat.
- Avoid duplicating route UI across multiple competing panels.

### 3. Combat Feel

- Auto-combat remains readable and fast.
- Add/expand visible callouts for:
  - Fire Breath
  - Burn
  - Crit
  - Block
  - Dodge
  - Shield / Ash Armor
  - Boss warning / heavy hit
- Add phone-safe impact moments:
  - hit flash
  - crit shake
  - breath cone/burst
  - HP chunk movement
  - floating damage/status text
  - short victory recap
- Reduced Motion must keep the same information without excessive animation.

### 4. Stats That Matter

Initial stat intent:

- **ATK**: bigger damage numbers and faster enemy HP drops.
- **DEF**: visibly reduces incoming chunks.
- **Block**: turns a hit into a reduced/guarded hit with a clear BLOCK callout.
- **Dodge**: avoids damage with a clear DODGE callout.
- **Crit**: larger number, stronger impact flash, and potential Fire synergy.
- **Crit Damage**: makes crits feel meaningfully spikier.
- **Speed**: affects initiative / first move / turn cadence.
- **HP**: makes survival and boss pressure readable.

Design guardrail: do not add hidden percentages without visible feedback. If the stat changes the math, the player should see why it mattered.

### 5. Fire Skills / Build Choices

First skill pool should favor clear build identity over quantity.

Example early choices:

- **Fire Breath** — hit all enemies / stronger opening attack.
- **Burning Claws** — basic hits apply Burn.
- **Crit Ignition** — Crits add or detonate Burn.
- **Ash Armor** — gain Block chance or shield after taking damage.
- **Rage Flame** — lower HP increases ATK or Burn power.
- **Inferno Execute** — bonus damage to low-HP enemies.
- **Hoard Spark** — relic/treasure pickups increase fire damage.
- **Wing Rush** — Speed grants first move or dodge chance.

### 6. Evolution Promise

Fire evolution should be visible as a map/preview even before the full system is complete.

Baseline path:

- Egg → Hatchling → Drake → Young Dragon → Dragon → Ancient Dragon

Early branch identities:

- **Inferno Tyrant** — Burn/DPS/breath dominance.
- **Ash Warden** — armor/block/counter survival.
- **Emberfang Raider** — speed/crit/aggressive claws.
- **Hoardflame Ancient** — relic scaling and treasure-powered fire.

Evolution should feel like a major identity choice, not just a linear stat bump.

### 7. Art Direction

Fire path art direction should move from cute to mythic:

- Hatchling: cute, expressive, ember tail/horn motifs.
- Drake: sharper, faster, rebellious silhouette.
- Young Dragon: heroic, winged, adventure-ready.
- Dragon: volcanic armor, large wingspan, dominant posture.
- Ancient: magma veins, colossal mythic god-beast presence.

UI direction:

- Battlefield/adventure should be the hero surface.
- Use fewer overlapping panels.
- Dragon remains the emotional anchor.
- Hoard, forge, shrine, ruins, volcanic cave, and ancient relic motifs should replace generic menu flavor.

## Recommended Implementation Order

1. **Consolidate Adventure/Combat UI**
   - One focused Adventure Run mode.
   - Compact route strip, large battlefield, one bottom action/recap area.
   - No overlapping bottom nav/content problem.

2. **Build the Fire route skeleton**
   - Deterministic 5–8 stop route with battle, reward, skill, event, boss.
   - Show clear route progress and next stop.

3. **Make combat stats visible**
   - Add callouts/proof for crit/block/dodge/burn/skill triggers.
   - Ensure speed/initiative and damage mitigation are understandable.

4. **Add first Fire skill choice layer**
   - Three-card choice modal.
   - 6–8 initial Fire skills.
   - Current build summary/codex strip.

5. **Add victory / hoard / evolution progress recap**
   - Reward card after boss or major stops.
   - Show what changed: stats, skill, hoard, evolution pressure.

6. **Map Fire evolution preview**
   - Show future tiers and branch identities.
   - Use placeholder art if needed, but make the fantasy clear.

7. **Polish art/VFX pass**
   - Improve Fire hatchling readability, breath VFX, boss silhouettes, and reward presentation.

## Systems to Add After the Slice Proves Fun

- Relic/Hoard system with dragon-themed modifiers.
- Event pool: shrines, wounded knights, cursed caves, goblin merchants, rival dragons, ancient ruins.
- Elemental starter expansion: Water, Earth, Light, Dark.
- Equipment/loadout structure.
- Shop/reward economy clarity.
- Seasonal events and boss ladders.

## Definition of Done for This Alignment

The Fire Dragon Adventure Combat Slice is successful when:

- A player can complete a short Fire adventure path on phone.
- Combat produces readable flashy moments without screen chaos.
- At least five stats have visible, understandable combat feedback.
- At least six Fire skills exist and create different run identities.
- The boss/reward/evolution recap gives a reason to run again.
- The UI feels like one coherent dragon adventure screen, not stacked prototype panels.
- The experience stays roguelite/adventure-driven, not idle incremental or tap-to-claim.

## Immediate Handoff

Use this document as the alignment layer for agents and implementation work. The next safest concrete build target is:

> Focused Fire Adventure/Combat layout + route skeleton + visible combat callouts.
