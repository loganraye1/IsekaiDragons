# Commit Group Staging Plan

Generated: 2026-05-15T01:56:12Z
Source: `artifacts/mission-control/latest/cleanup-execution-pass.md`
Mode: **plan only** — no `git add`, no commit, no delete, no new ignore rules, no feature/art/animation work.

## Guardrails

- Do not stage anything until Logan approves a specific group.
- Do not use `git add .` or `git add -A`.
- Use explicit path staging only.
- Keep source/app changes separate from generated artifacts and docs.
- Keep Mission Control canonical files separate from generated Next/cache output.
- Re-run validation immediately before each commit.

## Proposed Commit Groups

### 1. Artifact / ignore policy

**Reason:** Capture the accepted safe ignore cleanup and review reports as the foundation for future worktree hygiene. This is the lowest-risk first commit because it reduces noise without touching app runtime behavior.

**Risk level:** Low

**Validation required before commit:**

```bash
npm run mission:triage && npm run typecheck && npm run test:auto
```

**Exact files to include:**

- `.gitignore`
- `docs/ARTIFACT_TRACKING_POLICY.md`
- `artifacts/mission-control/latest/unknown-review-pass.md`
- `artifacts/mission-control/latest/worktree-cleanup-plan.md`
- `artifacts/mission-control/latest/cleanup-execution-pass.md`
- `artifacts/mission-control/latest/commit-group-staging-plan.md`

**Exact files / paths to exclude from this group:**

- `artifacts/mission-control/latest/cleanup-baseline-before.json`
- `artifacts/mission-control/latest/cleanup-baseline-after.json`
- `artifacts/mission-control/latest/cleanup-baseline-final.json`
- `artifacts/mission-control/latest/git-status-after-ignore.txt`
- `artifacts/mission-control/latest/git-status-current.txt`
- `artifacts/mission-control/latest/git-status-for-staging-plan.txt`
- `artifacts/mission-control/latest/dashboard-current-public-root.html`
- `artifacts/mission-control/latest/dashboard-public-root.html`
- `artifacts/mission-control/latest/dashboard-root.html`
- `artifacts/mission-control/latest/dashboard-root-cleanup.html`
- `artifacts/mission-control/latest/solo-founder-dashboard-root.html`
- `artifacts/mission-control/latest/solo-founder-dashboard-public-root.html`
- `artifacts/mission-control/latest/pyraxis-hatching-onboarding-dashboard-root-final.html`
- `artifacts/mission-control/latest/dashboard-health.json`
- `artifacts/mission-control/latest/dashboard-health-cleanup.json`
- `artifacts/mission-control/latest/owner-action-cleanup-proof.json`
- `artifacts/mission-control/latest/pyraxis-hatching-onboarding-dashboard-health.json`
- `artifacts/mission-control/latest/pyraxis-hatching-onboarding-dashboard-health-final.json`
- `artifacts/mission-control/latest/solo-founder-dashboard-health.json`
- `artifacts/mission-control/latest/solo-founder-dashboard-health-after-tests.json`
- `artifacts/mission-control/latest/solo-founder-dashboard-proof.json`
- `artifacts/mission-control/latest/stabilization-layer-dashboard-proof.json`


### 2. Mission Control stabilization

**Reason:** Commit the solo-founder command dashboard and its canonical task/status data separately from generated dashboard caches and proofs.

**Risk level:** Medium

**Validation required before commit:**

```bash
npm run mission:triage && npm run typecheck && npm run test:auto
```

**Exact files to include:**

- `workspace/your/mission-control/scripts/serve-reading-dashboard.mjs`
- `workspace/your/mission-control/data/tasks.json`
- `workspace/your/mission-control/data/work-log.json`
- `workspace/your/mission-control/data/agent-chat.json`
- `workspace/your/mission-control/lib/openclaw-data.ts`
- `workspace/your/mission-control/package.json`
- `workspace/your/mission-control/tsconfig.json`
- `workspace/your/mission-control/next.config.mjs`
- `workspace/your/mission-control/next-env.d.ts`
- `docs/MISSION_CONTROL_HEALTH_POLICY.md`

**Exact files / paths to exclude from this group:**

- `workspace/your/mission-control/.next/`
- `workspace/your/mission-control/tmp/`
- `workspace/your/mission-control/C:\Users\logan\OneDrive\Desktop\Isekai Dragons\workspace\your\mission-control/`
- `workspace/your/mission-control/node_modules/`
- `workspace/your/mission-control/.env`


### 3. Deterministic onboarding validation

**Reason:** Commit the deterministic hatching/onboarding validation harness as a focused automation change. Include source reducer/storage/type changes only if a manual diff review proves they are required for this validation and not broader gameplay work.

**Risk level:** Medium

**Validation required before commit:**

```bash
npm run typecheck && npm run test:auto
```

**Exact files to include:**

- `scripts/test-animation-visual.js`

**Exact files / paths to exclude from this group:**

- `artifacts/test-run/latest/`
- `artifacts/mission-control/latest/pyraxis-hatching-onboarding-typecheck*.log`
- `artifacts/mission-control/latest/pyraxis-hatching-onboarding-test-auto*.log`
- `App.tsx`


### 4. Docs / runbooks

**Reason:** Commit curated operating docs and stakeholder-facing runbooks in a coherent documentation batch, not historical log spam.

**Risk level:** Medium

**Validation required before commit:**

```bash
npm run mission:triage && npm run typecheck && npm run test:auto
```

**Exact files to include:**

- `docs/AUTOMATION_RUNBOOK.md`
- `docs/EXPO_GO_CONNECTIVITY_RUNBOOK_2026-05-10.md`
- `docs/FIRST_IPHONE_PLAYTEST_CHECKLIST.md`
- `docs/CAPYBARA_GO_DRAGON_DIRECTION.md`
- `docs/CAPYBARA_GO_PRODUCT_BRIEF_2026-05-11.md`
- `docs/TOPNOTCH_PRODUCT_DIRECTIVE_2026-05-12.md`
- `docs/FIRE_HATCHLING_ANIMATION_PIPELINE_DECISION.md`
- `docs/FIRE_HATCHLING_COHESIVE_ART_PIVOT_2026-05-14.md`
- `docs/FIRE_HATCHLING_SPINE_IMPLEMENTATION_STEPS.md`
- `docs/FIRE_HATCHLING_SPINE_AUTHORING_PACKAGE.md`
- `docs/HATCHLING_ART_BIBLE.md`
- `RELEASE_NOTES.md`
- `README.md`
- `dragonforge-content-kit.md`

**Exact files / paths to exclude from this group:**

- `docs/audit/`
- `docs/journal/`
- `docs/agents/`
- `docs/Dragon_Evolution_Branches_Stats_Skills_2026-05-11.pdf`
- `docs/DRAGON_EVOLUTION_BRANCHES_STATS_SKILLS_2026-05-11.html`
- `docs/dragon_evolution_infographic_2026-05-11.png`
- `docs/drake_path_silhouette_direction_2026-05-11.png`
- `docs/evolution_path_placeholder_map_2026-05-11.png`


### 5. Curated Fire Hatchling production assets

**Reason:** Commit only approved/canonical Fire Hatchling source assets plus the runtime code/assets needed to display them. Do not include bulk generated pass dumps.

**Risk level:** High

**Validation required before commit:**

```bash
npm run typecheck && npm run test:auto
```

**Exact files to include:**

- `assets/dragons/fire-hatchling-canon-source/canon-selection-manifest.json`
- `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png`
- `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved-original.jpg`
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/00_canon_fullbody_base_do_not_repaint.png`
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/01_visible_eye_clean_eyelid_blink.png`
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/guide_minimal_motion_anchors_not_export_art.png`
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/fire-hatchling-A-subtle-life-v1.spine`
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/fire-hatchling-A-subtle-life-v1.spine.json`
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/images/canon_base.png`
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/images/eyelid_blink.png`
- `assets/dragons/fire-drake-cutout.png`
- `assets/dragons/earth-drake-cutout.png`
- `assets/dragons/water-drake-cutout.png`
- `assets/eggs/fire-dragon-egg-cutout.png`
- `assets/eggs/fire-dragon-egg-crack-1.png`
- `assets/eggs/fire-dragon-egg-crack-2.png`
- `assets/eggs/fire-dragon-egg-crack-3.png`
- `src/components/SpineFrameDragon.tsx`
- `src/data/fireHatchlingSpineAnimations.ts`
- `src/evolutionPreview.ts`

**Exact files / paths to exclude from this group:**

- `assets/dragons/living-forge-fire-hatchling/`
- `assets/dragons/layers/`
- `assets/dragons/placeholders/`
- `assets/dragons/fire-hatchling-canon-source/intermediate-passes/`
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/exported-frames/`


## Remaining `unknown/unreviewed: 21` Disposition

| Entry | Assignment | Disposition | Reason |
|---|---|---|---|
| ` M .gitignore` | Artifact / ignore policy | include in commit group | Reviewed safe ignore policy change already applied; commit only with cleanup plans. |
| ` M README.md` | Docs / runbooks | review manually | Root README may contain product/ops messaging; review diff before docs commit. |
| ` M RELEASE_NOTES.md` | Docs / runbooks | review manually | Release notes are stakeholder-facing; review for accuracy before docs commit. |
| ` M src/artVersion.ts` | Curated Fire Hatchling production assets | review manually | Source versioning affects runtime art selection; do not bundle until asset set is reviewed. |
| ` M src/balance.ts` | leave untracked temporarily | review manually | Gameplay tuning/source change; outside cleanup pass and should not ride artifact commit. |
| ` M src/content.ts` | leave untracked temporarily | review manually | Content/runtime source change; needs product/source review separately. |
| ` M src/game.ts` | Deterministic onboarding validation | review manually | Reducer hatching/onboarding logic may relate to validation; include only if diff confirms it is required. |
| ` M src/storage.ts` | Deterministic onboarding validation | review manually | Persistence/hydrate defaults may support deterministic onboarding; review diff before including. |
| ` M src/types.ts` | Deterministic onboarding validation | review manually | Typed state contracts may support onboarding validation; review diff before including. |
| `?? AGENTS.md` | leave untracked temporarily | review manually | Agent identity/workspace guidance; privacy/repo-scope review required. |
| `?? HEARTBEAT.md` | leave untracked temporarily | review manually | Agent runtime/proactive schedule notes; likely local/private. |
| `?? IDENTITY.md` | leave untracked temporarily | review manually | Agent identity file; privacy review required. |
| `?? MEMORY.md` | leave untracked temporarily | review manually | Long-term memory may contain private context; do not commit without explicit approval. |
| `?? SOUL.md` | leave untracked temporarily | review manually | Agent persona/identity; privacy/repo-scope review required. |
| `?? TOOLS.md` | leave untracked temporarily | review manually | May contain local tool details; privacy review required. |
| `?? USER.md` | leave untracked temporarily | review manually | Likely personal profile/preferences; do not commit without explicit approval. |
| `?? dragonforge-content-kit.md` | Docs / runbooks | review manually | Potentially useful stakeholder/content kit; review and move/commit with docs if canonical. |
| `?? src/components/` | Curated Fire Hatchling production assets | include in commit group after review | Contains SpineFrameDragon runtime component; include only exact reviewed file(s). |
| `?? src/data/` | Curated Fire Hatchling production assets | include in commit group after review | Contains Fire Hatchling Spine animation data; include only exact reviewed file(s). |
| `?? src/evolutionPreview.ts` | Curated Fire Hatchling production assets | review manually | Runtime preview source; include with curated visual asset/source group if still active. |
| `?? workspace/` | Mission Control stabilization | include in commit group after review | Contains canonical Mission Control files plus generated Next caches; include only explicit canonical files. |

## Suggested Approval / Staging Order

1. Approve **Artifact / ignore policy** first. Stage explicit paths only:

```bash
git add .gitignore \
  docs/ARTIFACT_TRACKING_POLICY.md \
  artifacts/mission-control/latest/unknown-review-pass.md \
  artifacts/mission-control/latest/worktree-cleanup-plan.md \
  artifacts/mission-control/latest/cleanup-execution-pass.md \
  artifacts/mission-control/latest/commit-group-staging-plan.md
```

2. Run validation and inspect staged diff:

```bash
npm run mission:triage && npm run typecheck && npm run test:auto
git diff --cached --check
git diff --cached --stat
```

3. Only then approve the commit message. Suggested message:

```text
chore: establish artifact and ignore policy baseline
```

4. Next, review Mission Control stabilization as its own commit. Do not include `.next/`, `tmp/`, or Windows-path generated cache directories.

5. Then review deterministic onboarding validation. Do not include broader source/gameplay changes unless the diff proves they are required.

6. Docs/runbooks and Fire Hatchling assets should remain separate because they have different reviewers and risk profiles.

## Current Non-Action Confirmation

This plan did not:

- stage files
- commit files
- delete files
- add `.gitignore` rules
- start feature work
- start art/animation work
- reorganize the repo
