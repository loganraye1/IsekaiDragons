# Mission Control Health Policy

**Status:** Active Dragonforge operating policy
**Purpose:** Mission Control must keep the project safe, reviewable, and moving through one clear next action. It is not only a summary dashboard.

## Source of Truth

Mission Control health is determined from:

- `npm run typecheck`
- `npm run test:auto`
- scoped whitespace/diff checks for touched source files
- required artifact/report existence
- `git status --short` dirty-worktree triage
- task ownership in `workspace/your/mission-control/data/tasks.json`
- owner handoff language in `docs/agents/WORKSPACE.md`
- current Mission Control reports/status notes

## Health Levels

### GREEN

Mission Control is **GREEN** only when all of the following are true:

- `npm run typecheck` passes.
- `npm run test:auto` passes.
- scoped whitespace/diff checks pass for touched files.
- expected evidence artifacts exist and paths are recorded.
- no active source-of-truth conflict exists between Mission Control tasks and `docs/agents/WORKSPACE.md`.
- no critical dirty-state risk exists:
  - no ambiguous in-progress owner chain;
  - no stale active task contradicting the current phase;
  - no large unclassified generated artifact burst;
  - no risky source-code changes without proof.
- there is exactly one active next owner/action.

GREEN does **not** mean the game is finished. It means the current proof gate is healthy and the next action is safe to take.

### YELLOW

Mission Control is **YELLOW** when core checks pass but review or release safety is reduced.

YELLOW examples:

- `typecheck` and `test:auto` pass, but the worktree is large/dirty.
- generated docs/artifacts are noisy or not triaged.
- real-device Expo/iPhone validation is missing for a slice that needs device confidence.
- artifact tracking policy is unclear.
- reports exist but do not end with one clear owner/action footer.
- evidence paths exist, but commit grouping is not obvious.

YELLOW allows continued development only if the next task is narrow and the risk is acknowledged. It should block broad new feature/art/animation expansion.

### RED

Mission Control is **RED** if any critical proof or source-of-truth condition fails.

RED examples:

- `npm run typecheck` fails.
- `npm run test:auto` fails.
- required artifacts are missing.
- dashboard root or `/health` is broken when a dashboard proof is required.
- task ownership conflicts between `tasks.json` and `WORKSPACE.md`.
- there are multiple competing active owners.
- a stale in-progress task points agents at superseded work.
- a report claims proof without evidence paths.

RED blocks new feature/art/animation work until the failing gate is repaired.

## One Next Owner Rule

Every Mission Control report, status note, or generated health/triage report must end with this block:

```text
ONE NEXT OWNER
Active owner: <agent/name>
Exact next task: <single task, not a menu>
Exact success command: <command or proof action that proves success>
Escalation condition: <specific condition that should stop autonomous continuation>
Do NOT work on next: <explicitly forbidden next work>
```

Rules:

- There may be many backlog items, but only one active next owner/action.
- If two next actions are equally valid, escalate instead of letting agents choose randomly.
- If the exact success command is unknown, the report is not ready.
- If the forbidden work is not stated, the report is not ready.
- The active owner must match Mission Control tasks and `docs/agents/WORKSPACE.md`.

## Dirty Worktree Policy

A large dirty worktree is not automatically RED, but unclassified dirty state is at least YELLOW.

Required behavior:

1. Run dirty-worktree triage before broad new work.
2. Categorize changes into source code, tests/scripts, docs, generated artifacts, assets, mission-control/workspace files, and unknown/unreviewed.
3. Recommend safe commit groups.
4. Do not mass commit blindly.
5. Do not mix generated noise with focused source-code commits unless the artifacts are intentional proof evidence.

## Artifact Tracking Policy Summary

Commit:

- operating policies and runbooks;
- source scripts that generate proof;
- important design/status docs;
- stable reference storyboards or review surfaces when intentionally preserved;
- curated evidence artifacts needed to understand a decision.

Ignore or rotate:

- latest test-run outputs;
- transient logs;
- temporary frame dumps;
- cache/build output;
- generated screenshots/contact sheets unless promoted to stable review evidence.

See `docs/ARTIFACT_TRACKING_POLICY.md` for the full policy.

## Device Validation Policy

Do not add browser/Playwright/device capture into `npm run test:auto` until it is proven stable separately.

If visual/device automation is added later, it must be optional:

```bash
npm run test:visual
```

not part of the core green gate.

Until then, Expo/iPhone validation is a tracked backlog item with manual/screenshot evidence.

## Default Health Interpretation Right Now

Current Mission Control health should usually be treated as **YELLOW** until:

- dirty worktree triage is clean enough;
- artifact policy is enforced;
- Expo/iPhone visual validation has at least one smoke-test evidence path;
- every report consistently carries the One Next Owner block.

## ONE NEXT OWNER

Active owner: Pyraxis
Exact next task: Hatching/onboarding deterministic validation.
Exact success command: `npm run typecheck && npm run test:auto`
Escalation condition: deterministic validation requires real-device-only proof, typecheck/test:auto fails, or source-of-truth ownership conflicts return.
Do NOT work on next: new visual slice, broad animation expansion, Playwright/browser capture inside `test:auto`, or cosmetic art polish.
