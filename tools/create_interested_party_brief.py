from pathlib import Path
import json

root=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
out_dir=Path('/mnt/c/Users/logan/Downloads')
out_dir.mkdir(parents=True, exist_ok=True)
md_path=out_dir/'Isekai_Dragons_Interested_Party_Brief.md'
pdf_path=out_dir/'Isekai_Dragons_Interested_Party_Brief.pdf'
image_path=root/'assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png'
content = '''# Isekai Dragons — Interested Party Brief

**Working title:** Isekai Dragons  
**Format:** Mobile-first creature-raising adventure RPG  
**Current focus:** Fire starter onboarding, adventure/combat feel, and dragon animation identity  
**Document type:** Non-confidential project overview for potential collaborators, advisors, partners, and early supporters

## Short pitch

Isekai Dragons is a mobile-first dragon-raising adventure RPG built around the fantasy of hatching, bonding with, training, and evolving elemental dragons. The game combines a readable adventure-board structure, fast auto-battle combat stops, meaningful skill choices, and collectible dragon evolution paths with a cute-to-epic fantasy art identity.

The immediate development priority is to make the first Fire starter experience feel great: clear route progression, satisfying combat readability, visible stat/skill payoff, and a hatchling that feels alive without losing the charm of the original illustration.

## The player fantasy

The player begins with a mysterious dragon egg and grows a tiny elemental hatchling into increasingly powerful forms. Instead of tapping endlessly for rewards, progression comes from sending the dragon through adventure routes, winning fights, choosing skills, collecting treasure, and evolving into stronger identities.

The emotional hook is simple:

- hatch a dragon
- watch it become yours
- take it on dangerous routes
- choose how it fights
- evolve it from cute companion into legendary monster

## Gameplay direction

Isekai Dragons is being shaped as a roguelite-leaning mobile RPG, not an idle incremental game. Idle rewards may support the loop, but the core fun should come from adventure progression, battle outcomes, build choices, and dragon growth.

### Core loop

1. Choose or continue an adventure route.
2. Move through a sequence of stops: fights, events, shops, shrines, rewards, and bosses.
3. Watch fast, readable combat resolve with clear stat outcomes.
4. Draft or unlock skills that shape the dragon's build identity.
5. Return with loot, relics, hoard progress, and evolution pressure.
6. Upgrade the dragon and push into a harder route.

### Combat feel

Combat is designed to be fast, readable, and visually satisfying on a phone. The current direction favors a hero scene plus one clean action card rather than cluttered HUD overlays. The goal is to make every hit, block, crit, dodge, and skill choice feel understandable without forcing the player to parse too much text.

### Dragon progression

Dragons are planned around elemental identities and evolution paths. The target fantasy blends:

- Pokémon-like elemental evolution readability
- D&D-style ancient dragon grandeur
- kaiju / monster-raising scale fantasy
- mobile RPG build clarity

The Fire starter path is the current proving ground.

## Art and animation identity

The project is prioritizing a strong dragon art identity early. Hatchlings should feel charming and alive, while later forms can become more powerful, ancient, and dramatic.

A key standard for the Fire hatchling is **illustration-first animation**. For subtle living-idle assets, animation should preserve the approved illustration rather than overbuilding it into a mechanical puppet. The production pipeline now separates animation tiers so each asset gets the right level of motion for its purpose.

Examples of animation tiers include:

- static illustration
- subtle-life living painting
- ambient menu/scene motion
- gameplay puppet for combat actions
- cinematic animation for trailers, bosses, or evolution reveals

This prevents wasted production effort and protects the original charm of the creature designs.

## Current development status

The project is in active prototype and production-pipeline development. Current work is focused on stabilizing the Fire starter slice and the project dashboard before expanding into more features.

Recent priorities include:

- clear adventure/combat screen structure
- Fire starter route readability
- combat feedback and stat outcome clarity
- mission-control dashboard honesty and proof tracking
- automation checks for type safety and visual/combat regression
- Spine-style dragon animation workflow and tier-gated production standards

The team is intentionally avoiding feature sprawl until the first Fire adventure/combat slice is clean enough to validate.

## What makes it different

Isekai Dragons is being designed around the combination of:

1. **Dragon-first emotional identity** — the creature is the center of the product, not just a stat card.
2. **Readable mobile adventure structure** — route stops and combat should be understandable at a glance.
3. **Crunchy but accessible progression** — stats, skills, relics, and evolution should matter without overwhelming the player.
4. **Animation-aware production discipline** — assets are tiered so art quality, runtime performance, and production cost stay aligned.
5. **Automation-backed development** — dashboards, tests, artifacts, and production-state files are used to reduce drift and show proof of progress.

## Target audience

Potential player groups include:

- mobile RPG players who like creature collection and progression
- players who enjoy dragon fantasy, monster raising, and evolution trees
- fans of roguelite route choices and build drafting
- players who want satisfying progress without managing a full tactical RPG
- collectors who care about creature identity, art, and evolution forms

## Near-term roadmap

The near-term plan is not to add every system at once. The current production order is:

1. stabilize task ownership, dashboard proof, and worktree risk
2. complete the focused Fire Adventure/Combat screen slice
3. validate the slice on iPhone/Expo
4. improve combat feel and readability
5. expand Fire skill choices and reward/evolution recap
6. continue dragon art and animation production with tier gates
7. use the Fire starter slice as the standard for future elements

## Possible collaboration areas

Interested parties could potentially help with:

- game design feedback for adventure/combat loop clarity
- mobile UI/UX review
- creature art direction and evolution concepts
- 2D animation / Spine production refinement
- production planning and milestone review
- marketing positioning and audience testing
- funding, publishing, or business development conversations

## Current ask

The project is looking for useful feedback, potential collaborators, and interested parties who understand mobile RPG production, creature-collection fantasy, art-forward game identity, or early-stage game development.

The most valuable feedback right now is not broad feature requests. It is focused input on whether the Fire starter slice communicates the core fantasy clearly:

- Do you understand what the dragon is doing?
- Does the adventure route feel readable?
- Does combat feel satisfying and fast enough?
- Do skill/stat choices seem meaningful?
- Does the dragon feel charming enough to care about?
- Is the visual direction commercially understandable?

## Summary

Isekai Dragons is an early-stage mobile dragon-raising adventure RPG focused on making a lovable hatchling-to-legend fantasy feel clear, tactile, and progression-rich on a phone. The project is currently building the Fire starter slice as the quality benchmark for combat feel, adventure structure, dragon animation identity, and future elemental expansion.
'''
md_path.write_text(content)

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle

styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Title'], fontSize=30, leading=34, alignment=TA_CENTER, textColor=colors.HexColor('#fff2d0'), spaceAfter=12))
styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontSize=12, leading=16, alignment=TA_CENTER, textColor=colors.HexColor('#d9c9ff'), spaceAfter=10))
styles.add(ParagraphStyle(name='H1x', parent=styles['Heading1'], fontSize=17, leading=21, textColor=colors.HexColor('#34135f'), spaceBefore=12, spaceAfter=7))
styles.add(ParagraphStyle(name='H2x', parent=styles['Heading2'], fontSize=12.5, leading=16, textColor=colors.HexColor('#6e2d12'), spaceBefore=8, spaceAfter=4))
styles.add(ParagraphStyle(name='Bodyx', parent=styles['BodyText'], fontSize=9.3, leading=12.4, textColor=colors.HexColor('#241b34'), spaceAfter=5))
styles.add(ParagraphStyle(name='Bulx', parent=styles['BodyText'], fontSize=9.1, leading=12.2, leftIndent=13, firstLineIndent=-8, textColor=colors.HexColor('#241b34'), spaceAfter=3))
styles.add(ParagraphStyle(name='Callout', parent=styles['BodyText'], fontSize=10.5, leading=14.5, textColor=colors.HexColor('#160c22'), backColor=colors.HexColor('#fff0cf'), borderColor=colors.HexColor('#f2a84b'), borderWidth=0.7, borderPadding=8, spaceBefore=6, spaceAfter=8))

pdf=SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=0.65*inch, leftMargin=0.65*inch, topMargin=0.58*inch, bottomMargin=0.55*inch)
W,H=letter
story=[]
story.append(Spacer(1,0.35*inch))
story.append(Paragraph('Isekai Dragons', styles['CoverTitle']))
story.append(Paragraph('Interested Party Brief', styles['CoverSub']))
story.append(Paragraph('Mobile-first creature-raising adventure RPG', styles['CoverSub']))
story.append(Spacer(1,0.25*inch))
if image_path.exists():
    img=Image(str(image_path))
    img._restrictSize(3.2*inch, 3.2*inch)
    cover_table=Table([[img]], colWidths=[7.0*inch])
    cover_table.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER')]))
    story.append(cover_table)
    story.append(Spacer(1,0.25*inch))
story.append(Paragraph('A non-confidential overview for potential collaborators, advisors, partners, and early supporters.', styles['Callout']))
meta=Table([
    ['Working title', 'Isekai Dragons'],
    ['Format', 'Mobile-first creature-raising adventure RPG'],
    ['Current focus', 'Fire starter onboarding, adventure/combat feel, and dragon animation identity'],
    ['Stage', 'Active prototype and production-pipeline development'],
], colWidths=[1.5*inch, 5.4*inch])
meta.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#2b1448')),('TEXTCOLOR',(0,0),(0,-1),colors.white),('BACKGROUND',(1,0),(1,-1),colors.HexColor('#fff7e8')),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#d7b56d')),('FONTSIZE',(0,0),(-1,-1),8.8),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
story.append(meta)
story.append(PageBreak())

def esc(t):
    return t.replace('&','&amp;')
def h1(t): story.append(Paragraph(esc(t), styles['H1x']))
def h2(t): story.append(Paragraph(esc(t), styles['H2x']))
def p(t): story.append(Paragraph(esc(t), styles['Bodyx']))
def bullet(t): story.append(Paragraph('• '+esc(t), styles['Bulx']))
def callout(t): story.append(Paragraph(esc(t), styles['Callout']))

h1('Short pitch')
p('Isekai Dragons is a mobile-first dragon-raising adventure RPG built around the fantasy of hatching, bonding with, training, and evolving elemental dragons. The game combines a readable adventure-board structure, fast auto-battle combat stops, meaningful skill choices, and collectible dragon evolution paths with a cute-to-epic fantasy art identity.')
callout('Immediate development priority: make the first Fire starter experience feel great — clear route progression, satisfying combat readability, visible stat/skill payoff, and a hatchling that feels alive without losing the charm of the original illustration.')
h1('The player fantasy')
p('The player begins with a mysterious dragon egg and grows a tiny elemental hatchling into increasingly powerful forms. Progression comes from adventure routes, fights, skill choices, treasure, and evolution pressure — not endless tapping.')
for item in ['hatch a dragon','watch it become yours','take it on dangerous routes','choose how it fights','evolve it from cute companion into legendary monster']: bullet(item)
h1('Gameplay direction')
p('Isekai Dragons is being shaped as a roguelite-leaning mobile RPG, not an idle incremental game. Idle rewards may support the loop, but the core fun should come from adventure progression, battle outcomes, build choices, and dragon growth.')
h2('Core loop')
for item in ['Choose or continue an adventure route.','Move through fights, events, shops, shrines, rewards, and bosses.','Watch fast, readable combat resolve with clear stat outcomes.','Draft or unlock skills that shape the dragon build identity.','Return with loot, relics, hoard progress, and evolution pressure.','Upgrade the dragon and push into a harder route.']: bullet(item)
h2('Combat feel')
p('Combat is designed to be fast, readable, and visually satisfying on a phone. The current direction favors a hero scene plus one clean action card rather than cluttered HUD overlays.')
h2('Dragon progression')
p('Dragons are planned around elemental identities and evolution paths, blending Pokémon-like elemental readability, D&D-style ancient dragon grandeur, kaiju/monster-raising scale fantasy, and mobile RPG build clarity.')
h1('Art and animation identity')
p('The project prioritizes dragon art identity early. Hatchlings should feel charming and alive, while later forms can become more powerful, ancient, and dramatic.')
p('A key standard for the Fire hatchling is illustration-first animation: subtle living-idle assets should preserve the approved illustration rather than overbuilding it into a mechanical puppet.')
for item in ['Static illustration','Subtle-life living painting','Ambient menu/scene motion','Gameplay puppet for combat actions','Cinematic animation for trailers, bosses, or evolution reveals']: bullet(item)
h1('Current development status')
p('The project is in active prototype and production-pipeline development. Current work is focused on stabilizing the Fire starter slice and the project dashboard before expanding into more features.')
for item in ['clear adventure/combat screen structure','Fire starter route readability','combat feedback and stat outcome clarity','mission-control dashboard honesty and proof tracking','automation checks for type safety and visual/combat regression','Spine-style dragon animation workflow and tier-gated production standards']: bullet(item)
h1('What makes it different')
for item in ['Dragon-first emotional identity — the creature is the center of the product, not just a stat card.','Readable mobile adventure structure — route stops and combat should be understandable at a glance.','Crunchy but accessible progression — stats, skills, relics, and evolution should matter without overwhelming the player.','Animation-aware production discipline — assets are tiered so art quality, runtime performance, and production cost stay aligned.','Automation-backed development — dashboards, tests, artifacts, and production-state files reduce drift and show proof of progress.']: bullet(item)
h1('Target audience')
for item in ['mobile RPG players who like creature collection and progression','players who enjoy dragon fantasy, monster raising, and evolution trees','fans of roguelite route choices and build drafting','players who want satisfying progress without managing a full tactical RPG','collectors who care about creature identity, art, and evolution forms']: bullet(item)
h1('Near-term roadmap')
roadmap=[['1','Stabilize task ownership, dashboard proof, and worktree risk'],['2','Complete the focused Fire Adventure/Combat screen slice'],['3','Validate the slice on iPhone/Expo'],['4','Improve combat feel and readability'],['5','Expand Fire skill choices and reward/evolution recap'],['6','Continue dragon art and animation production with tier gates'],['7','Use the Fire starter slice as the standard for future elements']]
t=Table(roadmap, colWidths=[0.35*inch, 6.55*inch])
t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#ffe3a3')),('GRID',(0,0),(-1,-1),0.25,colors.HexColor('#e0bf78')),('FONTSIZE',(0,0),(-1,-1),8.8),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
story.append(t)
h1('Possible collaboration areas')
for item in ['game design feedback for adventure/combat loop clarity','mobile UI/UX review','creature art direction and evolution concepts','2D animation / Spine production refinement','production planning and milestone review','marketing positioning and audience testing','funding, publishing, or business development conversations']: bullet(item)
h1('Current ask')
p('The project is looking for useful feedback, potential collaborators, and interested parties who understand mobile RPG production, creature-collection fantasy, art-forward game identity, or early-stage game development.')
callout('The most valuable feedback right now is focused input on whether the Fire starter slice communicates the core fantasy clearly: dragon action, adventure route readability, combat satisfaction, meaningful skill/stat choices, charm, and commercial visual clarity.')
h1('Summary')
p('Isekai Dragons is an early-stage mobile dragon-raising adventure RPG focused on making a lovable hatchling-to-legend fantasy feel clear, tactile, and progression-rich on a phone. The project is currently building the Fire starter slice as the quality benchmark for combat feel, adventure structure, dragon animation identity, and future elemental expansion.')

def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor('#2b1448'))
    canvas.rect(0, H-0.28*inch, W, 0.28*inch, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawString(0.65*inch, H-0.18*inch, 'Isekai Dragons — Interested Party Brief')
    canvas.setFillColor(colors.HexColor('#806c95'))
    canvas.drawRightString(W-0.65*inch, 0.28*inch, f'Page {doc.page}')
    canvas.restoreState()

def on_first(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor('#160a25'))
    canvas.rect(0,0,W,H,stroke=0,fill=1)
    canvas.setFillColor(colors.HexColor('#ffb547'))
    canvas.circle(W-0.8*inch,H-0.75*inch,0.35*inch,stroke=0,fill=1)
    canvas.setFillColor(colors.HexColor('#4a236e'))
    canvas.circle(0.7*inch,0.65*inch,0.42*inch,stroke=0,fill=1)
    canvas.restoreState()

pdf.build(story, onFirstPage=on_first, onLaterPages=on_page)
print(json.dumps({'pdf':str(pdf_path), 'md':str(md_path), 'image_used':image_path.exists()}, indent=2))
