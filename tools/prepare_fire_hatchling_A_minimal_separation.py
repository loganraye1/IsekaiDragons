#!/usr/bin/env python3
"""Prepare minimal animation-ready separation package for approved Fire Hatchling A.

STATE: MINIMAL_SEPARATION_BUILD
Allowed operations:
- prepare animation-ready version of approved canon source
- minimal eyelid separation
- subtle idle/breath setup guides
- optional scarf secondary motion anchor guide
- preserve unified silhouette / face appeal
- no advanced deformation, speculative mesh complexity, or plate-zone reconstruction

This intentionally does NOT segment body plates or rebuild the dragon. The approved source remains the visual base.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import json, math

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
SRC=ROOT/'assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png'
OUT=ROOT/'artifacts/spine/fire-hatchling/minimal-separation-A-v1-approved-source-prep'
LAYER_DIR=ROOT/'assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers'
OUT.mkdir(parents=True, exist_ok=True)
LAYER_DIR.mkdir(parents=True, exist_ok=True)

img=Image.open(SRC).convert('RGBA')
W,H=img.size

# Exact visual base: do not alter approved source appeal.
base_path=LAYER_DIR/'00_canon_fullbody_base_do_not_repaint.png'
img.save(base_path)

# One visible eye only. Coordinates tuned on 1024x576 source.
# Eyelid is a small full-canvas transparent layer, not a face rebuild.
eye_box=(398,148,456,192)  # x0,y0,x1,y1 around the visible eye
lid=Image.new('RGBA',(W,H),(0,0,0,0))
ld=ImageDraw.Draw(lid)
x0,y0,x1,y1=eye_box
# clip to a soft eye/scale oval so it reads as lid shape, not a sticker rectangle
mask=Image.new('L',(W,H),0); md=ImageDraw.Draw(mask)
md.ellipse((x0,y0,x1,y1),fill=255)
local=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(local)
# warm dark scale color sampled visually from brow/scales; keeps eye expressive by leaving a hot slit
base_col=(83,31,21,235)
hi_col=(190,72,38,178)
shadow_col=(34,18,15,210)
d.ellipse((x0-2,y0-2,x1+2,y1+2), fill=base_col)
d.arc((x0+4,y0+5,x1-4,y0+28), 190, 350, fill=hi_col, width=3)
d.arc((x0+6,y1-18,x1-6,y1-2), 185, 355, fill=(255,143,35,125), width=2)
d.arc((x0+3,y0+31,x1-3,y0+46), 185, 355, fill=shadow_col, width=2)
local.putalpha(Image.composite(local.getchannel('A'), Image.new('L',(W,H),0), mask))
lid=local.filter(ImageFilter.GaussianBlur(0.25))
lid_path=LAYER_DIR/'01_visible_eye_clean_eyelid_blink.png'
lid.save(lid_path)

# Guide-only anchors. These are not visual separated body parts; they document pivots for minimal future Spine controls.
guide=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(guide)
# chest breath support: broad body/chest center, whole-body scale/bob only
chest_anchor=(477,350); scarf_anchor=(500,278); body_pivot=(535,356)
# Use colored tiny guide marks; excluded from no-overlay screenshots.
for pt,color,label in [
    (body_pivot,(80,180,255,220),'body/breath pivot'),
    (chest_anchor,(255,180,45,220),'subtle chest breath center'),
    (scarf_anchor,(220,220,255,220),'optional scarf secondary anchor'),
]:
    x,y=pt
    gd.ellipse((x-7,y-7,x+7,y+7), fill=color)
    gd.line((x-14,y,x+14,y), fill=color, width=2)
    gd.line((x,y-14,x,y+14), fill=color, width=2)
    gd.text((x+12,y-8),label,fill=color)
guide_path=LAYER_DIR/'guide_minimal_motion_anchors_not_export_art.png'
guide.save(guide_path)

# No-overlay full body and 50% readability screenshots.
full_path=OUT/'no-overlay-full-body-screenshot.png'
img.save(full_path)
small=img.resize((W//2,H//2),Image.Resampling.LANCZOS)
small_path=OUT/'50-percent-readability-screenshot.png'
small.save(small_path)

# Minimal blink/breath proof frames.
def apply_blink(base, close):
    if close<=0: return base.copy()
    # Fade in the separated eyelid layer. At half close, use vertical crop of upper lid only.
    ov=Image.new('RGBA',(W,H),(0,0,0,0))
    if close < 0.98:
        crop_h=int((y1-y0)*(0.25+0.55*close))
        m=Image.new('L',(W,H),0); draw=ImageDraw.Draw(m)
        draw.ellipse((x0,y0,x1,y0+crop_h), fill=int(255*close))
        part=lid.copy(); part.putalpha(Image.composite(part.getchannel('A'), Image.new('L',(W,H),0), m))
        ov=part
    else:
        ov=lid
    return Image.alpha_composite(base, ov)

open_frame=img.copy()
half_frame=apply_blink(img,0.55)
closed_frame=apply_blink(img,1.0)
closed_path=OUT/'minimal-blink-closed-proof.png'; closed_frame.save(closed_path)

# Subtle idle proof GIF: whole-image tiny breathe + eyelid blink only. No segmented body motion.
frames=[]
for i in range(48):
    t=i/48
    breath=math.sin(2*math.pi*t)
    sx=1.0+0.004*breath; sy=1.0+0.006*breath
    canvas=Image.new('RGBA',(W,H),(54,54,54,255))
    resized=img.resize((round(W*sx), round(H*sy)), Image.Resampling.BICUBIC)
    px=-(resized.width-W)//2
    py=-(resized.height-H)//2-round(1.5*breath)
    canvas.alpha_composite(resized,(px,py))
    dist=abs(i-20); close=max(0,1-dist/3.0)
    if close>0:
        canvas=apply_blink(canvas,close)
    frames.append(canvas)
gif_path=OUT/'minimal-subtle-life-proof.gif'
frames_p=[f.convert('P',palette=Image.Palette.ADAPTIVE,colors=128) for f in frames]
frames_p[0].save(gif_path,save_all=True,append_images=frames_p[1:],duration=1000//24,loop=0,disposal=2)

# Layer breakdown sheet.
try:
    font=ImageFont.truetype('DejaVuSans-Bold.ttf',22)
    small_font=ImageFont.truetype('DejaVuSans.ttf',16)
except Exception:
    font=small_font=None
sheet=Image.new('RGBA',(1600,1200),(24,20,18,255)); sd=ImageDraw.Draw(sheet)

def panel(x,y,w,h,title,content):
    sd.rectangle((x,y,x+w,y+h),fill=(38,32,28,255),outline=(98,76,55,255),width=2)
    sd.rectangle((x,y,x+w,y+38),fill=(0,0,0,170))
    sd.text((x+12,y+9),title,fill=(255,230,190,255),font=small_font)
    content.thumbnail((w-24,h-58),Image.Resampling.LANCZOS)
    sheet.alpha_composite(content,(x+(w-content.width)//2,y+48+(h-58-content.height)//2))

# base panel
panel(30,40,740,480,'00 FULLBODY BASE — exact approved source, unchanged',img.copy())
# eyelid alone on dark background
lid_vis=Image.new('RGBA',(W,H),(34,29,26,255)); lid_vis.alpha_composite(lid)
panel(830,40,740,480,'01 EYELID SEPARATION — only real visual separation',lid_vis)
# guides overlay
with_guides=Image.alpha_composite(img.copy(),guide)
panel(30,580,740,480,'GUIDE ONLY — breath/scarf anchors, not body plates',with_guides)
# separated parts notes
sd.rectangle((830,580,740+830,480+580),fill=(38,32,28,255),outline=(98,76,55,255),width=2)
sd.rectangle((830,580,1570,618),fill=(0,0,0,170))
sd.text((842,589),'MINIMAL SEPARATED PARTS + NECESSITY',fill=(255,230,190,255),font=small_font)
notes=[
'1. 00_canon_fullbody_base_do_not_repaint.png',
'   Necessity: preserves exact approved appeal/silhouette as the main creature.',
'2. 01_visible_eye_clean_eyelid_blink.png',
'   Necessity: only way to blink without repainting/rebuilding the face.',
'3. guide_minimal_motion_anchors_not_export_art.png',
'   Necessity: documents future subtle breath/scarf pivots; not visual art.',
'',
'Not separated in this pass:',
'- body plates / scale chunks: would fragment silhouette.',
'- scarf fabric: deferred; current source has no hidden underpaint.',
'- tail base: not needed for first subtle-life setup.',
'- jaw: source has open mouth/fire breath; defer until neutral mouth plan.',
'',
'Motion philosophy: whole-body tiny breathe + one clean blink first.'
]
for j,line in enumerate(notes):
    sd.text((852,640+j*27),line,fill=(230,220,205,255),font=small_font)
layer_sheet=OUT/'animation-ready-layer-breakdown-sheet.png'
sheet.save(layer_sheet)

# Separation proof sheet: open/half/closed/full 50%.
proof=Image.new('RGBA',(1600,1200),(24,20,18,255)); pd=ImageDraw.Draw(proof)
def proof_panel(x,y,w,h,title,content):
    pd.rectangle((x,y,x+w,y+h),fill=(38,32,28,255),outline=(98,76,55,255),width=2)
    pd.rectangle((x,y,x+w,y+38),fill=(0,0,0,170))
    pd.text((x+12,y+9),title,fill=(255,230,190,255),font=small_font)
    content=content.copy(); content.thumbnail((w-24,h-58),Image.Resampling.LANCZOS)
    proof.alpha_composite(content,(x+(w-content.width)//2,y+48+(h-58-content.height)//2))
proof_panel(30,40,740,480,'OPEN — approved source preserved',open_frame)
proof_panel(830,40,740,480,'HALF BLINK — eyelid layer only',half_frame)
proof_panel(30,580,740,480,'CLOSED BLINK — minimal separation preview',closed_frame)
proof_panel(830,580,740,480,'50% READABILITY — same design, small scale',small.resize((W,H),Image.Resampling.NEAREST))
proof_path=OUT/'minimal-separation-proof-sheet.png'
proof.save(proof_path)

manifest={
    'state':'MINIMAL_SEPARATION_BUILD',
    'transition':'none',
    'canonSource':str(SRC),
    'allowedOperations':[ 'prepare animation-ready version of approved canon source', 'minimal eyelid separation', 'subtle idle/breath setup guides', 'optional scarf secondary motion anchor guide', 'preserve unified silhouette', 'preserve face appeal', 'no advanced deformation', 'no speculative mesh complexity', 'no plate-zone reconstruction' ],
    'separatedParts':[{
        'name':'00_canon_fullbody_base_do_not_repaint',
        'path':str(base_path),
        'type':'full cohesive base',
        'necessaryBecause':'Preserves exact approved source image; avoids rebuilding the creature into fragments.'
    },{
        'name':'01_visible_eye_clean_eyelid_blink',
        'path':str(lid_path),
        'type':'minimal visual separation',
        'necessaryBecause':'Allows a proper blink while leaving the open face and all other anatomy unchanged.'
    }],
    'guideOnlyParts':[{
        'name':'guide_minimal_motion_anchors_not_export_art',
        'path':str(guide_path),
        'necessaryBecause':'Documents broad body/chest breath pivot and optional scarf anchor without creating new visual fragmentation.'
    }],
    'deferred':[ 'scarf visual separation: deferred until hidden underpaint/clean fabric plan exists', 'tail-base support: not needed for first subtle-life pass', 'jaw separation: deferred because source is open-mouth/fire-breath pose', 'body/scale plates: explicitly prohibited' ],
    'outputs':{
        'layerBreakdownSheet':str(layer_sheet),
        'minimalSeparationProofSheet':str(proof_path),
        'noOverlayFullBody':str(full_path),
        'fiftyPercentReadability':str(small_path),
        'blinkClosedProof':str(closed_path),
        'subtleLifeGif':str(gif_path)
    }
}
manifest_path=OUT/'minimal-separation-A-v1-manifest.json'
manifest_path.write_text(json.dumps(manifest,indent=2))
print(json.dumps({'out':str(OUT),'manifest':str(manifest_path),'outputs':manifest['outputs']},indent=2))
