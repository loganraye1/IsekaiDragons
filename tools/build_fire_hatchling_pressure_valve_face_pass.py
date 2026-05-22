#!/usr/bin/env python3
"""Fire Hatchling v7 pressure-valve facial deformation slice.

Builds on v6 weighted deformation. Focuses jaw articulation score as cheek/jaw
mesh deformation truth, not more mouth opening or timing polish.
"""
from __future__ import annotations

import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v6-weighted-deformation/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v6-weighted-deformation.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v7-pressure-valve-face'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v7-pressure-valve-face.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v7-pressure-valve-face.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v7-pressure-valve-face'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

MOUTH_VERTEX_BEHAVIOR={
 'compression_seal': {'time':0.00,'mouthCorner':'closed/inset','cheek':'compressed forward','lowerJaw':'held shut','weights':{'head_neck':0.76,'lower_jaw_hinge':0.14,'cheek_jowl_bridge':0.10}},
 'pressure_build_stretch': {'time':0.18,'mouthCorner':'taut/stretching','cheek':'bulged under pressure','lowerJaw':'preloaded -3deg','weights':{'head_neck':0.66,'lower_jaw_hinge':0.22,'cheek_jowl_bridge':0.12}},
 'release_open': {'time':0.30,'mouthCorner':'stretched open, not disconnected','cheek':'elastic drag','lowerJaw':'opens from pressure valve','weights':{'head_neck':0.56,'lower_jaw_hinge':0.34,'cheek_jowl_bridge':0.10}},
 'recoil_settle': {'time':0.56,'mouthCorner':'returns without cavity gap','cheek':'settle overlap','lowerJaw':'soft catch','weights':{'head_neck':0.70,'lower_jaw_hinge':0.20,'cheek_jowl_bridge':0.10}},
}

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)

def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def update_spine():
    data=json.loads(SRC_JSON.read_text()); data['skeleton']['hash']='mechanics-truth-v7-pressure-valve-face'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    bones=data['bones']
    def add(n,parent,x,y):
        if not any(b['name']==n for b in bones): bones.append({'name':n,'parent':parent,'x':x,'y':y})
    add('mouth_corner_vertex_driver','head_neck',-54,18)
    add('cheek_pressure_bulge_driver','cheek_jaw_mass_driver',-42,34)
    add('upper_skull_contact_driver','head_neck',-36,46)
    add('lower_jaw_soft_overlap_driver','lower_jaw_hinge',-12,12)
    anim=data['animations'].setdefault('mechanics_truth_pressure_valve_face',{'bones':{}})['bones']
    anim['lower_jaw_hinge']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.18,'value':-3,'curve':'smooth'},{'time':0.30,'value':25,'curve':'stepped'},{'time':0.46,'value':11,'curve':'smooth'},{'time':0.76,'value':0,'curve':'smooth'}]}
    anim['mouth_corner_vertex_driver']={'scale':[{'time':0,'x':1.05,'y':0.92,'curve':'smooth'},{'time':0.18,'x':1.16,'y':0.88,'curve':'smooth'},{'time':0.30,'x':0.92,'y':1.22,'curve':'smooth'},{'time':0.56,'x':1.04,'y':0.98,'curve':'smooth'},{'time':0.76,'x':1,'y':1,'curve':'smooth'}], 'translate':[{'time':0,'x':-2,'y':0,'curve':'smooth'},{'time':0.18,'x':-5,'y':1,'curve':'smooth'},{'time':0.30,'x':6,'y':-3,'curve':'smooth'},{'time':0.56,'x':-2,'y':1,'curve':'smooth'},{'time':0.76,'x':0,'y':0,'curve':'smooth'}]}
    anim['cheek_pressure_bulge_driver']={'scale':[{'time':0,'x':1.10,'y':0.95,'curve':'smooth'},{'time':0.18,'x':1.18,'y':0.90,'curve':'smooth'},{'time':0.30,'x':0.96,'y':1.10,'curve':'smooth'},{'time':0.56,'x':1.04,'y':0.98,'curve':'smooth'},{'time':0.82,'x':1,'y':1,'curve':'smooth'}]}
    anim['upper_skull_contact_driver']={'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.30,'x':1,'y':-1,'curve':'smooth'},{'time':0.56,'x':0,'y':0,'curve':'smooth'}]}
    anim['lower_jaw_soft_overlap_driver']={'scale':[{'time':0,'x':1.02,'y':0.98,'curve':'smooth'},{'time':0.18,'x':1.08,'y':0.94,'curve':'smooth'},{'time':0.30,'x':0.97,'y':1.07,'curve':'smooth'},{'time':0.56,'x':1.02,'y':0.99,'curve':'smooth'},{'time':0.76,'x':1,'y':1,'curve':'smooth'}]}
    data.setdefault('mechanicsTruth',{})['pressureValveFace']=MOUTH_VERTEX_BEHAVIOR
    data['mechanicsTruth']['phase']='pressure-valve facial deformation truth, not polish'
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(n): return Image.open(LAYER_DIR/n).convert('RGBA')

def make_vertex_map():
    im=Image.new('RGB',(1400,840),(24,21,19)); d=ImageDraw.Draw(im)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',17); small=ImageFont.truetype('DejaVuSans.ttf',14)
    except OSError: title=font=small=None
    d.text((30,24),'v7 Pressure-Valve Facial Deformation — mouth-corner vertex plan',fill=(255,224,170),font=title)
    # large schematic head
    d.ellipse((170,170,580,430),fill=(112,55,34),outline=(255,170,80),width=4)
    d.polygon([(330,280),(460,260),(548,318),(468,375),(334,352)],fill=(52,26,22),outline=(255,126,42))
    # soft cheek bridge / vertices
    pts=[(340,278),(382,266),(430,272),(468,294),(500,326),(462,356),(410,360),(356,344)]
    d.line(pts+[pts[0]],fill=(0,235,255),width=4)
    for i,p in enumerate(pts):
        d.ellipse((p[0]-7,p[1]-7,p[0]+7,p[1]+7),fill=(0,235,255)); d.text((p[0]+8,p[1]-8),str(i+1),fill=(235,250,255),font=small)
    d.text((650,145),'Vertex behavior states:',fill=(255,224,170),font=font)
    y=180
    for name,b in MOUTH_VERTEX_BEHAVIOR.items():
        d.text((670,y),f"{name}: {b['mouthCorner']}; cheek={b['cheek']}; jaw={b['lowerJaw']}",fill=(235,210,185),font=small); y+=55
    d.text((30,700),'Rule: jaw articulation score improves only if mouth corner seals, stretches, opens, and settles as shared cheek/jaw mass — not if the hinge simply opens wider.',fill=(255,170,95),font=font)
    path=ART_DIR/'pressure-valve-mouth-corner-vertex-map.jpg'; im.save(path,quality=94); return path

def make_frames():
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    states=[
      ('01 sealed compression',0,.28,(1.12,.90),(-5,1),'mouth corner sealed; cheek compresses before release'),
      ('02 pressure build stretch',-3,.65,(1.20,.88),(-9,2),'mouth corner stretches under furnace pressure'),
      ('03 pressure-valve release',25,1.0,(0.94,1.18),(6,-4),'jaw opens but mouth corner stretches, not disconnects'),
      ('04 recoil soft overlap',11,.45,(1.06,.98),(-2,1),'cheek bridge catches recoil with soft overlap'),
      ('05 settle seal restored',0,.12,(1.00,1.00),(0,0),'lower jaw returns without hollow cavity exposure'),
    ]
    frames=[]
    for idx,(label,jang,gstr,cheek_scale,corner_off,note) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        # body/energy source context, not polish
        chest=(432,320); neck=(342,250); mouth=(HEAD_PLACE[0]+118+corner_off[0], HEAD_PLACE[1]+188+corner_off[1])
        d.ellipse((310,250,590,395),fill=(78,39,31,220),outline=(255,126,42,150),width=3)
        d.ellipse((270,213,440,303),fill=(119,57,34,210),outline=(255,170,80,130),width=3)
        for a,b in zip([chest,neck,mouth],[neck,mouth,(mouth[0]+50,mouth[1]-3)]): d.line((a,b),fill=(255,118,34,190),width=4)
        hp=HEAD_PLACE; fr.alpha_composite(upper,hp)
        if gstr:
            g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp)
        fr.alpha_composite(bridge,hp)
        # overlaid deformation zone: cyan mouth corner loop + orange cheek pressure blob
        cx,cy=hp[0]+125+corner_off[0],hp[1]+178+corner_off[1]
        sx,sy=cheek_scale; d.ellipse((cx-int(58*sx),cy-int(34*sy),cx+int(58*sx),cy+int(34*sy)),outline=(0,235,255),width=4)
        d.ellipse((cx-38,cy-22,cx+44,cy+24),outline=(255,160,60),width=3)
        d.line((cx-48,cy,cx+54,cy+12),fill=(0,235,255),width=3)
        # close-up inset
        crop=fr.crop((HEAD_PLACE[0]+55,HEAD_PLACE[1]+132,HEAD_PLACE[0]+238,HEAD_PLACE[1]+248)).resize((366,232),Image.Resampling.LANCZOS)
        fr.alpha_composite(Image.new('RGBA',(382,248),(12,10,9,225)),(555,260)); fr.alpha_composite(crop,(563,268))
        d.rectangle((563,268,929,500),outline=(0,235,255),width=2)
        d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,54),note,fill=(235,210,185),font=small)
        d.text((24,505),'Pressure valve logic: chest → heat → neck pressure → jaw seal tension → release → recoil.',fill=(255,170,95),font=small)
        # four state dots
        for i,l in enumerate(['seal','stretch','open','settle']):
            x=28+i*80; y=448; color=(255,126,42) if i==min(idx,3) else (70,60,52)
            d.ellipse((x,y,x+18,y+18),fill=color); d.text((x+24,y),l,fill=(235,210,185),font=small)
        frames.append(fr.convert('RGB'))
    contact=Image.new('RGB',(1500,900),(24,21,19)); cd=ImageDraw.Draw(contact)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: title=None
    cd.text((30,24),'Mechanics Truth v7 — Pressure-Valve Cheek/Jaw Deformation',fill=(255,224,170),font=title)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340
        contact.paste(th,(x,y)); cd.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
    contact_path=ART_DIR/'pressure-valve-face-contact-sheet.jpg'; contact.save(contact_path,quality=94)
    gif_path=ART_DIR/'pressure-valve-face-deformation.gif'; frames[0].save(gif_path,save_all=True,append_images=frames[1:],duration=[170,130,120,170,230],loop=0)
    sil=[]
    for fr in frames:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'pressure-valve-face-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[170,130,120,170,230],loop=0)
    mobile=frames[2].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-pressure-valve-release.jpg'; mobile.save(mobile_path,quality=94)
    return {'contact':contact_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path,'vertexMap':make_vertex_map()}

def manifest(code,log,arts):
    spec={'phase':'pressure-valve facial deformation truth','sourceOfTruth':'v6 automation lowest score: Jaw Articulation — 4.2/10','notAddMoreJawMotion':True,'mouthVertexBehavior':MOUTH_VERTEX_BEHAVIOR,'requiredMeshTargets':['lower_jaw','cheek_jowl_bridge','mouth_corner','upper_skull_contact_area'],'caveat':'Spine proof contains facial deformation driver bones/timelines and vertex-behavior metadata; final production still requires actual mesh vertices and hand weight-painting in Spine Professional.'}
    (OUT_DIR/'pressure-valve-face-mesh-deformation-spec.json').write_text(json.dumps(spec,indent=2)+'\n')
    m={'name':'mechanics-truth-v7-pressure-valve-face','activeDirective':'docs/FIRE_HATCHLING_PRESSURE_VALVE_FACIAL_DEFORMATION_DIRECTIVE_2026-05-14.md','phase':'mechanics truth, not polish','proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()},'deformationSpec':str((OUT_DIR/'pressure-valve-face-mesh-deformation-spec.json').relative_to(ROOT))},'notPolish':['no more mouth opening','no glow polish','no plume beauty','no easing polish','no presentation cleanup']}
    (OUT_DIR/'pressure-valve-face-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_frames(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
