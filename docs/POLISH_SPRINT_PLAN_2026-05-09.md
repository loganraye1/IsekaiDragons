# Polish Sprint Plan — 2026-05-09

Owner: Ember / Dragonforge Crew
Scope: Improve first-session feel from Logan's iPhone playtest without changing frozen v0.1.0 balance.

## Why upgrade the plan now?

The Mission Control setup is working: notes are landing, tasks are visible, and proof logs are being written. Logan validated that the transparent dragon cutout fix improved background blending, but the dragon still feels static. The next plan should stop treating this as general discovery and become a focused polish sprint.

## Guardrails

- Do not change v0.1.0 balance/economy until a clean no-skip 15-minute test supports it.
- Prefer presentation, feedback, and activity-density fixes over new systems.
- Keep every crew task small enough to finish, typecheck, and log proof.
- Validate on iPhone after each visible-feel improvement.

## Sprint Goal

Make the first 10–15 minutes feel more alive and less like waiting by improving:

1. Dragon presence.
2. Combat visibility.
3. Hatch/evolution ceremony.
4. Early activity texture.

## Priority Order

### P0 — Dragon presence / static-feel fix

Evidence: Logan said the dragon blends much better now, but still feels very static.

Deliverables:
- Stronger idle breathing/sway/hover.
- More satisfying tap reaction.
- Keep reduced-motion support.
- No balance change.

Owner: Pyraxis + Veyra
Task: `task-polish-dragon-idle-motion`

### P1 — Visible combat pass

Evidence: iPhone note said combat is not very fun because there are no enemies or animations.

Deliverables:
- Enemy cutout shown in Auto Battle.
- Simple hit/impact feedback.
- Clear HP/reward/defeat feedback.
- No combat system rewrite.

Owner: Pyraxis
Task: `task-polish-visible-combat`

### P2 — Egg hatch and evolution ceremony

Evidence: egg opening felt static; evolution felt minor instead of game-changing.

Deliverables:
- Faster perceived egg presentation.
- More motion/flash/ceremony in hatch/evolution beats.
- Clearer benefit messaging.

Owner: Veyra
Tasks: `task-polish-egg-hatch`, `task-polish-evolution-ceremony`

### P3 — Early activity density design

Evidence: after menus/upgrades, Logan felt in wait mode before Drake.

Deliverables:
- 3–5 low-scope micro-goals or dragon interaction ideas.
- No economy tuning until after presentation fixes are tested.

Owner: Aurelith
Task: `task-design-early-activity-density`

## Validation Loop

After each P0/P1/P2 implementation:

1. Run `npm.cmd run typecheck`.
2. Update Mission Control work log with evidence.
3. Ask Logan for one iPhone validation question.
4. Only then move to next visible-feel task.

## Current Recommendation

Start with P0: dragon idle/tap motion. It directly addresses Logan's latest feedback and should improve the companion fantasy immediately.
