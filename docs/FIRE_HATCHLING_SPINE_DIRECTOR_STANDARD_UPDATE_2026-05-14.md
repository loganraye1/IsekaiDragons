# Fire Hatchling — Spine Director Standard Update

Source: `Spine_Animation_Director_Operating_Standard.pdf` supplied by Topnotch on 2026-05-14.

## Applied to Project Docs

Updated:

- `docs/agents/SPINE_ANIMATION_DIRECTOR.md`
- `docs/agents/VEYRA_ART_DIRECTOR.md`

## New Additions Beyond Previous Director Prompt

The new PDF reinforced the existing director standard and added/clarified these mandatory checks:

1. **Core principle:** technical success is not artistic success.
2. **Primary goal:** commercially competitive animation quality.
3. **Silhouette validation is mandatory:**
   - black-fill silhouette review;
   - 50% scale review;
   - mobile-size readability;
   - attack-pose readability.
4. **Secondary motion review is mandatory:**
   - neck drag;
   - horn lag;
   - jaw settle;
   - chest compression;
   - tail overlap;
   - ember drift;
   - flame turbulence;
   - recoil settle.
5. **Final director rule:** always ask whether the animation would feel believable, readable, expressive, and commercially viable inside a successful shipped mobile game.

## Current Fire Hatchling Correction Path

The new standard confirms the current issue is not a masking problem. The correct order remains:

1. Hand-paint neck/collar underlap.
2. Convert `body_core` and `head_neck` into Spine meshes.
3. Weight neck base into torso.
4. Add jaw separation/controller.
5. Block attack timing.
6. Export GIF/contact sheet.
7. Include Director Quality review.
8. Include silhouette validation.
9. Include secondary motion review.

## Operational Change

Future Fire Hatchling updates should be structured as:

### Proof Health

- file/project import status;
- export status;
- frame/contact sheet availability;
- automation checks.

### Director Quality

- Motion Quality Score;
- Readability Score;
- Game Feel Score;
- Commercial Readiness Score;
- Biggest Weakness;
- Highest-Impact Improvement;
- Spine-Specific Implementation Notes;
- Export/Mobile Performance Notes;
- Silhouette Validation;
- Secondary Motion Review.

Proof health can pass while Director Quality still fails. Only Director Quality reflects meaningful animation progress.
