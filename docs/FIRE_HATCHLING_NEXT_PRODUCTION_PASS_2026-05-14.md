# Fire Hatchling — Next Production Pass

Source: `Fire_Hatchling_Next_Production_Pass.pdf` supplied by Topnotch on 2026-05-14.

## Objective

Eliminate the remaining **sticker-head** effect and move the Fire Hatchling toward commercially readable creature animation.

This is an execution slice, not a planning/framework update.

## Directive

Do **not** continue improving procedural masking systems unless directly required for deformation support. The neck/body problem is now treated as:

1. anatomy;
2. hidden underlap art;
3. Spine mesh deformation;
4. neck-to-torso weighting;
5. animation timing/personality.

## Proof Health vs Director Quality

The following only count as **Proof Health**:

- Spine imports;
- contact sheets;
- layer diagnostics;
- export validation.

Meaningful progress requires **Director Quality** improvement.

## Production Slice Order

Execute in this order:

1. Hand-paint neck/collar/shoulder underlap art.
2. Convert `body_core` and `head_neck` into Spine meshes.
3. Weight the neck base into the torso to remove rigid rotational behavior.
4. Add separated jaw controller support.
5. Block attack timing:
   - brace;
   - furnace charge;
   - jaw open;
   - flame/plume release;
   - recovery settle.
6. Export updated combat GIF and contact sheet.
7. Attach Director Quality review.

## Required Review Output

### Director Quality Review

- Motion Quality Score
- Readability Score
- Game Feel Score
- Commercial Readiness Score

### Silhouette Validation

- black-fill readability
- 50% scale readability
- mobile-size readability
- attack-pose readability

### Secondary Motion Review

- neck drag
- jaw settle
- chest compression
- ember drift
- recoil settle

### Spine Technical Review

- mesh quality
- weighting quality
- deformation issues
- pivot issues
- controller architecture notes

### Commercial Review

Explain:

- what still feels amateur;
- what currently feels professional;
- what most improves perceived production value;
- what should be prioritized next.

## Target Motion Language

- unstable furnace energy;
- juvenile aggression;
- oversized head personality;
- recoil-heavy flame attacks;
- eager/predatory posture.

## Success Criteria

The next Fire Hatchling pass should be judged by whether it improves:

- readability;
- personality;
- weight;
- shipped-game commercial quality.
