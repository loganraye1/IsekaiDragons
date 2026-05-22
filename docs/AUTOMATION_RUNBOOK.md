# Automation Runbook

## How to run

From the project root:

```bash
npm run test:auto
```

The command is non-interactive. It exits with status 0 only when source checks, generated artifact checks, `npm run typecheck`, and whitespace diff checks pass.

## Generated artifacts

`npm run test:auto` refreshes `artifacts/test-run/latest/` on each run.

`report.json` also includes an artifact index lifecycle policy so future agents can tell which artifact paths were verified before the report was written. The `report-json` and `log-text` entries use `written-at-end-of-run` because those files are written after the final report object is assembled. Other generated review artifacts use `verified-on-disk` because the harness writes and verifies them before indexing.

Key files:

- `artifacts/test-run/latest/report.json` — machine-readable pass/fail summary, command results, check IDs, and artifact paths.
- `artifacts/test-run/latest/log.txt` — human-readable mirror of the report for quick terminal review.
- `artifacts/test-run/latest/fire-breath-storyboard.html` — deterministic visual storyboard for the fire-breath animation frames.
- `artifacts/test-run/latest/fire-breath-frames.json` — seven sampled progress frames with full fire-breath particle state data.
- `artifacts/test-run/latest/fire-breath-frame-00.svg` through `fire-breath-frame-06.svg` — one SVG per sampled fire-breath frame.
- `artifacts/test-run/latest/fire-breath-snippet.txt` — inspected fire-breath source snippet used by the automation.
- `artifacts/test-run/latest/hatching-reveal-storyboard.html` — deterministic visual storyboard for the first-impression hatching reveal.
- `artifacts/test-run/latest/hatching-reveal-frames.json` — seven sampled hatching progress frames; ray and shell-spark counts/positions are parsed from `App.tsx`, while timing and reveal interpolation are a mirrored deterministic storyboard model that must be updated when the source animation timing changes.
- `artifacts/test-run/latest/combat-path-simulation.json` — deterministic combat samples and readable path flavor callouts for all nine element/path combinations.
- `artifacts/test-run/latest/dragon-path-content-completeness.json` — per-path content completeness matrix for element, role, combat copy, stat boost, and battle modifier fields.
- `artifacts/test-run/latest/dragon-path-ui-copy.json` — exact visible selection-card and persistent-badge copy for every first-bond path, including shared Offense/Mitigation/Tempo tradeoff strings.
- `artifacts/test-run/latest/live-battle-feedback-cues.json` — compact per-path live combat label cues, including combat turn, brace, and enemy-hit strings for every evolution path.
- `artifacts/test-run/latest/evolution-reveal-path-lines.json` — exact drake evolution reveal payoff lines for all nine paths, including path name, verb, power, mitigation, tempo, `visualAccentPills`, and `revealAccentHelperParityWithStoryboard` proof metadata.
- `artifacts/test-run/latest/evolution-reveal-path-storyboard.html` — non-interactive storyboard grouping all path-specific drake evolution reveal lines and visual accent pills for quick review.
- `artifacts/test-run/latest/adventure-route-plan.json` — 30-node adventure route plan showing every-third fight cadence plus shop, shrine, camp, and treasure side adventures.
- `artifacts/test-run/latest/adventure-ui-reference.json` — Capybara Go-inspired adventure UI contract covering top HUD capsules, chunky route rail, event card, choice buttons, and tactile CTA proof points.
- `artifacts/test-run/latest/adventure-fight-stop-hud-snapshot.json` — representative guardian/raider/mystic fight-stop HUD snapshot showing COMBAT READY/COMBAT STOP labels, path role build labels, Offense/Mitigation/Tempo copy, attack/brace cues, and CRIT/BLOCK/DODGE pills.
- `artifacts/test-run/latest/adventure-combat-consolidation-contract.json` — machine-readable contract proving the visible Dragon Expedition Loop labels and CTAs connect Adventure Route, Combat Stop, Quick Battle Result, and Return Chest.
- `artifacts/test-run/latest/adventure-combat-consolidation-storyboard.html` — non-interactive storyboard for fast review of the route -> combat stop -> result -> return chest loop.

## Artifact index quick reference

When you need to discover generated review surfaces quickly, read `artifacts/test-run/latest/report.json` first and inspect its `artifactIndex` array. The stable artifact IDs are: report-json, log-text, fire-breath-storyboard, fire-breath-frames, fire-breath-snippet, hatching-reveal-storyboard, hatching-reveal-frames, combat-path-simulation, dragon-path-content-completeness, dragon-path-ui-copy, live-battle-feedback-cues, evolution-reveal-path-lines, evolution-reveal-path-storyboard, adventure-route-plan, adventure-ui-reference, adventure-fight-stop-hud-snapshot, adventure-combat-consolidation-contract, adventure-combat-consolidation-storyboard.

Each `artifactIndex` entry includes `id`, `path`, `format`, `purpose`, `relatedCheckIds`, `exists`, and `existence` so future agents can jump from a failing check to the right artifact without reading this runbook first.

## Combat/evolution identity proof chain

For crunchy progression work, verify the full combat/evolution identity proof chain before changing balance or saved state: content completeness -> combat simulation/build-decision callouts -> UI-copy artifact -> live battle feedback cues -> evolution reveal payoff -> cross-artifact consistency.

- `dragon-path-content-completeness.json` proves every element has guardian/raider/mystic identity plus required combat copy, stat boost, and battle modifier fields.
- `combat-path-simulation.json` proves each path changes deterministic combat outcomes and includes build-decision callouts with Offense, Mitigation, and Tempo tradeoffs.
- `dragon-path-ui-copy.json` proves selection-card and persistent-badge copy expose the same build-choice tradeoffs players see before and after evolution.
- `live-battle-feedback-cues.json` proves combat, brace, and hit labels surface the selected path identity during battle.
- `evolution-reveal-path-lines.json` and `evolution-reveal-path-storyboard.html` prove the drake evolution payoff line itself reads as a selected-path build decision, not a generic growth message.
- `evolution-reveal-storyboard-visual-accent-pills` proves the generated reveal JSON/storyboard exposes the same two visual accent pills (`visualAccentPills`) shown in-app for selected role/offense and combat verb/mitigation.
- `evolution-reveal-accent-helper-artifact-parity` proves `visualAccentPills` stay in exact label/value parity with `App.tsx` `getDragonPathRevealAccent` via `revealAccentHelperParityWithStoryboard`, so the artifact cannot drift away from the live reveal helper.
- The `live-battle-feedback-cross-artifact-consistency` check proves the combat simulation, UI-copy, and live battle feedback artifacts agree on path identity and tradeoff values, while the content completeness artifact remains the upstream matrix proving every required path field exists.

## Autonomous agent loop

1. Start by running `npm run test:auto` to establish the current baseline.
2. If a check fails, make the smallest scoped change that addresses that exact failure.
3. Re-run `npm run test:auto` and inspect `artifacts/test-run/latest/report.json`.
4. Use `fire-breath-storyboard.html`, SVG frames, `fire-breath-frames.json`, `hatching-reveal-storyboard.html`, and `hatching-reveal-frames.json` as non-interactive visual review surfaces before asking for human review.
5. Use `combat-path-simulation.json`, `dragon-path-content-completeness.json`, `dragon-path-ui-copy.json`, `live-battle-feedback-cues.json`, `evolution-reveal-path-lines.json`, `evolution-reveal-path-storyboard.html`, `adventure-route-plan.json`, `adventure-ui-reference.json`, `adventure-fight-stop-hud-snapshot.json`, `adventure-combat-consolidation-contract.json`, and `adventure-combat-consolidation-storyboard.html` to verify path identity, combat flavor, content coverage, exact visible first-bond build-choice copy, reveal payoff, live battle cue readability, adventure-node cadence, Capybara-style adventure UI hierarchy, representative fight-stop HUD readability, and the route -> combat stop -> result -> return chest loop before changing gameplay balance.
6. Follow the combat/evolution identity proof chain when judging whether a new path or evolution slice really makes the choice feel consequential in combat.
7. If changing TypeScript or React Native code, keep `npm run typecheck` green. `test:auto` currently runs it internally.
8. Finish with `git diff --check -- <changed files>` for the files you touched, even when `test:auto` already runs its scoped whitespace check.
9. Leave a concise report under `docs/` when doing unattended overnight work.

## Overnight guardrails

- Do not push to remote.
- Do not publish, send messages, email, tweet, or use external side effects.
- Do not delete broad directories or user files.
- Do not touch secrets or `.env` files.
- Do not alter game balance, rewards, timers, progression math, monetization, or saved-state migrations unless a failing test directly requires it.
- Keep changes small, reviewable, and scoped to the automation or visual slice under test.
- Preserve existing modified and untracked user work; do not reset, clean, or overwrite unrelated files.
- Avoid heavy dependency installs. If a package is necessary, prefer a dev-only dependency and document why.

## Extending automation safely

Prefer deterministic, non-interactive checks first: source-structure assertions, generated frame JSON validation, generated SVG/storyboard validation, deterministic combat/content artifacts, and typechecking. The current harness intentionally includes parser-coupled source checks for inline animation/path constants; when those source shapes change, update the parser and keep the artifact integrity checks fail-fast instead of silently producing hollow artifacts. If an artifact uses a mirrored deterministic model rather than parsing every source interpolation, document that coupling and update the model in the same slice as source animation timing changes. Browser or Expo web capture can be added behind an optional script such as `npm run test:visual:web`, but `npm run test:auto` should not depend on flaky browser installation or network state.
