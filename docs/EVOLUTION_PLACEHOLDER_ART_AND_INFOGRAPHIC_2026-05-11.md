# Evolution Placeholder Art and Infographic Pass

Date: 2026-05-11
Status: First visual representation pass

## Outputs Created

### Infographic

- `docs/dragon_evolution_infographic_2026-05-11.png`

Purpose:

- Give a phone-friendly visual summary of the evolution roadmap.
- Show the stage timeline: Hatchling → Drake → Young Dragon → Dragon → Ancient.
- Show the adventure scale: dungeon → forest → towns → cities → mythic domination.
- Show five starter eggs and the first three Drake paths per element.
- Show battle-screen requirements: HP bars, XP bar, 3 skill picks, info button.
- Show implementation target: first slice should be five eggs + hatchling battle screen + future Drake preview.

### Placeholder Art Set

Directory:

- `assets/dragons/placeholders/evolution-branches-2026-05-11/`

Generated:

- Fire, Water, Earth, Light, and Dark egg placeholders.
- Fire, Water, Earth, Light, and Dark hatchling placeholders.
- Drake / Young Dragon / Dragon / Ancient placeholders for each element.
- `evolution_placeholder_contact_sheet.png` overview sheet.
- `README.md` describing intent and usage.

## Design Intent

These are **placeholder assets**, not final production art.

They are meant to unblock:

- evolution-tree UI mockups
- egg-selection UI
- branch preview screens
- battle-screen layout testing
- phone-scale readability checks

The placeholders intentionally emphasize:

- strong element color coding
- readable silhouettes
- cute hatchling tone
- increasing scale from hatchling to ancient
- replaceable structure for final art

## Drake Path Distinction Update

Created a second-pass Drake branch placeholder set after Topnotch approved the direction and asked for the three Drake paths to be visually distinct.

New outputs:

- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/` — 15 transparent branch placeholders, three per starter element.
- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/drake_path_distinction_contact_sheet.png` — comparison sheet for phone-scale readability.
- `docs/drake_path_silhouette_direction_2026-05-11.png` — art-direction infographic.
- `docs/DRAKE_PATH_VISUAL_DISTINCTION_2026-05-11.md` — branch-by-branch visual contract.

Design rule: these paths should not be recolors. Each branch must keep a different silhouette/motif family, e.g. Flame = sleek fire mane, Smoke = wispy/serpentine clouds, Magma = heavy plated lava cracks.

## Suggested Next Art Tasks

1. Wire the 15 Drake placeholders into a branch-preview UI.
2. Improve silhouette variety between Young Dragon / Dragon / Ancient.
3. Create a branch-tree visual where Fire → Flame / Smoke / Magma, Water → Tide / Frost / Mist, etc.
4. Add UI-ready icons for stats:
   - HP
   - Attack
   - Defense
   - Speed
   - Crit
   - Block
   - Dodge
   - Breath
   - Rage
5. Add skill-card placeholder icons for general skills and element skills.

## Suggested Next Implementation Tasks

1. Use these placeholders in a non-final evolution preview screen.
2. Add an automated check that the five starter eggs exist as assets/data entries.
3. Add an automated check that every egg exposes three Drake path labels.
4. Add the battle-screen info panel wireframe using placeholder icons.

## Review Notes

The infographic is readable as a single phone-openable PNG.
The contact sheet is useful for direction, but individual silhouettes still need final art direction; the current set is intentionally simple and repetitive.
