#!/usr/bin/env python3
"""Fire Hatchling v9 Integration Truth slice.

Moves beyond isolated proxy validation into one full-chain organism proof:
chest/ribcage -> furnace core -> lower neck/underlap -> cheek/jaw valve -> torso/tail -> lantern.
Still mechanics truth: driver bones + integration metadata + review artifacts, not presentation polish.
"""
from __future__ import annotations
import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v8-source-pressure-compression/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v8-source-pressure-compression.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v9-integration-truth'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v9-integration-truth.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v9-integration-truth.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v9-integration-truth'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

CHAIN=[
 ('chest/ribcage compression','furnace core',0.00,0.78),
 ('furnace core','lower neck + underlap',0.16,0.62),
 ('lower neck + underlap','cheek/jaw valve',0.30,0.50),
 ('torso mass','tail root stabilization',0.48,0.58),
 ('tail root stabilization','lantern lag',0.66,0.44),
]
INTEGRATION_SPEC={
 'phase':'Integration Truth Phase',
 'sourceOfTruth':'clustered mechanics scores: no isolated bottleneck; integrate full chain',
 'systems':['chest_ribcage','furnace_core','lower_neck','underlap','cheek_jaw_bridge','tail_root','lantern_lag','recoil_transfer'],
 'sharedInfluence':{
   'chest_to_neck':{'chest_ribcage':0.70,'lower_neck':0.30},
   'neck_to_jaw':{'lower_neck':0.55,'cheek_jaw_bridge':0.30,'lower_jaw':0.15},
   'torso_to_tail':{'torso_mass':0.62,'tail_root':0.38},
   'tail_to_lantern':{'tail_root':0.58,'lantern':0.42},
 },
 'avoid':['isolated deformation islands','rigid plates','overlay-only propagation','synchronized motion blocks'],
}

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()
def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)
def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def update_spine():
    data=json.loads(SRC_JSON.read_text()); data['skeleton']['hash']='mechanics-truth-v9-integration-truth'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    bones=data['bones']
    def add(n,parent,x,y):
        if not any(b['name']==n for b in bones): bones.append({'name':n,'parent':parent,'x':x,'y':y})
    for n,p,x,y in [('full_chain_root_driver','body_core',0,0),('chain_chest_to_neck_driver','full_chain_root_driver',-35,22),('chain_neck_to_jaw_driver','chain_chest_to_neck_driver',-78,58),('chain_torso_to_tail_driver','full_chain_root_driver',102,-40),('chain_tail_to_lantern_driver','chain_torso_to_tail_driver',120,-32)]: add(n,p,x,y)
    anim=data['animations'].setdefault('mechanics_truth_integration_chain',{'bones':{}})['bones']
    # One connected wave: timings stagger, but all drivers share parent full_chain_root_driver.
    anim['full_chain_root_driver']={'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.24,'x':-2,'y':-3,'curve':'smooth'},{'time':0.48,'x':6,'y':4,'curve':'smooth'},{'time':0.90,'x':0,'y':0,'curve':'smooth'}]}
    anim['chain_chest_to_neck_driver']={'scale':[{'time':0,'x':1.04,'y':1.02,'curve':'smooth'},{'time':0.18,'x':1.17,'y':0.86,'curve':'smooth'},{'time':0.34,'x':0.98,'y':1.13,'curve':'smooth'},{'time':0.90,'x':1,'y':1,'curve':'smooth'}]}
    anim['chain_neck_to_jaw_driver']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.30,'x':0.92,'y':1.20,'curve':'smooth'},{'time':0.48,'x':1.06,'y':0.97,'curve':'smooth'},{'time':0.90,'x':1,'y':1,'curve':'smooth'}]}
    anim['chain_torso_to_tail_driver']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.48,'value':-7,'curve':'smooth'},{'time':0.70,'value':5,'curve':'smooth'},{'time':1.02,'value':0,'curve':'smooth'}], 'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.48,'x':1.10,'y':0.95,'curve':'smooth'},{'time':1.02,'x':1,'y':1,'curve':'smooth'}]}
    anim['chain_tail_to_lantern_driver']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.66,'value':10,'curve':'smooth'},{'time':0.88,'value':-6,'curve':'smooth'},{'time':1.12,'value':0,'curve':'smooth'}]}
    anim['lower_jaw_hinge']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.30,'value':-3,'curve':'smooth'},{'time':0.48,'value':24,'curve':'stepped'},{'time':0.68,'value':10,'curve':'smooth'},{'time':0.98,'value':0,'curve':'smooth'}]}
    data.setdefault('mechanicsTruth',{})['integrationTruth']=INTEGRATION_SPEC
    data['mechanicsTruth']['phase']='Integration Truth Phase — unified weighted organism proof, not polish'
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(n): return Image.open(LAYER_DIR/n).convert('RGBA')

def draw_map():
    im=Image.new('RGB',(1500,850),(24,21,19)); d=ImageDraw.Draw(im)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',17); small=ImageFont.truetype('DejaVuSans.ttf',14)
    except OSError: title=font=small=None
    d.text((30,24),'v9 Integration Truth — shared mesh influence chain',fill=(255,224,170),font=title)
    nodes={'chest':(520,360),'furnace':(520,360),'neck':(360,270),'jaw':(245,235),'torso':(610,385),'tail':(820,410),'lantern':(1030,455)}
    d.ellipse((350,260,720,475),fill=(78,39,31),outline=(255,126,42),width=4); d.ellipse((455,310,585,410),fill=(185,74,30),outline=(255,220,120),width=3)
    d.ellipse((280,220,430,320),fill=(116,57,34),outline=(255,170,80),width=3); d.ellipse((160,165,335,285),fill=(128,62,36),outline=(255,170,80),width=3)
    d.line([nodes['torso'],nodes['tail'],nodes['lantern']],fill=(120,58,33),width=32)
    arrows=[('chest','neck'),('neck','jaw'),('chest','torso'),('torso','tail'),('tail','lantern')]
    for a,b in arrows:
        d.line([nodes[a],nodes[b]],fill=(0,235,255),width=6)
    y=560
    for k,v in INTEGRATION_SPEC['sharedInfluence'].items():
        d.text((50,y),f"{k}: {v}",fill=(235,210,185),font=font); y+=38
    d.text((50,740),'Integration rule: each section is still staggered, but every response is parented to / influenced by the shared pressure-recoil chain.',fill=(255,170,95),font=font)
    path=ART_DIR/'integration-truth-shared-influence-map.jpg'; im.save(path,quality=94); return path

def make_frames():
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    states=[
      ('01 organism brace',0,.15,(1.04,1.02),(1.0,1.0),0,0,'whole chain connected before compression'),
      ('02 chest stores / neck receives',0,.55,(1.17,.86),(.96,1.12),0,0,'chest compression starts shared influence into lower neck'),
      ('03 valve tension / transfer',-3,.85,(1.08,.96),(.92,1.22),0,0,'neck transfer creates jaw seal tension; underlap remains connected'),
      ('04 release / torso absorbs',24,.70,(.96,1.12),(1.04,.98),-5,0,'jaw release discharges into torso mass'),
      ('05 tail stabilizes / lantern lags',10,.30,(1.03,.99),(1.0,1.0),7,12,'tail root takes recoil; lantern lags behind'),
      ('06 organism settle',0,.12,(1.0,1.0),(1.0,1.0),0,-6,'all parts settle through one chain, not isolated blocks'),
    ]
    frames=[]
    for i,(label,jang,gstr,chest_s,neck_s,tail_ang,lantern_lag,note) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        cx,cy=450,322; cw,ch=int(290*chest_s[0]),int(152*chest_s[1]); d.ellipse((cx-cw//2,cy-ch//2,cx+cw//2,cy+ch//2),fill=(78,39,31,235),outline=(255,126,42,180),width=4)
        fx,fy=cx+6,cy+8; fw,fh=int(92*(1+gstr*.28)),int(68*(1+gstr*.22)); d.ellipse((fx-fw//2,fy-fh//2,fx+fw//2,fy+fh//2),fill=(255,106,28,130+int(80*gstr)),outline=(255,220,120),width=3)
        nx,ny=336,252; nw,nh=int(170*neck_s[0]),int(86*neck_s[1]); d.ellipse((nx-nw//2,ny-nh//2,nx+nw//2,ny+nh//2),fill=(119,57,34,220),outline=(255,170,80,170),width=3)
        # underlap bridge polygon, follows chest+neck instead of overlay island
        d.polygon([(nx-45,ny+24),(cx-135,cy-42),(cx-65,cy+34),(nx+45,ny+48)],fill=(150,72,39,150),outline=(255,126,42,120))
        # tail chain
        root=(cx+125,cy+44); t2=(700+tail_ang*2,382-tail_ang); t3=(835+tail_ang*4,430+tail_ang); d.line([root,t2,t3],fill=(118,58,33,235),width=28); d.line([root,t2,t3],fill=(255,126,42,140),width=4)
        lx,ly=t3[0]+35+lantern_lag,t3[1]+10+lantern_lag//2; d.ellipse((lx-16,ly-16,lx+16,ly+16),fill=(255,116,35,205),outline=(255,220,120),width=2)
        mouth=(HEAD_PLACE[0]+120,HEAD_PLACE[1]+188)
        for a,b,w in [((fx,fy),(nx,ny),5),((nx,ny),mouth,5),((cx,cy),root,4),(root,t2,4),(t2,(lx,ly),3)]: d.line((a,b),fill=(0,235,255,180),width=w)
        hp=HEAD_PLACE; fr.alpha_composite(upper,hp)
        if gstr:
            g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp); fr.alpha_composite(bridge,hp)
        d.ellipse((hp[0]+69,hp[1]+148,hp[0]+181,hp[1]+208),outline=(0,235,255),width=3)
        d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,54),note,fill=(235,210,185),font=small)
        d.text((24,505),'Integration truth: source, valve, recoil, tail, lantern act through one shared chain — not separate proxy passes.',fill=(255,170,95),font=small)
        # no overlay-only dependency note shown as subtle chain meter
        d.rectangle((24,450,324,462),outline=(90,75,60)); d.rectangle((24,450,24+int((i+1)/len(states)*300),462),fill=(0,235,255))
        frames.append(fr.convert('RGB'))
    contact=Image.new('RGB',(1500,900),(24,21,19)); cd=ImageDraw.Draw(contact)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: title=None
    cd.text((30,24),'Mechanics Truth v9 — Integration Truth / Unified Organism Chain',fill=(255,224,170),font=title)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340; contact.paste(th,(x,y)); cd.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
    contact_path=ART_DIR/'integration-truth-contact-sheet.jpg'; contact.save(contact_path,quality=94)
    gif_path=ART_DIR/'integration-truth-unified-organism.gif'; frames[0].save(gif_path,save_all=True,append_images=frames[1:],duration=[150,140,130,140,170,230],loop=0)
    sil=[]
    for fr in frames:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'integration-truth-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[150,140,130,140,170,230],loop=0)
    mobile=frames[3].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-integration-release.jpg'; mobile.save(mobile_path,quality=94)
    return {'contact':contact_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path,'map':draw_map()}

def manifest(code,log,arts):
    (OUT_DIR/'integration-truth-mesh-influence-spec.json').write_text(json.dumps(INTEGRATION_SPEC,indent=2)+'\n')
    m={'name':'mechanics-truth-v9-integration-truth','activeDirective':'docs/FIRE_HATCHLING_INTEGRATION_TRUTH_PHASE_DIRECTIVE_2026-05-14.md','phase':'Integration Truth Phase','proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()},'integrationSpec':str((OUT_DIR/'integration-truth-mesh-influence-spec.json').relative_to(ROOT))},'notPolish':['no isolated proxy pass','no more jaw-only work','no more recoil-only work','no glow substitution','no presentation cleanup']}
    (OUT_DIR/'integration-truth-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_frames(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
