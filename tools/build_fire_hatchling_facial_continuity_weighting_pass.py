#!/usr/bin/env python3
"""Fire Hatchling v4 facial continuity + anatomical weighting mechanics slice.

Builds on v3 jaw articulation. Adds mouth-corner/cheek bridge and lower-neck
weighting proxy artifacts. This is mechanics-truth validation, not polish.
"""
from __future__ import annotations

import json, math, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v3-jaw-articulation/layers"
SRC_JSON = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v3-jaw-articulation.spine.json"
OUT_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v4-facial-continuity-weighting"
LAYER_DIR = OUT_DIR / "layers"
PROJECT_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-project"
SPINE_JSON = PROJECT_DIR / "living-forge-fire-hatchling.mechanics-truth-v4-facial-continuity-weighting.spine.json"
SPINE_FILE = PROJECT_DIR / "living-forge-fire-hatchling.mechanics-truth-v4-facial-continuity-weighting.spine"
ART_DIR = ROOT / "artifacts/spine/fire-hatchling/mechanics-truth-v4-facial-continuity-weighting"
SPINE_EXE = r"C:\Program Files\Spine\Spine.exe"
BRIDGE = "05d_cheek_jowl_mouth_corner_bridge"
NECK_BLEND = "02c_lower_neck_torso_weight_blend_proxy"
HINGE_LOCAL = (120, 166)
HEAD_PLACE = (170, 115)
CANVAS = (960, 540)

def win(path: Path) -> str:
    return subprocess.check_output(["wslpath", "-w", str(path)], text=True).strip()

def rotate_about(img, angle, pivot):
    w,h=img.size; px,py=pivot; r=math.radians(angle); c=math.cos(r); s=math.sin(r)
    return img.transform((w,h), Image.Transform.AFFINE, (c,s,px-c*px-s*py,-s,c,py+s*px-c*py), resample=Image.Resampling.BICUBIC)

def setup():
    LAYER_DIR.mkdir(parents=True, exist_ok=True); ART_DIR.mkdir(parents=True, exist_ok=True); PROJECT_DIR.mkdir(parents=True, exist_ok=True)
    for p in SRC_DIR.glob("*.png"):
        shutil.copy2(p, LAYER_DIR / p.name)

def make_bridge_layers():
    head = Image.open(LAYER_DIR / "05a_upper_head_neck.png").convert("RGBA")
    jaw = Image.open(LAYER_DIR / "05b_lower_jaw_pressure_valve.png").convert("RGBA")
    underlap = Image.open(LAYER_DIR / "02b_neck_collar_underlap_paint.png").convert("RGBA")
    bridge = Image.new("RGBA", head.size, (0,0,0,0))
    d=ImageDraw.Draw(bridge)
    # Cheek/jowl patch: small anatomical flap over hinge/mouth corner, not a mask blob.
    d.ellipse((82,142,168,213), fill=(111,57,34,210))
    d.ellipse((105,154,202,228), fill=(138,69,36,185))
    d.polygon([(95,166),(132,150),(178,180),(172,214),(118,219),(78,194)], fill=(163,82,40,175))
    d.line([(108,167),(142,180),(176,201)], fill=(238,142,62,155), width=5)
    d.line([(88,194),(122,209),(164,219)], fill=(65,31,24,140), width=4)
    mask = bridge.getchannel('A').filter(ImageFilter.GaussianBlur(1.2))
    bridge.putalpha(mask)
    # Keep bridge only where it can plausibly cover cheek/jaw hinge area.
    bridge.save(LAYER_DIR / f"{BRIDGE}.png")

    blend = Image.new("RGBA", underlap.size, (0,0,0,0))
    bd=ImageDraw.Draw(blend)
    # Lower-neck torso influence proxy; broad under-chest collar pressure shape.
    bd.ellipse((24,44,188,136), fill=(117,57,32,150))
    bd.polygon([(18,92),(78,36),(184,48),(206,98),(148,145),(42,142)], fill=(156,76,39,120))
    bd.line([(36,104),(90,78),(176,86)], fill=(255,136,54,110), width=7)
    blend.putalpha(blend.getchannel('A').filter(ImageFilter.GaussianBlur(3)))
    blend.save(LAYER_DIR / f"{NECK_BLEND}.png")

    guide = Image.new('RGB',(1160,620),(24,21,19)); gd=ImageDraw.Draw(guide)
    try: title=ImageFont.truetype('DejaVuSans.ttf',28); font=ImageFont.truetype('DejaVuSans.ttf',17)
    except OSError: title=font=None
    gd.text((30,20),'v4 Facial Continuity + Anatomical Weighting: bridge structures, not polish',fill=(255,224,170),font=title)
    comp=Image.new('RGBA', head.size,(0,0,0,0)); comp.alpha_composite(head); comp.alpha_composite(jaw); comp.alpha_composite(bridge)
    guide.paste(comp.convert('RGB'),(50,90),comp.getchannel('A'))
    guide.paste(bridge.convert('RGB'),(430,90),bridge.getchannel('A'))
    guide.paste(blend.convert('RGB'),(800,135),blend.getchannel('A'))
    for x,label in [(50,'head + jaw + cheek/jowl bridge'),(430,'mouth-corner bridge only'),(800,'lower-neck torso blend proxy')]:
        gd.rectangle((x-4,86,x+330,390),outline=(255,126,42),width=2); gd.text((x,404),label,fill=(235,210,185),font=font)
    hx,hy=50+HINGE_LOCAL[0],90+HINGE_LOCAL[1]
    gd.ellipse((hx-9,hy-9,hx+9,hy+9),outline=(0,240,255),width=3)
    gd.text((30,565),'Intent: cover hollow mouth corner enough to restore anatomy while preserving visible jaw hinge/release.',fill=(255,170,95),font=font)
    guide.save(ART_DIR/'facial-continuity-bridge-guide.jpg',quality=94)

def update_spine():
    data=json.loads(SRC_JSON.read_text())
    data['skeleton']['hash']='mechanics-truth-v4-facial-continuity-weighting'; data['skeleton']['images']=win(LAYER_DIR)+'\\'
    bones=data['bones']
    def addbone(name,parent,x,y):
        if not any(b['name']==name for b in bones): bones.append({'name':name,'parent':parent,'x':x,'y':y})
    addbone('cheek_jowl_bridge','head_neck',-178,-16)
    addbone('lower_neck_torso_weight_blend','neck_base_deform',0,0)
    slots=data['slots']
    if not any(s['name']=='slot_cheek_jowl_bridge' for s in slots): slots.append({'name':'slot_cheek_jowl_bridge','bone':'cheek_jowl_bridge','attachment':BRIDGE})
    if not any(s['name']=='slot_lower_neck_torso_weight_blend' for s in slots): slots.insert(4,{'name':'slot_lower_neck_torso_weight_blend','bone':'lower_neck_torso_weight_blend','attachment':NECK_BLEND})
    att=data['skins'][0]['attachments']
    att['slot_cheek_jowl_bridge']={BRIDGE:{'type':'region','path':BRIDGE,'x':-56.0,'y':37.5,'width':320,'height':293}}
    att['slot_lower_neck_torso_weight_blend']={NECK_BLEND:{'type':'region','path':NECK_BLEND,'x':12.0,'y':-4.0,'width':214,'height':160}}
    anim=data['animations'].setdefault('mechanics_truth_facial_continuity_weighting',{'bones':{}})['bones']
    anim['cheek_jowl_bridge']={'rotate':[{'time':0,'value':0,'curve':'smooth'},{'time':0.24,'value':-2,'curve':'smooth'},{'time':0.30,'value':3,'curve':'stepped'},{'time':0.54,'value':0,'curve':'smooth'}], 'translate':[{'time':0,'x':0,'y':0,'curve':'smooth'},{'time':0.30,'x':2,'y':-1,'curve':'smooth'},{'time':0.54,'x':0,'y':0,'curve':'smooth'}]}
    anim['lower_neck_torso_weight_blend']={'scale':[{'time':0,'x':1,'y':1,'curve':'smooth'},{'time':0.16,'x':1.08,'y':0.94,'curve':'smooth'},{'time':0.32,'x':0.98,'y':1.04,'curve':'smooth'},{'time':0.64,'x':1,'y':1,'curve':'smooth'}]}
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=120)
    return proc.returncode, proc.stdout+proc.stderr

def make_frames():
    base_path=ROOT/'artifacts/spine/fire-hatchling/mechanics-truth-v3-jaw-articulation/jaw-articulation-mechanics-contact-sheet.jpg'
    bg=Image.new('RGBA',CANVAS,(24,21,19,255))
    upper=Image.open(LAYER_DIR/'05a_upper_head_neck.png').convert('RGBA')
    jaw=Image.open(LAYER_DIR/'05b_lower_jaw_pressure_valve.png').convert('RGBA')
    glow=Image.open(LAYER_DIR/'05c_jaw_pressure_glow.png').convert('RGBA')
    bridge=Image.open(LAYER_DIR/f'{BRIDGE}.png').convert('RGBA')
    states=[('01 compress / bridge sealed',0,.25,'mouth corner stays structurally closed'),('02 pressure build',-4,.65,'cheek/jowl covers hinge while pressure rises'),('03 snap open',32,1,'jaw releases, bridge preserves cheek continuity'),('04 recoil catch',12,.45,'bridge rides recoil, cavity remains covered'),('05 settle',0,.1,'jaw closes without hollow corner')]
    frames=[]
    for label,ang,gstr,note in states:
        fr=bg.copy(); d=ImageDraw.Draw(fr)
        try: font=ImageFont.truetype('DejaVuSans.ttf',22); small=ImageFont.truetype('DejaVuSans.ttf',16)
        except OSError: font=small=None
        chest=(420,305); neck=(340,238); mouth=(HEAD_PLACE[0]+118,HEAD_PLACE[1]+188)
        d.line((chest,neck,mouth),fill=(255,118,34,220),width=5)
        d.ellipse((chest[0]-45,chest[1]-26,chest[0]+45,chest[1]+26),outline=(255,126,42),width=4)
        fr.alpha_composite(upper,HEAD_PLACE)
        if gstr: g=glow.copy(); g.putalpha(g.getchannel('A').point(lambda v:int(v*gstr))); fr.alpha_composite(g,HEAD_PLACE)
        fr.alpha_composite(rotate_about(jaw,ang,HINGE_LOCAL),HEAD_PLACE)
        fr.alpha_composite(bridge,HEAD_PLACE)
        # close-up inset
        crop=fr.crop((HEAD_PLACE[0]+45,HEAD_PLACE[1]+130,HEAD_PLACE[0]+232,HEAD_PLACE[1]+248)).resize((374,236),Image.Resampling.LANCZOS)
        fr.alpha_composite(Image.new('RGBA',(390,252),(12,10,9,225)),(550,260)); fr.alpha_composite(crop,(558,268))
        d.rectangle((558,268,932,504),outline=(0,240,255),width=2)
        d.text((24,22),label,fill=(255,224,170),font=font); d.text((24,54),note,fill=(235,210,185),font=small)
        d.text((24,505),'Energy Source Rule preserved; focus is facial continuity + anatomical weighting, not polish.',fill=(255,170,95),font=small)
        frames.append(fr.convert('RGB'))
    contact=Image.new('RGB',(1500,900),(24,21,19)); cd=ImageDraw.Draw(contact)
    try: title=ImageFont.truetype('DejaVuSans.ttf',30)
    except OSError: title=None
    cd.text((30,24),'Mechanics Truth v4 — Facial Continuity + Anatomical Weighting',fill=(255,224,170),font=title)
    for i,fr in enumerate(frames):
        th=fr.copy(); th.thumbnail((460,255),Image.Resampling.LANCZOS); x=30+(i%3)*490; y=85+(i//3)*340
        contact.paste(th,(x,y)); cd.rectangle((x-2,y-2,x+462,y+257),outline=(255,126,42),width=2)
    contact_path=ART_DIR/'facial-continuity-weighting-contact-sheet.jpg'; contact.save(contact_path,quality=94)
    gif_path=ART_DIR/'facial-continuity-weighting-prototype.gif'; frames[0].save(gif_path,save_all=True,append_images=frames[1:],duration=[180,160,120,160,220],loop=0)
    sil=[]
    for fr in frames:
        mask=fr.convert('L').point(lambda v:255 if v>35 else 0).filter(ImageFilter.MaxFilter(5)); im=Image.new('RGB',CANVAS,(244,242,236)); im.paste((0,0,0),mask=mask); sil.append(im)
    sil_path=ART_DIR/'facial-continuity-weighting-silhouette.gif'; sil[0].save(sil_path,save_all=True,append_images=sil[1:],duration=[180,160,120,160,220],loop=0)
    mobile=frames[2].resize((480,270),Image.Resampling.LANCZOS); mobile_path=ART_DIR/'mobile-50-facial-continuity-snap-open.jpg'; mobile.save(mobile_path,quality=94)
    return {'contact':contact_path,'gif':gif_path,'silhouette':sil_path,'mobile':mobile_path}

def manifest(code,log,arts):
    m={'name':'mechanics-truth-v4-facial-continuity-weighting','activeDirective':'docs/FIRE_HATCHLING_FACIAL_CONTINUITY_WEIGHTING_DIRECTIVE_2026-05-14.md','phase':'mechanics truth, not polish','sourceOfTruth':'v3 automation lowest score: Anatomical Weighting — 3.2/10','additions':['mouth-corner anatomy bridge','cheek/jowl overlap over hinge','lower-neck torso blend proxy','facial continuity review artifacts'],'energySourceRule':['chest compression','heat buildup','neck pressure','jaw release','recoil discharge'],'proofHealth':{'spineJson':str(SPINE_JSON.relative_to(ROOT)),'spineFile':str(SPINE_FILE.relative_to(ROOT)),'spineImportExitCode':code,'spineImportLogTail':log[-1500:],'layers':str(LAYER_DIR.relative_to(ROOT)),'artifacts':{k:str(v.relative_to(ROOT)) for k,v in arts.items()}},'notPolish':['no glow compensation','no plume polish','no beauty smoothing','no presentation cleanup']}
    (OUT_DIR/'facial-continuity-weighting-manifest.json').write_text(json.dumps(m,indent=2)+'\n')

def main():
    setup(); make_bridge_layers(); code,log=update_spine(); arts=make_frames(); manifest(code,log,arts); print(json.dumps({'spineExit':code,'spineFile':str(SPINE_FILE),'artifacts':{k:str(v) for k,v in arts.items()}},indent=2))
if __name__=='__main__': main()
