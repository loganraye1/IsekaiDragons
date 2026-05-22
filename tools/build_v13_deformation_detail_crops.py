#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
# Use before-after sheet generated from exported actual Spine playback; crop key rows/areas for visual evidence.
SRC=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v13-hand-tuned-deformation/before-after-actual-playback-screenshots.jpg'
OUT=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v13-hand-tuned-deformation/before-after-deformation-detail-crops.jpg'
im=Image.open(SRC).convert('RGB')
try: font=ImageFont.truetype('DejaVuSans.ttf',24); small=ImageFont.truetype('DejaVuSans.ttf',17)
except: font=small=None
# Source sheet layout: before thumb at x=100, after thumb at x=840, y=60+i*210, thumb 320x180.
rows=[('compression / chest pressure',1),('release / cheek-mouth corner',3),('tail stabilization / lantern lag',5)]
out=Image.new('RGB',(1280,780),(24,21,19)); d=ImageDraw.Draw(out)
d.text((24,18),'v13 detail crops from actual exported Spine playback: before vs after hand-tuned weighted meshes',fill=(255,220,170),font=font)
y=70
for label,i in rows:
    sy=60+i*210
    before=im.crop((100,sy,420,sy+180)).resize((420,236),Image.Resampling.LANCZOS)
    after=im.crop((840,sy,1160,sy+180)).resize((420,236),Image.Resampling.LANCZOS)
    d.text((28,y+95),label,fill=(255,180,100),font=small)
    out.paste(before,(260,y)); out.paste(after,(780,y))
    d.rectangle((260,y,680,y+236),outline=(255,150,90),width=2)
    d.rectangle((780,y,1200,y+236),outline=(120,255,150),width=2)
    # emphasis boxes approximate chest/cheek/tail zones
    for bx in [260,780]:
        if i==1: d.rectangle((bx+120,y+95,bx+205,y+150),outline=(255,255,0),width=2)
        if i==3: d.rectangle((bx+55,y+65,bx+130,y+125),outline=(255,255,0),width=2)
        if i==5: d.rectangle((bx+260,y+100,bx+395,y+170),outline=(255,255,0),width=2)
    y+=235
d.text((330,735),'BEFORE v12',fill=(255,150,90),font=font); d.text((890,735),'AFTER v13',fill=(120,255,150),font=font)
out.save(OUT,quality=94)
print(OUT)
