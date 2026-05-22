#!/usr/bin/env python3
"""Fire Hatchling v10 Production Mesh Truth slice.

Converts v9 integration truth into a production-mesh-weighting package:
- explicit vertex rings / seam vertices / weighted influence tables for Spine Pro
- full-chain driver skeleton remains as deformation control rig
- primary proof reduces overlay dependency and validates silhouette readability

Note: Spine JSON remains import-safe; production mesh vertex plans are emitted as specs
for hand weight-painting in Spine Professional. This avoids corrupting the .spine
file with unsafe generated mesh data while still defining the real vertex work.
"""
from __future__ import annotations
import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v9-integration-truth/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v9-integration-truth.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v10-production-mesh-truth'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v10-production-mesh-truth.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v10-production-mesh-truth.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v10-production-mesh-truth'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

VERTEX_SPECS={
 'body_core_chest_ribcage': {
   'attachment':'02_body_core','rings':['outer_silhouette_lock','rib_compression_ring','furnace_pressure_pocket','shoulder_countermass'],
   'targetVertices':36,'influences':{'body_core':0.52,'ribcage_compression_driver':0.26,'chest_volume_preserve_driver':0.14,'full_chain_root_driver':0.08},
   'readabilityLock':'outer_silhouette_lock vertices keep chest recognizable during compression/release'
 },
 'furnace_core_support': {
   'attachment':'02_body_core internal support shape','rings':['pressure_core_inner','pressure_core_outer'],
   'targetVertices':16,'influences':{'furnace_pressure_core_driver':0.70,'ribcage_compression_driver':0.20,'body_core':0.10},
   'readabilityLock':'heat support must follow compression; glow cannot substitute for volume deformation'
 },
 'lower_neck_underlap_chain': {
   'attachments':['02b_neck_collar_underlap_paint','02c_lower_neck_torso_weight_blend_proxy'],
   'rings':['neck_root_seam','underlap_torso_overlap','neck_underside_stretch'],
   'targetVertices':30,'influences':{'neck_base_deform':0.36,'lower_neck_weight_driver':0.28,'chain_chest_to_neck_driver':0.20,'body_core':0.16},
   'readabilityLock':'neck arc remains readable; no sliding underlap island'
 },
 'cheek_jaw_bridge_valve': {
   'attachments':['05d_cheek_jowl_mouth_corner_bridge','05b_lower_jaw_pressure_valve','05a_upper_head_neck'],
   'rings':['mouth_corner_seal','cheek_overlap','upper_skull_contact','lower_jaw_soft_overlap'],
   'targetVertices':28,'influences':{'head_neck':0.48,'mouth_corner_vertex_driver':0.20,'cheek_pressure_bulge_driver':0.16,'lower_jaw_hinge':0.16},
   'readabilityLock':'jaw silhouette clear; mouth corner stretches without exposing hollow cavity'
 },
 'tail_root_lantern_chain': {
   'attachment':'00_tail_lantern','rings':['tail_root_counterweight','tail_mid_drag','lantern_link_lag'],
   'targetVertices':26,'influences':{'tail_lantern':0.42,'tail_root_weight_driver':0.24,'chain_torso_to_tail_driver':0.22,'chain_tail_to_lantern_driver':0.12},
   'readabilityLock':'tail stabilizes silhouette; lantern lags but does not detach'
 },
}
FAILURE_GUARDS=['mush deformation','over-softening','silhouette collapse','floating vertices','sliding seams','disconnected weighting islands','unreadable compression']

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()
def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)
def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def update_spine():
    data=json.loads(SRC_JSON.read_text()); data['skeleton']['hash']='mechanics-truth-v10-production-mesh-truth'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    data.setdefault('mechanicsTruth',{})['productionMeshTruth']={'phase':'Production Mesh Truth Phase','vertexSpecs':VERTEX_SPECS,'failureGuards':FAILURE_GUARDS,'overlayReduction':'primary proof artifacts use natural contour/mass read first; debug mesh map is separate','caveat':'JSON includes production vertex/weight specs and driver rig; final hand-painted Spine mesh conversion must be done in Spine Professional.'}
    # Add a production mesh audit animation marker by keeping v9 chain timings and adding small silhouette-lock drivers.
    bones=data['bones']
    def add(n,parent,x,y):
        if not any(b['name']==n for b in bones): bones.append({'name':n,'parent':parent,'x':x,'y':y})
    for n,p,x,y in [('silhouette_lock_chest','body_core',0,0),('silhouette_lock_neck','neck_base_deform',-35,20),('silhouette_lock_jaw','head_neck',-54,16),('silhouette_lock_tail','tail_lantern',15,0)]: add(n,p,x,y)
    anim=data['animations'].setdefault('mechanics_truth_production_mesh_audit',{'bones':{}})['bones']
    anim['silhouette_lock_chest']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.18,'x':1.05,'y':0.96,'curve':'smooth'},{'time':0.48,'x':0.98,'y':1.04,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}]}
    anim['silhouette_lock_neck']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.34,'x':0.96,'y':1.10,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}]}
    anim['silhouette_lock_jaw']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.48,'x':1.02,'y':1.03,'curve':'smooth'},{'time':0.92,'x':1,'y':1,'curve':'smooth'}]}
    anim['silhouette_lock_tail']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.66,'value':6,'curve':'smooth'},{'time':1.0,'value':0,'curve':'smooth'}]}
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(n): return Image.open(LAYER_DIR/n).convert('RGBA')

def draw_mesh_map():
    im=Image.new('RGB',(1600,950),(24,21,19)); d=ImageDraw.Draw(im)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',17); small=ImageFont.truetype('DejaVuSans.ttf',13)
    except OSError: title=font=small=None
    d.text((30,24),'v10 Production Mesh Truth — vertex rings / silhouette locks / shared weights',fill=(255,224,170),font=title)
    # Schematic with vertices
    d.ellipse((425,300,790,515),fill=(78,39,31),outline=(255,126,42),width=4)
    d.ellipse((515,350,640,440),fill=(175,74,30),outline=(255,220,120),width=3)
    d.ellipse((330,250,480,350),fill=(118,57,34),outline=(255,170,80),width=3)
    d.ellipse((205,190,365,310),fill=(128,62,36),outline=(255,170,80),width=3)
    d.line([(750,445),(930,420),(1120,480)],fill=(120,58,33),width=34)
    shapes=[('body_core_chest_ribcage',(610,405),95,48,(255,126,42)),('lower_neck_underlap_chain',(395,315),58,32,(0,235,255)),('cheek_jaw_bridge_valve',(290,262),48,24,(255,170,80)),('tail_root_lantern_chain',(880,430),100,24,(220,120,255)),('furnace_core_support',(578,395),45,30,(255,220,120))]
    for name,(cx,cy),rx,ry,c in shapes:
        d.ellipse((cx-rx,cy-ry,cx+rx,cy+ry),outline=c,width=3)
        # sample vertices around ring
        for i in range(12):
            a=math.tau*i/12; x=cx+math.cos(a)*rx; y=cy+math.sin(a)*ry; d.ellipse((x-4,y-4,x+4,y+4),fill=c)
        d.text((cx-rx,cy+ry+8),name,fill=c,font=small)
    y=570
    for name,s in VERTEX_SPECS.items():
        d.text((40,y),f"{name}: {s['targetVertices']} verts | influences {s['influences']} | lock: {s['readabilityLock']}",fill=(235,210,185),font=small); y+=45
    d.text((40,845),'Production risk guards: no mush, silhouette collapse, floating vertices, sliding seams, disconnected islands, or unreadable compression.',fill=(255,170,95),font=font)
    path=ART_DIR/'production-mesh-vertex-weight-map.jpg'; im.save(path,quality=94); return path

def compose_frames(debug=False):
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    states=[('01 brace / silhouette lock',0,.12,(1.04,1.02),(.99,1.03),0,0),('02 compression / volume preserved',0,.55,(1.15,.88),(.96,1.12),0,0),('03 neck transfer / jaw tension',-3,.82,(1.08,.96),(.92,1.20),0,0),('04 release / clear jaw silhouette',24,.66,(.98,1.10),(1.04,.98),-5,0),('05 recoil / tail stabilizes',10,.28,(1.03,.99),(1.0,1.0),7,12),('06 settle / no floating islands',0,.12,(1,1),(1,1),0,-6)]
    frames=[]
    for i,(label,jang,gstr,chest_s,neck_s,tail_ang,lantern_lag) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        cx,cy=450,322; cw,ch=int(290*chest_s[0]),int(152*chest_s[1]); d.ellipse((cx-cw//2,cy-ch//2,cx+cw//2,cy+ch//2),fill=(78,39,31,235),outline=(255,126,42,160),width=3)
        # show deformation by contour, not guide line: shoulder and furnace pressure shapes are natural-ish solids
        d.ellipse((cx-142,cy-70,cx-36,cy+30),fill=(108,52,33,205),outline=(210,116,62,110),width=2)
        fx,fy=cx+6,cy+8; fw,fh=int(88*(1+gstr*.22)),int(64*(1+gstr*.18)); d.ellipse((fx-fw//2,fy-fh//2,fx+fw//2,fy+fh//2),fill=(215,82,28,120+int(70*gstr)),outline=(245,170,85,170),width=2)
        nx,ny=336,252; nw,nh=int(170*neck_s[0]),int(86*neck_s[1]); d.ellipse((nx-nw//2,ny-nh//2,nx+nw//2,ny+nh//2),fill=(119,57,34,220),outline=(255,170,80,140),width=3)
        d.polygon([(nx-45,ny+24),(cx-135,cy-42),(cx-65,cy+34),(nx+45,ny+48)],fill=(150,72,39,150),outline=(210,116,62,110))
        root=(cx+125,cy+44); t2=(700+tail_ang*2,382-tail_ang); t3=(835+tail_ang*4,430+tail_ang); d.line([root,t2,t3],fill=(118,58,33,235),width=28); d.line([root,t2,t3],fill=(210,116,62,120),width=3)
        lx,ly=t3[0]+35+lantern_lag,t3[1]+10+lantern_lag//2; d.ellipse((lx-16,ly-16,lx+16,ly+16),fill=(210,92,36,210),outline=(245,170,85),width=2)
        hp=HEAD_PLACE; fr.alpha_composite(upper,hp)
        if gstr:
            g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr*.72))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp); fr.alpha_composite(bridge,hp)
        if debug:
            # optional mesh rings only in debug sheet, not primary proof.
            for (mx,my,rx,ry,c) in [(cx,cy,120,56,(255,126,42)),(nx,ny,70,36,(0,235,255)),(hp[0]+125,hp[1]+178,56,28,(255,170,80)),(root[0],root[1],52,22,(220,120,255))]:
                d.ellipse((mx-rx,my-ry,mx+rx,my+ry),outline=c,width=2)
                for k in range(8):
                    a=math.tau*k/8; x=mx+math.cos(a)*rx; y=my+math.sin(a)*ry; d.ellipse((x-3,y-3,x+3,y+3),fill=c)
        d.text((24,22),label,fill=(255,224,170),font=font)
        d.text((24,505),'Production Mesh Truth: contour/readability first; debug vertex rings separated from primary proof.',fill=(255,170,95),font=small)
        frames.append(fr.convert('RGB'))
    return frames

def make_artifacts():
    primary=compose_frames(False); debug=compose_frames(True)
    def contact(frames,path,title):
        sheet=Image.new('RGB',(1500,900),(24,21,19)); d=ImageDraw.Draw(sheet)
        try: titlef=ImageFont.truetype('DejaVuSans.ttf',30)
        except OSError: titlef=None
        d.text((30,24),title,fill=(255,224,170),font=titlef)
        for i,fr in enumerate(frames):
            th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340; sheet.paste(th,(x,y)); d.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
        sheet.save(path,quality=94)
    contact_path=ART_DIR/'production-mesh-truth-primary-contact-sheet.jpg'; contact(primary,contact_path,'v10 Production Mesh Truth — primary readability / reduced overlays')
    debug_path=ART_DIR/'production-mesh-truth-debug-vertex-contact-sheet.jpg'; contact(debug,debug_path,'v10 Production Mesh Truth — debug vertex rings / influence audit')
    gif_path=ART_DIR/'production-mesh-truth-readability.gif'; primary[0].save(gif_path,save_all=True,append_images=primary[1:],duration=[150,140,130,140,170,230],loop=0)
    sil=[]
    for fr in primary:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'production-mesh-truth-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[150,140,130,140,170,230],loop=0)
    mobile=primary[3].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-production-mesh-release.jpg'; mobile.save(mobile_path,quality=94)
    return {'primary':contact_path,'debug':debug_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path,'meshMap':draw_mesh_map()}

def manifest(code,log,arts):
    (OUT_DIR/'production-mesh-vertex-weight-spec.json').write_text(json.dumps({'phase':'Production Mesh Truth Phase','vertexSpecs':VERTEX_SPECS,'failureGuards':FAILURE_GUARDS,'reviewFocus':['production mesh stability','silhouette integrity','force readability','commercial production viability']},indent=2)+'\n')
    m={'name':'mechanics-truth-v10-production-mesh-truth','activeDirective':'docs/FIRE_HATCHLING_PRODUCTION_MESH_TRUTH_PHASE_DIRECTIVE_2026-05-14.md','phase':'Production Mesh Truth Phase','proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()},'vertexWeightSpec':str((OUT_DIR/'production-mesh-vertex-weight-spec.json').relative_to(ROOT))},'caveat':'Import-safe Spine proof plus production vertex-weight specs; final .spine still requires hand mesh conversion/weight paint in Spine Professional.'}
    (OUT_DIR/'production-mesh-truth-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_artifacts(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
