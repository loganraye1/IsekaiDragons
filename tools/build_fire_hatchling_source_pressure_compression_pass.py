#!/usr/bin/env python3
"""Fire Hatchling v8 source-pressure compression slice.

Builds on v7 pressure-valve face. Focus: chest/ribcage/furnace core stores pressure
before neck extension and jaw release. This is mechanics truth, not glow polish.
"""
from __future__ import annotations

import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v7-pressure-valve-face/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v7-pressure-valve-face.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v8-source-pressure-compression'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v8-source-pressure-compression.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v8-source-pressure-compression.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v8-source-pressure-compression'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

SOURCE_PRESSURE_STATES={
 '01_ribcage_intake': {'time':0.00,'chest':'slight inhale / high volume','furnace':'low heat','neck':'closed pressure path','jaw':'sealed'},
 '02_chest_compression_store': {'time':0.14,'chest':'ribcage compresses inward while belly/furnace bulges','furnace':'pressure pocket grows','neck':'not extended yet','jaw':'seal tension begins'},
 '03_furnace_pressure_peak': {'time':0.24,'chest':'maximum stored pressure, volume preserved','furnace':'brightest pressure support','neck':'pressure column begins transfer','jaw':'still held'},
 '04_neck_transfer_valve_ready': {'time':0.34,'chest':'release pushes pressure into neck','furnace':'pressure stream','neck':'extends from chest source','jaw':'seal tension high'},
 '05_jaw_release_discharge': {'time':0.44,'chest':'expands after release','furnace':'discharge falls','neck':'pressure exits','jaw':'opens as valve'},
 '06_recoil_absorb_settle': {'time':0.70,'chest':'absorbs recoil and returns','furnace':'settles','neck':'soft recoil','jaw':'settles'},
}

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)

def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def update_spine():
    data=json.loads(SRC_JSON.read_text()); data['skeleton']['hash']='mechanics-truth-v8-source-pressure-compression'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    bones=data['bones']
    def add(n,parent,x,y):
        if not any(b['name']==n for b in bones): bones.append({'name':n,'parent':parent,'x':x,'y':y})
    add('ribcage_compression_driver','body_core',-18,18)
    add('furnace_pressure_core_driver','ribcage_compression_driver',14,-4)
    add('chest_volume_preserve_driver','body_core',10,-18)
    add('neck_pressure_column_driver','lower_neck_weight_driver',-20,10)
    add('shoulder_countermass_driver','chest_mass_absorber',-48,34)
    anim=data['animations'].setdefault('mechanics_truth_source_pressure_compression',{'bones':{}})['bones']
    # Non-uniform compression with volume-preserving compensation, prior to neck/jaw release.
    anim['ribcage_compression_driver']={'scale':[{'time':0,'x':1.03,'y':1.02,'curve':'smooth'},{'time':0.14,'x':1.14,'y':0.88,'curve':'smooth'},{'time':0.24,'x':1.18,'y':0.84,'curve':'smooth'},{'time':0.44,'x':0.96,'y':1.10,'curve':'smooth'},{'time':0.70,'x':1.02,'y':0.98,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}], 'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.24,'x':-3,'y':-5,'curve':'smooth'},{'time':0.44,'x':6,'y':4,'curve':'smooth'},{'time':0.92,'x':0,'y':0,'curve':'smooth'}]}
    anim['chest_volume_preserve_driver']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.14,'x':0.94,'y':1.18,'curve':'smooth'},{'time':0.24,'x':0.92,'y':1.24,'curve':'smooth'},{'time':0.44,'x':1.08,'y':0.96,'curve':'smooth'},{'time':0.70,'x':0.98,'y':1.04,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}]}
    anim['furnace_pressure_core_driver']={'scale':[{'time':0,'x':0.80,'y':0.80,'curve':'smooth'},{'time':0.14,'x':1.10,'y':1.08,'curve':'smooth'},{'time':0.24,'x':1.38,'y':1.30,'curve':'smooth'},{'time':0.34,'x':1.22,'y':1.12,'curve':'smooth'},{'time':0.44,'x':0.96,'y':0.94,'curve':'smooth'},{'time':0.92,'x':0.80,'y':0.80,'curve':'smooth'}]}
    anim['neck_pressure_column_driver']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.24,'x':1.04,'y':1.02,'curve':'smooth'},{'time':0.34,'x':0.92,'y':1.22,'curve':'smooth'},{'time':0.50,'x':1.06,'y':0.96,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}], 'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.34,'x':8,'y':4,'curve':'smooth'},{'time':0.64,'x':-4,'y':-2,'curve':'smooth'},{'time':0.92,'x':0,'y':0,'curve':'smooth'}]}
    # Preserve previous pressure-valve face timing; jaw releases only after chest source peak.
    anim['lower_jaw_hinge']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.24,'value':-3,'curve':'smooth'},{'time':0.44,'value':25,'curve':'stepped'},{'time':0.62,'value':11,'curve':'smooth'},{'time':0.92,'value':0,'curve':'smooth'}]}
    anim['mouth_corner_vertex_driver']={'scale':[{'time':0,'x':1.05,'y':0.92,'curve':'smooth'},{'time':0.24,'x':1.16,'y':0.88,'curve':'smooth'},{'time':0.44,'x':0.92,'y':1.22,'curve':'smooth'},{'time':0.70,'x':1.04,'y':0.98,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}]}
    anim['shoulder_countermass_driver']={'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.24,'x':-6,'y':-2,'curve':'smooth'},{'time':0.50,'x':5,'y':3,'curve':'smooth'},{'time':0.92,'x':0,'y':0,'curve':'smooth'}]}
    data.setdefault('mechanicsTruth',{})['sourcePressureCompression']=SOURCE_PRESSURE_STATES
    data['mechanicsTruth']['phase']='source-pressure compression truth, not polish'
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(n): return Image.open(LAYER_DIR/n).convert('RGBA')

def make_pressure_map():
    im=Image.new('RGB',(1400,840),(24,21,19)); d=ImageDraw.Draw(im)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',17); small=ImageFont.truetype('DejaVuSans.ttf',14)
    except OSError: title=font=small=None
    d.text((30,24),'v8 Source-Pressure Compression — chest/furnace volume plan',fill=(255,224,170),font=title)
    # Schematic body
    d.ellipse((360,250,740,470),fill=(82,40,30),outline=(255,126,42),width=4)
    d.ellipse((455,300,625,420),fill=(170,72,32),outline=(255,220,120),width=4)
    d.ellipse((280,205,455,330),fill=(118,57,34),outline=(255,170,80),width=3)
    d.line([(555,350),(410,275),(310,245),(250,220)],fill=(255,118,34),width=7)
    labels=[('ribcage compresses inward',(392,245),(255,170,80)),('furnace pressure pocket bulges',(620,315),(255,220,120)),('neck pressure transfer begins after source peak',(410,185),(0,235,255)),('jaw valve releases last',(205,205),(255,126,42))]
    for text,xy,c in labels:
        d.text(xy,text,fill=c,font=font)
    y=560
    for name,s in SOURCE_PRESSURE_STATES.items():
        d.text((50,y),f"{name}: chest={s['chest']}; furnace={s['furnace']}; neck={s['neck']}; jaw={s['jaw']}",fill=(235,210,185),font=small); y+=38
    d.text((30,760),'Rule: glow can reveal pressure, but deformation must carry the mechanic. No uniform squash; volume preserved through local rib/furnace bulge.',fill=(255,170,95),font=font)
    path=ART_DIR/'source-pressure-compression-map.jpg'; im.save(path,quality=94); return path

def make_frames():
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    states=[
      ('01 ribcage intake',0,.10,(1.02,1.04),(0.82,0.82),(1.00,1.00),'source volume present before action'),
      ('02 compression stores pressure',0,.35,(1.16,.86),(1.12,1.08),(1.02,.98),'ribcage compresses inward; furnace pocket bulges'),
      ('03 pressure peak / valve held',-3,.75,(1.20,.82),(1.40,1.30),(1.05,1.00),'maximum stored pressure before neck extension'),
      ('04 neck transfer / seal tension',-3,.95,(1.06,.96),(1.24,1.14),(.92,1.20),'pressure transfers into neck while jaw stays sealed'),
      ('05 valve release discharge',25,.70,(.96,1.10),(.94,.94),(1.06,.96),'chest expands after release; jaw opens as caused valve'),
      ('06 recoil absorb settle',9,.25,(1.04,.98),(.86,.86),(1.02,.99),'chest absorbs recoil and returns'),
    ]
    frames=[]
    for idx,(label,jang,gstr,chest_scale,core_scale,neck_scale,note) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        cx,cy=450,322; cw,ch=int(290*chest_scale[0]),int(152*chest_scale[1])
        # Body/chest compression: local inverse scale + bulge, not whole-body flatten.
        d.ellipse((cx-cw//2,cy-ch//2,cx+cw//2,cy+ch//2),fill=(78,39,31,235),outline=(255,126,42,180),width=4)
        # side/rib lines show inward compression while belly/furnace expands.
        for off in [-80,-42,0,42,80]:
            d.arc((cx-115+off//4,cy-68,cx-40+off//4,cy+62),260,90,fill=(255,170,80,130),width=2)
        fx,fy=cx+8,cy+10; fw,fh=int(96*core_scale[0]),int(70*core_scale[1])
        d.ellipse((fx-fw//2,fy-fh//2,fx+fw//2,fy+fh//2),fill=(255,106,28,150+int(70*gstr)),outline=(255,220,120),width=3)
        d.ellipse((fx-fw//3,fy-fh//3,fx+fw//3,fy+fh//3),fill=(255,180,60,100+int(90*gstr)))
        nx,ny=336,252; nw,nh=int(170*neck_scale[0]),int(86*neck_scale[1])
        d.ellipse((nx-nw//2,ny-nh//2,nx+nw//2,ny+nh//2),fill=(119,57,34,220),outline=(255,170,80,170),width=3)
        # pressure path from chest to neck to mouth
        mouth=(HEAD_PLACE[0]+120,HEAD_PLACE[1]+188)
        for a,b in zip([(fx,fy),(nx,ny),mouth],[(nx,ny),mouth,(mouth[0]+55,mouth[1]-4)]):
            d.line((a,b),fill=(255,118,34,120+int(100*gstr)),width=5)
        hp=HEAD_PLACE; fr.alpha_composite(upper,hp)
        if gstr:
            g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp); fr.alpha_composite(bridge,hp)
        # mouth-corner seal/stretch overlay preserved from v7
        mc=(hp[0]+125,hp[1]+178); d.ellipse((mc[0]-56,mc[1]-30,mc[0]+56,mc[1]+30),outline=(0,235,255),width=3)
        # inset chest source
        crop=fr.crop((300,225,610,425)).resize((372,240),Image.Resampling.LANCZOS)
        fr.alpha_composite(Image.new('RGBA',(388,256),(12,10,9,225)),(548,258)); fr.alpha_composite(crop,(556,266)); d.rectangle((556,266,928,506),outline=(255,220,120),width=2)
        d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,54),note,fill=(235,210,185),font=small)
        d.text((24,505),'Source-pressure rule: chest stores pressure first; jaw is the valve, not the source.',fill=(255,170,95),font=small)
        # volume meter
        volume=round(chest_scale[0]*chest_scale[1]+core_scale[0]*core_scale[1]*.18,2)
        d.text((24,448),f'local volume proxy: {volume}  |  glow supports deformation only',fill=(235,210,185),font=small)
        d.rectangle((24,470,154,482),outline=(90,75,60)); d.rectangle((24,470,24+min(130,int(volume/1.35*130)),482),fill=(255,126,42))
        frames.append(fr.convert('RGB'))
    contact=Image.new('RGB',(1500,900),(24,21,19)); cd=ImageDraw.Draw(contact)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: title=None
    cd.text((30,24),'Mechanics Truth v8 — Source-Pressure Chest/Furnace Compression',fill=(255,224,170),font=title)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340
        contact.paste(th,(x,y)); cd.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
    contact_path=ART_DIR/'source-pressure-compression-contact-sheet.jpg'; contact.save(contact_path,quality=94)
    gif_path=ART_DIR/'source-pressure-compression.gif'; frames[0].save(gif_path,save_all=True,append_images=frames[1:],duration=[160,140,130,130,140,230],loop=0)
    sil=[]
    for fr in frames:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'source-pressure-compression-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[160,140,130,130,140,230],loop=0)
    mobile=frames[2].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-source-pressure-peak.jpg'; mobile.save(mobile_path,quality=94)
    return {'contact':contact_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path,'pressureMap':make_pressure_map()}

def manifest(code,log,arts):
    spec={'phase':'source-pressure compression truth','sourceOfTruth':'v7 automation lowest score: Compression Volume — 5.0/10','glowIsSupportOnly':True,'sourcePressureStates':SOURCE_PRESSURE_STATES,'requiredMeshTargets':['ribcage_compression','furnace_pressure_core','chest_volume_preserve','neck_pressure_column','pressure-valve face preserved'],'caveat':'Spine proof contains compression driver bones/timelines and pressure-state metadata; final production still requires real chest/ribcage mesh vertices and hand weight-painting in Spine Professional.'}
    (OUT_DIR/'source-pressure-compression-mesh-spec.json').write_text(json.dumps(spec,indent=2)+'\n')
    m={'name':'mechanics-truth-v8-source-pressure-compression','activeDirective':'docs/FIRE_HATCHLING_SOURCE_PRESSURE_COMPRESSION_DIRECTIVE_2026-05-14.md','phase':'mechanics truth, not polish','proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()},'compressionSpec':str((OUT_DIR/'source-pressure-compression-mesh-spec.json').relative_to(ROOT))},'notPolish':['no plume beauty','no glow substitution','no more jaw work','no easing cleanup','no presentation cleanup']}
    (OUT_DIR/'source-pressure-compression-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_frames(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
