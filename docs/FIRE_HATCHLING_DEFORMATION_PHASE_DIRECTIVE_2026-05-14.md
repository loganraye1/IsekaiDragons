# Fire Hatchling — Deformation Phase Directive

Source: `Fire_Hatchling_Deformation_Phase_Directive.pdf` supplied by Topnotch on 2026-05-14.

## Phase Change

The Fire Hatchling pipeline is now out of layered-art validation and into **true creature deformation**.

The remaining sticker-head issue is officially classified as a **neck-to-torso deformation and compression problem**, not a masking problem.

## Deprioritized Until They Directly Support Deformation

Do not spend additional production time on:

- procedural mask expansion;
- proof-health visuals;
- static export diagnostics;
- non-deformation layer diagnosis.

## Current Status

- Concept quality: strong
- Silhouette readability: improving
- Rig foundation: viable
- Deformation quality: early production

## Production Objective

Transition the hatchling from layered sprite behavior into believable living creature mechanics.

This phase is explicitly the **mechanics truth phase**, not the final animation polish phase. Review must prioritize whether the creature's internal structure feels true before judging polish, VFX beauty, or finished presentation.

Primary pipeline focus now:

- compression volume;
- anatomical weighting;
- jaw articulation;
- recoil propagation.

Do not spend effort on polish unless it exposes or clarifies one of those mechanics.

The creature should begin feeling:

- alive;
- weighted;
- reactive;
- physically connected;
- driven from torso/chest mechanics rather than isolated pivots.

## Required Execution Order

1. Convert these into true Spine meshes:
   - `body_core`
   - `head_neck`
   - `02b_neck_collar_underlap_paint`
2. Create proper neck-root deformation weighting:
   - neck compresses into chest;
   - torso reacts slightly during turns;
   - rigid plate rotation behavior is eliminated.
3. Implement neck compression behavior during:
   - breathing;
   - attacks;
   - recoil;
   - directional turns.
4. Add separated jaw deformation support:
   - independent jaw timing;
   - open/compress phases;
   - recoil settle;
   - additive overlap motion.
5. Create a short mechanics-validation attack prototype focused only on:
   - brace;
   - chest compression;
   - neck extension;
   - jaw open;
   - recoil settle.

Do **not** polish yet. This is a mechanics-validation pass.

## Required Review Additions

### Neck Compression Review

Evaluate:

- chest reaction;
- neck-root blending;
- compression readability;
- extension quality;
- recoil propagation.

### Creature Mechanics Review

Evaluate whether:

- motion originates from the torso;
- the head leads action naturally;
- recoil travels through the body;
- the dragon feels physically connected.

## Commercial Target

The player should subconsciously believe the neck is attached to a spine and ribcage rather than rotating from a sticker pivot.
