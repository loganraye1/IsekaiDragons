# Playtest Summary — 2026-05-09

Owner: Caldrin
Source: `workspace/your/mission-control/data/playtest-observations.json`
Baseline: `v0.1.0-alpha` / balance version `0.1.0` unchanged.

## Session Context

Logan ran a real iPhone Expo Go playtest and intentionally skipped roughly 10–20 minutes of normal gameplay to speed up Essence gathering. That means the notes are valid for **feel, presentation, clarity, and activity density**, but should not yet be used as direct proof that balance pacing is too slow.

## Notes Processed

- Egg image took a while to load; hatching/cracking felt static.
- Starting hatchling choice felt redundant.
- Dragon image did not blend into the background because of a white border.
- Combat was not very fun because enemies/animations were not visible enough.
- Evolution felt minor rather than game-changing.
- Early loop felt like waiting for the next evolution after checking menus and buying upgrades.
- The game felt like it needed more to do while reaching Drake, such as mini-games or side quests.
- Prior test note confirmed the in-app note pipeline works.

## Main Findings

### 1. Presentation is the biggest immediate weakness

The notes are mostly about moments that should feel alive but currently feel static: egg hatch, combat, dragon/background integration, and evolution. These are strong polish targets because they improve perceived quality without changing the frozen balance.

### 2. The first-session activity loop needs more texture

The player can run out of active decisions and feel like they are waiting for evolution. Because the session skipped ahead, we should not immediately lower evolution costs. Instead, add or improve **presentation, short-term goals, and visible adventure feedback** before tuning numbers.

### 3. Evolution needs a stronger payoff

Evolution should feel like a major emotional/gameplay beat. The current signal says it reads as minor. This is likely a combination of animation, UI ceremony, stat/benefit explanation, and dragon continuity presentation.

### 4. Combat needs visible enemies and motion

Combat exists systemically, but the player did not feel it. That suggests the UI should surface enemies, hits, rewards, and movement more clearly before adding deeper combat mechanics.

## Recommended Next Tasks

1. **Pyraxis + Veyra:** Remove or soften the dragon image white-border issue so the dragon blends into backgrounds.
2. **Veyra + Pyraxis:** Improve egg hatch presentation: preload/optimize egg image and add stronger crack/open animation feedback.
3. **Pyraxis + Aurelith:** Make combat visible: show current enemy, simple hit/defeat animation, and reward feedback.
4. **Veyra + Aurelith:** Strengthen evolution ceremony so evolution feels game-changing.
5. **Aurelith + Caldrin:** Design low-scope early activity fillers, such as micro-goals, short side objectives, or menu-driven mini decisions, without changing balance yet.
6. **Aurelith:** Review starting hatchling choice flow for redundancy and propose a clearer version.

## Decision

No balance change yet. The notes point to **presentation and activity density** first. Revisit balance only after a non-skipped 15-minute test shows repeated pacing frustration.
