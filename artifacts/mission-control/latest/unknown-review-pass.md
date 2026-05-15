# Unknown / Unreviewed Worktree Review Pass

Generated: 2026-05-15T01:41:06Z

Scope: categorization-only review of current dirty worktree. No files were deleted, committed, moved, or ignored.

## Executive Summary

- Current `git status --porcelain --untracked-files=all` entries: **6123**
- Untracked/unknown entries inspected: **6101**
- Modified source/root entries still requiring normal code review: **9**
- KEEP_TRACKED: **370**
- GENERATED_USEFUL: **1999**
- IGNORE: **3553**
- REVIEW_LATER: **179**

Interpretation: review debt is dominated by a portable Krita/tool bundle, generated artifacts, generated art passes, and historical docs/audit outputs. The actionable source/code unknown set is much smaller and should be reviewed separately from generated evidence.

## Category Rules

- **KEEP_TRACKED**: likely durable source/config/docs/assets that should be reviewed for commit.
- **GENERATED_USEFUL**: useful proof/artifact outputs, but should be curated; do not blanket commit all.
- **IGNORE**: cache/temp/local tool state that is safe to ignore after human confirms policy.
- **REVIEW_LATER**: potentially useful but needs owner/privacy/relevance review before tracking or ignoring.

## Categorized Groups

### KEEP_TRACKED — `assets/` (291 file(s))

- **category:** KEEP_TRACKED
- **reason:** Runtime art asset candidate used by current dragon/egg/evolution presentation.
- **recommended action:** Verify references and visual quality, then commit with asset/art group.
- **human review required:** yes
- **oldest approx age:** 5.1 days
- **examples:**
  - `assets/dragons/earth-drake-cutout.png`
  - `assets/dragons/fire-drake-cutout.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/README.md`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_ancient_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_dragon_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_drake_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_egg_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_hatchling_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_young_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_blood_drake_path_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_curse_drake_path_placeholder.png`
  - `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_shadow_drake_path_placeholder.png`
  - …and 279 more

### KEEP_TRACKED — `assets/` (10 file(s))

- **category:** KEEP_TRACKED
- **reason:** Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth.
- **recommended action:** Track curated canon source + manifest; review generated preview subfolders before committing.
- **human review required:** yes
- **oldest approx age:** 0.2 days
- **examples:**
  - `assets/dragons/fire-hatchling-canon-source/canon-selection-manifest.json`
  - `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved-original.jpg`
  - `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png`
  - `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/00_canon_fullbody_base_do_not_repaint.png`
  - `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/01_visible_eye_clean_eyelid_blink.png`
  - `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/guide_minimal_motion_anchors_not_export_art.png`
  - `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/fire-hatchling-A-subtle-life-v1.spine`
  - `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/fire-hatchling-A-subtle-life-v1.spine.json`
  - `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/images/canon_base.png`
  - `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/images/eyelid_blink.png`

### KEEP_TRACKED — `docs/` (58 file(s))

- **category:** KEEP_TRACKED
- **reason:** Hand-authored planning/operating doc likely part of current source-of-truth.
- **recommended action:** Review for relevance, then commit curated docs in thematic groups.
- **human review required:** yes
- **oldest approx age:** 5.2 days
- **examples:**
  - `docs/AGENT_OPERATING_RHYTHM.md`
  - `docs/ARTIFACT_TRACKING_POLICY.md`
  - `docs/AUTOMATION_RUNBOOK.md`
  - `docs/AUTONOMOUS_10H_POLISH_PLAN_2026-05-11.md`
  - `docs/AUTONOMOUS_10H_POLISH_PROMPT_2026-05-11.md`
  - `docs/AUTONOMOUS_10H_POLISH_REPORT_2026-05-11.md`
  - `docs/CALDRIN_CAPYBARA_ADVENTURE_VALIDATION_PACKET_2026-05-11.md`
  - `docs/CAPYBARA_GO_DRAGON_DIRECTION.md`
  - `docs/CAPYBARA_GO_DRAGON_WORKFLOW_2026-05-11.md`
  - `docs/CAPYBARA_GO_PRODUCT_BRIEF_2026-05-11.md`
  - `docs/CREW_OPERATING_SYSTEM.md`
  - `docs/DISCORD_MISSION_CONTROL_PLAN.md`
  - …and 46 more

### KEEP_TRACKED — `dragonforge-content-kit.md/` (1 file(s))

- **category:** KEEP_TRACKED
- **reason:** Likely shareable Dragonforge content/planning artifact.
- **recommended action:** Review content, then commit with docs/content kit group if still current.
- **human review required:** yes
- **oldest approx age:** 4.8 days
- **examples:**
  - `dragonforge-content-kit.md`

### KEEP_TRACKED — `metro.config.js/` (1 file(s))

- **category:** KEEP_TRACKED
- **reason:** Potentially important app source/config referenced by current runtime or automation.
- **recommended action:** Human/code review, then commit with app/source group after typecheck/test:auto.
- **human review required:** yes
- **oldest approx age:** 3.8 days
- **examples:**
  - `metro.config.js`

### KEEP_TRACKED — `scripts/` (6 file(s))

- **category:** KEEP_TRACKED
- **reason:** Automation or production support script; several are wired to package scripts/proof flow.
- **recommended action:** Review script intent and commit with automation-source group if still active.
- **human review required:** yes
- **oldest approx age:** 4.0 days
- **examples:**
  - `scripts/generate_evolution_path_placeholders.py`
  - `scripts/mission-control-dirty-triage.js`
  - `scripts/run-autonomous-10h-loop.sh`
  - `scripts/run-autonomous-10h-polish.sh`
  - `scripts/run-overnight-self-improve.sh`
  - `scripts/test-animation-visual.js`

### KEEP_TRACKED — `src/` (3 file(s))

- **category:** KEEP_TRACKED
- **reason:** Potentially important app source/config referenced by current runtime or automation.
- **recommended action:** Human/code review, then commit with app/source group after typecheck/test:auto.
- **human review required:** yes
- **oldest approx age:** 3.0 days
- **examples:**
  - `src/components/SpineFrameDragon.tsx`
  - `src/data/fireHatchlingSpineAnimations.ts`
  - `src/evolutionPreview.ts`

### GENERATED_USEFUL — `artifacts/` (1335 file(s))

- **category:** GENERATED_USEFUL
- **reason:** Generated proof/log/storyboard artifact from automation or autonomous runs.
- **recommended action:** Review only curated summaries; ignore bulk logs and generated frames unless selected as evidence.
- **human review required:** no
- **oldest approx age:** 6.1 days
- **examples:**
  - `artifacts/autonomous-10h/latest.log`
  - `artifacts/autonomous-10h/polish-2026-05-11-20260510-204205.log`
  - `artifacts/autonomous-loop/final-diff-check-20260510-211114.log`
  - `artifacts/autonomous-loop/final-git-status-20260510-211114.txt`
  - `artifacts/autonomous-loop/final-test-auto-20260510-211114.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-1.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-10.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-11.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-12.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-13.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-14.log`
  - `artifacts/autonomous-loop/iteration-20260510-211114-15.log`
  - …and 1323 more

### GENERATED_USEFUL — `artifacts/` (22 file(s))

- **category:** GENERATED_USEFUL
- **reason:** Latest proof/dashboard artifact. Useful for current review but mutable/noisy.
- **recommended action:** Keep only curated report artifacts; prefer dated immutable bundles over committing `latest/`.
- **human review required:** no
- **oldest approx age:** 0.1 days
- **examples:**
  - `artifacts/mission-control/latest/dashboard-current-public-health.json`
  - `artifacts/mission-control/latest/dashboard-current-public-root.html`
  - `artifacts/mission-control/latest/dashboard-health-cleanup.json`
  - `artifacts/mission-control/latest/dashboard-health.json`
  - `artifacts/mission-control/latest/dashboard-public-health.json`
  - `artifacts/mission-control/latest/dashboard-public-root.html`
  - `artifacts/mission-control/latest/dashboard-root-cleanup.html`
  - `artifacts/mission-control/latest/dashboard-root.html`
  - `artifacts/mission-control/latest/dirty-worktree-triage.md`
  - `artifacts/mission-control/latest/git-status-current.txt`
  - `artifacts/mission-control/latest/owner-action-cleanup-proof.json`
  - `artifacts/mission-control/latest/pyraxis-hatching-onboarding-dashboard-health-final.json`
  - …and 10 more

### GENERATED_USEFUL — `assets/` (602 file(s))

- **category:** GENERATED_USEFUL
- **reason:** Large generated Fire hatchling production/pass outputs; useful as art evidence, noisy as source.
- **recommended action:** Curate final approved frames/assets; avoid committing every intermediate pass.
- **human review required:** yes
- **oldest approx age:** 4.5 days
- **examples:**
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cohesive-base-manifest.json`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cohesive-proof-layer-manifest.json`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cut-layers-proof/body_core.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cut-layers-proof/front_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cut-layers-proof/head_neck.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cut-layers-proof/rear_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cut-layers-proof/tail_lantern.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/cut-layers-proof/wing.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/living-forge-hatchling-cohesive-base-transparent-review-v2.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/living-forge-hatchling-cohesive-base-transparent-review.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/living-forge-hatchling-cohesive-base-transparent-v2.png`
  - `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/living-forge-hatchling-cohesive-base-transparent.png`
  - …and 590 more

### GENERATED_USEFUL — `docs/` (32 file(s))

- **category:** GENERATED_USEFUL
- **reason:** Generated audit/proof note. Useful history but high-volume.
- **recommended action:** Keep selected audits that support decisions; consider docs/audit/ policy before mass tracking.
- **human review required:** yes
- **oldest approx age:** 2.1 days
- **examples:**
  - `docs/audit/FORGEHAND_ACCESSIBILITY_TOUCH_TARGET_AUDIT_2026-05-14-1128.md`
  - `docs/audit/FORGEHAND_ANIMATION_RUNTIME_EXPO_GO_HEALTH_2026-05-15-0124.md`
  - `docs/audit/FORGEHAND_ASSET_IMPORT_CASE_HEALTH_2026-05-14-1936.md`
  - `docs/audit/FORGEHAND_ASSET_REQUIRE_EXTENSION_EXPO_GO_HEALTH_2026-05-14-0551.md`
  - `docs/audit/FORGEHAND_AUDIO_STUB_EXPO_GO_RISK_NOTE_2026-05-14-0914.md`
  - `docs/audit/FORGEHAND_AUTOMATION_ARTIFACT_FRESHNESS_NOTE_2026-05-14-1820.md`
  - `docs/audit/FORGEHAND_BATTLE_CALLOUT_SOURCE_ALIGNMENT_2026-05-13-1723.md`
  - `docs/audit/FORGEHAND_BATTLE_REDUCED_MOTION_STATIC_RECAP_AUDIT_2026-05-13-1507.md`
  - `docs/audit/FORGEHAND_BOTTOM_ACTION_NAV_OVERLAP_RISK_2026-05-13-1944.md`
  - `docs/audit/FORGEHAND_EGG_HATCH_REDUCED_MOTION_GAP_2026-05-13-2047.md`
  - `docs/audit/FORGEHAND_EXPO_GO_NATIVE_SURFACE_HEALTH_2026-05-13-0705.md`
  - `docs/audit/FORGEHAND_FIRE_ROUTE_SCOPE_ALIGNMENT_NOTE_2026-05-13-1357.md`
  - …and 20 more

### GENERATED_USEFUL — `docs/` (5 file(s))

- **category:** GENERATED_USEFUL
- **reason:** Generated/shareable documentation artifact rather than hand-authored source.
- **recommended action:** Keep if stakeholder-facing; otherwise move to artifacts or regenerate from markdown source.
- **human review required:** yes
- **oldest approx age:** 3.1 days
- **examples:**
  - `docs/DRAGON_EVOLUTION_BRANCHES_STATS_SKILLS_2026-05-11.html`
  - `docs/Dragon_Evolution_Branches_Stats_Skills_2026-05-11.pdf`
  - `docs/dragon_evolution_infographic_2026-05-11.png`
  - `docs/drake_path_silhouette_direction_2026-05-11.png`
  - `docs/evolution_path_placeholder_map_2026-05-11.png`

### GENERATED_USEFUL — `tools/` (3 file(s))

- **category:** GENERATED_USEFUL
- **reason:** Tool output/support file under tools; likely generated by art tooling.
- **recommended action:** Review by folder owner before tracking; ignore caches/binaries separately.
- **human review required:** yes
- **oldest approx age:** 0.9 days
- **examples:**
  - `tools/capture_spine_screen.ps1`
  - `tools/capture_spine_screenshot.ps1`
  - `tools/start_spine_screen_relay.ps1`

### IGNORE — `.openclaw/` (1 file(s))

- **category:** IGNORE
- **reason:** OpenClaw local workspace state; machine-local operational cache, not product source.
- **recommended action:** Add `.openclaw/` to .gitignore unless intentionally migrating OpenClaw config into repo.
- **human review required:** no
- **oldest approx age:** 4.9 days
- **examples:**
  - `.openclaw/workspace-state.json`

### IGNORE — `expo-lan-qr.png/` (1 file(s))

- **category:** IGNORE
- **reason:** Ephemeral local Expo LAN QR screenshot.
- **recommended action:** Regenerate when needed; ignore `expo-lan-qr.png`.
- **human review required:** no
- **oldest approx age:** 4.1 days
- **examples:**
  - `expo-lan-qr.png`

### IGNORE — `memory/` (2 file(s))

- **category:** IGNORE
- **reason:** Agent dream/recall runtime cache, not project source.
- **recommended action:** Ignore `memory/.dreams/`; do not commit private/runtime agent cache.
- **human review required:** no
- **oldest approx age:** 1.1 days
- **examples:**
  - `memory/.dreams/events.jsonl`
  - `memory/.dreams/short-term-recall.json`

### IGNORE — `scripts/` (1 file(s))

- **category:** IGNORE
- **reason:** Python bytecode/cache; reproducible and should not be reviewed or committed.
- **recommended action:** Ignore via `__pycache__/` and `*.py[cod]`; optionally delete later after review window.
- **human review required:** no
- **oldest approx age:** 3.1 days
- **examples:**
  - `scripts/__pycache__/generate_evolution_path_placeholders.cpython-314.pyc`

### IGNORE — `tmp_egg_crack_contact.png/` (1 file(s))

- **category:** IGNORE
- **reason:** Temporary scratch output.
- **recommended action:** Ignore `tmp_*` patterns; delete only after human confirms no art comparison still needed.
- **human review required:** no
- **oldest approx age:** 4.0 days
- **examples:**
  - `tmp_egg_crack_contact.png`

### IGNORE — `tmp_egg_crack_contact_after.png/` (1 file(s))

- **category:** IGNORE
- **reason:** Temporary scratch output.
- **recommended action:** Ignore `tmp_*` patterns; delete only after human confirms no art comparison still needed.
- **human review required:** no
- **oldest approx age:** 4.0 days
- **examples:**
  - `tmp_egg_crack_contact_after.png`

### IGNORE — `tmp_egg_crack_contact_final.png/` (1 file(s))

- **category:** IGNORE
- **reason:** Temporary scratch output.
- **recommended action:** Ignore `tmp_*` patterns; delete only after human confirms no art comparison still needed.
- **human review required:** no
- **oldest approx age:** 4.0 days
- **examples:**
  - `tmp_egg_crack_contact_final.png`

### IGNORE — `tools/` (3543 file(s))

- **category:** IGNORE
- **reason:** Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.
- **recommended action:** Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.
- **human review required:** no
- **oldest approx age:** 157.3 days
- **examples:**
  - `tools/krita-portable/krita-x64-5.3.1.zip`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Concurrent.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Core.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Gui.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Network.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5PrintSupport.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Qml.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QmlModels.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QmlWorkerScript.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Quick.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickControls2.dll`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickParticles.dll`
  - …and 3531 more

### IGNORE — `tools/` (2 file(s))

- **category:** IGNORE
- **reason:** Python bytecode/cache; reproducible and should not be reviewed or committed.
- **recommended action:** Ignore via `__pycache__/` and `*.py[cod]`; optionally delete later after review window.
- **human review required:** no
- **oldest approx age:** 0.4 days
- **examples:**
  - `tools/__pycache__/build_fire_hatchling_cohesive_spine_production_prep.cpython-314.pyc`
  - `tools/__pycache__/generate_cohesive_fire_hatchling_v3_proof.cpython-314.pyc`

### REVIEW_LATER — `AGENTS.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.9 days
- **examples:**
  - `AGENTS.md`

### REVIEW_LATER — `HEARTBEAT.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.9 days
- **examples:**
  - `HEARTBEAT.md`

### REVIEW_LATER — `IDENTITY.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.7 days
- **examples:**
  - `IDENTITY.md`

### REVIEW_LATER — `MEMORY.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.6 days
- **examples:**
  - `MEMORY.md`

### REVIEW_LATER — `SOUL.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.9 days
- **examples:**
  - `SOUL.md`

### REVIEW_LATER — `TOOLS.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.6 days
- **examples:**
  - `TOOLS.md`

### REVIEW_LATER — `USER.md/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Hermes/agent identity or user-memory file; could be private or environment-specific.
- **recommended action:** Do not commit without human/privacy review; consider ignoring local agent identity files.
- **human review required:** yes
- **oldest approx age:** 4.9 days
- **examples:**
  - `USER.md`

### REVIEW_LATER — `assets/` (33 file(s))

- **category:** REVIEW_LATER
- **reason:** Layered art production working files; important but may include intermediate/large editor outputs.
- **recommended action:** Curate final layer package and ignore editor caches/derived merges.
- **human review required:** yes
- **oldest approx age:** 4.5 days
- **examples:**
  - `assets/dragons/layers/fire-hatchling/body-matte.png`
  - `assets/dragons/layers/fire-hatchling/body.png`
  - `assets/dragons/layers/fire-hatchling/head-matte.png`
  - `assets/dragons/layers/fire-hatchling/head.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/body_paint_here.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/fire-hatchling-layer-workflow-contact.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/fire-hatchling-layer-workflow.ora`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/head_paint_here.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/krita-open-test.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/mergedimage.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/reference_locked_do_not_edit.png`
  - `assets/dragons/layers/fire-hatchling/krita-workflow/seam_notes_red.png`
  - …and 21 more

### REVIEW_LATER — `docs/` (88 file(s))

- **category:** REVIEW_LATER
- **reason:** Documentation backlog item; may be historical or duplicated by newer docs.
- **recommended action:** Review age/relevance before tracking; consolidate if superseded.
- **human review required:** yes
- **oldest approx age:** 5.2 days
- **examples:**
  - `docs/ANIMATION_TIER_TAXONOMY.md`
  - `docs/ART_AUDIT_2026-05-09.md`
  - `docs/ASSET_PIPELINE_INVENTORY_2026-05-10.md`
  - `docs/AUTOMATED_LAYER_ART_WORKFLOW.md`
  - `docs/AUTONOMOUS_LOOP_ITERATION_PROMPT_2026-05-11.md`
  - `docs/AUTONOMOUS_LOOP_STATUS_2026-05-11.md`
  - `docs/DRAGON_EVOLUTION_BRANCHES_STATS_SKILLS_2026-05-11.md`
  - `docs/DRAKE_CONTINUITY_REVIEW_GUIDE.md`
  - `docs/DRAKE_PATH_VISUAL_DISTINCTION_2026-05-11.md`
  - `docs/EVOLUTION_PATH_PLACEHOLDER_ART_2026-05-11.md`
  - `docs/EVOLUTION_PLACEHOLDER_ART_AND_INFOGRAPHIC_2026-05-11.md`
  - `docs/EXPO_GO_CONNECTIVITY_RUNBOOK_2026-05-10.md`
  - …and 76 more

### REVIEW_LATER — `memory/` (7 file(s))

- **category:** REVIEW_LATER
- **reason:** Agent/project memory notes may include useful context but can contain private/stale session state.
- **recommended action:** Human privacy review before tracking; prefer docs for public project knowledge.
- **human review required:** yes
- **oldest approx age:** 4.8 days
- **examples:**
  - `memory/2026-05-09.md`
  - `memory/2026-05-10.md`
  - `memory/2026-05-11.md`
  - `memory/2026-05-12.md`
  - `memory/2026-05-13.md`
  - `memory/2026-05-14.md`
  - `memory/2026-05-15.md`

### REVIEW_LATER — `project/` (6 file(s))

- **category:** REVIEW_LATER
- **reason:** Autonomous project-state/backlog metadata; may be useful for Mission Control but source-of-truth unclear.
- **recommended action:** Review ownership with Mission Control; track only durable configs/backlogs.
- **human review required:** yes
- **oldest approx age:** 0.1 days
- **examples:**
  - `project/automation_scores.json`
  - `project/autonomous_loop_rules.md`
  - `project/autonomous_passes/latest_autonomous_directive.json`
  - `project/current_phase.md`
  - `project/escalation_rules.md`
  - `project/production_backlog.json`

### REVIEW_LATER — `tools/` (37 file(s))

- **category:** REVIEW_LATER
- **reason:** Art/asset generation helper script; potentially useful but many are one-off pass generators.
- **recommended action:** Catalog which scripts produced approved assets; track reusable ones, archive or ignore one-off experiments.
- **human review required:** yes
- **oldest approx age:** 4.5 days
- **examples:**
  - `tools/apply_fire_hatchling_actual_mesh_weight_pass.py`
  - `tools/apply_fire_hatchling_hand_tuned_deformation_pass.py`
  - `tools/apply_fire_hatchling_original_art_cohesive_base_repair.py`
  - `tools/apply_fire_hatchling_original_art_fullbody_likeness.py`
  - `tools/apply_fire_hatchling_original_art_likeness_repair.py`
  - `tools/apply_fire_hatchling_original_art_scaled_likeness.py`
  - `tools/apply_fire_hatchling_structural_placement_repair.py`
  - `tools/apply_fire_hatchling_v20_minimal_eyelid_blink.py`
  - `tools/build_actual_spine_mesh_audit_image.py`
  - `tools/build_fire_hatchling_A_subtle_life_proof.py`
  - `tools/build_fire_hatchling_cohesive_spine_production_prep.py`
  - `tools/build_fire_hatchling_exact_layers.py`
  - …and 25 more

### REVIEW_LATER — `workspace/` (1 file(s))

- **category:** REVIEW_LATER
- **reason:** Nested Mission Control workspace; contains active dashboard/task state but may not belong as unreviewed root folder.
- **recommended action:** Review intended repo layout; track specific Mission Control data/scripts if this is the canonical location.
- **human review required:** yes
- **oldest approx age:** 5.4 days
- **examples:**
  - `workspace/`

## Potentially Important Untracked Source / Docs / Scripts

These should not be auto-ignored. Review and commit in small thematic groups if still current.
- `assets/dragons/earth-drake-cutout.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 5.1d; human review: yes)
- `assets/dragons/fire-drake-cutout.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 5.1d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/canon-selection-manifest.json` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved-original.jpg` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/00_canon_fullbody_base_do_not_repaint.png` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/01_visible_eye_clean_eyelid_blink.png` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers/guide_minimal_motion_anchors_not_export_art.png` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/fire-hatchling-A-subtle-life-v1.spine` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/fire-hatchling-A-subtle-life-v1.spine.json` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/images/canon_base.png` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1/images/eyelid_blink.png` — Approved canon source and minimal separation/Spine preview assets are durable art source-of-truth. (age: 0.2d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/README.md` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_ancient_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_drake_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_egg_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_hatchling_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/dark_young_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_blood_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_curse_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_shadow_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/drake_path_distinction_contact_sheet.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/earth_crystal_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/earth_stone_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/earth_thorn_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/fire_flame_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/fire_magma_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/fire_smoke_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/light_dawn_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/light_sacred_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/light_stormlight_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/water_frost_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/water_mist_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/water_tide_drake_path_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/earth_ancient_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/earth_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/earth_drake_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/earth_egg_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/earth_hatchling_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/earth_young_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 3.1d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_ancient_ravager_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_ancient_vampiric_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_doom_ravager_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_doom_vampiric_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_elder_ravager_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_elder_vampiric_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_primordial_ravager_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_primordial_vampiric_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_ancient_hex_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_ancient_reaper_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_doom_hex_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_doom_reaper_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_elder_hex_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_elder_reaper_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_primordial_hex_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_primordial_reaper_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_ancient_night_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_ancient_voidstep_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_doom_night_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_doom_voidstep_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_elder_night_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_elder_voidstep_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_primordial_night_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_primordial_voidstep_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_ancient_gem_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_ancient_prism_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_doom_gem_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_doom_prism_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_elder_gem_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_elder_prism_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_primordial_gem_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_primordial_prism_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_ancient_ironhide_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_ancient_mountain_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_doom_ironhide_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_doom_mountain_avatar_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_elder_ironhide_warden_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_elder_mountain_sovereign_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_primordial_ironhide_ravager_dragon_placeholder.png` — Runtime art asset candidate used by current dragon/egg/evolution presentation. (age: 1.4d; human review: yes)
- …and 290 more KEEP_TRACKED candidates, mostly curated docs/assets.

## Stale Unknown Files

Heuristic: mtime older than 2 days. Stale does not mean useless; it means less likely to be part of the immediate production flow.

- `tools/`: 3549 stale unknown file(s)
- `artifacts/`: 350 stale unknown file(s)
- `docs/`: 103 stale unknown file(s)
- `assets/`: 97 stale unknown file(s)
- `memory/`: 4 stale unknown file(s)
- `scripts/`: 4 stale unknown file(s)
- `.openclaw/`: 1 stale unknown file(s)
- `AGENTS.md/`: 1 stale unknown file(s)
- `HEARTBEAT.md/`: 1 stale unknown file(s)
- `IDENTITY.md/`: 1 stale unknown file(s)
- `MEMORY.md/`: 1 stale unknown file(s)
- `SOUL.md/`: 1 stale unknown file(s)
- `TOOLS.md/`: 1 stale unknown file(s)
- `USER.md/`: 1 stale unknown file(s)
- `dragonforge-content-kit.md/`: 1 stale unknown file(s)
- `expo-lan-qr.png/`: 1 stale unknown file(s)
- `metro.config.js/`: 1 stale unknown file(s)
- `src/`: 1 stale unknown file(s)
- `tmp_egg_crack_contact.png/`: 1 stale unknown file(s)
- `tmp_egg_crack_contact_after.png/`: 1 stale unknown file(s)

Highest-risk stale buckets: historical `docs/`, `artifacts/autonomous-*`, `tools/krita-portable/`, and old generated art passes. Review by bucket, not one-by-one.

## Duplicate / Repeated Generated Artifacts

- `tools/krita-portable/**`: 3543 repeated/generated entries
- `artifacts/autonomous-loop/iteration-*.log`: 55 repeated/generated entries
- `artifacts/mission-control/latest/*`: 22 repeated/generated entries
- `**/__pycache__/** and *.pyc`: 3 repeated/generated entries

Duplicate basename examples:
- `kcoreaddons5_qt.qm` appears 106 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/kcoreaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/kcoreaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/as/LC_MESSAGES/kcoreaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ast/LC_MESSAGES/kcoreaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/kcoreaddons5_qt.qm`
  - …and 101 more
- `ki18n5.mo` appears 101 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/ki18n5.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/ki18n5.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/as/LC_MESSAGES/ki18n5.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/ki18n5.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/ki18n5.mo`
  - …and 96 more
- `kcompletion5_qt.qm` appears 100 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/kcompletion5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/kcompletion5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/as/LC_MESSAGES/kcompletion5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/kcompletion5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/kcompletion5_qt.qm`
  - …and 95 more
- `kitemviews5_qt.qm` appears 100 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/kitemviews5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/kitemviews5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/as/LC_MESSAGES/kitemviews5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/kitemviews5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/kitemviews5_qt.qm`
  - …and 95 more
- `kwidgetsaddons5_qt.qm` appears 100 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/kwidgetsaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/kwidgetsaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/as/LC_MESSAGES/kwidgetsaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/kwidgetsaddons5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/kwidgetsaddons5_qt.qm`
  - …and 95 more
- `kwindowsystem5_qt.qm` appears 100 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/kwindowsystem5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/kwindowsystem5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/as/LC_MESSAGES/kwindowsystem5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/kwindowsystem5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/kwindowsystem5_qt.qm`
  - …and 95 more
- `kconfig5_qt.qm` appears 93 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/kconfig5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/kconfig5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/az/LC_MESSAGES/kconfig5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/kconfig5_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be@latin/LC_MESSAGES/kconfig5_qt.qm`
  - …and 88 more
- `krita.mo` appears 75 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/af/LC_MESSAGES/krita.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ar/LC_MESSAGES/krita.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/krita.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/bg/LC_MESSAGES/krita.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/br/LC_MESSAGES/krita.mo`
  - …and 70 more
- `__init__.py` appears 57 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/lib/krita-python-libs/krita/__init__.py`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/lib/krita-python-libs/krita/sceditor/__init__.py`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/lib/site-packages/PyQt5/__init__.py`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/lib/site-packages/PyQt5/uic/Compiler/__init__.py`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/lib/site-packages/PyQt5/uic/Loader/__init__.py`
  - …and 52 more
- `gettext-tools.mo` appears 37 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/be/LC_MESSAGES/gettext-tools.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/bg/LC_MESSAGES/gettext-tools.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ca/LC_MESSAGES/gettext-tools.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/cs/LC_MESSAGES/gettext-tools.mo`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/da/LC_MESSAGES/gettext-tools.mo`
  - …and 32 more
- `04_front_leg.png` appears 23 times
  - `assets/dragons/living-forge-fire-hatchling/hand-painted-parts-clean/spine-canvas-v2/04_front_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/hand-painted-parts-clean/spine-canvas/04_front_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/hand-painted-parts-clean/trimmed/04_front_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-autonomous-pmesh-001-real-weighted/layers/04_front_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v2-tight-margins/layers/04_front_leg.png`
  - …and 18 more
- `seexpr2_qt.qm` appears 23 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ca/LC_MESSAGES/seexpr2_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/ca@valencia/LC_MESSAGES/seexpr2_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/cs/LC_MESSAGES/seexpr2_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/de/LC_MESSAGES/seexpr2_qt.qm`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/locale/en_GB/LC_MESSAGES/seexpr2_qt.qm`
  - …and 18 more
- `00_tail_lantern.png` appears 20 times
  - `assets/dragons/living-forge-fire-hatchling/spine-production-autonomous-pmesh-001-real-weighted/layers/00_tail_lantern.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v2-tight-margins/layers/00_tail_lantern.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v3-painted-bridges/layers/00_tail_lantern.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v4-seam-repair/layers/00_tail_lantern.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v5-neck-body-repair/layers/00_tail_lantern.png`
  - …and 15 more
- `01_rear_leg.png` appears 20 times
  - `assets/dragons/living-forge-fire-hatchling/spine-production-autonomous-pmesh-001-real-weighted/layers/01_rear_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v2-tight-margins/layers/01_rear_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v3-painted-bridges/layers/01_rear_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v4-seam-repair/layers/01_rear_leg.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v5-neck-body-repair/layers/01_rear_leg.png`
  - …and 15 more
- `02_body_core.png` appears 20 times
  - `assets/dragons/living-forge-fire-hatchling/spine-production-autonomous-pmesh-001-real-weighted/layers/02_body_core.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v2-tight-margins/layers/02_body_core.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v3-painted-bridges/layers/02_body_core.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v4-seam-repair/layers/02_body_core.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v5-neck-body-repair/layers/02_body_core.png`
  - …and 15 more
- `03_wing.png` appears 20 times
  - `assets/dragons/living-forge-fire-hatchling/spine-production-autonomous-pmesh-001-real-weighted/layers/03_wing.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v2-tight-margins/layers/03_wing.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v3-painted-bridges/layers/03_wing.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v4-seam-repair/layers/03_wing.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v5-neck-body-repair/layers/03_wing.png`
  - …and 15 more
- `05_head_neck.png` appears 20 times
  - `assets/dragons/living-forge-fire-hatchling/spine-production-autonomous-pmesh-001-real-weighted/layers/05_head_neck.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v2-tight-margins/layers/05_head_neck.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v3-painted-bridges/layers/05_head_neck.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v4-seam-repair/layers/05_head_neck.png`
  - `assets/dragons/living-forge-fire-hatchling/spine-production-cohesive-v5-neck-body-repair/layers/05_head_neck.png`
  - …and 15 more
- `qmldir` appears 19 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/qmldir`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/qmldir`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/Models.2/qmldir`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/StateMachine/qmldir`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/WorkerScript.2/qmldir`
  - …and 14 more
- `plugins.qmltypes` appears 17 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/plugins.qmltypes`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/Models.2/plugins.qmltypes`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/StateMachine/plugins.qmltypes`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/WorkerScript.2/plugins.qmltypes`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/plugins.qmltypes`
  - …and 12 more
- `manual.html` appears 17 times
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/share/krita/pykrita/assignprofiledialog/Manual.html`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/share/krita/pykrita/batch_exporter/Manual.html`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/share/krita/pykrita/channels2layers/Manual.html`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/share/krita/pykrita/colorspace/Manual.html`
  - `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/share/krita/pykrita/documenttools/Manual.html`
  - …and 12 more

## Likely Cache / Temp Outputs

- `.openclaw/workspace-state.json` — OpenClaw local workspace state; machine-local operational cache, not product source.; action: Add `.openclaw/` to .gitignore unless intentionally migrating OpenClaw config into repo.; human review: no
- `expo-lan-qr.png` — Ephemeral local Expo LAN QR screenshot.; action: Regenerate when needed; ignore `expo-lan-qr.png`.; human review: no
- `memory/.dreams/events.jsonl` — Agent dream/recall runtime cache, not project source.; action: Ignore `memory/.dreams/`; do not commit private/runtime agent cache.; human review: no
- `memory/.dreams/short-term-recall.json` — Agent dream/recall runtime cache, not project source.; action: Ignore `memory/.dreams/`; do not commit private/runtime agent cache.; human review: no
- `scripts/__pycache__/generate_evolution_path_placeholders.cpython-314.pyc` — Python bytecode/cache; reproducible and should not be reviewed or committed.; action: Ignore via `__pycache__/` and `*.py[cod]`; optionally delete later after review window.; human review: no
- `tmp_egg_crack_contact.png` — Temporary scratch output.; action: Ignore `tmp_*` patterns; delete only after human confirms no art comparison still needed.; human review: no
- `tmp_egg_crack_contact_after.png` — Temporary scratch output.; action: Ignore `tmp_*` patterns; delete only after human confirms no art comparison still needed.; human review: no
- `tmp_egg_crack_contact_final.png` — Temporary scratch output.; action: Ignore `tmp_*` patterns; delete only after human confirms no art comparison still needed.; human review: no
- `tools/__pycache__/build_fire_hatchling_cohesive_spine_production_prep.cpython-314.pyc` — Python bytecode/cache; reproducible and should not be reviewed or committed.; action: Ignore via `__pycache__/` and `*.py[cod]`; optionally delete later after review window.; human review: no
- `tools/__pycache__/generate_cohesive_fire_hatchling_v3_proof.cpython-314.pyc` — Python bytecode/cache; reproducible and should not be reviewed or committed.; action: Ignore via `__pycache__/` and `*.py[cod]`; optionally delete later after review window.; human review: no
- `tools/krita-portable/krita-x64-5.3.1.zip` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Concurrent.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Core.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Gui.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Network.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5PrintSupport.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Qml.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QmlModels.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QmlWorkerScript.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Quick.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickControls2.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickParticles.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickShapes.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickTemplates2.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5QuickWidgets.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Sql.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Svg.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Widgets.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/Qt5Xml.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/Blend.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/BrightnessContrast.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/ColorOverlay.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/Colorize.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/ConicalGradient.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/Desaturate.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/DirectionalBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/Displace.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/DropShadow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/FastBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/GammaAdjust.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/GaussianBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/Glow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/HueSaturation.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/InnerShadow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/LevelAdjust.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/LinearGradient.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/MaskedBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/OpacityMask.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/RadialBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/RadialGradient.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/RectangularGlow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/RecursiveBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/ThresholdMask.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/ZoomBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/plugins.qmltypes` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/DropShadowBase.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/FastGlow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/FastInnerShadow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/FastMaskedBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/GaussianDirectionalBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/GaussianGlow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/GaussianInnerShadow.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/GaussianMaskedBlur.qml` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/qmldir` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/private/qtgraphicaleffectsprivate.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/qmldir` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtGraphicalEffects/qtgraphicaleffectsplugin.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/Models.2/modelsplugin.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/Models.2/plugins.qmltypes` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/Models.2/qmldir` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/StateMachine/plugins.qmltypes` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/StateMachine/qmldir` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/StateMachine/qtqmlstatemachine.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/WorkerScript.2/plugins.qmltypes` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/WorkerScript.2/qmldir` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/WorkerScript.2/workerscriptplugin.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/plugins.qmltypes` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/qmldir` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQml/qmlplugin.dll` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- `tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/QtQuick.2/plugins.qmltypes` — Portable Krita application bundle/vendor binary tree; thousands of binaries/plugins/translations, not source.; action: Keep outside repo or ignore `tools/krita-portable/`; document install separately if needed.; human review: no
- …and 3473 more cache/temp/vendor-bundle entries, primarily `tools/krita-portable/**`.

## Safe `.gitignore` Recommendations

Recommended additions are separated from action. Do **not** auto-ignore important files; review these as policy changes first.
- `__pycache__/` — Python bytecode cache; safe and standard.
- `*.py[cod]` — Python compiled bytecode; safe and standard.
- `.openclaw/` — Local OpenClaw workspace state; repo already tracks canonical project files elsewhere.
- `tmp_*` — Scratch comparison images such as tmp_egg_crack_contact*.png.
- `expo-lan-qr.png` — Ephemeral local Expo QR screenshot.
- `memory/.dreams/` — Agent runtime recall/cache; avoid committing private/local state.
- `tools/krita-portable/` — Portable Krita binary/vendor bundle; better installed outside repo or documented as external dependency.
- `artifacts/autonomous-loop/*.log` — High-volume autonomous loop logs; curate summary reports instead.
- `artifacts/autonomous-10h/*.log` — High-volume run logs; preserve selected summaries only.
- `artifacts/mission-control/latest/*.html` — Mutable dashboard snapshots; keep selected JSON/MD proofs if needed.
- `artifacts/mission-control/latest/*public-health*.json` — Transient tunnel/health checks; useful locally but not durable source.

Do **not** ignore without review: `src/**`, `scripts/*.js`, `scripts/*.py`, `metro.config.js`, curated `docs/*.md`, approved `assets/dragons/fire-hatchling-canon-source/**`, egg/cutout runtime assets, or Mission Control canonical data/scripts.

## Recommended Review Flow

1. **Apply ignore policy only after human review** for obvious cache/temp/vendor buckets.
2. **Review KEEP_TRACKED source/config/scripts first**: `metro.config.js`, `src/**`, `scripts/test-animation-visual.js`, `scripts/mission-control-dirty-triage.js`.
3. **Curate docs in batches**: Mission Control policy, automation runbook, product direction, Fire hatchling art/Spine docs, then historical audit logs.
4. **Curate assets separately**: approved canon source and runtime cutouts before intermediate art passes.
5. **Leave generated artifacts uncommitted unless selected as proof bundles**; prefer dated immutable evidence over mutable `latest/`.
6. Do not mass-delete or mass-commit. This report is a review map, not an action script.

## Modified Entries Still Requiring Normal Review

- ` M .gitignore` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M README.md` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M RELEASE_NOTES.md` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M src/artVersion.ts` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M src/balance.ts` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M src/content.ts` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M src/game.ts` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M src/storage.ts` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
- ` M src/types.ts` — modified tracked/root source entry; review diff normally, not as unknown/untracked debt.
