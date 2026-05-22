# Fire Hatchling Finished Polish Status — 2026-05-14

## Status

Morning-ready first polished animation pass is generated, wired for Expo frame playback, and approved by Topnotch as finished enough for the Fire hatchling standard.

## Approved animations

- `idle_loop` — 24 frames, looping
- `attack_forge_breath` — 30 frames, non-looping, low horizontal forge plume
- `hit_recoil` — 12 frames, non-looping, no active breath/plume
- `crit_forge_burst` — 36 frames, non-looping, larger horizontal burst

## Runtime files

- `assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.editor-safe.spine`
- `assets/dragons/living-forge-fire-hatchling/spine-export/animations.json`
- `assets/dragons/living-forge-fire-hatchling/spine-export/<animation>/frame_###.png`
- `src/data/fireHatchlingSpineAnimations.ts`
- `src/components/SpineFrameDragon.tsx`

## Review artifacts

- `artifacts/spine/fire-hatchling/fire-hatchling-spine-proof-contact-sheet.png`
- `artifacts/spine/fire-hatchling/gifs/idle_loop.gif`
- `artifacts/spine/fire-hatchling/gifs/attack_forge_breath.gif`
- `artifacts/spine/fire-hatchling/gifs/hit_recoil.gif`
- `artifacts/spine/fire-hatchling/gifs/crit_forge_burst.gif`

## Verification

- `python3 tools/generate_fire_hatchling_spine_proof_frames.py` — PASS
- frame count check — PASS
- `npm run test:auto` — PASS, including internal `npm run typecheck`
- `git diff --check -- tools/generate_fire_hatchling_spine_proof_frames.py src/data/fireHatchlingSpineAnimations.ts` — PASS

## Notes

- `src/data/fireHatchlingSpineAnimations.ts` now marks the source as `spine-export`, not `temporary-proof-frames`.
- For the approved `.spine` project, open the `.spine` directly. Do not separately import animations; that can produce false `Bone not found` warnings.
- This is ready for morning review/playtest as the Fire hatchling animation standard. Further polish can improve painted art layers, but the current pass is export-ready and wired.
