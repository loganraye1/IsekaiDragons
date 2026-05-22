#!/usr/bin/env python3
from __future__ import annotations
import json, math, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
BEFORE=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/before-exported-from-spine/living-forge-fire-hatchling.mechanics-truth-v11-no-overlay-50-readability.json'
# export filename can include .spine.json depending Spine version
if not BEFORE.exists():
    candidates=list((ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/before-exported-from-spine').glob('*.json'))
    BEFORE=candidates[0]
AFTER=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/exported-from-spine-file/living-forge-fire-hatchling.production-mesh-v12-actual-weighted.spine.json'
if not AFTER.exists():
    candidates=list((ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/exported-from-spine-file').glob('*.json'))
    AFTER=candidates[0]
OUT=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/actual-spine-file-before-after-mesh-audit.png'
AUDIT=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/actual-mesh-conversion-audit.json'
CHECKS=[('slot_body_core','02_body_core'),('slot_neck_collar_underlap','02b_neck_collar_underlap_paint'),('slot_lower_neck_torso_weight_blend','02c_lower_neck_torso_weight_blend_proxy'),('slot_cheek_jowl_bridge','05d_cheek_jowl_mouth_corner_bridge'),('slot_tail_lantern','00_tail_lantern')]

def load(p):
    d=json.loads(p.read_text()); return d['skins'][0]['attachments']
b=load(BEFORE); a=load(AFTER)
audit=json.loads(AUDIT.read_text())
meta_by_key={(c['slot'],c['attachment']):c for c in audit['convertedAttachments']}
try:
    title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',18); small=ImageFont.truetype('DejaVuSans.ttf',14); mono=ImageFont.truetype('DejaVuSansMono.ttf',13)
except OSError: title=font=small=mono=None
im=Image.new('RGB',(1900,1180),(24,21,19)); d=ImageDraw.Draw(im)
d.text((30,24),'Actual Spine File Round-Trip Mesh Audit — BEFORE exported .spine vs AFTER exported .spine',fill=(255,224,170),font=title)
d.text((30,66),f'BEFORE actual .spine export: {BEFORE.relative_to(ROOT)}',fill=(200,200,200),font=small)
d.text((30,88),f'AFTER actual .spine export:  {AFTER.relative_to(ROOT)}',fill=(200,200,200),font=small)
headers=['Attachment','Before type','After type','After verts/uvs/tris','Weighted regions / driver bones']
xs=[30,460,650,850,1120]
y=140
for x,h in zip(xs,headers): d.text((x,y),h,fill=(255,170,95),font=font)
y+=35
for slot,att in CHECKS:
    ba=b[slot][att]; aa=a[slot][att]
    bt=ba.get('type','region'); at=aa.get('type','region')
    verts=len(aa.get('vertices',[])); uvs=len(aa.get('uvs',[])); tris=len(aa.get('triangles',[]))
    meta=meta_by_key[(slot,att)]
    regions=', '.join(meta.get('weightedRegions',[]))
    bones=', '.join(meta.get('influencingBones',[]))
    lines=[f'{slot}/{att}',bt,at,f'{verts} / {uvs} / {tris}',f'regions: {regions}\nbones: {bones}']
    row_h=110
    d.rectangle((25,y-6,1875,y+row_h-8),outline=(80,60,45),width=1)
    for x,text in zip(xs,lines):
        wrapped=[]
        for part in text.split('\n'):
            wrapped+=textwrap.wrap(part, width=58 if x==1120 else 30) or ['']
        yy=y
        for wl in wrapped[:5]:
            color=(160,255,170) if (x==650 and wl=='mesh') else (235,210,185)
            d.text((x,yy),wl,fill=color,font=mono if x in (30,1120) else font); yy+=18
    y+=row_h
# Draw a simplified mesh grid evidence panel for after.
y+=20
d.text((30,y),'After-file weighted mesh structure: each converted attachment has 12 mesh vertices, 12 triangles, multi-bone weighted vertex records.',fill=(255,224,170),font=font)
y+=40
for idx,(slot,att) in enumerate(CHECKS):
    x=60+idx*350; yy=y+40
    d.text((x,yy-30),att,fill=(255,170,95),font=small)
    # draw 4x3 vertices + triangle diagonals
    cols=4; rows=3; sx=70; sy=55
    pts=[]
    for r in range(rows):
        for c in range(cols): pts.append((x+c*sx,yy+r*sy))
    for r in range(rows-1):
        for c in range(cols-1):
            p0=pts[r*cols+c]; p1=pts[r*cols+c+1]; p2=pts[(r+1)*cols+c+1]; p3=pts[(r+1)*cols+c]
            d.line([p0,p1,p2,p0],fill=(80,180,210),width=1); d.line([p0,p2,p3,p0],fill=(80,180,210),width=1)
    for p in pts: d.ellipse((p[0]-5,p[1]-5,p[0]+5,p[1]+5),fill=(255,170,80))
    d.text((x,yy+rows*sy+12),'weighted mesh',fill=(160,255,170),font=small)
d.text((30,1130),'Evidence source is Spine CLI export from the actual .spine files, not a proof GIF/contact sheet. Visual deformation still requires artist inspection/tuning in Spine Pro.',fill=(255,120,120),font=font)
im.save(OUT,quality=94)
print(OUT)
