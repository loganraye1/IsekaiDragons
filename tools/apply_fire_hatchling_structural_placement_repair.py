#!/usr/bin/env python3
"""Structural placement repair after v13 visual rejection.

This is not a new mechanics/directive pass. It repairs the core placement bug in the
weighted meshes: v12/v13 stored attachment-local grid positions directly in every
weighted bone record. For weighted Spine meshes, each vertex's x/y must be local to
the influencing bone. Using attachment-local coordinates as bone-local coordinates
caused forward/floating snout/cheek/neck/tail drift and a disorganized silhouette.

v14 recalculates each weighted vertex record so the setup pose reconstructs the
clean v11 region placement, then reapplies the small v13 structural silhouette deltas
in world/attachment space. This preserves the same attachment set and mechanics while
restoring whole-creature anatomy.
"""
from __future__ import annotations
import json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
V11=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v11-no-overlay-50-readability.spine.json'
V13=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v13-hand-tuned-deformation/exported-from-spine-file/living-forge-fire-hatchling.production-mesh-v13-hand-tuned-deformation.spine.json'
if not V13.exists(): V13=next((ROOT/'artifacts/spine/fire-hatchling/production-mesh-v13-hand-tuned-deformation/exported-from-spine-file').glob('*.json'))
OUT_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v14-structural-placement-repair.spine.json'
OUT_SPINE=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v14-structural-placement-repair.spine'
ART=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v14-structural-placement-repair'
EXP=ART/'exported-from-spine-file'
LAYER_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mesh-weighted-v12-actual-mesh-pass/layers'
SPINE_EXE=r'C:\\Program Files\\Spine\\Spine.exe'
CHECKS=[('slot_body_core','02_body_core'),('slot_neck_collar_underlap','02b_neck_collar_underlap_paint'),('slot_lower_neck_torso_weight_blend','02c_lower_neck_torso_weight_blend_proxy'),('slot_cheek_jowl_bridge','05d_cheek_jowl_mouth_corner_bridge'),('slot_tail_lantern','00_tail_lantern')]
ANIM='mechanics_truth_integration_chain'
TIMES=[0.0,0.18,0.34,0.48,0.66,0.88,1.05]
W,H=960,540
# v13 intended silhouette edits, now applied in attachment/world space before bone-local conversion.
WORLD_DELTAS={
 '02_body_core':{4:(-10,0),7:(10,0),5:(-3,8),6:(3,8)},
 '02b_neck_collar_underlap_paint':{0:(-4,-5),4:(-6,0),8:(-4,5),3:(4,2)},
 '02c_lower_neck_torso_weight_blend_proxy':{1:(-3,-4),5:(-2,0),9:(-2,4),11:(5,2)},
 '05d_cheek_jowl_mouth_corner_bridge':{5:(-6,3),6:(6,-2),4:(-4,5),7:(5,-4)},
 '00_tail_lantern':{0:(-5,2),4:(-7,0),8:(-5,-2),11:(6,-3)},
}

def win(p:Path)->str:
    return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def parse_weighted(vertices):
    out=[]; i=0
    while i<len(vertices):
        n=int(vertices[i]); i+=1; rec=[]
        for _ in range(n):
            rec.append({'bone':int(vertices[i]),'x':float(vertices[i+1]),'y':float(vertices[i+2]),'w':float(vertices[i+3])}); i+=4
        out.append(rec)
    return out

def flatten_weighted(vs):
    flat=[]
    for rec in vs:
        s=sum(r['w'] for r in rec) or 1
        flat.append(len(rec))
        for r in rec:
            flat += [r['bone'], round(r['x'],3), round(r['y'],3), round(r['w']/s,4)]
    return flat

def setup_mats(data):
    mats=[]; name_to_i={b['name']:i for i,b in enumerate(data['bones'])}
    for b in data['bones']:
        x=b.get('x',0); y=b.get('y',0); rot=math.radians(b.get('rotation',0)); sx=b.get('scaleX',1); sy=b.get('scaleY',1)
        co=math.cos(rot); si=math.sin(rot); local=(co*sx,-si*sy,x,si*sx,co*sy,y)
        parent=b.get('parent')
        if parent:
            pm=mats[name_to_i[parent]]; a,bb,c,d,e,f=local; pa,pb,pc,pd,pe,pf=pm
            mat=(pa*a+pb*d,pa*bb+pb*e,pa*c+pb*f+pc,pd*a+pe*d,pd*bb+pe*e,pd*c+pe*f+pf)
        else: mat=local
        mats.append(mat)
    return mats

def inv_tx(mat,x,y):
    a,b,c,d,e,f=mat; det=a*e-b*d
    if abs(det)<1e-8: return x-c,y-f
    xx=x-c; yy=y-f
    return ((e*xx-b*yy)/det,(-d*xx+a*yy)/det)

def reconstruct_setup_world(mesh,mats):
    pts=[]
    for rec in parse_weighted(mesh['vertices']):
        x=y=0
        for r in rec:
            a,b,c,d,e,f=mats[r['bone']]
            wx=a*r['x']+b*r['y']+c; wy=d*r['x']+e*r['y']+f
            x+=wx*r['w']; y+=wy*r['w']
        pts.append((x,y))
    return pts

def desired_grid_from_v11(region, att_name):
    cols=4; rows=3; pts=[]
    w=float(region.get('width',100)); h=float(region.get('height',100)); ox=float(region.get('x',0)); oy=float(region.get('y',0))
    for r in range(rows):
        v=r/(rows-1)
        for c in range(cols):
            u=c/(cols-1)
            x=ox+(u-0.5)*w; y=oy+(0.5-v)*h
            dx,dy=WORLD_DELTAS.get(att_name,{}).get(r*cols+c,(0,0))
            pts.append((x+dx,y+dy))
    return pts

def repair():
    ART.mkdir(parents=True,exist_ok=True); EXP.mkdir(parents=True,exist_ok=True)
    v11=json.loads(V11.read_text()); data=json.loads(V13.read_text())
    data['skeleton']['hash']='production-mesh-v14-structural-placement-repair'
    data['skeleton']['images']=win(LAYER_DIR)+'\\'
    mats=setup_mats(data)
    audit=[]; skin=data['skins'][0]['attachments']; skin11=v11['skins'][0]['attachments']
    for slot,att in CHECKS:
        mesh=skin[slot][att]; before_pts=reconstruct_setup_world(mesh,mats); desired=desired_grid_from_v11(skin11[slot][att],att)
        vs=parse_weighted(mesh['vertices'])
        max_before=max(math.dist(a,b) for a,b in zip(before_pts,desired))
        for i,rec in enumerate(vs):
            wx,wy=desired[i]
            for r in rec:
                lx,ly=inv_tx(mats[r['bone']],wx,wy)
                r['x']=lx; r['y']=ly
        mesh['vertices']=flatten_weighted(vs)
        after_pts=reconstruct_setup_world(mesh,mats); max_after=max(math.dist(a,b) for a,b in zip(after_pts,desired))
        mesh.setdefault('productionMeshTuning',{})['v14StructuralPlacementRepair']={'method':'bone-local recalculation from v11 clean setup placement plus v13 silhouette deltas','maxSetupDriftBeforePx':round(max_before,3),'maxSetupDriftAfterPx':round(max_after,3)}
        audit.append({'slot':slot,'attachment':att,'correctedVertices':list(range(12)),'worldDeltasApplied':WORLD_DELTAS.get(att,{}),'maxSetupDriftBeforePx':round(max_before,3),'maxSetupDriftAfterPx':round(max_after,3),'cause':'v12/v13 used attachment-local coordinates as bone-local weighted mesh coordinates; recalculated each weighted record using inverse setup bone matrix'})
    data.setdefault('mechanicsTruth',{})['v14StructuralPlacementRepair']={'source':'v13 visual rejection','noNewMechanics':True,'audit':audit}
    OUT_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_JSON)}' -o '{win(OUT_SPINE)}' -r"],text=True,capture_output=True,timeout=180)
    (ART/'spine-import-log.txt').write_text(proc.stdout+proc.stderr)
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_SPINE)}' -o '{win(EXP)}' -e json"],text=True,capture_output=True,timeout=180)
    (ART/'spine-export-log.txt').write_text(exp.stdout+exp.stderr)
    (ART/'structural-placement-repair-audit.json').write_text(json.dumps({'spineImportExit':proc.returncode,'spineExportExit':exp.returncode,'outputSpine':str(OUT_SPINE),'audit':audit},indent=2)+'\n')
    if proc.returncode or exp.returncode: raise SystemExit(1)
    return audit

# Renderer for screenshot proof. Mirrors v13 renderer but uses repaired exported JSON.
def interp(keys,t,kind):
    if not keys: return None
    prev=keys[0]
    if t<=prev.get('time',0): return prev
    for nxt in keys[1:]:
        nt=nxt.get('time',0)
        if t<=nt:
            pt=prev.get('time',0); f=0 if nt==pt else (t-pt)/(nt-pt); out={}
            if kind=='rotate': out['value']=prev.get('value',0)+(nxt.get('value',0)-prev.get('value',0))*f
            else:
                base=0 if kind=='translate' else 1
                out['x']=prev.get('x',base)+(nxt.get('x',base)-prev.get('x',base))*f; out['y']=prev.get('y',base)+(nxt.get('y',base)-prev.get('y',base))*f
            return out
        prev=nxt
    return prev

def bone_mats_anim(data,t):
    tl=data.get('animations',{}).get(ANIM,{}).get('bones',{}); mats=[]; name_to_i={b['name']:i for i,b in enumerate(data['bones'])}
    for bdef in data['bones']:
        x=bdef.get('x',0); y=bdef.get('y',0); rot=bdef.get('rotation',0); sx=bdef.get('scaleX',1); sy=bdef.get('scaleY',1); btl=tl.get(bdef['name'],{})
        if 'translate' in btl:
            v=interp(btl['translate'],t,'translate'); x+=v.get('x',0); y+=v.get('y',0)
        if 'rotate' in btl:
            v=interp(btl['rotate'],t,'rotate'); rot+=v.get('value',0)
        if 'scale' in btl:
            v=interp(btl['scale'],t,'scale'); sx*=v.get('x',1); sy*=v.get('y',1)
        rad=math.radians(rot); co=math.cos(rad); si=math.sin(rad); local=(co*sx,-si*sy,x,si*sx,co*sy,y)
        parent=bdef.get('parent')
        if parent:
            pm=mats[name_to_i[parent]]; a,b,c,d,e,f=local; pa,pb,pc,pd,pe,pf=pm
            mat=(pa*a+pb*d,pa*b+pb*e,pa*c+pb*f+pc,pd*a+pe*d,pd*b+pe*e,pd*c+pe*f+pf)
        else: mat=local
        mats.append(mat)
    return mats

def screen_xy(mat,x,y):
    a,b,c,d,e,f=mat; return (a*x+b*y+c+W/2,H/2-(d*x+e*y+f))

def vertices_screen(mesh,mats):
    pts=[]
    for rec in parse_weighted(mesh['vertices']):
        x=y=0
        for r in rec:
            px,py=screen_xy(mats[r['bone']],r['x'],r['y']); x+=px*r['w']; y+=py*r['w']
        pts.append((x,y))
    return pts

def draw_cell(out,img,src,dst):
    xs=[p[0] for p in dst]; ys=[p[1] for p in dst]
    bbox=(max(0,int(min(xs))-2),max(0,int(min(ys))-2),min(W,int(max(xs))+2),min(H,int(max(ys))+2))
    if bbox[2]<=bbox[0] or bbox[3]<=bbox[1]: return
    sx=[p[0] for p in src]; sy=[p[1] for p in src]
    crop=img.crop((int(min(sx)),int(min(sy)),int(max(sx)),int(max(sy))))
    if crop.width<1 or crop.height<1: return
    crop=crop.resize((bbox[2]-bbox[0],bbox[3]-bbox[1]),Image.Resampling.BICUBIC)
    mask=Image.new('L',crop.size,0); ImageDraw.Draw(mask).polygon([(x-bbox[0],y-bbox[1]) for x,y in dst],fill=255)
    crop.putalpha(Image.composite(crop.getchannel('A'),Image.new('L',crop.size,0),mask)); out.alpha_composite(crop,(bbox[0],bbox[1]))

def render(data,t,mode='color'):
    mats=bone_mats_anim(data,t); out=Image.new('RGBA',(W,H),(18,15,13,255)); skin=data['skins'][0]['attachments']
    for s in data['slots']:
        slot=s['name']
        if slot not in skin: continue
        att_name=next(iter(skin[slot].keys())); att=skin[slot][att_name]; path=att.get('path') or att_name
        imgp=LAYER_DIR/(path+'.png')
        if not imgp.exists(): imgp=LAYER_DIR/(att_name+'.png')
        if not imgp.exists(): continue
        img=Image.open(imgp).convert('RGBA')
        if mode=='silhouette':
            alpha=img.getchannel('A'); img=Image.new('RGBA',img.size,(3,3,3,255)); img.putalpha(alpha)
        if att.get('type')=='mesh':
            pts=vertices_screen(att,mats); uvs=att['uvs']; cols=4; rows=3
            for r in range(rows-1):
                for c in range(cols-1):
                    ids=[r*cols+c,r*cols+c+1,(r+1)*cols+c+1,(r+1)*cols+c]
                    draw_cell(out,img,[(uvs[i*2]*img.width,uvs[i*2+1]*img.height) for i in ids],[pts[i] for i in ids])
        else:
            x=att.get('x',0)+W/2; y=H/2-att.get('y',0); ww=int(att.get('width',img.width)); hh=int(att.get('height',img.height))
            layer=img.resize((max(1,ww),max(1,hh)),Image.Resampling.LANCZOS); out.alpha_composite(layer,(int(x-ww/2),int(y-hh/2)))
    return out

def render_proofs():
    v11=json.loads(V11.read_text()); v13=json.loads(V13.read_text()); v14=json.loads(next(EXP.glob('*.json')).read_text())
    t=0.48
    ims=[render(v11,t),render(v13,t),render(v14,t)]
    sheet=Image.new('RGBA',(1500,520),(25,22,20,255)); d=ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype('DejaVuSans.ttf',28); small=ImageFont.truetype('DejaVuSans.ttf',18)
    except: font=small=None
    d.text((25,20),'v11 clean readability vs v13 rejected drift vs v14 structural repair (actual exported Spine playback data)',fill=(255,220,170),font=font)
    labels=['v11 baseline','v13 rejected','v14 repaired']
    for i,im in enumerate(ims):
        x=40+i*480; thumb=im.resize((440,248),Image.Resampling.LANCZOS); sheet.alpha_composite(thumb,(x,90)); d.rectangle((x,90,x+440,y:=338),outline=(255,180,90) if i<2 else (120,255,150),width=2); d.text((x+120,355),labels[i],fill=(230,230,220),font=font)
    # 50% and silhouette screenshots for v14
    full=render(v14,t); full.convert('RGB').save(ART/'full-body-no-overlay-screenshot.jpg',quality=92)
    full.resize((W//2,H//2),Image.Resampling.LANCZOS).convert('RGB').save(ART/'50-percent-scale-screenshot.jpg',quality=92)
    render(v14,t,'silhouette').convert('RGB').save(ART/'silhouette-only-screenshot.jpg',quality=92)
    sheet.convert('RGB').save(ART/'v11-v13-v14-structural-comparison.jpg',quality=92)
    return [ART/'v11-v13-v14-structural-comparison.jpg',ART/'full-body-no-overlay-screenshot.jpg',ART/'50-percent-scale-screenshot.jpg',ART/'silhouette-only-screenshot.jpg']

if __name__=='__main__':
    audit=repair(); outs=render_proofs(); print(json.dumps({'audit':str(ART/'structural-placement-repair-audit.json'),'outputs':[str(o) for o in outs],'auditSummary':audit},indent=2))
