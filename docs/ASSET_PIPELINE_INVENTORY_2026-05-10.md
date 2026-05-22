# Asset Pipeline Inventory — 2026-05-10

Owner: Forgehand  
Purpose: non-overlapping engineering-support audit of current asset inventory, Expo Go risk, and upcoming layered-dragon asset needs. No app behavior, balance, dependency, or live config changes.

## Scope

Inspected:

- `assets/`
- `App.tsx` static asset mappings
- `docs/LAYERED_DRAGON_RIG_PLAN.md`
- `docs/agents/WORKSPACE.md`
- `package.json`

## Current Runtime Asset Mappings

`App.tsx` statically requires these runtime groups:

- Eggs: `assets/eggs/*-dragon-egg.png`
- Adventure scenes: `assets/adventure/forest-path.png`, `ruins-cavern.png`, `ancient-shrine.png`, `dragon-camp.png`, `rift-boss.png`
- Hatchlings: `assets/dragons/*-hatchling-cutout.png`
- Drakes: `assets/dragons/*-drake-cutout.png`
- Drake concept review images: `assets/dragons/concepts/*_drake_concept.png`
- Aura/evolution effects: `assets/effects/*.json`
- Enemy cutouts: `assets/enemies/*-cutout.png`

## Inventory Summary

Current counts by folder:

- `assets/adventure`: 5 PNG scene backgrounds, roughly 2.0–2.8 MB each.
- `assets/dragons`: hatchling/drake art for Fire, Water, Earth, including cutout and non-cutout variants. Most PNGs are roughly 1.5–1.9 MB each.
- `assets/dragons/concepts`: Fire/Water/Earth drake concept PNGs, same image sizes as the non-cutout drake files.
- `assets/effects`: 4 small Lottie JSON files under 1 KB each.
- `assets/eggs`: 3 egg PNGs, roughly 1.8–2.1 MB each.
- `assets/enemies`: 6 enemy pairs, each with full/non-cutout and `*-cutout.png` variants. Cutouts are the runtime mapped set.

## Gaps Relevant to Current Dragon-Presence Work

- No `assets/dragons/layers/` directory exists yet.
- No true body/head/wing/tail layer PNGs exist for Fire hatchling.
- The current rough layered Fire hatchling POC must therefore be code-side clipped overlay or needs generated/source-layer art before final-quality rigging.
- `dragon` and `wyrm` stages currently fall back to hatchling images in `dragonStageImages`; acceptable for alpha scaffolding, but should be tracked before evolution presentation is judged.

## Expo Go / Performance Risks

- Many PNGs are large for always-bundled mobile assets. Single files are usually manageable, but the combined art set may increase Expo startup/bundle load and memory pressure on older iPhones.
- Adventure backgrounds are the largest group and should stay lazily displayed through existing screens rather than preloading broadly.
- Enemy runtime mapping correctly uses `*-cutout.png`; full enemy PNGs appear available for source/reference but are not mapped in the visible enemy runtime path.
- Current asset imports are static `require(...)`, which is Expo-compatible and typecheck-safe. Do not switch to dynamic string requires for asset paths.

## Pipeline Notes / Safe Next Steps

1. For the Fire layered-rig validation, prefer generated/source-layer assets under:
   - `assets/dragons/layers/fire-hatchling/body.png`
   - `assets/dragons/layers/fire-hatchling/head.png`
   - `assets/dragons/layers/fire-hatchling/wing-near.png`
   - `assets/dragons/layers/fire-hatchling/wing-far.png`
   - `assets/dragons/layers/fire-hatchling/tail.png`
2. Keep the current full Fire hatchling cutout as fallback/underlay until true source layers are validated.
3. If adding real layer assets, keep static imports explicit in `App.tsx` or a small asset map module; avoid dynamic path construction.
4. Before adding more art, consider a lightweight asset-size budget note: target compressed PNG/WebP alternatives only if Expo Go/iPhone testing shows load or memory pain.
5. Do not delete duplicate/reference art until Veyra confirms which files are source/reference versus runtime assets.

## Recommended Proof Gate

- For docs-only inventory: file inspection is sufficient.
- After any asset-map/code change: run `npm.cmd run typecheck`.
- After adding large art files: run Expo Go iPhone smoke test and check startup/render responsiveness.

## Result

Artifact produced without touching Pyraxis-owned active implementation files. This inventory supports the next dragon-presence decision: current repo lacks true layered Fire hatchling assets, so final-quality separated-part motion likely needs new source-layer PNGs rather than further whole-sprite motion tuning.
