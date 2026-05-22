#!/usr/bin/env python3
"""Fire Hatchling v6 weighted deformation truth slice.

Builds on v5 recoil hierarchy. Creates a deformation-focused proof package:
- explicit mesh/weight zones for lower neck, underlap, chest, tail root, cheek/jaw
- mass-preservation deformation prototype frames
- Spine JSON proof with deformation driver bones/timelines

This is mechanics truth, not polish. It is still not a fully artist-weight-painted
Spine rig, but the pass moves from pure rigid timing into authored deformation zones
and mass redistribution behavior.
"""
from __future__ import annotations

import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v5-recoil-propagation/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v5-recoil-propagation.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v6-weighted-deformation'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v6-weighted-deformation.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v6-weighted-deformation.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v6-weighted-deformation'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

WEIGHT_ZONES={
 'lower_neck_root': {'primary':'neck_base_deform','secondary':'body_core','weights':{'neck_base_deform':0.55,'body_core':0.45},'behavior':'compress/stretch into chest during recoil transfer'},
 'underlap_torso_bridge': {'primary':'body_core','secondary':'neck_base_deform','weights':{'body_core':0.65,'neck_base_deform':0.35},'behavior':'hidden paint deforms with torso instead of sliding'},
 'chest_absorber': {'primary':'body_core','secondary':'neck_base_deform','weights':{'body_core':0.80,'neck_base_deform':0.20},'behavior':'chest expands after compressed release'},
 'tail_root_counterweight': {'primary':'body_core','secondary':'tail_lantern','weights':{'body_core':0.55,'tail_lantern':0.45},'behavior':'tail root thickens and drags before tail tip'},
 'cheek_jaw_mass': {'primary':'head_neck','secondary':'lower_jaw_hinge','weights':{'head_neck':0.72,'lower_jaw_hinge':0.28},'behavior':'cheek bridge redistributes with jaw compression without becoming armor plate'},
}

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)

def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def update_spine():
    data=json.loads(SRC_JSON.read_text()); data['skeleton']['hash']='mechanics-truth-v6-weighted-deformation'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    bones=data['bones']
    def add(name,parent,x,y):
        if not any(b['name']==name for b in bones): bones.append({'name':name,'parent':parent,'x':x,'y':y})
    add('lower_neck_weight_driver','neck_base_deform',-35,-16)
    add('chest_mass_absorber','body_core',18,12)
    add('underlap_torso_driver','body_core',-22,10)
    add('tail_root_weight_driver','body_core',84,-28)
    add('cheek_jaw_mass_driver','head_neck',-48,28)
    anim=data['animations'].setdefault('mechanics_truth_weighted_deformation',{'bones':{}})['bones']
    # Timelines: intentionally staggered. These are bone deformation drivers that define the mesh-weight target behavior.
    anim['lower_jaw_hinge']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.20,'value':-3,'curve':'smooth'},{'time':0.28,'value':32,'curve':'stepped'},{'time':0.42,'value':10,'curve':'smooth'},{'time':0.74,'value':0,'curve':'smooth'}]}
    anim['lower_neck_weight_driver']={'scale':[{'time':0,'x':1.00,'y':1.00,'curve':'smooth'},{'time':0.18,'x':1.06,'y':0.92,'curve':'smooth'},{'time':0.34,'x':0.95,'y':1.12,'curve':'smooth'},{'time':0.56,'x':1.03,'y':0.98,'curve':'smooth'},{'time':0.86,'x':1,'y':1,'curve':'smooth'}], 'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.34,'x':10,'y':5,'curve':'smooth'},{'time':0.58,'x':-4,'y':-2,'curve':'smooth'},{'time':0.86,'x':0,'y':0,'curve':'smooth'}]}
    anim['underlap_torso_driver']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.18,'x':1.04,'y':0.96,'curve':'smooth'},{'time':0.40,'x':1.02,'y':1.04,'curve':'smooth'},{'time':0.86,'x':1,'y':1,'curve':'smooth'}]}
    anim['chest_mass_absorber']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.16,'x':1.08,'y':0.93,'curve':'smooth'},{'time':0.42,'x':0.96,'y':1.09,'curve':'smooth'},{'time':0.66,'x':1.03,'y':0.98,'curve':'smooth'},{'time':0.94,'x':1,'y':1,'curve':'smooth'}], 'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.42,'x':7,'y':4,'curve':'smooth'},{'time':0.66,'x':-3,'y':-1,'curve':'smooth'},{'time':0.94,'x':0,'y':0,'curve':'smooth'}]}
    anim['tail_root_weight_driver']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.52,'x':1.10,'y':0.94,'curve':'smooth'},{'time':0.78,'x':0.98,'y':1.04,'curve':'smooth'},{'time':1.04,'x':1,'y':1,'curve':'smooth'}], 'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.52,'value':-8,'curve':'smooth'},{'time':0.78,'value':6,'curve':'smooth'},{'time':1.04,'value':0,'curve':'smooth'}]}
    anim['cheek_jaw_mass_driver']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.20,'x':1.04,'y':0.96,'curve':'smooth'},{'time':0.30,'x':0.98,'y':1.06,'curve':'smooth'},{'time':0.60,'x':1,'y':1,'curve':'smooth'}]}
    data.setdefault('mechanicsTruth',{})['weightedDeformationZones']=WEIGHT_ZONES
    data['mechanicsTruth']['phase']='weighted deformation truth, not polish'
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(name): return Image.open(LAYER_DIR/name).convert('RGBA')

def draw_weight_map():
    im=Image.new('RGB',(1400,850),(24,21,19)); d=ImageDraw.Draw(im)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',17); small=ImageFont.truetype('DejaVuSans.ttf',14)
    except OSError: title=font=small=None
    d.text((30,24),'v6 Weighted Deformation Truth — mesh influence plan',fill=(255,224,170),font=title)
    # Creature schematic
    d.ellipse((360,255,715,455),fill=(80,40,32),outline=(255,126,42),width=3) # chest
    d.ellipse((265,185,460,315),fill=(120,58,34),outline=(255,170,80),width=3) # neck
    d.ellipse((130,115,350,285),fill=(130,62,36),outline=(255,170,80),width=3) # head
    d.line([(700,395),(900,380),(1080,430)],fill=(118,58,33),width=38) # tail
    zones=[('cheek_jaw_mass',(170,205),(72,28),'head 72 / jaw 28'),('lower_neck_root',(335,260),(55,45),'neck 55 / torso 45'),('underlap_torso_bridge',(425,310),(35,65),'neck 35 / torso 65'),('chest_absorber',(555,350),(20,80),'neck 20 / torso 80'),('tail_root_counterweight',(760,395),(45,55),'tail 45 / torso 55')]
    colors=[(0,220,255),(255,180,60),(255,80,80),(170,255,80),(220,120,255)]
    for (name,xy,wt,label),c in zip(zones,colors):
        x,y=xy; d.ellipse((x-42,y-28,x+42,y+28),outline=c,width=5); d.text((x-80,y+38),name,fill=c,font=small); d.text((x-58,y+56),label,fill=(235,210,185),font=small)
    d.text((30,650),'Review rule: deformation must preserve mass and stagger through existing timing hierarchy; no uniform squash or sliding overlay islands.',fill=(255,170,95),font=font)
    y=690
    for name,z in WEIGHT_ZONES.items():
        d.text((45,y),f"{name}: {z['behavior']}",fill=(235,210,185),font=small); y+=24
    path=ART_DIR/'weighted-deformation-influence-map.jpg'; im.save(path,quality=94); return path

def make_frames():
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    # each state: label, jaw angle, glow, chest scale xy, neck scale xy, tail root thickness, offsets
    states=[
      ('01 compression stores mass',0,.25,(1.08,.93),(1.05,.92),1.00,(0,0),(0,0),0,'chest compresses; neck underside gathers'),
      ('02 jaw impulse',32,1.0,(1.00,1.02),(.98,1.05),1.00,(6,1),(0,0),0,'jaw releases while cheek mass redistributes'),
      ('03 neck stretch transfer',18,.65,(.98,1.05),(.94,1.14),1.02,(14,4),(2,1),0,'lower neck stretches into recoil vector'),
      ('04 chest absorption',10,.42,(.95,1.11),(1.02,1.00),1.04,(7,2),(12,6),0,'chest expands after release; shoulder mass shifts'),
      ('05 tail root thickens',4,.25,(1.02,.99),(1.00,1.0),1.16,(2,0),(6,2),-10,'tail root thickens to stabilize balance'),
      ('06 lantern drag / settle',0,.10,(1.00,1.00),(1.00,1.0),.98,(0,0),(-2,-1),8,'tail/lantern lag and soft settle'),
    ]
    frames=[]
    for idx,(label,jang,gstr,cscale,nscale,tthick,hoff,boff,trot,note) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        # deforming mass proxies: non-uniform ellipses and local bulges, not full-body squash
        cx,cy=440+boff[0],320+boff[1]; cw,ch=int(280*cscale[0]),int(142*cscale[1])
        d.ellipse((cx-cw//2,cy-ch//2,cx+cw//2,cy+ch//2),fill=(78,39,31,235),outline=(255,126,42,180),width=3)
        # shoulder/chest absorption bulge
        d.ellipse((cx-120,cy-70,cx-20,cy+30),fill=(112,55,34,190),outline=(255,170,80,140),width=2)
        nx,ny=335+hoff[0],250+hoff[1]; nw,nh=int(170*nscale[0]),int(84*nscale[1])
        d.ellipse((nx-nw//2,ny-nh//2,nx+nw//2,ny+nh//2),fill=(119,57,34,220),outline=(255,170,80,170),width=3)
        # underlap deformation band
        d.polygon([(nx-40,ny+20),(cx-135,cy-35),(cx-65,cy+35),(nx+40,ny+45)],fill=(150,72,39,155),outline=(255,126,42,120))
        # tail root thickening/tail counterbalance
        root=(cx+120,cy+45); tail2=(690+int(trot*.2),380); tail3=(830+int(trot*.6),425+int(trot*.4))
        d.line([root,tail2,tail3],fill=(118,58,33,235),width=int(25*tthick))
        d.line([root,tail2,tail3],fill=(255,126,42,150),width=4)
        lx,ly=845+int(trot*.8),430+int(trot*.3); d.ellipse((lx-16,ly-16,lx+16,ly+16),fill=(255,116,35,205),outline=(255,220,120),width=2)
        hp=(HEAD_PLACE[0]+hoff[0],HEAD_PLACE[1]+hoff[1]); fr.alpha_composite(upper,hp)
        if gstr:
            g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp)
        # cheek bridge scale proxy by slight resize around same anchor
        fr.alpha_composite(bridge,hp)
        # force path, staged markers
        path=[(cx,cy),(nx,ny),(hp[0]+118,hp[1]+188),root,tail2,(lx,ly)]
        for a,b in zip(path,path[1:]): d.line((a,b),fill=(255,118,34,190),width=4)
        d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,54),note,fill=(235,210,185),font=small)
        d.text((24,490),'Mass preservation: local chest/neck/tail-root deformation + staggered recoil, not rigid whole-part sliding.',fill=(255,170,95),font=small)
        # small weight bars
        for i,(name,val) in enumerate([('neck↔torso',0.45 if idx<2 else .55),('chest absorb',cscale[1]),('tail root',tthick),('cheek/jaw',.28 if jang else .15)]):
            x=24+i*145; y=450; d.text((x,y-18),name,fill=(235,210,185),font=small); d.rectangle((x,y,x+100,y+10),outline=(90,75,60)); d.rectangle((x,y,x+int(min(val,1.2)/1.2*100),y+10),fill=(255,126,42))
        frames.append(fr.convert('RGB'))
    contact=Image.new('RGB',(1500,900),(24,21,19)); cd=ImageDraw.Draw(contact)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: title=None
    cd.text((30,24),'Mechanics Truth v6 — Weighted Deformation + Mass Preservation',fill=(255,224,170),font=title)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340
        contact.paste(th,(x,y)); cd.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
    contact_path=ART_DIR/'weighted-deformation-contact-sheet.jpg'; contact.save(contact_path,quality=94)
    gif_path=ART_DIR/'weighted-deformation-mass-preservation.gif'; frames[0].save(gif_path,save_all=True,append_images=frames[1:],duration=[160,110,130,150,170,230],loop=0)
    sil=[]
    for fr in frames:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'weighted-deformation-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[160,110,130,150,170,230],loop=0)
    mobile=frames[3].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-weighted-deformation-chest-absorption.jpg'; mobile.save(mobile_path,quality=94)
    return {'contact':contact_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path,'weightMap':draw_weight_map()}

def manifest(code,log,arts):
    mesh_spec={'phase':'weighted deformation truth','sourceOfTruth':'v5 automation lowest score: Anatomical Weighting — 4.1/10','weightedZones':WEIGHT_ZONES,'preserveTimingHierarchy':['jaw impulse','neck transfer','chest absorption','torso displacement','tail stabilization','lantern lag','settle oscillation'],'massPreservation':['chest expands after release','neck underside stretches','shoulder mass shifts','tail root thickens','cheek/jaw mass redistributes'],'caveat':'Spine file contains deformation driver bones/timelines and weight-zone metadata; final artist pass must convert listed attachments to actual mesh vertices and weight paint them in Spine Professional.'}
    (OUT_DIR/'weighted-deformation-mesh-weight-spec.json').write_text(json.dumps(mesh_spec,indent=2)+'\n')
    m={'name':'mechanics-truth-v6-weighted-deformation','activeDirective':'docs/FIRE_HATCHLING_WEIGHTED_DEFORMATION_TRUTH_DIRECTIVE_2026-05-14.md','phase':'mechanics truth, not polish','proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()},'meshWeightSpec':str((OUT_DIR/'weighted-deformation-mesh-weight-spec.json').relative_to(ROOT))},'notPolish':['no plume beauty','no ember polish','no easing cleanup','no presentation cleanup']}
    (OUT_DIR/'weighted-deformation-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_frames(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
