# Fire Hatchling — Real Layer Export Spec

Purpose: stop treating the Fire hatchling as one sticker PNG. Production animation should use separated layers with pivots so the dragon can brace, charge, breathe fire, recoil, and idle naturally.

## Current Layer Pack

Prototype export path:

`assets/dragons/living-forge-fire-hatchling/layers-v1/`

Manifest:

`assets/dragons/living-forge-fire-hatchling/layers-v1/manifest.json`

Review artifacts:

- `artifacts/test-run/latest/living-forge-fire-hatchling-layered-export-preview.png`
- `artifacts/test-run/latest/living-forge-fire-hatchling-layer-export-contact-sheet.png`

## Required Layers

Draw order should be back-to-front:

1. `00_shadow`
2. `10_tail`
3. `11_tail_lantern`
4. `20_rear_wing`
5. `30_body`
6. `31_front_leg`
7. `32_back_leg`
8. `40_chest_core_glow`
9. `41_chest_core`
10. `50_neck`
11. `60_head`
12. `61_jaw`
13. `70_mouth_flame_seed`
14. `71_attack_plume`

## Pivot Expectations

- Tail pivots at body attachment.
- Tail lantern pivots at lantern center/hook.
- Wing pivots at shoulder.
- Legs pivot at hip/shoulder contact points.
- Chest core pivots at the furnace-heart center.
- Neck pivots at body attachment.
- Head pivots at neck/head joint.
- Jaw pivots at mouth hinge.
- Mouth flame and attack plume pivot at the mouth origin.

## Animation Rules

- Do not squash the entire dragon image.
- Body may move slightly, but the action should come from parts.
- Attack should read as:
  1. feet brace,
  2. tail counterswings,
  3. chest core charges,
  4. neck/head leans,
  5. jaw opens,
  6. flame seed appears at mouth,
  7. plume scales/grows outward,
  8. smoke/recovery settles.

## Production Art Requirements

The prototype layers are rough vector/paint-over layers. Final art should repaint each same layer with the polished Living Forge style:

- cute expressive head,
- asymmetric obsidian/fire horn nubs,
- soft smoke scarf,
- cracked charcoal-orange body scales,
- authored furnace-heart core,
- coal-lantern tail,
- separate jaw/mouth interior,
- clean alpha edges for React Native layering.

## Acceptance Criteria

- Every layer is transparent PNG.
- Manifest includes canvas, draw order, bbox, trim offsets, and pivots.
- Composite preview matches the full dragon design.
- Animation proof can move head/jaw/tail/chest/FX independently without whole-sticker squashing.
