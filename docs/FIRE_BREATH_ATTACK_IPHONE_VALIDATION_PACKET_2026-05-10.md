# Fire Breath Attack iPhone Validation Packet — 2026-05-10

## Recommendation

Proceed with one visual-only Fire hatchling fire-breath vertical slice, then validate on iPhone before expanding to clawing, wing-flap movement, or broader combat animation.

This is presentation polish over existing auto-battle state. It is not a new mechanic, ability, cooldown, attack button, damage change, or economy retune.

## Validation Question

> Does the dragon breathing fire at visible enemies make auto-battle feel more alive without making the screen feel too busy, gimmicky, or mechanically changed?

## Pass

Keep the slice if:

- Fire breath clearly reads as an attack.
- Dragon still feels like the approved Fire hatchling: cute/eager, not monstrous or overpowered.
- Enemy hit/defeat feedback is understandable.
- Enemy/HP/readout do not crowd the den UI on iPhone.
- No tester thinks damage, speed, rewards, or combat mechanics changed.
- Reduced Motion is calm: static enemy + HP/readout, no cone/shake/streak/flash loops.
- Expo Go performance is stable.

## Borderline

Allow exactly one constrained polish pass if:

- Fire breath is readable but too large, too frequent, or too flashy.
- Enemy reaction is unclear but the concept works.
- Layout is a little crowded but fixable.
- Motion amplitude/duration needs reduction.
- Reduced Motion needs minor cleanup.

Allowed fixes: shrink flame, shorten timing, reduce wing/head anticipation, simplify hit flash, improve HP readability, or calm reduced-motion handling.

## Fail

Stop, revert, or simplify if:

- It feels like a new mechanic rather than presentation.
- It implies faster attacks, stronger damage, burn status, AoE, or a special skill.
- Fire breath overwhelms the dragon/den presentation.
- Existing layered dragon motion plus attack motion feels too busy or paper-doll-like.
- Reduced Motion is uncomfortable or not respected.
- iPhone layout/performance is not acceptable.

## Result Capture Template

```md
## Fire Breath Attack Validation Result

Device / path:
Result: Pass / Borderline / Fail
Feels more alive? yes/no/notes
Too busy or gimmicky? yes/no/notes
Mechanically changed impression? yes/no/notes
Reduced Motion checked? yes/no/notes
Layout/performance notes:
Decision: keep / one polish pass / revert or simplify
```

## Proof Baseline

- Planning/prep produced by Veyra, Aurelith, and Forgehand agent passes.
- Implementation plan: `docs/FIRE_BREATH_ATTACK_VERTICAL_SLICE_PLAN_2026-05-10.md`.
- Implementation proof: `App.tsx` changed for visual-only Fire Breath Combat Visual; `npm run typecheck` passed from WSL; spec compliance review PASS; quality re-review APPROVED.
