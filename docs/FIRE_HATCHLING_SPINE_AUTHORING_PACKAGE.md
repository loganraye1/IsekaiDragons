# Fire Hatchling Spine Professional Authoring Package

## Status

Spine Professional is installed and the Expo playback bridge is ready. This package turns the current Living Forge Fire Hatchling layer pack into a Spine-ready production handoff while final manual rigging happens in Spine.

- Spine editor: `C:\Program Files\Spine\Spine.exe`
- Source layers: `assets/dragons/living-forge-fire-hatchling/spine-source/layers/`
- Source manifest: `assets/dragons/living-forge-fire-hatchling/spine-source/import-manifest.json`
- Expo frame export target: `assets/dragons/living-forge-fire-hatchling/spine-export/`
- Review contact sheet: `artifacts/spine/fire-hatchling/fire-hatchling-spine-proof-contact-sheet.png`
- Authoring contract: `artifacts/spine/fire-hatchling/fire-hatchling-spine-authoring-contract.json`

## What changed in this build-out

1. Added missing temporary authoring layers for the Living Forge identity:
   - `12_scorched_scarf.png`
   - `72_forge_smoke.png`
   - `73_forge_embers.png`
2. Updated the Spine import manifest with Professional-only requirements and identity rules.
3. Rebuilt all four frame sequences as anatomy-aware proof motion:
   - `idle_loop` — 24 frames
   - `attack_forge_breath` — 30 frames
   - `hit_recoil` — 12 frames
   - `crit_forge_burst` — 36 frames
4. Added `tools/generate_fire_hatchling_spine_proof_frames.py` so the proof frames/contact sheet can be regenerated consistently.

## Spine rig plan

Build the skeleton from the actual anatomy, not from one flattened PNG.

### Root and body

- `root`
  - global placement only
- `body`
  - parent for torso, legs, chest core, neck, wing, tail base
  - use mesh deformation for subtle breathing and furnace-chest compression
- `chest_core`
  - separate slot for hard furnace frame
- `chest_core_glow`
  - separate additive/glow attachment; pulse opacity/scale, not a generic circle overlay

### Head and attack chain

- `neck_01`, `neck_02`
  - weighted mesh or linked bones for bending
- `head`
  - asymmetric horn silhouette stays readable
- `jaw`
  - separate jaw bone with pivot under cheek/hinge
- `mouth_flame_seed`
  - small authored flame seed at mouth before plume appears
- `attack_plume`
  - FX slot keyed only during attack/crit; should grow organically, not read as a laser beam

### Legs and weight

- `front_leg_upper`, `front_leg_lower`, `front_foot`
- `back_leg_upper`, `back_leg_lower`, `back_foot`
- Use IK constraints for bracing during attack and recoil.
- Feet should plant before the head/jaw fires.

### Tail and identity motion

- `tail_01`, `tail_02`, `tail_03`
- `tail_lantern`
  - separate attachment; swings after tail and glows on charge/crit
- Use tail counter-swing to sell weight shift before attacks.

### Secondary motion

- `rear_wing`
  - wing settles during idle and braces during attacks
- `scorched_scarf`
  - trailing cloth/smoke silhouette; drifts on idle, snaps during burst
- `forge_smoke`
  - recovery smoke only; do not turn idle into attack noise
- `forge_embers`
  - small sparks tied to core/crit, not random full-screen streaks

## Animation beat sheets

### `idle_loop`

Purpose: make the hatchling feel alive without fighting noise.

Beats:
1. Body breathes around furnace chest.
2. Core glow flickers in place.
3. Tail lantern sways with a delayed follow-through.
4. Smoke/scarf drifts subtly behind the neck/body.
5. Wing settles with tiny weight movement.
6. Jaw stays closed except for optional tiny breathing part.

Reject if:
- It looks like random attack streaks.
- The whole dragon squashes like a sticker.
- The core/lantern are replaced by simple floating circles.

### `attack_forge_breath`

Purpose: the creature physically causes the attack.

Beats:
1. Feet brace and body lowers.
2. Tail counter-swings backward.
3. Furnace chest charges brighter.
4. Neck and head lean into the shot.
5. Jaw opens from a real hinge.
6. Mouth seed ignites.
7. Organic forge plume expands from mouth/core direction.
8. Smoke trails and body recovers.

Reject if:
- It reads as a straight beam.
- The plume appears without body/jaw motion.
- The old projectile overlay becomes the main visual again.

### `hit_recoil`

Purpose: readable damage response without losing silhouette.

Beats:
1. Head and neck snap back first.
2. Body shifts backward a smaller amount.
3. Tail counter-moves.
4. Core dims briefly.
5. Hatchling settles back into stance.

Reject if:
- The whole character slides as one sticker.
- Hit reaction hides the HP/combat readability.

### `crit_forge_burst`

Purpose: bigger forge identity payoff for critical attacks.

Beats:
1. Deeper brace than normal attack.
2. Core and lantern overcharge together.
3. Jaw opens wider.
4. Burst plume is shorter, hotter, and chunkier than a beam.
5. Ember spray follows the plume.
6. Smoke recovers after the burst.

Reject if:
- It becomes a generic screen flash.
- It looks identical to normal attack except brighter.

## Export rules for Spine

Use these names exactly so Expo does not need file churn:

```text
assets/dragons/living-forge-fire-hatchling/spine-export/idle_loop/frame_000.png ... frame_023.png
assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_000.png ... frame_029.png
assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_000.png ... frame_011.png
assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_000.png ... frame_035.png
```

Recommended export settings:

- Canvas: `960 x 540`
- Transparent background: yes
- FPS: `24`
- Output: PNG sequence for app, GIF/MP4 for review
- Keep frame counts stable unless `src/data/fireHatchlingSpineAnimations.ts` is updated with matching static imports

## Verification

After export or regeneration:

```bash
python3 tools/generate_fire_hatchling_spine_proof_frames.py
npm run test:auto
npm run typecheck
git diff --check -- App.tsx src/data/fireHatchlingSpineAnimations.ts src/components/SpineFrameDragon.tsx scripts/test-animation-visual.js docs/FIRE_HATCHLING_SPINE_AUTHORING_PACKAGE.md tools/generate_fire_hatchling_spine_proof_frames.py
```

For untracked frame/image artifacts, use review by opening the generated contact sheet instead of relying only on git diff.
