#!/usr/bin/env python3
"""v13 hand-tuned deformation quality pass for the five v12 weighted meshes.

This modifies actual weighted mesh vertices/weights, imports to .spine, exports back from
that .spine file, then renders no-overlay/silhouette/50% playback GIFs from the exported
Spine data to compare v12 -> v13 deformation.
"""
from __future__ import annotations
import json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
SRC_JSON=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/exported-from-spine-file/living-forge-fire-hatchling.production-mesh-v12-actual-weighted.spine.json'
OUT_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v13-hand-tuned-deformation.spine.json'
OUT_SPINE=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v13-hand-tuned-deformation.spine'
ART=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v13-hand-tuned-deformation'
EXP=ART/'exported-from-spine-file'
LAYER_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mesh-weighted-v12-actual-mesh-pass/layers'
SPINE_EXE=r'C:\\Program Files\\Spine\\Spine.exe'
CHECKS=[('slot_body_core','02_body_core'),('slot_neck_collar_underlap','02b_neck_collar_underlap_paint'),('slot_lower_neck_torso_weight_blend','02c_lower_neck_torso_weight_blend_proxy'),('slot_cheek_jowl_bridge','05d_cheek_jowl_mouth_corner_bridge'),('slot_tail_lantern','00_tail_lantern')]
ANIM='mechanics_truth_integration_chain'
TIMES=[0.0,0.18,0.34,0.48,0.66,0.88,1.05]
W,H=960,540

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

def tune_mesh(slot, att, mesh, bone_names):
    vs=parse_weighted(mesh['vertices']); edits=[]
    def add_weight(rec, name, delta):
        bi=bone_names.index(name)
        for r in rec:
            if r['bone']==bi: r['w']=max(0.01,r['w']+delta)
    def move(v,dx,dy,why):
        for r in vs[v]: r['x']+=dx; r['y']+=dy
        edits.append({'vertex':v,'positionDelta':{'x':dx,'y':dy},'why':why})
    def weight(v,name,delta,why):
        add_weight(vs[v],name,delta); edits.append({'vertex':v,'weightDelta':{name:delta},'why':why})
    if att=='02_body_core':
        for v in [0,3,8,11]: weight(v,'body_core',0.18,'outer corner silhouette lock; reduce mush/collapse')
        for v in [5,6]: weight(v,'ribcage_compression_driver',0.16,'center ribcage compression carries pressure, not outer contour')
        for v in [4,5,6,7]: weight(v,'chest_volume_preserve_driver',0.12,'middle row volume preservation during brace/release')
        move(4,-10,0,'left rib silhouette pushed out to preserve chest pressure volume')
        move(7,10,0,'right rib silhouette pushed out to preserve chest pressure volume')
        move(5,-3,8,'furnace pocket lifted so compression remains visible')
        move(6,3,8,'furnace pocket lifted so compression remains visible')
    elif att=='02b_neck_collar_underlap_paint':
        for v in [0,4,8]: weight(v,'body_core',0.22,'neck-root seam follows torso to stop sliding underlap')
        for v in [1,5,9]: weight(v,'chain_chest_to_neck_driver',0.16,'smooth chest-to-neck force transfer')
        for v in [2,3,6,7]: weight(v,'neck_base_deform',0.12,'upper neck arc remains readable')
        move(0,-4,-5,'root underlap tucked under collar; prevents floating seam')
        move(4,-6,0,'mid underlap widened to hide slide')
        move(8,-4,5,'lower underlap tucked into torso')
        move(3,4,2,'neck tip silhouette maintained during extension')
    elif att=='02c_lower_neck_torso_weight_blend_proxy':
        for v in [0,4,8]: weight(v,'body_core',0.18,'torso-side blend anchors to body')
        for v in [1,5,9]: weight(v,'chain_chest_to_neck_driver',0.18,'middle blend carries pressure upward')
        for v in [2,3,6,7,10,11]: weight(v,'neck_base_deform',0.12,'neck-side vertices keep arc instead of mush')
        move(1,-3,-4,'blend band follows chest compression')
        move(5,-2,0,'center blend softened without collapse')
        move(9,-2,4,'lower blend prevents visible seam gap')
        move(11,5,2,'neck silhouette endpoint protected')
    elif att=='05d_cheek_jowl_mouth_corner_bridge':
        for v in [0,1,4,5]: weight(v,'head_neck',0.18,'upper cheek remains attached to skull')
        for v in [5,6]: weight(v,'mouth_corner_vertex_driver',0.22,'mouth-corner seal remains readable without opening jaw more')
        for v in [6,7,10,11]: weight(v,'lower_jaw_hinge',0.18,'lower jowl follows jaw release without detaching')
        for v in [4,5,6,7]: weight(v,'cheek_pressure_bulge_driver',0.14,'cheek bulge carries valve pressure')
        move(5,-6,3,'mouth-corner anchor pinched inward for readable seal')
        move(6,6,-2,'lower mouth-corner follows jaw but avoids hollow gap')
        move(4,-4,5,'cheek silhouette rounded to prevent flat plate')
        move(7,5,-4,'jowl overlap maintained during release')
    elif att=='00_tail_lantern':
        for v in [0,4,8]: weight(v,'tail_root_weight_driver',0.24,'tail root anchored to torso; prevents detachment')
        for v in [1,5,9]: weight(v,'chain_torso_to_tail_driver',0.18,'tail mid receives delayed force')
        for v in [2,3,6,7,10,11]: weight(v,'chain_tail_to_lantern_driver',0.18,'lantern-end lag without floating seam')
        move(0,-5,2,'tail root tucked into body mass')
        move(4,-7,0,'tail root width preserved during counterbalance')
        move(8,-5,-2,'lower tail root tucked into body mass')
        move(11,6,-3,'lantern link endpoint protected from collapsing')
    mesh['vertices']=flatten_weighted(vs)
    mesh.setdefault('productionMeshTuning',{})['v13HandTunedEdits']=edits
    return edits

def apply_tuning():
    ART.mkdir(parents=True,exist_ok=True); EXP.mkdir(parents=True,exist_ok=True)
    data=json.loads(SRC_JSON.read_text())
    data['skeleton']['hash']='production-mesh-v13-hand-tuned-deformation'
    data['skeleton']['images']=win(LAYER_DIR)+'\\'
    bone_names=[b['name'] for b in data['bones']]
    audit=[]; skin=data['skins'][0]['attachments']
    for slot,att in CHECKS:
        mesh=skin[slot][att]; before=mesh['vertices'][:]; edits=tune_mesh(slot,att,mesh,bone_names)
        audit.append({'slot':slot,'attachment':att,'edits':edits,'weightedVertexRecordLengthBefore':len(before),'weightedVertexRecordLengthAfter':len(mesh['vertices'])})
    data.setdefault('mechanicsTruth',{})['v13HandTunedDeformation']={'animationInspected':ANIM,'meshWeightEdits':audit,'completionCaveat':'CLI import/export verified; visual proof rendered from exported Spine playback data.'}
    OUT_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_JSON)}' -o '{win(OUT_SPINE)}' -r"],text=True,capture_output=True,timeout=180)
    (ART/'spine-import-log.txt').write_text(proc.stdout+proc.stderr)
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_SPINE)}' -o '{win(EXP)}' -e json"],text=True,capture_output=True,timeout=180)
    (ART/'spine-export-log.txt').write_text(exp.stdout+exp.stderr)
    (ART/'exact-mesh-weight-edits.json').write_text(json.dumps({'spineImportExit':proc.returncode,'spineExportExit':exp.returncode,'outputSpine':str(OUT_SPINE),'edits':audit},indent=2)+'\n')
    if proc.returncode!=0 or exp.returncode!=0: raise SystemExit(1)
    return audit

def interp(keys,t,kind):
    if not keys: return None
    prev=keys[0]
    if t <= prev.get('time',0): return prev
    for nxt in keys[1:]:
        nt=nxt.get('time',0)
        if t<=nt:
            pt=prev.get('time',0); f=0 if nt==pt else (t-pt)/(nt-pt); out={}
            if kind=='rotate': out['value']=prev.get('value',0)+(nxt.get('value',0)-prev.get('value',0))*f
            elif kind in ('translate','scale'):
                base=0 if kind=='translate' else 1
                out['x']=prev.get('x',base)+(nxt.get('x',base)-prev.get('x',base))*f; out['y']=prev.get('y',base)+(nxt.get('y',base)-prev.get('y',base))*f
            return out
        prev=nxt
    return prev

def bone_mats(data,t):
    tl=data.get('animations',{}).get(ANIM,{}).get('bones',{}); mats=[]; name_to_i={b['name']:i for i,b in enumerate(data['bones'])}
    for bdef in data['bones']:
        x=bdef.get('x',0); y=bdef.get('y',0); rot=bdef.get('rotation',0); sx=bdef.get('scaleX',1); sy=bdef.get('scaleY',1); btl=tl.get(bdef['name'],{})
        if 'translate' in btl:
            v=interp(btl['translate'],t,'translate'); x+=v.get('x',0); y+=v.get('y',0)
        if 'rotate' in btl:
            v=interp(btl['rotate'],t,'rotate'); rot+=v.get('value',0)
        if 'scale' in btl:
            v=interp(btl['scale'],t,'scale'); sx*=v.get('x',1); sy*=v.get('y',1)
        rad=math.radians(rot); co=math.cos(rad); si=math.sin(rad)
        local=(co*sx,-si*sy,x,si*sx,co*sy,y)
        parent=bdef.get('parent')
        if parent:
            pm=mats[name_to_i[parent]]; a,b,c,d,e,f=local; pa,pb,pc,pd,pe,pf=pm
            mat=(pa*a+pb*d,pa*b+pb*e,pa*c+pb*f+pc,pd*a+pe*d,pd*b+pe*e,pd*c+pe*f+pf)
        else: mat=local
        mats.append(mat)
    return mats

def tx(mat,x,y):
    a,b,c,d,e,f=mat; return (a*x+b*y+c+W/2, H/2-(d*x+e*y+f))

def vertices_world(mesh,mats):
    pts=[]
    for rec in parse_weighted(mesh['vertices']):
        x=y=0
        for r in rec:
            px,py=tx(mats[r['bone']],r['x'],r['y']); x+=px*r['w']; y+=py*r['w']
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
    mask=Image.new('L',crop.size,0); md=ImageDraw.Draw(mask); md.polygon([(x-bbox[0],y-bbox[1]) for x,y in dst],fill=255)
    crop.putalpha(Image.composite(crop.getchannel('A'),Image.new('L',crop.size,0),mask))
    out.alpha_composite(crop,(bbox[0],bbox[1]))

def render(data,t,mode='color'):
    mats=bone_mats(data,t); out=Image.new('RGBA',(W,H),(18,15,13,255)); skin=data['skins'][0]['attachments']; slots=[s['name'] for s in data['slots']]
    for slot in slots:
        if slot not in skin: continue
        att_name=next(iter(skin[slot].keys())); att=skin[slot][att_name]; path=att.get('path') or att_name
        imgp=LAYER_DIR/(path+'.png')
        if not imgp.exists(): imgp=LAYER_DIR/(att_name+'.png')
        if not imgp.exists(): continue
        img=Image.open(imgp).convert('RGBA')
        if mode=='silhouette':
            alpha=img.getchannel('A'); img=Image.new('RGBA',img.size,(3,3,3,255)); img.putalpha(alpha)
        if att.get('type')=='mesh':
            pts=vertices_world(att,mats); uvs=att['uvs']; cols=4; rows=3
            for r in range(rows-1):
                for c in range(cols-1):
                    ids=[r*cols+c,r*cols+c+1,(r+1)*cols+c+1,(r+1)*cols+c]
                    draw_cell(out,img,[(uvs[i*2]*img.width,uvs[i*2+1]*img.height) for i in ids],[pts[i] for i in ids])
        else:
            x=att.get('x',0)+W/2; y=H/2-att.get('y',0); ww=int(att.get('width',img.width)); hh=int(att.get('height',img.height))
            layer=img.resize((max(1,ww),max(1,hh)),Image.Resampling.LANCZOS)
            out.alpha_composite(layer,(int(x-ww/2),int(y-hh/2)))
    return out

def render_outputs():
    after=json.loads(next(EXP.glob('*.json')).read_text()); before=json.loads(SRC_JSON.read_text())
    after_frames=[render(after,t) for t in TIMES]; before_frames=[render(before,t) for t in TIMES]; sil=[render(after,t,'silhouette') for t in TIMES]
    sheet=Image.new('RGBA',(1500,210*len(TIMES)+90),(26,22,20,255)); d=ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype('DejaVuSans.ttf',22)
    except: font=None
    d.text((20,18),'Before v12 actual exported Spine playback',fill=(255,180,120),font=font); d.text((760,18),'After v13 hand-tuned exported Spine playback',fill=(160,255,170),font=font)
    for i,t in enumerate(TIMES):
        y=60+i*210
        d.text((20,y+80),f't={t:.2f}s',fill=(230,220,200),font=font)
        sheet.alpha_composite(before_frames[i].resize((320,180),Image.Resampling.LANCZOS),(100,y)); sheet.alpha_composite(after_frames[i].resize((320,180),Image.Resampling.LANCZOS),(840,y))
    sheet.convert('RGB').save(ART/'before-after-actual-playback-screenshots.jpg',quality=92)
    after_frames[0].save(ART/'no-overlay-playback.gif',save_all=True,append_images=after_frames[1:]+after_frames[-2:0:-1],duration=130,loop=0)
    small=[f.resize((W//2,H//2),Image.Resampling.LANCZOS) for f in after_frames]; small[0].save(ART/'50-percent-scale-playback.gif',save_all=True,append_images=small[1:]+small[-2:0:-1],duration=130,loop=0)
    sil[0].save(ART/'silhouette-only-playback.gif',save_all=True,append_images=sil[1:]+sil[-2:0:-1],duration=130,loop=0)
    return [ART/'before-after-actual-playback-screenshots.jpg',ART/'no-overlay-playback.gif',ART/'50-percent-scale-playback.gif',ART/'silhouette-only-playback.gif']

if __name__=='__main__':
    apply_tuning(); outs=render_outputs(); print(json.dumps({'outputSpine':str(OUT_SPINE),'audit':str(ART/'exact-mesh-weight-edits.json'),'proof':[str(o) for o in outs]},indent=2))
