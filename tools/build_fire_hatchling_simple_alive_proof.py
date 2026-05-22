#!/usr/bin/env python3
"""Simple alive proof for Fire Hatchling.

STATE: BASIC_MOTION_VALIDATION
Allowed: simple idle/breath/blink/tiny tail sway proof only.
No advanced mesh complexity, no plate-zone reconstruction, no new deformation systems.

This creates a lightweight visual proof from the current temporary visual authority/reference.
It deliberately keeps the creature as one cohesive mass and uses very small broad transforms.
Blink is deferred because a rough overlay harmed face appeal; proper blink needs a clean eyelid separation.
"""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
REF=ROOT/'assets/dragons/layers/fire-hatchling/krita-workflow/reference_locked_do_not_edit.png'
OUT=ROOT/'artifacts/spine/fire-hatchling/basic-motion-v19-simple-alive-proof'
OUT.mkdir(parents=True, exist_ok=True)

img=Image.open(REF).convert('RGBA')
bbox=img.getbbox()
creature=img.crop(bbox)
# normalize to 720 wide like v18 proof, preserving whole design
W=720
scale=W/creature.width
H=round(creature.height*scale)
base=creature.resize((W,H), Image.Resampling.LANCZOS)

CANVAS=(900,820)
base_pos=((CANVAS[0]-W)//2, (CANVAS[1]-H)//2+10)

# Approximate feature regions in normalized 720-wide crop coordinates.
# Kept as overlays/transforms only; no permanent separations.
# These are intentionally broad/simple and only support a readable proof.
head_region=(95,105,470,345)
eyes=[(125,235,190,308),(332,215,425,300)]
chest_region=(245,355,405,540)
tail_region=(405,435,655,610)
wing_region=(80,260,650,455)

frames=[]
N=48
for i in range(N):
    t=i/N
    breath=math.sin(2*math.pi*t)
    tail=math.sin(2*math.pi*(t-.12))
    wing=math.sin(2*math.pi*(t+.1))
    frame=Image.new('RGBA', CANVAS, (38,24,20,255))
    # Broad body motion: tiny scale bob, applied to whole creature to preserve unified silhouette.
    sx=1.0 + 0.006*breath
    sy=1.0 + 0.010*breath
    resized=base.resize((round(W*sx), round(H*sy)), Image.Resampling.BICUBIC)
    px=base_pos[0]-(resized.width-W)//2
    py=base_pos[1]-(resized.height-H)//2 - round(3*breath)
    frame.alpha_composite(resized,(px,py))

    # Subtle chest breathing: warm transparent oval, not new glow/VFX; just slight value pulse proof.
    overlay=Image.new('RGBA', CANVAS, (0,0,0,0)); d=ImageDraw.Draw(overlay)
    cx=px+round((chest_region[0]+chest_region[2])*sx/2); cy=py+round((chest_region[1]+chest_region[3])*sy/2)
    rx=round((chest_region[2]-chest_region[0])*sx*.33*(1+.035*breath))
    ry=round((chest_region[3]-chest_region[1])*sy*.28*(1+.045*breath))
    alpha=int(18+10*(breath+1)/2)
    d.ellipse((cx-rx,cy-ry,cx+rx,cy+ry), fill=(255,128,45,alpha))
    overlay=overlay.filter(ImageFilter.GaussianBlur(10))
    frame=Image.alpha_composite(frame, overlay)

    # Blink intentionally omitted in this proof after visual check: a rough overlay reduced face appeal.
    # Keep the eye as the emotional focal point until a proper minimal eye-lid separation exists.

    # Tiny tail sway hint: a translucent shifted tail echo behind original, very low alpha so silhouette is not doubled.
    # Included only as motion readability cue; original full creature remains authoritative.
    if abs(tail) > .15:
        tail_crop=base.crop(tail_region)
        echo=Image.new('RGBA', tail_crop.size, (0,0,0,0))
        echo.alpha_composite(tail_crop)
        # fade alpha to prevent detached double-tail read
        a=echo.getchannel('A').point(lambda p:int(p*0.18))
        echo.putalpha(a)
        dx=round(5*tail); dy=round(2*tail)
        frame.alpha_composite(echo,(px+tail_region[0]+dx, py+tail_region[1]+dy))

    frames.append(frame.convert('P', palette=Image.Palette.ADAPTIVE, colors=128))

# Save GIF and stills
frames[0].save(OUT/'simple-alive-idle.gif', save_all=True, append_images=frames[1:], duration=1000//24, loop=0, disposal=2)
# representative full screenshot
full=frames[12].convert('RGBA')
full.save(OUT/'full-body-no-overlay-screenshot.png')
# 50% scale screenshot
small=full.resize((full.width//2, full.height//2), Image.Resampling.LANCZOS)
small.save(OUT/'50-percent-scale-screenshot.png')
# silhouette screenshot: use creature alpha mask, not opaque background.
mask=Image.new('L', CANVAS, 0)
mask_base=base.getchannel('A').resize((resized.width, resized.height), Image.Resampling.BICUBIC)
mask.paste(mask_base, (px, py), mask_base)
sil=Image.new('RGBA', CANVAS, (35,25,22,255))
black=Image.new('RGBA', CANVAS, (9,9,9,255))
black.putalpha(mask)
sil=Image.alpha_composite(sil, black)
sil.save(OUT/'silhouette-only-screenshot.png')
# contact/proof sheet
ref_panel=Image.new('RGBA', CANVAS, (38,24,20,255)); ref_panel.alpha_composite(base,base_pos)
labels=[('TEMP VISUAL AUTHORITY', ref_panel), ('SIMPLE ALIVE FRAME', full), ('50% READABILITY', small.resize(CANVAS, Image.Resampling.NEAREST)), ('SILHOUETTE', sil)]
sheet=Image.new('RGBA',(CANVAS[0]*2,CANVAS[1]*2),(26,18,15,255)); sd=ImageDraw.Draw(sheet)
for idx,(lab,panel) in enumerate(labels):
    x=(idx%2)*CANVAS[0]; y=(idx//2)*CANVAS[1]
    sheet.alpha_composite(panel,(x,y)); sd.rectangle((x,y,x+CANVAS[0]-1,y+34), fill=(0,0,0,160)); sd.text((x+16,y+10), lab, fill=(255,230,190,255))
sheet.save(OUT/'simple-alive-proof-sheet.png')

manifest={
  'state':'BASIC_MOTION_VALIDATION',
  'allowed_operations':['simple idle','subtle chest breathing','tiny tail sway','50% readability/silhouette proof'],
  'transition':'MINIMAL_SEPARATION_BUILD -> BASIC_MOTION_VALIDATION',
  'justification':'User requested return to production execution with simple idle/chest/tail motion; blink was tested and omitted because the rough overlay harmed face appeal. No advanced mesh complexity.',
  'source_authority':str(REF),
  'outputs':[str(OUT/p) for p in ['simple-alive-idle.gif','simple-alive-proof-sheet.png','full-body-no-overlay-screenshot.png','50-percent-scale-screenshot.png','silhouette-only-screenshot.png']],
  'changed_asset_type':'lightweight animation proof; no Spine mesh complexity added',
  'operations':['whole-creature tiny breathing scale/bob','very low-alpha tiny tail sway cue','subtle chest pulse value cue','blink deferred; needs clean eyelid separation to avoid reducing appeal']
}
(OUT/'simple-alive-proof-manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest, indent=2))
