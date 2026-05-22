#!/usr/bin/env python3
"""Fire Hatchling v11 no-overlay / 50% readability stress test.

Validates the v10 production mesh chain without debug rings, guide lines, pressure arrows,
or proxy overlays. This does not add new mechanics; it generates stress-test artifacts
for silhouette, 50% mobile scale, and debug-vs-no-overlay comparison.
"""
from __future__ import annotations
import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v10-production-mesh-truth/layers'
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v10-production-mesh-truth.spine.json'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v11-no-overlay-50-readability'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v11-no-overlay-50-readability.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.mechanics-truth-v11-no-overlay-50-readability.spine'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v11-no-overlay-50-readability'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'
CANVAS=(960,540); HEAD_PLACE=(170,115); HINGE=(120,166)

STRESS_SPEC={
 'phase':'Production Mesh Truth Phase — no-overlay / 50% readability stress test',
 'newMechanics':False,
 'doNotAdd':['recoil logic','glow polish','jaw opening','proxy overlays','presentation-only fixes'],
 'focus':['jaw_cheek_readability','mouth_corner_silhouette','chest_pressure_read','neck_arc_clarity','tail_stabilization','seam_stability','50_percent_action_chain'],
 'failureGuards':['mush deformation','over-softening','silhouette collapse','disconnected weighting islands','unreadable compression','floating/sliding seams'],
 'target':'raise jaw/readability from 5.8 through silhouette clarity only'
}

def win(p:Path)->str: return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()
def setup():
    LAYER_DIR.mkdir(parents=True,exist_ok=True); ART_DIR.mkdir(parents=True,exist_ok=True); PROJECT_DIR.mkdir(parents=True,exist_ok=True)
    for p in SRC_DIR.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)

def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)

def update_spine():
    data=json.loads(SRC_JSON.read_text())
    data['skeleton']['hash']='mechanics-truth-v11-no-overlay-50-readability'
    data['skeleton']['images']=win(LAYER_DIR)+'\\'
    data.setdefault('mechanicsTruth',{})['noOverlay50ReadabilityStressTest']=STRESS_SPEC
    data['mechanicsTruth']['activeDirective']='docs/FIRE_HATCHLING_NO_OVERLAY_50_READABILITY_STRESS_TEST_DIRECTIVE_2026-05-14.md'
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def load(n): return Image.open(LAYER_DIR/n).convert('RGBA')

def compose(debug=False, label_overlay=True):
    upper=load('05a_upper_head_neck.png'); jaw=load('05b_lower_jaw_pressure_valve.png'); glow=load('05c_jaw_pressure_glow.png'); bridge=load('05d_cheek_jowl_mouth_corner_bridge.png')
    states=[
      ('brace',0,.10,(1.04,1.02),(.99,1.03),0,0,'body stores tension before release'),
      ('compression',0,.50,(1.15,.88),(.96,1.12),0,0,'chest pressure readable without arrows'),
      ('neck / jaw seal',-3,.74,(1.08,.96),(.92,1.20),0,0,'mouth-corner seal holds silhouette'),
      ('jaw release',22,.58,(.98,1.10),(1.04,.98),-5,0,'jaw opens no more than v10; silhouette clarity only'),
      ('recoil / tail',10,.22,(1.03,.99),(1.0,1.0),7,12,'tail stabilizes without guide assistance'),
      ('settle',0,.10,(1,1),(1,1),0,-6,'no floating/sliding seams visible'),
    ]
    frames=[]
    for idx,(label,jang,gstr,chest_s,neck_s,tail_ang,lantern_lag,note) in enumerate(states):
        fr=Image.new('RGBA',CANVAS,(24,21,19,255)); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',15)
        except OSError: font=small=None
        cx,cy=450,322; cw,ch=int(290*chest_s[0]),int(152*chest_s[1])
        # Primary proof uses only creature-like contour masses; no arrows/guide lines.
        d.ellipse((cx-cw//2,cy-ch//2,cx+cw//2,cy+ch//2),fill=(78,39,31,235),outline=(235,126,62,150),width=3)
        d.ellipse((cx-142,cy-70,cx-36,cy+30),fill=(108,52,33,205),outline=(190,100,58,105),width=2)
        fx,fy=cx+6,cy+8; fw,fh=int(88*(1+gstr*.18)),int(64*(1+gstr*.15))
        d.ellipse((fx-fw//2,fy-fh//2,fx+fw//2,fy+fh//2),fill=(190,74,30,105+int(48*gstr)),outline=(225,145,72,140),width=2)
        nx,ny=336,252; nw,nh=int(170*neck_s[0]),int(86*neck_s[1])
        d.ellipse((nx-nw//2,ny-nh//2,nx+nw//2,ny+nh//2),fill=(119,57,34,220),outline=(235,148,76,135),width=3)
        d.polygon([(nx-45,ny+24),(cx-135,cy-42),(cx-65,cy+34),(nx+45,ny+48)],fill=(150,72,39,145),outline=(190,100,58,100))
        root=(cx+125,cy+44); t2=(700+tail_ang*2,382-tail_ang); t3=(835+tail_ang*4,430+tail_ang)
        d.line([root,t2,t3],fill=(118,58,33,235),width=28); d.line([root,t2,t3],fill=(190,100,58,110),width=3)
        lx,ly=t3[0]+35+lantern_lag,t3[1]+10+lantern_lag//2
        d.ellipse((lx-16,ly-16,lx+16,ly+16),fill=(205,88,34,210),outline=(225,145,72),width=2)
        hp=HEAD_PLACE; fr.alpha_composite(upper,hp)
        if gstr:
            # Support heat is subdued and deformation-tied; no glow-as-substitute.
            g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr*.48))); fr.alpha_composite(g,hp)
        fr.alpha_composite(rotate_about(jaw,jang,HINGE),hp); fr.alpha_composite(bridge,hp)
        if debug:
            # Only comparison sheet uses debug rings.
            for (mx,my,rx,ry,c) in [(cx,cy,118,54,(255,126,42)),(nx,ny,68,34,(0,235,255)),(hp[0]+125,hp[1]+178,55,27,(255,170,80)),(root[0],root[1],50,22,(220,120,255))]:
                d.ellipse((mx-rx,my-ry,mx+rx,my+ry),outline=c,width=2)
                for k in range(8):
                    a=math.tau*k/8; x=mx+math.cos(a)*rx; y=my+math.sin(a)*ry; d.ellipse((x-3,y-3,x+3,y+3),fill=c)
        if label_overlay:
            d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,505),note,fill=(235,180,120),font=small)
        frames.append(fr.convert('RGB'))
    return frames

def contact(frames,path,title,thumb=(460,255),sheet_size=(1500,900),with_title=True):
    sheet=Image.new('RGB',sheet_size,(24,21,19)); d=ImageDraw.Draw(sheet)
    try: titlef=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: titlef=None
    top=85
    if with_title: d.text((30,24),title,fill=(255,224,170),font=titlef)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail(thumb,Image.Resampling.LANCZOS); x=30+(i%3)*490; y=top+(i//3)*340
        sheet.paste(th,(x,y)); d.rectangle((x-2,y-2,x+thumb[0]+2,y+thumb[1]+2),outline=(255,126,42),width=2)
    sheet.save(path,quality=94)

def make_artifacts():
    no=compose(False,True); dbg=compose(True,True); pure=compose(False,False)
    no_contact=ART_DIR/'no-overlay-readability-contact-sheet.jpg'; contact(no,no_contact,'v11 No-Overlay Readability Stress Test')
    # 50% contact sheet: source frames physically downscaled to 480x270 then arranged without upscaling.
    half=[fr.resize((480,270),Image.Resampling.LANCZOS) for fr in pure]
    half_sheet=Image.new('RGB',(1540,650),(24,21,19)); d=ImageDraw.Draw(half_sheet)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); small=ImageFont.truetype('DejaVuSans.ttf',14)
    except OSError: title=small=None
    d.text((30,24),'v11 50% Mobile Scale Readability — no overlays / no debug rings',fill=(255,224,170),font=title)
    labels=['brace','compression','neck/jaw seal','jaw release','recoil/tail','settle']
    for i,fr in enumerate(half):
        x=30+(i%3)*500; y=80+(i//3)*285; half_sheet.paste(fr,(x,y)); d.rectangle((x-2,y-2,x+482,y+272),outline=(255,126,42),width=2); d.text((x+8,y+8),labels[i],fill=(255,224,170),font=small)
    half_path=ART_DIR/'50-percent-scale-contact-sheet.jpg'; half_sheet.save(half_path,quality=94)
    gif_path=ART_DIR/'no-overlay-readability.gif'; no[0].save(gif_path,save_all=True,append_images=no[1:],duration=[150,140,130,140,170,230],loop=0)
    sil=[]
    for fr in pure:
        # True silhouette-only; no labels/text included.
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'silhouette-only.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[150,140,130,140,170,230],loop=0)
    # Debug-vs-no overlay comparison.
    comp=Image.new('RGB',(1800,1120),(24,21,19)); d=ImageDraw.Draw(comp)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30); font=ImageFont.truetype('DejaVuSans.ttf',17)
    except OSError: title=font=None
    d.text((30,24),'v11 Debug vs No-Overlay Comparison — debug is audit only; no-overlay is the pass/fail read',fill=(255,224,170),font=title)
    d.text((30,72),'Top row: no overlay. Bottom row: debug vertex rings.',fill=(235,210,185),font=font)
    for i in range(6):
        a=no[i].resize((280,158),Image.Resampling.LANCZOS); b=dbg[i].resize((280,158),Image.Resampling.LANCZOS)
        x=30+(i%3)*590; y=120+(i//3)*460
        comp.paste(a,(x,y)); comp.paste(b,(x,y+185)); d.rectangle((x-2,y-2,x+282,y+160),outline=(255,126,42),width=2); d.rectangle((x-2,y+183,x+282,y+345),outline=(0,235,255),width=2)
    comp_path=ART_DIR/'debug-vs-no-overlay-comparison-sheet.jpg'; comp.save(comp_path,quality=94)
    mobile=half[3]; mobile_path=ART_DIR/'mobile-50-no-overlay-release.jpg'; mobile.save(mobile_path,quality=94)
    return {'noOverlayContact':no_contact,'scale50Contact':half_path,'silhouetteGif':sil_path,'noOverlayGif':gif_path,'debugVsNoOverlay':comp_path,'mobile':mobile_path}

def manifest(code,log,arts):
    (OUT_DIR/'no-overlay-readability-stress-spec.json').write_text(json.dumps(STRESS_SPEC,indent=2)+'\n')
    m={'name':'mechanics-truth-v11-no-overlay-50-readability','activeDirective':'docs/FIRE_HATCHLING_NO_OVERLAY_50_READABILITY_STRESS_TEST_DIRECTIVE_2026-05-14.md','phase':STRESS_SPEC['phase'],'proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()},'stressSpec':str((OUT_DIR/'no-overlay-readability-stress-spec.json').relative_to(ROOT))},'caveat':'Readability stress test only; no new mechanics or final hand weight-painting performed.'}
    (OUT_DIR/'no-overlay-readability-stress-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); code,log=update_spine(); arts=make_artifacts(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
