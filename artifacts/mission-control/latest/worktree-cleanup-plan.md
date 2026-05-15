# Worktree Cleanup Plan

Source report: `artifacts/mission-control/latest/unknown-review-pass.md`
Generated: 2026-05-15
Mode: **plan only** — no files deleted, no `.gitignore` edits, no commits, no mass-ignore.

## Goal

Turn the unknown/unreviewed worktree pile into a staged cleanup Logan can approve one step at a time, without interrupting production flow or hiding important project/source assets.

Current review-report baseline:

- dirty entries: **6123**
- untracked/unknown inspected: **6101**
- KEEP_TRACKED: **370**
- GENERATED_USEFUL: **1999**
- IGNORE: **3553**
- REVIEW_LATER: **179**

## Stage 0 — Approval Gate

Before any action:

1. Logan approves the first `.gitignore` policy update.
2. Run `git status --short --untracked-files=all` before/after the ignore-only change.
3. Confirm only cache/temp/vendor/tooling noise disappears from status.
4. Do **not** delete the ignored files yet.
5. Do **not** commit app/product/source changes in the ignore-policy commit.

## 1. SAFE IGNORE CANDIDATES

These are clearly cache/temp/vendor/tooling noise. They are candidates for a first safe `.gitignore` update, pending Logan approval.

| Pattern / File | Why safe | Recommended action | Human review required |
|---|---|---|---|
| `__pycache__/` | Python bytecode cache; reproducible. | Add ignore pattern. | No |
| `*.py[cod]` | Python compiled bytecode; standard generated output. | Add ignore pattern. | No |
| `.openclaw/` | Local OpenClaw workspace state, not product source. | Add ignore pattern unless Logan wants OpenClaw state tracked. | Low |
| `tmp_*` | Scratch comparison images such as `tmp_egg_crack_contact*.png`. | Add ignore pattern; do not delete yet. | No |
| `expo-lan-qr.png` | Ephemeral Expo LAN QR screenshot. | Add exact-file ignore. | No |
| `memory/.dreams/` | Agent runtime/dream/recall cache; likely private/local. | Add ignore pattern. | Low privacy review |
| `tools/krita-portable/` | Portable Krita vendor/binary bundle; thousands of files, not source. | Add ignore pattern; keep install notes separately if needed. | Low |
| `artifacts/mission-control/latest/*.log` | Already ignored; transient logs. | Keep existing pattern. | No |
| `artifacts/autonomous-loop/*.log` | High-volume repeated autonomous loop logs. | Add ignore pattern; keep selected summaries only. | No |
| `artifacts/autonomous-10h/*.log` | High-volume run logs. | Add ignore pattern; preserve curated summaries if useful. | No |
| `artifacts/mission-control/latest/*.tmp` | Already ignored; transient cache. | Keep existing pattern. | No |
| `artifacts/mission-control/latest/*.cache` | Already ignored; transient cache. | Keep existing pattern. | No |
| `artifacts/mission-control/latest/*.html` | Mutable dashboard snapshots; easily regenerated. | Candidate ignore, but keep selected proof summaries. | Low |
| `artifacts/mission-control/latest/*public-health*.json` | Transient tunnel/public-health checks. | Candidate ignore. | Low |

Recommended first ignore-only patch, if approved:

```gitignore
__pycache__/
*.py[cod]
.openclaw/
tmp_*
expo-lan-qr.png
memory/.dreams/
tools/krita-portable/
artifacts/autonomous-loop/*.log
artifacts/autonomous-10h/*.log
artifacts/mission-control/latest/*.html
artifacts/mission-control/latest/*public-health*.json
```

Do not apply this until Logan explicitly approves.

## 2. DO NOT AUTO-IGNORE

These must stay visible until reviewed. Do **not** hide them with broad ignore rules.

| Protected area | Why protected | Next review action |
|---|---|---|
| `src/**` | App/game source and runtime behavior. | Review diffs and commit only after `npm run typecheck && npm run test:auto`. |
| `scripts/*.js` | Automation/proof scripts; some are wired into `test:auto` and Mission Control. | Review individually; commit active scripts with automation group. |
| `scripts/*.py` | Asset/docs generation scripts may be reusable source. | Separate reusable tools from one-off experiments. |
| `metro.config.js` | Expo/Metro config can affect app launch and asset loading. | Review and commit with app configuration group if still required. |
| curated `docs/*.md` | Source-of-truth docs, runbooks, product/art direction. | Curate and commit in doc batches. |
| `assets/dragons/fire-hatchling-canon-source/**` | Approved Fire Hatchling canon source and minimal separation/Spine preview assets. | Human/art review; track curated canon source assets. |
| runtime egg/cutout assets | Used by hatching/onboarding/evolution presentation. | Verify references and visual quality before asset commit. |
| Mission Control canonical scripts/data | Active dashboard/task/status infrastructure. | Commit in Mission Control stabilization group only after status/proof review. |
| `workspace/your/mission-control/**` | Current Mission Control implementation/data layout. | Confirm repo layout is canonical before committing broad workspace paths. |
| `project/**` | Autonomous project-state/backlog metadata. | Review whether it is durable source-of-truth or generated state. |
| `memory/*.md` and root identity files | Can contain private/local agent memory and identity context. | Privacy review before any tracking decision. |

## 3. GENERATED ARTIFACT POLICY

Generated artifacts are useful, but not all should become source history.

### Keep latest proof summaries

Keep these visible for current review, but commit only the smallest useful summary set:

- `artifacts/mission-control/latest/unknown-review-pass.md`
- `artifacts/mission-control/latest/worktree-cleanup-plan.md`
- selected Mission Control health/proof JSON if they support a commit
- selected `artifacts/test-run/latest/report.json` only when it is needed as release/proof evidence

### Archive curated evidence

For durable milestone evidence, prefer dated or named bundles instead of mutable `latest/` paths:

- `artifacts/mission-control/YYYY-MM-DD-<slug>/...`
- `artifacts/test-run/YYYY-MM-DD-<slug>/...`
- curated Fire Hatchling contact sheets/GIFs tied to a decision

### Ignore repeated frame dumps/log spam

Do not track high-volume generated noise unless a specific file is chosen as evidence:

- repeated autonomous loop logs
- repeated dashboard/public tunnel health snapshots
- bulk frame dumps
- temporary HTML dashboard snapshots
- cache/temp files
- portable tool/vendor output

### Keep only milestone GIF/contact-sheet outputs

For visual/art evidence, keep only milestone outputs that answer a stakeholder question:

- approved Fire Hatchling canon reference
- one or two contact sheets showing before/after progress
- final/accepted GIF or animation proof for a named pass
- source-alignment proof used in a decision

Avoid committing every intermediate generated PNG/frame. Curate first.

## 4. COMMIT GROUPS

Future commits should be small and reviewable. Suggested groups:

### A. Mission Control stabilization

Purpose: dashboard + health policy + task/work-log state.

Likely includes, after review:

- `workspace/your/mission-control/scripts/serve-reading-dashboard.mjs`
- `workspace/your/mission-control/data/tasks.json`
- `workspace/your/mission-control/data/work-log.json`
- `docs/MISSION_CONTROL_HEALTH_POLICY.md`
- selected Mission Control proof reports

Pre-commit gate:

```bash
npm run typecheck && npm run test:auto
```

### B. Deterministic onboarding validation

Purpose: keep Pyraxis hatching/onboarding deterministic validation as a focused automation change.

Likely includes, after review:

- `scripts/test-animation-visual.js`
- selected `artifacts/test-run/latest/report.json` or copied dated proof summary, if needed

Pre-commit gate:

```bash
npm run typecheck && npm run test:auto
```

### C. Artifact / ignore policy

Purpose: reduce worktree noise without hiding important work.

Likely includes, only after Logan approval:

- `.gitignore`
- `docs/ARTIFACT_TRACKING_POLICY.md`
- `artifacts/mission-control/latest/unknown-review-pass.md`
- `artifacts/mission-control/latest/worktree-cleanup-plan.md`

Pre-commit check:

```bash
git status --short --untracked-files=all
```

Expected result: fewer cache/temp/vendor entries; no app/source files hidden.

### D. Fire Hatchling curated production assets

Purpose: track only approved/canonical art source and curated milestone evidence.

Likely includes, after art review:

- `assets/dragons/fire-hatchling-canon-source/canon-selection-manifest.json`
- approved Fire Hatchling canon source image(s)
- minimal separation layers if they are the chosen production source
- selected Spine preview files if accepted as source/proof
- milestone GIF/contact sheet, not every intermediate frame

Do **not** include full generated pass dumps unless explicitly approved.

### E. Docs / runbooks

Purpose: preserve current source-of-truth docs without burying the repo in historical logs.

Possible batches:

1. Mission Control / operating docs
2. Automation / Expo / iPhone validation runbooks
3. Fire Hatchling art direction and Spine production docs
4. Product direction / Capybara Go-like game direction
5. Historical audits only if they support current decisions

## 5. HUMAN REVIEW REQUIRED — Smallest High-Value Set

Before any commits, Logan should review this compact set first:

### Source/config/scripts

- `metro.config.js`
- `src/components/SpineFrameDragon.tsx`
- `src/data/fireHatchlingSpineAnimations.ts`
- `src/evolutionPreview.ts`
- `scripts/test-animation-visual.js`
- `scripts/mission-control-dirty-triage.js`

### Mission Control canonical state

- `workspace/your/mission-control/scripts/serve-reading-dashboard.mjs`
- `workspace/your/mission-control/data/tasks.json`
- `workspace/your/mission-control/data/work-log.json`
- `docs/MISSION_CONTROL_HEALTH_POLICY.md`
- `docs/ARTIFACT_TRACKING_POLICY.md`

### Ignore/artifact policy

- `.gitignore`
- `artifacts/mission-control/latest/unknown-review-pass.md`
- `artifacts/mission-control/latest/worktree-cleanup-plan.md`

### Fire Hatchling source-of-truth assets

- `assets/dragons/fire-hatchling-canon-source/canon-selection-manifest.json`
- `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png`
- `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved-original.jpg`
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/00_canon_fullbody_base_do_not_repaint.png`
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/01_visible_eye_clean_eyelid_blink.png`

### Runtime visual assets

- `assets/dragons/fire-drake-cutout.png`
- `assets/dragons/earth-drake-cutout.png`
- `assets/dragons/water-drake-cutout.png`
- `assets/eggs/fire-dragon-egg-cutout.png`
- `assets/eggs/fire-dragon-egg-crack-1.png`
- `assets/eggs/fire-dragon-egg-crack-2.png`
- `assets/eggs/fire-dragon-egg-crack-3.png`

### Privacy/local-state review

- `memory/*.md`
- `AGENTS.md`
- `HEARTBEAT.md`
- `IDENTITY.md`
- `MEMORY.md`
- `SOUL.md`
- `TOOLS.md`
- `USER.md`

Default recommendation: do not commit root agent identity/memory files unless Logan explicitly wants them in this repo.

## 6. NO DESTRUCTIVE ACTION

This plan authorizes **no destructive action**.

Do not:

- delete files
- move files
- modify `.gitignore`
- commit files
- run cleanup scripts
- mass-ignore directories beyond the approved first policy patch
- hide `src/**`, scripts, docs, runtime assets, or Mission Control state

## Recommended First Approval Ask

If Logan approves the first safe cleanup step, make exactly one narrow `.gitignore` policy update for cache/temp/vendor/tooling noise:

```gitignore
__pycache__/
*.py[cod]
.openclaw/
tmp_*
expo-lan-qr.png
memory/.dreams/
tools/krita-portable/
artifacts/autonomous-loop/*.log
artifacts/autonomous-10h/*.log
artifacts/mission-control/latest/*.html
artifacts/mission-control/latest/*public-health*.json
```

Then immediately verify:

```bash
git status --short --untracked-files=all
npm run typecheck && npm run test:auto
```

Success for first cleanup step: worktree noise drops substantially, important source/art/docs remain visible, and automation stays green.
