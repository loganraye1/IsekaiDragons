# Capybara-Go-Inspired Dragon Workflow

Date: 2026-05-11
Owner: Ember coordination / Dragonforge crew

## Commander Intent

Shift the project from narrow visual polish into a structured **Capybara Go-inspired dragon adventure loop** while keeping the Dragonforge quality bar: visible, substantive changes; proof-backed handoffs; no vague progress theater.

Target fantasy:

> Capybara Go-style approachable adventure progression + crunchy dragon evolution choices + flashy readable combat + dragon-hoard identity.

## North Star Loop

1. Player starts an expedition/adventure path.
2. Dragon travels through visible route nodes.
3. Nodes stop the dragon for fights, treasure, shrines, camps, shops, choices, elites, and bosses.
4. Combat mostly auto-resolves, but stats/skills visibly affect outcomes.
5. Player drafts temporary run skills from 3-choice offers.
6. Run rewards feed permanent dragon growth, evolutions, relics, hoard, and idle rewards.
7. Player retries stronger with a clearer build identity.

## Workstream Lanes

### Lane 1 — Reference Research / Product Shape

Assigned role: Aurelith

Output:
- Short product brief on which Capybara Go mechanics to adapt, simplify, or avoid.
- First-session target: what a player should understand in the first 5 minutes.
- Non-goals: aggressive monetization clutter, opaque stat soup, balance retunes without proof.

Proof:
- Written brief in `docs/`.
- Acceptance criteria for implementation tasks.

### Lane 2 — Adventure Path Design

Assigned role: Caldrin + Aurelith support

Output:
- Data contract for route nodes: fight, elite, boss, treasure, shrine, camp, shop, choice event.
- Chapter/run structure: node count, fight cadence, boss placement, reward cadence.
- Validation rubric for whether the path feels like an adventure instead of a passive timer.

Proof:
- Route spec doc in `docs/`.
- If code follows, `npm run test:auto` must verify route length, stop behavior, fight CTA, event choices, and final boss placement.

### Lane 3 — Engineering Map / Safe Architecture

Assigned role: Forgehand

Output:
- Identify exact source files/types/reducer/UI surfaces for adventure routes, combat stats, skills, and animations.
- Recommend smallest safe implementation slices.
- Define proof commands and rollback notes.

Proof:
- Inspection note in `docs/`.
- No behavior changes unless explicitly assigned.

### Lane 4 — Visual / Art Direction

Assigned role: Veyra

Output:
- Dragon-style art direction brief for route, battle, evolution, elements, enemies, treasure/hoard UI.
- Animation feel targets: breath, crit, dodge, block, speed, impact, ultimate.
- Readability rules for phone screen.

Proof:
- Art direction doc and/or mock/spec in `docs/`.
- Specific acceptance checks for implementation, not just mood words.

### Lane 5 — Implementation Slices

Assigned role: Pyraxis

Output sequence:
1. Route/adventure path skeleton.
2. Stat-impact combat presentation pass.
3. Flashy battle feedback animations.
4. Skill drafting and build tags.
5. Evolution branch model.
6. Relics/hoard/idle rewards after core loop is readable.

Proof:
- RED/GREEN automation where possible.
- `npm run test:auto`.
- `npm run typecheck`.
- `git diff --check -- <changed files>`.
- Direct Expo bundle check when Metro is running.

### Lane 6 — Validation / QA

Assigned role: Caldrin

Output:
- Playtest packets for subjective feel.
- Pass/borderline/fail rubrics.
- Capture exact user feedback and convert it into next decision gates.

Proof:
- Validation packet in `docs/`.
- Results logged before new scope is started.

### Lane 7 — Marketing / Capture Later

Assigned role: Ignivar

Output:
- Internal capture checklist only after gameplay is visibly presentable.
- Do not public-post or overpromise.

Proof:
- Parked checklist or honest internal trailer-beat outline.

## Operating Rules

- One implementation owner edits a hot file at a time.
- Parallelize research/design/engineering-map work; do not parallelize conflicting code edits.
- Every task must define:
  - exact goal
  - files/surfaces to inspect or edit
  - guardrails
  - proof command
  - done condition
  - rollback note if code changes
- Subjective visual/game-feel work needs objective checks in `test:auto` before or alongside code changes.
- Balance changes require explicit product approval unless a task is only adding presentation/readability around existing math.
- Evolutions must be build-defining, not only stat bumps.
- Stats must have visible feedback in battle.

## Initial Hermes Kanban Board

Board: `isekai-dragons`

Active parallel discovery cards:

1. `t_71e94f45` — Aurelith: Capybara Go adaptation product brief.
2. `t_5775bfc9` — Forgehand: engineering surface map for adventure path/stats/skills/evolutions.
3. `t_da6fcb0d` — Veyra: dragon art + animation direction brief.
4. `t_9ad8873c` — Caldrin: adventure-path validation rubric and playtest packet.

Blocked/gated follow-up cards:

5. `t_7f461b3d` — Ember: synthesize first implementation plan after cards 1-4 finish.
6. `t_017da304` — Pyraxis: implement route skeleton after the plan is approved.
7. `t_1a67e0f1` — Aurelith: impactful stat model spec after product + engineering outputs.
8. `t_fcfc0300` — Aurelith: dragon evolution branch map after product + art outputs.

Priority order after discovery:

1. Unblock/synthesize the implementation plan.
2. Implement route skeleton only after design + engineering + validation are ready.
3. Implement stat-impact presentation after route skeleton.
4. Implement skill drafting after stat-impact proof.
5. Implement evolution branch data/UI after the branch map is accepted.

## Definition of Good Workflow

A good Dragonforge workflow produces:

- A visible player-facing improvement each implementation slice.
- A proof trail future agents can trust.
- A clear next owner.
- Fewer repeated “continue working” prompts from Logan/Topnotch.
- No hidden scope creep into monetization, balance, or save-state risk without an explicit gate.
