# Fire Hatchling — Spine Implementation Steps

## Decision

Use **Spine as the production animation authoring tool** for the Fire Living Forge hatchling, but integrate into the current Expo app first through **exported spritesheets/frame sequences**, not direct Spine runtime playback.

This avoids the React Native/WebGL/runtime risk while letting us get the higher-quality skeletal animation workflow Topnotch is asking for.

## Why this pipeline

Spine can export image sequences, video, JSON/binary skeleton data, atlases, and PNGs. For the current Expo/React Native game, the safest path is:

> final layered PNGs → Spine rig/animation → GIF/MP4 review proof → frame sequence/spritesheet export → Expo sprite playback → later native Spine runtime investigation if needed

## Phase 0 — Prep the current assets

Current source layer pack:

`assets/dragons/living-forge-fire-hatchling/layers-v1/`

Before importing into Spine, the layer pack must be production-clean:

- every layer is transparent PNG;
- all layers share the same 960x540 registration canvas or documented trim offsets;
- pivots in `manifest.json` are reviewed for body, head, jaw, neck, legs, wing, tail, tail lantern, furnace core, and attack plume;
- missing identity layers are added, especially the cream scarf and smoke/ember layers;
- layer names are stable and readable.

Deliverable:

- `assets/dragons/living-forge-fire-hatchling/spine-source/layers/`
- `assets/dragons/living-forge-fire-hatchling/spine-source/import-manifest.json`

## Phase 1 — Build the Spine skeleton

Create a new Spine project for the Fire hatchling.

Skeleton hierarchy:

- root
  - body
    - chest_core / furnace_glow
    - rear_wing
    - neck
      - head
        - jaw
        - mouth_flame_seed
    - scarf_root
      - scarf_tip
    - front_leg
    - back_leg
    - tail_root
      - tail_mid
        - tail_lantern
    - attack_fx_root
      - plume
      - smoke
      - embers

Important: do not rig the dragon as a single sticker. The attack must be caused by body mechanics: foot brace, tail counter-swing, furnace charge, neck/head lean, jaw open, plume release, and recovery.

Deliverable:

- `assets/dragons/living-forge-fire-hatchling/spine/fire_hatchling.spine`

## Phase 2 — Animate the first state set

Create these animation clips first:

1. `idle_loop`
   - furnace breathing glow;
   - subtle chest/body breath;
   - tail lantern sway;
   - scarf drift;
   - wing micro-shift;
   - no random streaks/flashes.

2. `attack_forge_breath`
   - 0.00s: ready stance;
   - 0.10s: feet brace, body lowers slightly;
   - 0.22s: chest/furnace charge brightens;
   - 0.34s: neck/head lean forward;
   - 0.42s: jaw opens, mouth seed ignites;
   - 0.50s: forge plume burst;
   - 0.70s: plume dissipates into smoke/embers;
   - 0.90s: recover to stance.

3. `hit_recoil`
   - quick recoil;
   - furnace glow dims then returns;
   - small smoke puff.

4. `crit_forge_burst`
   - same body mechanics as attack;
   - stronger furnace flare and plume;
   - no full-screen random flash.

Deliverables:

- exported preview GIF/MP4 for each animation;
- keyframe contact sheet for Discord review.

## Phase 3 — Export app-safe playback assets

For Expo first-pass integration, export animation frames instead of trying to run Spine live.

Suggested exports:

- `idle_loop`: 24 frames, loopable;
- `attack_forge_breath`: 24–30 frames, non-looping;
- `hit_recoil`: 10–12 frames, non-looping;
- `crit_forge_burst`: 30–36 frames, non-looping.

Export layout:

`assets/dragons/living-forge-fire-hatchling/spine-export/`

Recommended files:

- `idle_loop/frame_000.png` ...
- `attack_forge_breath/frame_000.png` ...
- `hit_recoil/frame_000.png` ...
- `crit_forge_burst/frame_000.png` ...
- `animations.json` with fps, frame count, loop flag, canvas size, and anchor.

Optional optimization after proof approval:

- pack frames into atlas spritesheets;
- keep individual frames during early iteration for easier review/diffing.

## Phase 4 — Add Expo sprite animation renderer

Implement a renderer that can play exported Spine frames inside the current combat scene.

Suggested component:

`src/components/SpineFrameDragon.tsx`

Responsibilities:

- loads a typed animation manifest;
- displays frame PNGs at the correct fps;
- supports `idle`, `attack`, `hit`, and `crit` states;
- loops idle;
- plays non-looping attacks once and returns to idle;
- respects Reduced Motion by using idle/static key poses only.

Suggested data module:

`src/data/fireHatchlingSpineAnimations.ts`

Responsibilities:

- imports each frame with static `require()` calls so Metro can bundle assets;
- exports typed animation definitions;
- maps combat events to animation IDs.

## Phase 5 — Wire to combat events

Connect the frame renderer to battle state:

- normal player attack → `attack_forge_breath`;
- crit result → `crit_forge_burst`;
- dragon receives damage → `hit_recoil`;
- waiting/route stop → `idle_loop`.

The dragon should not play a result card first. The fight scene should visibly animate the action before reward/return chest state appears.

## Phase 6 — Add automation/proof checks

Extend `npm run test:auto` so this cannot silently regress.

Checks should verify:

- Spine export manifest exists;
- required animation IDs exist: `idle_loop`, `attack_forge_breath`, `hit_recoil`, `crit_forge_burst`;
- each animation has enough frames;
- frame paths exist on disk;
- Expo data module includes static frame imports;
- combat source maps attack/crit/hit events to Spine frame animation IDs;
- Reduced Motion fallback exists;
- old bad motion patterns are absent: whole-sticker squash, generic circle glow, random streaks, beam-only attack.

Deliverables:

- `artifacts/test-run/latest/fire-hatchling-spine-export-contract.json`
- updated `report.json`
- passing `npm run test:auto`
- passing `npm run typecheck`

## Phase 7 — Later: evaluate direct Spine runtime

Only after the spritesheet version proves the animation quality should we evaluate direct runtime playback.

Runtime options to investigate later:

1. native Spine runtime through a custom React Native native module;
2. `expo-gl`/Skia-style renderer spike;
3. custom dev build instead of Expo Go;
4. keeping Spine only as authoring source and continuing to ship optimized frame atlases.

For now, do **not** block Fire hatchling animation quality on direct runtime support.

## First implementation slice

The next concrete build slice should be small:

1. create `spine-source/` folder from the current layer pack;
2. add a Spine export contract JSON placeholder for the required animations;
3. add the Expo `SpineFrameDragon` renderer using current generated proof frames as temporary stand-ins;
4. wire one combat trigger: player attack → `attack_forge_breath`;
5. add `test:auto` checks for the export contract;
6. run typecheck/test:auto;
7. send Topnotch a GIF/contact sheet proof.

This gives the project a real Spine-shaped pipeline immediately, even before final artist-quality Spine files are produced.
