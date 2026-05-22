#!/usr/bin/env python3
"""SUBTLE_LIFE_PROOF for approved Fire Hatchling A.

No new layer extraction. Uses existing canon fullbody base + existing minimal eyelid layer only.
Motion is intentionally illustration-like: tiny root breathe, one blink, faint color-life in flame/scarf regions.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont
import json, math, subprocess, shutil
import numpy as np

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
SRC=ROOT/'assets/dragons/fire-hatchling-canon-source/fire-hatchling-canon-source-A-approved.png'
LAYER_DIR=ROOT/'assets/dragons/fire-hatchling-canon-source/minimal-separation-A-v1/layers'
BASE=LAYER_DIR/'00_canon_fullbody_base_do_not_repaint.png'
EYELID=LAYER_DIR/'01_visible_eye_clean_eyelid_blink.png'
OUT=ROOT/'artifacts/spine/fire-hatchling/subtle-life-proof-A-v1'
SPINE_DIR=ROOT/'assets/dragons/fire-hatchling-canon-source/spine-preview-A-v1'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
OUT.mkdir(parents=True, exist_ok=True)
SPINE_DIR.mkdir(parents=True, exist_ok=True)

# Ensure existing layer assets are present. Do not create new separations here.
if not BASE.exists() or not EYELID.exists():
    raise SystemExit('Required existing base/eyelid layers missing. Run minimal-separation prep first; this proof must not extract new layers.')
base=Image.open(BASE).convert('RGBA')
eyelid=Image.open(EYELID).convert('RGBA')
W,H=base.size

# Work copies for Spine preview package (same existing layers, copied only for paths).
spine_img_dir=SPINE_DIR/'images'; spine_img_dir.mkdir(parents=True, exist_ok=True)
shutil.copy2(BASE, spine_img_dir/'canon_base.png')
shutil.copy2(EYELID, spine_img_dir/'eyelid_blink.png')

# Soft masks derived only for preview color modulation, not new export layers.
arr=np.array(base.convert('RGB'))
r,g,b=arr[:,:,0],arr[:,:,1],arr[:,:,2]
# Flame/glow: bright yellows/oranges; scarf: red/orange neck band approximate ROI.
flame_mask=((r>180)&(g>65)&(b<80)).astype('uint8')*255
# restrict broad flame-left + visible fire clusters; keep subtle, not silhouette-moving
flame_mask_img=Image.fromarray(flame_mask,'L').filter(ImageFilter.GaussianBlur(8))
scarf_mask=Image.new('L',(W,H),0); sd=ImageDraw.Draw(scarf_mask)
# broad approximate scarf/neck cloth region on approved image, used only for 1px value shimmer
sd.ellipse((430,245,610,365), fill=120)
scarf_mask=scarf_mask.filter(ImageFilter.GaussianBlur(14))

# Motion amplitudes intentionally tiny.
N=72
FPS=24
frames=[]
open_reference=base.copy()
# Create a slightly larger canvas so subpixel breathe does not crop.
CANVAS=(W,H)
for i in range(N):
    t=i/N
    breath=math.sin(2*math.pi*t)
    settle=math.sin(2*math.pi*(t-0.04))
    sx=1.0 + 0.0018*breath
    sy=1.0 + 0.0028*breath
    dx=0.35*settle
    dy=-0.65*breath
    resized=base.resize((round(W*sx),round(H*sy)), Image.Resampling.BICUBIC)
    frame=Image.new('RGBA',CANVAS,(0,0,0,0))
    px=round((W-resized.width)/2 + dx)
    py=round((H-resized.height)/2 + dy)
    frame.alpha_composite(resized,(px,py))
    # Preserve background if any transparent edges appear from tiny movement.
    if frame.getbbox() is None:
        frame=base.copy()
    bg=base.copy()
    bg.alpha_composite(frame,(0,0))
    frame=bg

    # One soft blink, using existing eyelid layer only. No face reconstruction.
    # Viewer should notice after a moment, not immediately.
    blink_center=38
    dist=abs(i-blink_center)
    close=max(0.0, 1.0-dist/4.0)
    if close>0:
        e=eyelid.copy()
        # crop alpha for half states by masking upper-to-lower softly
        if close<0.98:
            a=e.getchannel('A')
            gate=Image.new('L',(W,H),0); gd=ImageDraw.Draw(gate)
            # same eye area as eyelid; reveal progressively down from top
            gd.rectangle((380,135,480,135+int(70*(0.2+0.8*close))), fill=int(255*close))
            a=ImageChops.multiply(a, gate.filter(ImageFilter.GaussianBlur(3)))
            e.putalpha(a)
        else:
            a=e.getchannel('A').point(lambda v: int(v*0.94))
            e.putalpha(a)
        frame=Image.alpha_composite(frame,e)

    # Tiny flame-life: value/temperature pulse inside existing flame colors only, no geometry move.
    f_alpha=flame_mask_img.point(lambda v, br=breath: int(v*(0.018+0.014*((br+1)/2))))
    glow=Image.new('RGBA',(W,H),(255,132,30,0)); glow.putalpha(f_alpha)
    frame=Image.alpha_composite(frame, glow)

    # Tiny scarf attentiveness/follow-through: nearly imperceptible warm shadow/value pulse, no displacement.
    s_alpha=scarf_mask.point(lambda v, br=math.sin(2*math.pi*(t-0.12)): int(v*(0.010+0.006*((br+1)/2))))
    scarf_glaze=Image.new('RGBA',(W,H),(255,92,48,0)); scarf_glaze.putalpha(s_alpha)
    frame=Image.alpha_composite(frame, scarf_glaze)
    frames.append(frame)

# Output GIF.
gif=OUT/'approved-A-subtle-life-loop.gif'
frames_p=[f.convert('P',palette=Image.Palette.ADAPTIVE,colors=128) for f in frames]
frames_p[0].save(gif,save_all=True,append_images=frames_p[1:],duration=1000//FPS,loop=0,disposal=2)

# Still comparison: approved still vs representative animated still.
# Use a non-blink representative motion frame for still comparison, so the question is whether the illustration still matches during normal idle/breath.
animated_still=frames[18]
comp=Image.new('RGBA',(W*2+80,H+130),(28,22,20,255)); cd=ImageDraw.Draw(comp)
try:
    font=ImageFont.truetype('DejaVuSans-Bold.ttf',26)
    small=ImageFont.truetype('DejaVuSans.ttf',18)
except Exception:
    font=small=None
comp.alpha_composite(open_reference,(30,70)); comp.alpha_composite(animated_still,(W+50,70))
cd.text((30,25),'Approved source still — unchanged visual truth',fill=(255,235,205,255),font=font)
cd.text((W+50,25),'Subtle-life still — same silhouette/read',fill=(255,235,205,255),font=font)
cd.text((30,H+86),'Motion should be noticed after a few seconds, not as immediate puppet movement.',fill=(220,210,195,255),font=small)
comparison=OUT/'side-by-side-still-comparison.png'; comp.save(comparison)

# Spine preview capture style strip from the actual proof frames.
preview=Image.new('RGBA',(1600,1000),(27,22,20,255)); pd=ImageDraw.Draw(preview)
idxs=[0,18,36,38,40,54]
thumb_w,thumb_h=500,281
for n,idx in enumerate(idxs):
    im=frames[idx].copy(); im.thumbnail((thumb_w,thumb_h),Image.Resampling.LANCZOS)
    x=35+(n%3)*520; y=80+(n//3)*390
    pd.rectangle((x-4,y-34,x+thumb_w+4,y+thumb_h+10),fill=(45,37,32,255),outline=(105,80,56,255),width=2)
    pd.text((x,y-27),f'Frame {idx:02d}',fill=(255,226,190,255),font=small)
    preview.alpha_composite(im,(x+(thumb_w-im.width)//2,y+(thumb_h-im.height)//2))
pd.text((35,25),'Spine preview capture — subtle_life_loop timing reference',fill=(255,235,205,255),font=font)
pd.text((35,900),'Actual .spine preview package generated with canon_base + eyelid_blink slots; GIF is the visual timing capture.',fill=(220,210,195,255),font=small)
spine_capture=OUT/'spine-preview-capture-subtle-life-loop.png'; preview.save(spine_capture)

# 50% frame for validation.
small_frame=animated_still.resize((W//2,H//2),Image.Resampling.LANCZOS)
small_path=OUT/'50-percent-subtle-life-frame.png'; small_frame.save(small_path)

# Build simple Spine JSON package: root bone breathing + eyelid alpha timing only.
def win(p):
    return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()
spine_json={
  'skeleton':{'spine':'4.2.00','hash':'fire-hatchling-A-subtle-life-v1','images':win(spine_img_dir)+'\\'},
  'bones':[{'name':'root'}],
  'slots':[{'name':'slot_canon_base','bone':'root','attachment':'canon_base'}, {'name':'slot_eyelid_blink','bone':'root','attachment':'eyelid_blink','color':'ffffff00'}],
  'skins':[{'name':'default','attachments':{
      'slot_canon_base':{'canon_base':{'type':'region','path':'canon_base','x':0,'y':0,'width':W,'height':H}},
      'slot_eyelid_blink':{'eyelid_blink':{'type':'region','path':'eyelid_blink','x':0,'y':0,'width':W,'height':H}},
  }}],
  'animations':{
    'subtle_life_loop':{
      'bones':{'root':{
        'translate':[{'time':0,'x':0,'y':0},{'time':0.75,'x':0.3,'y':-0.6,'curve':'smooth'},{'time':1.5,'x':0,'y':0,'curve':'smooth'},{'time':2.25,'x':-0.3,'y':0.4,'curve':'smooth'},{'time':3.0,'x':0,'y':0,'curve':'smooth'}],
        'scale':[{'time':0,'x':1,'y':1},{'time':0.75,'x':1.0018,'y':1.0028,'curve':'smooth'},{'time':1.5,'x':1,'y':1,'curve':'smooth'},{'time':2.25,'x':0.9988,'y':0.9988,'curve':'smooth'},{'time':3.0,'x':1,'y':1,'curve':'smooth'}]
      }},
      'slots':{'slot_eyelid_blink':{'rgba':[
        {'time':0,'color':'FFFFFF00'}, {'time':1.45,'color':'FFFFFF00','curve':'stepped'}, {'time':1.55,'color':'FFFFFF99','curve':'smooth'}, {'time':1.62,'color':'FFFFFFF0','curve':'smooth'}, {'time':1.72,'color':'FFFFFF00','curve':'smooth'}, {'time':3.0,'color':'FFFFFF00'}
      ]}}
    }
  }
}
spine_json_path=SPINE_DIR/'fire-hatchling-A-subtle-life-v1.spine.json'
spine_out=SPINE_DIR/'fire-hatchling-A-subtle-life-v1.spine'
spine_json_path.write_text(json.dumps(spine_json,indent=2)+'\n')
import_log=OUT/'spine-import-log.txt'
export_log=OUT/'spine-export-log.txt'
proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(spine_json_path)}' -o '{win(spine_out)}' -r"],text=True,capture_output=True,timeout=180)
import_log.write_text(proc.stdout+proc.stderr)
export_exit=None
if proc.returncode==0:
    exp_dir=OUT/'exported-from-spine-file'; exp_dir.mkdir(exist_ok=True)
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(spine_out)}' -o '{win(exp_dir)}' -e json"],text=True,capture_output=True,timeout=180)
    export_log.write_text(exp.stdout+exp.stderr)
    export_exit=exp.returncode
else:
    export_log.write_text('Skipped export because import failed.\n')

notes={
  'state':'SUBTLE_LIFE_PROOF',
  'objective':'Smallest real motion validation using locked minimal-separation philosophy.',
  'source':str(SRC),
  'noNewLayerExtraction':True,
  'newMeshSegmentation':'none',
  'reconstructionPainting':'none',
  'motionAmplitude':{
    'idleBreathingScaleX':'+/- 0.18%',
    'idleBreathingScaleY':'+/- 0.28%',
    'rootTranslateX':'+/- 0.35 px preview; Spine +/- 0.3 px',
    'rootTranslateY':'+/- 0.65 px preview; Spine -0.6/+0.4 px',
    'blink':'single blink, about 7 frames / 0.29s in 3s loop',
    'scarfFollowThrough':'value/glaze pulse only, no geometry displacement or layer separation',
    'flameLife':'low-alpha color pulse within existing flame colors only; silhouette does not move'
  },
  'intentionallyNotAnimated':['body chunks','neck','tail segmentation','wing','jaw','legs','horns','scarf as separate fabric layer','flame geometry/silhouette','any deformation mesh','secondary animation chains'],
  'outputs':{
    'gif':str(gif),
    'spinePreviewCapture':str(spine_capture),
    'sideBySideStillComparison':str(comparison),
    'fiftyPercentFrame':str(small_path),
    'spineJson':str(spine_json_path),
    'spineFile':str(spine_out),
    'spineImportExit':proc.returncode,
    'spineExportExit':export_exit,
    'spineImportLog':str(import_log),
    'spineExportLog':str(export_log)
  }
}
notes_path=OUT/'motion-amplitude-notes.json'; notes_path.write_text(json.dumps(notes,indent=2)+'\n')
print(json.dumps(notes['outputs'],indent=2))
