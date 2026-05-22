# Fire Hatchling First-Pass Spine Rig

## What this is

This is a generated starter Spine rig for the Living Forge Fire Hatchling. It is meant to be opened in Spine Professional and polished by hand, not treated as the final animation pass.

## Files

- Importable skeleton JSON: `assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.first-pass.spine.json`
- Spine project target: `assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.first-pass.spine`
- Rig summary: `assets/dragons/living-forge-fire-hatchling/spine-project/first-pass-rig-summary.json`
- Source images: `assets/dragons/living-forge-fire-hatchling/spine-source/layers/`

## Built animations

- `idle_loop`
- `attack_forge_breath`
- `hit_recoil`
- `crit_forge_burst`

## Manual polish checklist in Spine Professional

1. Open the generated `.spine` project if import succeeded; otherwise import the `.spine.json` into a new project.
2. Confirm each slot image is registered on the same canvas.
3. Convert key anatomy regions into meshes:
   - body
   - rear wing
   - neck
   - head
   - jaw
   - tail
   - scarf/smoke if needed
4. Add/clean constraints:
   - IK on front/back legs
   - transform/path-like follow-through on tail and scarf
5. Polish curves:
   - idle should loop seamlessly
   - attack should read brace -> charge -> jaw open -> plume -> recovery
   - crit should feel larger than attack without becoming a generic screen flash
6. Export PNG sequences back into `spine-export/<animation>/frame_###.png` using the existing frame counts.

## Reject rules

- No whole-sticker squash.
- No beam-only attack.
- No generic circles for core/lantern identity.
- No random idle attack streaks.

## Spine CLI import status

```text
Spine Launcher 4.3.03
Esoteric Software LLC (C) 2013-2026 | http://esotericsoftware.com
Windows 10 Home amd64 10.0
Starting: Spine 4.2.43 Professional
Spine 4.2.43 Professional
Licensed to: [redacted]
Project import: living-forge-fire-hatchling.first-pass.spine.json into living-forge-fire-hatchling.first-pass
Complete.
```
