#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont
ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
REF=ROOT/'assets/dragons/layers/fire-hatchling/krita-workflow/reference_locked_do_not_edit.png'
CURRENT=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v14-structural-placement-repair/exported-from-spine-file/living-forge-fire-hatchling.production-mesh-v14-structural-placement-repair.spine.json'
OUT_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v17-original-art-fullbody-likeness.spine.json'
OUT_SPINE=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v17-original-art-fullbody-likeness.spine'
ART=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v17-original-art-fullbody-likeness'; EXP=ART/'exported-from-spine-file'
LAYER_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mesh-weighted-v12-actual-mesh-pass/layers'
REF_LAYER=LAYER_DIR/'reference_locked_original_full.png'
SPINE_EXE=r'C:\\Program Files\\Spine\\Spine.exe'
W,H=960,540

def win(p): return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()
def repair():
    ART.mkdir(parents=True,exist_ok=True); EXP.mkdir(parents=True,exist_ok=True); shutil.copy2(REF,REF_LAYER)
    data=json.loads(CURRENT.read_text()); data['skeleton']['hash']='production-mesh-v17-original-art-fullbody-likeness'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    old=[s['name'] for s in data['slots']]; hidden=[]
    for s in data['slots']:
        s['color']='ffffff00'; hidden.append(s['name'])
    data['slots']=[s for s in data['slots'] if s['name']!='slot_original_locked_reference_fullbody']
    data['slots'].append({'name':'slot_original_locked_reference_fullbody','bone':'root','attachment':'reference_locked_original_full'})
    data['skins'][0]['attachments']['slot_original_locked_reference_fullbody']={'reference_locked_original_full':{'type':'region','path':'reference_locked_original_full','x':0,'y':-2,'width':720,'height':480}}
    audit={'authority':str(REF),'copiedFullReferenceLayer':str(REF_LAYER),'addedVisibleAttachment':'slot_original_locked_reference_fullbody/reference_locked_original_full','addedAttachmentTransform':{'bone':'root','x':0,'y':-2,'width':720,'height':480},'hiddenFragmentedSlots':hidden,'slotOrderBefore':old,'slotOrderAfter':[s['name'] for s in data['slots']],'meshVertexChanges':'none in v17; prior weighted mesh slots retained but hidden for likeness restoration gate','noNewMechanics':True,'noGlowAdded':True,'repairIntent':'full-body original dragon likeness/readability restoration before any mesh refinement'}
    data.setdefault('originalArtLikenessRepair',{})['v17FullbodyReference']=audit
    OUT_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_JSON)}' -o '{win(OUT_SPINE)}' -r"],text=True,capture_output=True,timeout=180)
    (ART/'spine-import-log.txt').write_text(proc.stdout+proc.stderr)
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_SPINE)}' -o '{win(EXP)}' -e json"],text=True,capture_output=True,timeout=180)
    (ART/'spine-export-log.txt').write_text(exp.stdout+exp.stderr)
    (ART/'original-art-fullbody-likeness-audit.json').write_text(json.dumps({'spineImportExit':proc.returncode,'spineExportExit':exp.returncode,'audit':audit},indent=2)+'\n')
    if proc.returncode or exp.returncode: raise SystemExit(1)
def render(data, mode='color'):
    out=Image.new('RGBA',(W,H),(18,15,13,255)); skin=data['skins'][0]['attachments']
    for s in data['slots']:
        if s.get('color','ffffffff').lower().endswith('00'): continue
        slot=s['name']; attn=s.get('attachment')
        if slot not in skin or not attn: continue
        att=skin[slot][attn]; imgp=LAYER_DIR/((att.get('path') or attn)+'.png')
        img=Image.open(imgp).convert('RGBA')
        if mode=='silhouette':
            alpha=img.getchannel('A'); img=Image.new('RGBA',img.size,(3,3,3,255)); img.putalpha(alpha)
        ww=int(att.get('width',img.width)); hh=int(att.get('height',img.height)); x=att.get('x',0)+W/2; y=H/2-att.get('y',0)
        img=img.resize((ww,hh),Image.Resampling.LANCZOS); out.alpha_composite(img,(int(x-ww/2),int(y-hh/2)))
    return out
def render_current_simple(data):
    out=Image.new('RGBA',(W,H),(18,15,13,255)); skin=data['skins'][0]['attachments']
    for s in data['slots']:
        slot=s['name']
        if slot not in skin: continue
        attn=s.get('attachment') or next(iter(skin[slot].keys())); att=skin[slot][attn]; imgp=LAYER_DIR/((att.get('path') or attn)+'.png')
        if not imgp.exists(): continue
        img=Image.open(imgp).convert('RGBA'); ww=int(att.get('width',img.width)); hh=int(att.get('height',img.height)); x=att.get('x',0); y=att.get('y',0)
        img=img.resize((ww,hh),Image.Resampling.LANCZOS); out.alpha_composite(img,(int(W/2+x-ww/2),int(H/2-y-hh/2)))
    return out
def fit(im,size=(440,248)):
    im=im.convert('RGBA'); im.thumbnail(size,Image.Resampling.LANCZOS); o=Image.new('RGBA',size,(18,15,13,255)); o.alpha_composite(im,((size[0]-im.width)//2,(size[1]-im.height)//2)); return o
def proofs():
    cur=json.loads(CURRENT.read_text()); rep=json.loads(next(EXP.glob('*.json')).read_text())
    panels=[fit(Image.open(REF)), render_current_simple(cur).resize((440,248),Image.Resampling.LANCZOS), render(rep).resize((440,248),Image.Resampling.LANCZOS)]
    labels=['ORIGINAL LOCKED REFERENCE','CURRENT v14 RIG','REPAIRED v17 RIG']
    sheet=Image.new('RGBA',(1500,520),(24,21,19,255)); d=ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype('DejaVuSans.ttf',26); small=ImageFont.truetype('DejaVuSans.ttf',18)
    except: font=small=None
    d.text((24,20),'Original locked reference vs current rig vs repaired rig — full-body likeness restoration',fill=(255,220,170),font=font)
    for i,(im,label) in enumerate(zip(panels,labels)):
        x=40+i*480; sheet.alpha_composite(im,(x,90)); d.rectangle((x,90,x+440,338),outline=(255,180,90) if i<2 else (120,255,150),width=2); d.text((x+50,360),label,fill=(235,230,220),font=font)
    d.text((40,430),'v17 repair: full locked original art installed as visible full-body base; fragmented cutout/mechanical slots hidden for original-art gate.',fill=(220,210,190),font=small)
    sheet.convert('RGB').save(ART/'original-current-repaired-comparison-sheet.jpg',quality=93)
    full=render(rep); full.convert('RGB').save(ART/'full-body-no-overlay-screenshot.jpg',quality=93); full.resize((W//2,H//2),Image.Resampling.LANCZOS).convert('RGB').save(ART/'50-percent-scale-screenshot.jpg',quality=93); render(rep,'silhouette').convert('RGB').save(ART/'silhouette-only-screenshot.jpg',quality=93)
if __name__=='__main__':
    repair(); proofs(); print(json.dumps({'outputSpine':str(OUT_SPINE),'audit':str(ART/'original-art-fullbody-likeness-audit.json'),'proofs':[str(ART/'original-current-repaired-comparison-sheet.jpg'),str(ART/'full-body-no-overlay-screenshot.jpg'),str(ART/'50-percent-scale-screenshot.jpg'),str(ART/'silhouette-only-screenshot.jpg')]},indent=2))
