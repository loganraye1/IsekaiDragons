# Fire Living Forge — Animation Direction

Goal: make the Fire starter feel alive in-game, not just good as a still image. Every art pass should preserve clear animation anchors so the sprite can breathe, react, attack, and evolve without needing a total redraw.

## Animation Pillars

1. **Readable at phone size**
   - Main movement should read at ~128px: chest pulse, smoke scarf, tail lantern, horn/crest silhouette.
   - Avoid tiny detail-only motion that disappears in combat.

2. **Living furnace identity**
   - The furnace-heart is the timing source: idle glow pulse, attack charge, hit dim, victory flare.
   - Heat shimmer and ember particles should support the dragon, not cover it.

3. **Cute-to-epic continuity**
   - Hatchling: bouncy, curious, mischievous.
   - Drake/Young: more confident, bigger breath charge, tail lantern swings with weight.
   - Dragon/Ancient: slower, heavier, mythic furnace pressure and volcanic armor movement.

4. **Branch-specific motion language**
   - Flame / Raider: fast lunges, sharp snap-backs, blade-fin streaks, crit flare.
   - Smoke / Mystic: drifting offsets, blink/vanish wisps, rune motes, dodge silhouettes.
   - Magma / Guardian: heavy stomps, armor plate glow, block brace, slow molten shockwaves.

## Required Sprite/Animation Beats

### Idle
- Chest furnace pulse: low → warm → bright → low.
- Smoke scarf drifts upward with slight delay.
- Tail lantern sways opposite body bob.
- Eyes blink / mischievous glance for hatchling.

### Attack Windup
- Chest glow intensifies before the hit.
- Tail lantern and smoke pull inward as if drawing heat.
- Flame branch leans forward sharply; Smoke branch dissolves edges; Magma branch plants feet.

### Attack Impact
- Fire breath, claw slash, or forge-burst must have a clear start, impact, and fade.
- Avoid straight left/right beam reads. The dragon must visibly cause the attack: body crouch/lean, chest compression, mouth/core ignition, then a plume/burst that grows outward from the dragon.
- Do not squash/scrunch the whole sticker image and rebound it as the attack. Attack motion must come from separated parts: head/neck lean, jaw/mouth ignition, chest-core charge, tail counter-swing, wing/feet brace, then plume/burst.
- Prefer short cone/plume/fireball shapes with curling embers over long uniform beams.
- Use embers/sparks and screen-space hit flash sparingly.
- Combat timing target: impact should happen quickly enough to feel snappy, not delayed.

### Hit Reaction
- Furnace-heart briefly dims/flickers.
- Body squashes or recoils by branch weight.
- Smoke puffs and ember chips communicate damage without hiding the sprite.

### Block / Dodge / Crit
- Block: volcanic plates flare and form a short shield-read.
- Dodge: smoke afterimage / sideways drift.
- Crit: white-hot furnace flash plus sharper flame trail.

### Evolution Moment
- The forge-heart becomes the transformation anchor.
- Smoke wraps body, volcanic cracks spread, horn silhouette changes, tail lantern flares.
- Avoid random particle soup; the silhouette should clearly change stage/branch.

## Art-Pass Requirements

Each new Fire concept should be checked for these animation anchors:

- Visible chest core that can pulse.
- Separated smoke scarf/mane shape that can drift.
- Tail tip/lantern that can swing and flare.
- Horn/crest silhouette with room for squash/tilt.
- Branch forms with different movement weight.
- Clean alpha/cutout-friendly outline for React Native layering.

## Implementation Notes

- Gate nonessential loops behind Reduced Motion.
- Prefer layered sprite effects: base dragon + authored furnace-core layer + smoke wisps + authored tail-lantern layer + attack VFX.
- Do not fake the furnace-heart or tail lantern with obvious generic circle overlays; if the source art lacks a separated core/tail layer, use subtle whole-body heat/ember motion until proper layers exist.
- Do not add random attack streak lines, arcs, or full-screen light flashes to idle proofs. Show idle feel first: breathing, chest flicker, smoke drift, tail sway, and embers. Save attack VFX for a separate clearly-labeled attack animation pass.
- Reuse animation timing constants across combat and evolution preview so feel stays consistent.
- Add automation checks for: idle loop exists, attack windup/impact/fade timings, Reduced Motion fallback, no stale beam-only effects, and no placeholder circle-glow treatment.
