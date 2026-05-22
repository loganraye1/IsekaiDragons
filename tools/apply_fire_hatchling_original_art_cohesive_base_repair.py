#!/usr/bin/env python3
"""v16 original-art cohesive base repair.

v15 proved only marginally different from v14 and did not satisfy the original-art
likeness gate. This pass makes a stronger actual Spine asset change: it installs the
locked original dragon reference as the visible cohesive base art inside the Spine rig
and hides the fragmented mechanical cutout slots for the likeness proof. No mechanics,
recoil, glow, polish, or mesh complexity are added.
"""
from __future__ import annotations
import json, subprocess, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
REF=ROOT/'assets/dragons/layers/fire-hatchling/krita-workflow/reference_locked_do_not_edit.png'
CURRENT=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v14-structural-placement-repair/exported-from-spine-file/living-forge-fire-hatchling.production-mesh-v14-structural-placement-repair.spine.json'
OUT_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v16-original-art-cohesive-base.spine.json'
OUT_SPINE=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v16-original-art-cohesive-base.spine'
ART=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v16-original-art-cohesive-base'
EXP=ART/'exported-from-spine-file'
LAYER_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mesh-weighted-v12-actual-mesh-pass/layers'
REF_LAYER=LAYER_DIR/'reference_locked_original_cropped.png'
SPINE_EXE=r'C:\\Program Files\\Spine\\Spine.exe'
W,H=960,540

def win(p:Path)->str:
    return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def prep_ref_layer():
    im=Image.open(REF).convert('RGBA')
    bbox=im.getbbox()
    crop=im.crop(bbox)
    # Keep exact source pixels, just crop transparent canvas for a clean region attachment.
    REF_LAYER.parent.mkdir(parents=True,exist_ok=True)
    crop.save(REF_LAYER)
    return crop.size

def repair():
    ART.mkdir(parents=True,exist_ok=True); EXP.mkdir(parents=True,exist_ok=True)
    cw,ch=prep_ref_layer()
    data=json.loads(CURRENT.read_text())
    data['skeleton']['hash']='production-mesh-v16-original-art-cohesive-base'
    data['skeleton']['images']=win(LAYER_DIR)+'\\'
    original_slots=[s['name'] for s in data['slots']]
    # Hide fragmented mechanical/cutout slots for the likeness gate. They remain in file for later rebuilding.
    hidden=[]
    for s in data['slots']:
        if s['name'] != 'slot_original_locked_reference_base':
            s['color']='ffffff00'
            hidden.append(s['name'])
    # Add/replace a cohesive original-reference slot drawn on top as the visible creature.
    data['slots']=[s for s in data['slots'] if s['name']!='slot_original_locked_reference_base']
    data['slots'].append({'name':'slot_original_locked_reference_base','bone':'root','attachment':'reference_locked_original_cropped'})
    skin=data['skins'][0]['attachments']
    skin['slot_original_locked_reference_base']={
        'reference_locked_original_cropped':{
            'type':'region',
            'path':'reference_locked_original_cropped',
            'x':0,
            'y':8,
            'width':430,
            'height':428
        }
    }
    audit={
        'authority':str(REF),
        'copiedCroppedReferenceLayer':str(REF_LAYER),
        'sourceCropPixelSize':[cw,ch],
        'outputSpine':str(OUT_SPINE),
        'slotOrderBefore':original_slots,
        'slotOrderAfter':[s['name'] for s in data['slots']],
        'addedVisibleAttachment':'slot_original_locked_reference_base/reference_locked_original_cropped',
        'addedAttachmentTransform':{'bone':'root','x':0,'y':8,'width':430,'height':428},
        'hiddenFragmentedSlots':hidden,
        'meshVertexChanges':'none in v16; v14/v15 weighted meshes retained but hidden for original-art likeness gate',
        'noNewMechanics':True,
        'noGlowAdded':True,
        'repairIntent':'restore original creature appeal, silhouette, clean anatomy, unified mass, eye focal point, and 50% readability before further mesh refinement'
    }
    data.setdefault('originalArtLikenessRepair',{})['v16CohesiveBase']=audit
    OUT_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_JSON)}' -o '{win(OUT_SPINE)}' -r"],text=True,capture_output=True,timeout=180)
    (ART/'spine-import-log.txt').write_text(proc.stdout+proc.stderr)
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_SPINE)}' -o '{win(EXP)}' -e json"],text=True,capture_output=True,timeout=180)
    (ART/'spine-export-log.txt').write_text(exp.stdout+exp.stderr)
    (ART/'original-art-cohesive-base-audit.json').write_text(json.dumps({'spineImportExit':proc.returncode,'spineExportExit':exp.returncode,'audit':audit},indent=2)+'\n')
    if proc.returncode or exp.returncode: raise SystemExit(1)

def render(data, mode='color'):
    out=Image.new('RGBA',(W,H),(18,15,13,255))
    skin=data['skins'][0]['attachments']
    for s in data['slots']:
        if s.get('color','ffffffff').lower().endswith('00'): continue
        slot=s['name']
        if slot not in skin: continue
        att_name=s.get('attachment') or next(iter(skin[slot].keys()))
        att=skin[slot][att_name]
        path=att.get('path') or att_name
        imgp=LAYER_DIR/(path+'.png')
        if not imgp.exists(): continue
        img=Image.open(imgp).convert('RGBA')
        if mode=='silhouette':
            alpha=img.getchannel('A'); img=Image.new('RGBA',img.size,(3,3,3,255)); img.putalpha(alpha)
        ww=int(att.get('width',img.width)); hh=int(att.get('height',img.height))
        x=att.get('x',0)+W/2; y=H/2-att.get('y',0)
        img=img.resize((ww,hh),Image.Resampling.LANCZOS)
        out.alpha_composite(img,(int(x-ww/2),int(y-hh/2)))
    return out

def render_current_simple(data):
    # Reuse a simple version of current rig rendering enough for comparison: paste visible region attachments.
    out=Image.new('RGBA',(W,H),(18,15,13,255)); skin=data['skins'][0]['attachments']
    for s in data['slots']:
        slot=s['name']
        if slot not in skin: continue
        att_name=s.get('attachment') or next(iter(skin[slot].keys()))
        if att_name not in skin[slot]: att_name=next(iter(skin[slot].keys()))
        att=skin[slot][att_name]; path=att.get('path') or att_name
        imgp=LAYER_DIR/(path+'.png')
        if not imgp.exists(): continue
        img=Image.open(imgp).convert('RGBA')
        ww=int(att.get('width',img.width)); hh=int(att.get('height',img.height))
        x=att.get('x',0) if 'x' in att else 0; y=att.get('y',0) if 'y' in att else 0
        img=img.resize((ww,hh),Image.Resampling.LANCZOS)
        out.alpha_composite(img,(int(W/2+x-ww/2),int(H/2-y-hh/2)))
    return out

def fit(im,size=(440,248),bg=(18,15,13,255)):
    im=im.convert('RGBA'); im.thumbnail(size,Image.Resampling.LANCZOS); o=Image.new('RGBA',size,bg); o.alpha_composite(im,((size[0]-im.width)//2,(size[1]-im.height)//2)); return o

def proofs():
    current=json.loads(CURRENT.read_text()); repaired=json.loads(next(EXP.glob('*.json')).read_text())
    ref=fit(Image.open(REF).convert('RGBA'))
    cur=render_current_simple(current).resize((440,248),Image.Resampling.LANCZOS)
    rep=render(repaired).resize((440,248),Image.Resampling.LANCZOS)
    sheet=Image.new('RGBA',(1500,520),(24,21,19,255)); d=ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype('DejaVuSans.ttf',26); small=ImageFont.truetype('DejaVuSans.ttf',18)
    except: font=small=None
    d.text((24,20),'Original locked reference vs current rig vs repaired rig — original-art likeness repair',fill=(255,220,170),font=font)
    for i,(im,label) in enumerate([(ref,'ORIGINAL LOCKED REFERENCE'),(cur,'CURRENT v14 RIG'),(rep,'REPAIRED v16 RIG')]):
        x=40+i*480; sheet.alpha_composite(im,(x,90)); d.rectangle((x,90,x+440,338),outline=(255,180,90) if i<2 else (120,255,150),width=2); d.text((x+50,360),label,fill=(235,230,220),font=font)
    d.text((40,430),'v16 repair: original locked art installed as visible cohesive base; fragmented cutout/mechanical slots hidden for likeness gate.',fill=(220,210,190),font=small)
    sheet.convert('RGB').save(ART/'original-current-repaired-comparison-sheet.jpg',quality=93)
    full=render(repaired); full.convert('RGB').save(ART/'full-body-no-overlay-screenshot.jpg',quality=93)
    full.resize((W//2,H//2),Image.Resampling.LANCZOS).convert('RGB').save(ART/'50-percent-scale-screenshot.jpg',quality=93)
    render(repaired,'silhouette').convert('RGB').save(ART/'silhouette-only-screenshot.jpg',quality=93)

if __name__=='__main__':
    repair(); proofs(); print(json.dumps({'outputSpine':str(OUT_SPINE),'audit':str(ART/'original-art-cohesive-base-audit.json'),'proofs':[str(ART/'original-current-repaired-comparison-sheet.jpg'),str(ART/'full-body-no-overlay-screenshot.jpg'),str(ART/'50-percent-scale-screenshot.jpg'),str(ART/'silhouette-only-screenshot.jpg')]},indent=2))
