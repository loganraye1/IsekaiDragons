# Agent Workspace and Handoff Board

This file is the crew's lightweight shared workspace. Use it for short-lived coordination; long-term decisions belong in dedicated docs or Mission Control logs.

For the source-of-truth launchpad, see `docs/DRAGONFORGE_OPERATING_INDEX.md`.

## Current Phase

**Capybara Go-inspired dragon adventure foundation for v0.1.0-alpha.**

Primary goal: make the first 15 minutes stable, readable, understandable, emotionally promising, and recognizably adventure-driven on iPhone through Expo Go.

Standing guardrail: use Capybara Go as a structural reference, but keep Dragonforge identity centered on crunchy dragon evolution, impactful stats, flashy readable combat, hoard/relic progression, and phone-safe proof gates.

## Current Commander Intent

Set up and execute a **Capybara Go-style dragon workflow**: research → product shape → engineering map → art direction → implementation slices → validation.

Topnotch has aligned the next major product push around one polished, replayable **Fire Dragon Adventure Combat Slice**: make one short Fire starter adventure path feel awesome before spreading effort across more elements, menus, or deep economy.

Source of truth for this pivot:

- `docs/FIRE_DRAGON_ADVENTURE_COMBAT_SLICE_ALIGNMENT_2026-05-12.md`
- `docs/CAPYBARA_GO_DRAGON_WORKFLOW_2026-05-11.md`
- `docs/DRAGON_EVOLUTION_BRANCHES_STATS_SKILLS_2026-05-11.md`
- Hermes Kanban board: `isekai-dragons`
- Operating index priority list in `docs/DRAGONFORGE_OPERATING_INDEX.md`

This board currently implements Operating Index priorities in this order:

1. Adventure path foundation — visible route, stops, fights, choices, treasures, bosses, and return/payoff.
2. Impactful combat stats — ATK/DEF/block/dodge/crit/speed/etc must visibly affect combat outcomes.
3. Flashy battle feedback — breath, impact, crit, dodge, block, elemental, and ultimate effects with Reduced Motion support.
4. Skill drafting and build identity — fire/frost/storm/shadow/gold/ancient choices.
5. Evolution map — branch choices with visual identity and mechanical consequences.
6. Dragon art direction — silhouettes, elements, enemies, hoard/relic UI, and phone readability.
7. Relics/hoard/idle/events — supporting progression after the core loop is readable.

Capacity note: use the crew as a small studio. Veyra owns animation/VFX feel, Aurelith owns product guardrails, Forgehand scouts safe technical maps, Pyraxis implements, Caldrin validates, Ember coordinates.

## Active Chain

### 1. Ember / Hermes → Dashboard Honesty Pass

Status: current active owner — in progress

Requested output:
- Rename misleading “overall progress” language into **alignment/proof coverage**.
- Add separate visible measures for implementation progress, automation health, recent progress feed, and worktree hygiene.
- Keep the local LAN dashboard available at `http://192.168.1.183:3040`.

Done condition:
- Dashboard `/health` and root page prove the new labels are live.

### 2. Pyraxis → Focused Fire Adventure/Combat Screen Slice

Status: next implementation owner

Requested output:
- Build the next visible player-facing slice:
  - compact top route strip
  - large battlefield as the hero surface
  - Fire hatchling vs enemy staging
  - 5–8 stop Fire route skeleton
  - visible Fire Breath / Burn / Crit / Block / Dodge / Speed initiative callouts
  - bottom action/recap area that does not overlap navigation
- Keep changes scoped; do not expand economy or all elements before Fire proves fun.
- Gate animations through Reduced Motion.

Proof required:
- `npm run test:auto`
- `npm run typecheck`
- scoped whitespace check for touched files
- direct Metro/Expo bundle fetch if Metro is already running
- dashboard progress feed updated with the slice result

Done condition:
- A phone reviewer can understand the Fire adventure loop above the fold without reading chat.

### 3. Caldrin → Fire Slice Playtest Rubric

Status: queued after Pyraxis slice proof

Requested output:
- Validate the focused Fire slice with three questions:
  1. Can you tell where the dragon is on the route and what happens next?
  2. Does combat feel flashier and more readable without screen clutter?
  3. Do stats/skills feel like they changed the outcome?
- Capture Pass / Borderline / Fail and one sentence of why.

Done condition:
- Playtest result is logged and Aurelith has enough evidence to keep, polish once, or simplify.

### 4. Aurelith → Product Decision After Fire Slice Validation

Status: queued

Requested output:
- Decide whether to continue deeper into Fire skills/evolution/relics or first simplify/declutter the slice.
- Keep the decision tied to phone evidence, not internal enthusiasm.

Done condition:
- Decision logged with next single implementation owner.

## Parallel While-Waiting Tasks

Use these only when they do not touch files owned by the active implementation slice.

### Forgehand → Non-overlapping Proof Support

Status: available

Output needed:
- Inspect test harness/report health, Metro/Expo connectivity, or static proof gates without changing gameplay behavior.
- Keep notes short and name exact blockers or proof.

### Veyra → Fire Readability/Art Support

Status: available

Output needed:
- Provide phone-readability guidance for Fire hatchling silhouette, breath VFX, enemy staging, and boss/hoard presentation.
- Do not replace approved art direction without Logan/Topnotch approval.

### Ignivar → Internal Capture Prep

Status: low priority

Output needed:
- Maintain an internal screenshot/capture checklist only after the Fire slice is presentable.
- No public posting or overpromising.

## Current Risk

Efficiency is still constrained by a large uncommitted worktree and older generated/status artifacts. Stabilization must finish before the Fire Adventure/Combat slice starts: task ownership, dashboard proof, and worktree-risk reporting are the active blockers.

## Next After Active Chain

After Ember's stabilization proof is clean enough, Pyraxis may start the focused Fire Adventure/Combat screen slice. After Pyraxis proof, Caldrin validates on iPhone/Expo. If validation fails, simplify before adding more systems.

## Handoff Template

```md
## Handoff: <from> → <to>

Reason:
Requested output:
Evidence:
Done condition:
Blockers:
```
