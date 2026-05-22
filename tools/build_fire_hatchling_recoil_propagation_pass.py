#!/usr/bin/env python3
"""Fire Hatchling v5 recoil propagation mechanics-truth slice.

Builds on v4 facial continuity. Creates a delayed recoil wave proof through
jaw/head -> neck root -> torso/chest -> tail -> lantern -> settle.
This is mechanics validation, not polish.
"""
from __future__ import annotations

import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v4-facial-continuity-weighting/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v4-facial-continuity-weighting.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v5-recoil-propagation'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v5-recoil-propagation.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v5-recoil-propagation.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v5-recoil-propagation'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)

def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def update_spine():
    data=json.loads(SRC_JSON.read_text()); data['skeleton']['hash']='mechanics-truth-v5-recoil-propagation'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    anim=data['animations'].setdefault('mechanics_truth_recoil_propagation',{'bones':{}})['bones']
    # Delayed timing hierarchy. Values are still proof-level; purpose is staggered propagation.
    anim['lower_jaw_hinge']={'rotate':[{'time':0.00,'value':0,'curve':'smooth'},{'time':0.20,'value':-3,'curve':'smooth'},{'time':0.28,'value':32,'curve':'stepped'},{'time':0.38,'value':12,'curve':'smooth'},{'time':0.62,'value':0,'curve':'smooth'}]}
    anim['head_neck']={'rotate':[{'time':0.00,'value':0,'curve':'smooth'},{'time':0.18,'value':-4,'curve':'smooth'},{'time':0.32,'value':8,'curve':'smooth'},{'time':0.48,'value':-3,'curve':'smooth'},{'time':0.72,'value':0,'curve':'smooth'}], 'translate':[{'time':0.00,'x':0,'y':0,'curve':'smooth'},{'time':0.32,'x':10,'y':3,'curve':'smooth'},{'time':0.50,'x':-4,'y':-1,'curve':'smooth'},{'time':0.72,'x':0,'y':0,'curve':'smooth'}]}
    anim['cheek_jowl_bridge']={'rotate':[{'time':0.00,'value':0,'curve':'smooth'},{'time':0.30,'value':2,'curve':'smooth'},{'time':0.48,'value':-1,'curve':'smooth'},{'time':0.72,'value':0,'curve':'smooth'}]}
    anim['neck_base_deform']={'translate':[{'time':0.00,'x':0,'y':0,'curve':'smooth'},{'time':0.22,'x':-8,'y':-3,'curve':'smooth'},{'time':0.36,'x':14,'y':5,'curve':'smooth'},{'time':0.54,'x':-5,'y':-2,'curve':'smooth'},{'time':0.78,'x':0,'y':0,'curve':'smooth'}]}
    anim['body_core']={'translate':[{'time':0.00,'x':0,'y':0,'curve':'smooth'},{'time':0.16,'x':-5,'y':-8,'curve':'smooth'},{'time':0.42,'x':7,'y':4,'curve':'smooth'},{'time':0.62,'x':-3,'y':-2,'curve':'smooth'},{'time':0.88,'x':0,'y':0,'curve':'smooth'}], 'scale':[{'time':0.00,'x':1,'y':1,'curve':'smooth'},{'time':0.16,'x':1.04,'y':0.96,'curve':'smooth'},{'time':0.42,'x':0.985,'y':1.03,'curve':'smooth'},{'time':0.88,'x':1,'y':1,'curve':'smooth'}]}
    anim['tail_lantern']={'rotate':[{'time':0.00,'value':0,'curve':'smooth'},{'time':0.42,'value':0,'curve':'smooth'},{'time':0.56,'value':-12,'curve':'smooth'},{'time':0.76,'value':7,'curve':'smooth'},{'time':1.00,'value':0,'curve':'smooth'}], 'translate':[{'time':0.00,'x':0,'y':0,'curve':'smooth'},{'time':0.56,'x':-12,'y':3,'curve':'smooth'},{'time':0.76,'x':6,'y':-2,'curve':'smooth'},{'time':1.00,'x':0,'y':0,'curve':'smooth'}]}
    data['animations']['mechanics_truth_recoil_propagation']['timelineNotes']={'jawSnap':0.28,'neckRecoil':0.32,'chestDisplacement':0.42,'torsoShift':0.46,'tailReaction':0.56,'lanternDrag':0.64,'settleOscillation':0.76}
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(name): return Image.open(LAYER_DIR/name).convert('RGBA')

def make_frames():
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    body=load('02_body_core.png') if (LAYER_DIR/'02_body_core.png').exists() else None
    tail=load('00_tail_lantern.png') if (LAYER_DIR/'00_tail_lantern.png').exists() else None
    states=[
      ('01 chest compression',0,0.25,(0,0),(0,0),(0,0),0,'source pressure starts in chest'),
      ('02 jaw snap',32,1.0,(0,0),(0,0),(0,0),0,'jaw/head release first'),
      ('03 neck recoil',18,.7,(18,4),(0,0),(0,0),0,'force reaches neck root second'),
      ('04 chest receives',10,.45,(8,2),(14,7),(0,0),0,'chest/torso absorbs displacement'),
      ('05 tail counterbalance',4,.25,(2,0),(7,3),(-24,4),-13,'tail reacts after torso'),
      ('06 lantern drag',0,.12,(0,0),(-3,-1),(16,-3),10,'lantern/tail lag behind body'),
      ('07 settle oscillation',0,.05,(0,0),(0,0),(0,0),0,'whole chain settles last'),
    ]
    frames=[]
    for idx,(label,jang,gstr,hoff,boff,toff,trot,note) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        # simplified mass silhouettes using source layers where possible, offset by delayed hierarchy
        chest=(420+boff[0],305+boff[1]); neck=(340+hoff[0],238+hoff[1]); mouth=(HEAD_PLACE[0]+118+hoff[0],HEAD_PLACE[1]+188+hoff[1])
        # body mass proxy
        d.ellipse((315+boff[0],230+boff[1],590+boff[0],390+boff[1]),fill=(76,38,30,220),outline=(255,126,42,160),width=3)
        # tail counterbalance proxy
        tail_pts=[(560+toff[0],330+toff[1]),(705+toff[0],315+toff[1]),(820+toff[0],360+toff[1])]
        d.line(tail_pts,fill=(118,58,33,230),width=28)
        d.line(tail_pts,fill=(255,126,42,140),width=4)
        # lantern lag dot
        lx,ly=835+toff[0]+int(trot*.4),365+toff[1]+int(trot*.3)
        d.ellipse((lx-16,ly-16,lx+16,ly+16),fill=(255,116,35,200),outline=(255,220,120),width=2)
        # energy/recoil path arrows
        chain=[chest,neck,mouth,(neck[0]+60,neck[1]+25),(chest[0]+90,chest[1]+20),tail_pts[1],(lx,ly)]
        for a,b in zip(chain,chain[1:]): d.line((a,b),fill=(255,118,34,210),width=5)
        # compression ring
        if idx<=3: d.ellipse((chest[0]-50,chest[1]-28,chest[0]+50,chest[1]+28),outline=(255,185,72),width=4)
        hp=(HEAD_PLACE[0]+hoff[0],HEAD_PLACE[1]+hoff[1])
        fr.alpha_composite(upper,hp)
        if gstr: g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp)
        fr.alpha_composite(bridge,hp)
        # timing hierarchy lane
        lane_y=454; labels=['jaw','neck','chest','tail','lantern','settle']; active=min(idx,6)
        for i,l in enumerate(labels):
            x=290+i*92; color=(255,126,42) if i<=active-1 else (70,60,52)
            d.rectangle((x,lane_y,x+70,lane_y+18),fill=color); d.text((x,lane_y+24),l,fill=(235,210,185),font=small)
        d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,54),note,fill=(235,210,185),font=small)
        d.text((24,505),'Recoil hierarchy: jaw/head → neck root → chest/torso → tail counterbalance → lantern lag → settle.',fill=(255,170,95),font=small)
        frames.append(fr.convert('RGB'))
    contact=Image.new('RGB',(1500,1180),(24,21,19)); cd=ImageDraw.Draw(contact)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: title=None
    cd.text((30,24),'Mechanics Truth v5 — Recoil Propagation / Timing Hierarchy',fill=(255,224,170),font=title)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340
        contact.paste(th,(x,y)); cd.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
    contact_path=ART_DIR/'recoil-propagation-contact-sheet.jpg'; contact.save(contact_path,quality=94)
    gif_path=ART_DIR/'recoil-propagation-timing-hierarchy.gif'; frames[0].save(gif_path,save_all=True,append_images=frames[1:],duration=[140,110,120,140,150,160,220],loop=0)
    sil=[]
    for fr in frames:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'recoil-propagation-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[140,110,120,140,150,160,220],loop=0)
    mobile=frames[4].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-recoil-tail-counterbalance.jpg'; mobile.save(mobile_path,quality=94)
    return {'contact':contact_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path}

def manifest(code,log,arts):
    m={'name':'mechanics-truth-v5-recoil-propagation','activeDirective':'docs/FIRE_HATCHLING_RECOIL_PROPAGATION_DIRECTIVE_2026-05-14.md','phase':'mechanics truth, not polish','sourceOfTruth':'v4 automation lowest score: Recoil Propagation — 3.8/10','timingHierarchy':['jaw snap first','neck recoil second','chest displacement third','torso shift fourth','tail reaction fifth','lantern drag sixth','settle oscillation last'],'energySourceRule':['chest compression','heat buildup','neck pressure','jaw release','recoil discharge'],'cheekBridgeRule':'anatomical overlap, not armor plate','proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()}},'notPolish':['no plume beauty','no ember polish','no easing finesse','no presentation cleanup']}
    (OUT_DIR/'recoil-propagation-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_frames(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
