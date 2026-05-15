# Artifact Tracking Policy

**Status:** Active Dragonforge operating policy
**Purpose:** Keep proof useful without letting generated docs/artifacts become review noise.

## Principle

Artifacts are valuable when they explain a decision, prove a gate, or let a reviewer inspect a result. Artifacts become noise when they are transient `latest` outputs, repeated frame dumps, temporary logs, or generated files with no stable review purpose.

## Commit by Default

Commit these when they are intentionally authored or required for future review:

- runbooks and operating policies in `docs/`
- source scripts in `scripts/` or `tools/`
- stable project docs and agent directives
- curated status reports that carry evidence paths
- stable reference storyboards/contact sheets if they explain an approved decision
- stable manifests used by the app or production pipeline
- Mission Control source-of-truth files:
  - `workspace/your/mission-control/data/tasks.json`
  - `workspace/your/mission-control/data/work-log.json`
  - `workspace/your/mission-control/data/agent-chat.json`
  - Mission Control scripts/source files

## Ignore or Rotate by Default

Do not commit these unless deliberately promoted to stable evidence:

- `artifacts/test-run/latest/`
- transient log files
- temporary cache/build output
- frame dumps generated only for local inspection
- repeated screenshot/contact-sheet attempts that have been superseded
- local tunnel/Metro/Expo runtime output
- generated `latest` files that can be reproduced by a command

## Promote an Artifact Only When

An artifact can be committed if at least one is true:

- it is referenced by a status/report document;
- it captures a decision point or approved visual direction;
- it is needed to reproduce or debug a production handoff;
- it is a stable review surface for stakeholders;
- it is the only practical evidence of a device/manual validation pass.

When promoted, prefer a date/versioned path over a mutable `latest` path.

## Do Not Mix Commit Groups

Recommended commit grouping:

1. **Policy/source-of-truth commit**
   - `docs/MISSION_CONTROL_HEALTH_POLICY.md`
   - `docs/ARTIFACT_TRACKING_POLICY.md`
   - Mission Control task/status files
2. **Automation script commit**
   - dirty-worktree triage script
   - package script wiring
3. **App/source behavior commit**
   - app code only, with typecheck/test:auto proof
4. **Curated evidence commit**
   - selected artifact paths only
5. **Art/animation commit**
   - production assets and stable review artifacts only

Never mass commit the entire dirty tree just because tests pass.

## Current `.gitignore` Policy

The core generated test output remains ignored:

```gitignore
artifacts/test-run/
```

Mission Control latest logs/caches may be ignored, but stable Markdown reports like:

```text
artifacts/mission-control/latest/dirty-worktree-triage.md
```

may remain visible because they are lightweight and reviewable.

## Optional Visual Automation Policy

Do not put Playwright/browser/simulator capture into `npm run test:auto` until it has proven stable as a separate command.

If added later, use:

```bash
npm run test:visual
```

and keep the core green gate:

```bash
npm run typecheck
npm run test:auto
```

## ONE NEXT OWNER

Active owner: Pyraxis
Exact next task: Hatching/onboarding deterministic validation.
Exact success command: `npm run typecheck && npm run test:auto`
Escalation condition: deterministic validation requires real-device-only proof, typecheck/test:auto fails, or source-of-truth ownership conflicts return.
Do NOT work on next: new visual slice, broad animation expansion, Playwright/browser capture inside `test:auto`, or cosmetic art polish.
