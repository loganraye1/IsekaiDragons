# Fire Hatchling — Spine Director Prompt Comparison

Source: Topnotch-provided `hermes_spine_animation_director_prompt.pdf`.

## What the prompt adds

The prompt upgrades the review role from asset-generation/operator mode to senior animation direction. It requires every proof to be judged by:

- readability;
- weight;
- fluidity;
- personality;
- production efficiency;
- reusable animation systems;
- commercial readiness.

It also requires scored reviews and precise Spine-specific fixes: mesh weighting, IK/FK choices, pivots, draw order, easing, attack timing, secondary motion, VFX timing, export optimization, and mobile constraints.

## Comparison against current Fire Hatchling workflow

### Already aligned

- We pivoted away from Python/GIF part transforms toward Spine Professional.
- We separated source art prep from final animation authoring.
- We identified that the cutout problem is really a missing hand-painted overlap + mesh deformation problem.
- We are using exported GIF/MP4/frame sequences for review before Expo integration.
- Current attack intent already matches the required combat read: brace → furnace charge → jaw/plume → recovery.

### Not aligned enough

- Too much reporting focused on proof health: import success, layer counts, margins, contact sheets.
- Reviews did not consistently include motion/readability/game-feel/commercial-readiness scores.
- Procedural mask iteration continued too long after it became clear the head/neck/body seam needs hand-painted hidden art.
- The rig prep still lacks true mesh weighting, jaw separation, and controller-level notes.
- Contact sheets of isolated layers are useful diagnostics but should not be presented as quality progress by themselves.

## Corrected operating rule

Going forward, every Fire Hatchling animation update must include two separate sections:

1. **Proof Health** — what files build/import/export correctly.
2. **Director Quality** — scored assessment of whether the animation/art is getting closer to a commercial mobile game standard.

## Immediate change for the next Fire Hatchling pass

Stop iterating the body/head/neck issue as a pure mask-padding problem. The next pass should be:

1. hand-paint hidden neck/collar/shoulder underlap;
2. convert body_core and head_neck to Spine meshes;
3. weight the neck base into body_core so it does not rotate like a sticker;
4. add jaw separation/controller;
5. block the attack at 24 fps with startup, anticipation, hit frame, overshoot, recovery, smoke/ember secondary motion;
6. export review GIF/contact sheet with scores.

## New source of truth

Use: `docs/agents/SPINE_ANIMATION_DIRECTOR.md`
