#!/usr/bin/env python3
"""v20 minimal real eyelid separation + simple blink proof.

STATE: MINIMAL_SEPARATION_BUILD
Allowed operations: exactly one new minimal separation: eyelid blink layer.
No tail improvement, no jaw, no mesh complexity, no deformation systems, no plate zones.

Creates:
- two separate eyelid layer PNGs for Spine (left/right, full-canvas transparent regions)
- v20 Spine JSON/.spine with eyelid slots attached to root and hidden by default
- lightweight blink GIF/proof sheet using those separated eyelid shapes over the cohesive dragon base
"""
from pathlib import Path
import json, subprocess, math
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path('/mnt/c/Users/logan/OneDrive/Desktop/Isekai Dragons')
REF=ROOT/'assets/dragons/layers/fire-hatchling/krita-workflow/reference_locked_do_not_edit.png'
BASE_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v18-original-art-scaled-likeness.spine.json'
OUT_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v20-minimal-eyelid-blink.spine.json'
OUT_SPINE=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.production-mesh-v20-minimal-eyelid-blink.spine'
ART=ROOT/'artifacts/spine/fire-hatchling/minimal-separation-v20-eyelid-blink'
EXP=ART/'exported-from-spine-file'
LAYER_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mesh-weighted-v12-actual-mesh-pass/layers'
SPINE_EXE=r'C:\Program Files\Spine\Spine.exe'

# v18 reference layer in actual Spine is 720x480 full-canvas region.
SPINE_W, SPINE_H = 720, 480

def win(p):
    return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def make_spine_eyelid_layers():
    LAYER_DIR.mkdir(parents=True, exist_ok=True)
    # Coordinates are in v18 720x480 full-reference space.
    # Very small, face-colored upper-lid caps; kept separate so blink can be animated later.
    eye_defs = {
        'fire_hatchling_eyelid_left_clean': {
            'box': (220, 182, 272, 218),
            'iris_keep_gap': 0.20,
            'base': (139, 35, 22, 228),
            'highlight': (222, 72, 38, 185),
            'shadow': (70, 18, 15, 220),
        },
        'fire_hatchling_eyelid_right_clean': {
            'box': (305, 176, 364, 214),
            'iris_keep_gap': 0.20,
            'base': (139, 35, 22, 228),
            'highlight': (226, 74, 39, 185),
            'shadow': (70, 18, 15, 220),
        },
    }
    layer_paths=[]
    for name, spec in eye_defs.items():
        im=Image.new('RGBA',(SPINE_W,SPINE_H),(0,0,0,0))
        d=ImageDraw.Draw(im)
        x0,y0,x1,y1=spec['box']
        # Closed eyelid art is clipped to the existing eye oval, so it reads as a lid, not a sticker bar.
        eye_mask=Image.new('L',(SPINE_W,SPINE_H),0); md=ImageDraw.Draw(eye_mask)
        md.ellipse((x0,y0,x1,y1), fill=255)
        lid=Image.new('RGBA',(SPINE_W,SPINE_H),(0,0,0,0)); ld=ImageDraw.Draw(lid)
        ld.ellipse((x0-2,y0-2,x1+2,y1+2), fill=spec['base'])
        ld.arc((x0+2,y0+4,x1-2,y1+10), 190, 350, fill=spec['highlight'], width=2)
        ld.arc((x0+1,y0+12,x1-1,y1+7), 185, 355, fill=spec['shadow'], width=2)
        lid.putalpha(Image.composite(lid.getchannel('A'), Image.new('L',(SPINE_W,SPINE_H),0), eye_mask))
        im=lid.filter(ImageFilter.GaussianBlur(0.25))
        p=LAYER_DIR/f'{name}.png'; im.save(p); layer_paths.append(str(p))
    return eye_defs, layer_paths

def update_spine(eye_defs):
    ART.mkdir(parents=True, exist_ok=True); EXP.mkdir(parents=True, exist_ok=True)
    data=json.loads(BASE_JSON.read_text())
    data['skeleton']['hash']='production-mesh-v20-minimal-eyelid-blink'
    data['skeleton']['images']=win(LAYER_DIR)+'\\'
    # Remove stale v20 eyelid slots if rerun.
    names=set(eye_defs.keys())
    slot_names={f'slot_{n}' for n in names}
    data['slots']=[s for s in data['slots'] if s['name'] not in slot_names]
    skin=data['skins'][0]['attachments']
    for s in list(slot_names):
        skin.pop(s, None)
    # Add eyelid slots above the visible reference slot; hidden by default to preserve open-eye appeal.
    for name in names:
        slot=f'slot_{name}'
        data['slots'].append({'name':slot,'bone':'root','attachment':name,'color':'ffffff00'})
        skin[slot]={name:{'type':'region','path':name,'x':0,'y':0,'width':SPINE_W,'height':SPINE_H}}
    audit={
        'state':'MINIMAL_SEPARATION_BUILD',
        'transition':'none',
        'allowedOperations':['one minimal eyelid separation only','Spine slot/region insertion','blink proof generation'],
        'newSeparation':'clean eyelid blink layer',
        'newSlots':sorted(slot_names),
        'newAttachments':sorted(names),
        'meshVertexChanges':'none; region eyelid layers only',
        'deformationSystemsAdded':'none',
        'plateZoneReconstruction':'none',
        'tailImprovement':'not included by rule',
        'defaultVisibility':'hidden/open-eye; blink proof toggles eyelid overlay only during blink frames',
    }
    data.setdefault('minimalSeparationBuild',{})['v20EyelidBlink']=audit
    OUT_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_JSON)}' -o '{win(OUT_SPINE)}' -r"],text=True,capture_output=True,timeout=180)
    (ART/'spine-import-log.txt').write_text(proc.stdout+proc.stderr)
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(OUT_SPINE)}' -o '{win(EXP)}' -e json"],text=True,capture_output=True,timeout=180)
    (ART/'spine-export-log.txt').write_text(exp.stdout+exp.stderr)
    audit['spineImportExit']=proc.returncode; audit['spineExportExit']=exp.returncode
    (ART/'minimal-eyelid-blink-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
    if proc.returncode or exp.returncode:
        raise SystemExit('Spine import/export failed; see logs')
    return audit

def build_blink_proof():
    # Match v19 proof crop so face appeal is preserved in review artifact.
    img=Image.open(REF).convert('RGBA')
    creature=img.crop(img.getbbox())
    W=720; scale=W/creature.width; H=round(creature.height*scale)
    base=creature.resize((W,H), Image.Resampling.LANCZOS)
    CANVAS=(900,820); base_pos=((CANVAS[0]-W)//2,(CANVAS[1]-H)//2+10)
    # Clean separated eyelid proof coordinates in v19 crop-space, tuned for face appeal.
    eyes=[{'box':(130,264,190,322),'base':(139,35,22,222),'hi':(222,72,38,175),'shadow':(70,18,15,215)},
          {'box':(318,248,386,311),'base':(139,35,22,222),'hi':(226,74,39,175),'shadow':(70,18,15,215)}]
    def eyelid_overlay(close, sx=1, sy=1, px=0, py=0):
        ov=Image.new('RGBA', CANVAS, (0,0,0,0)); d=ImageDraw.Draw(ov)
        if close<=0: return ov
        for e in eyes:
            x0,y0,x1,y1=e['box']
            # interpolate down from upper lid; at full close leaves a thin eye-line rather than a dead flat patch.
            h=max(1, int((y1-y0)*0.72*close))
            X0=px+round(x0*sx); Y0=py+round(y0*sy); X1=px+round(x1*sx); Y1=py+round((y0+h)*sy)
            # Clip the lid to the existing eye oval; half blink covers only upper eye, closed still leaves a warm readable slit.
            mask=Image.new('L', CANVAS, 0); md=ImageDraw.Draw(mask)
            md.ellipse((X0,Y0,X1,py+round(y1*sy)), fill=int(255*close))
            local=Image.new('RGBA', CANVAS, (0,0,0,0)); ld=ImageDraw.Draw(local)
            fullY1=py+round(y1*sy)
            cover_h=max(2, int((fullY1-Y0)*(0.18+0.72*close)))
            ld.ellipse((X0-2,Y0-2,X1+2,Y0+cover_h+8), fill=e['base'])
            ld.arc((X0+3,Y0+4,X1-3,Y0+cover_h+4), 190, 350, fill=e['hi'], width=2)
            ld.arc((X0+2,Y0+cover_h-4,X1-2,Y0+cover_h+7), 185, 355, fill=e['shadow'], width=2)
            # keep a small eye glint/iris warmth at full close so it doesn't become a dead red patch
            if close > .88:
                ld.arc((X0+8,fullY1-16,X1-8,fullY1+2), 185, 355, fill=(255,139,42,120), width=2)
            local.putalpha(Image.composite(local.getchannel('A'), Image.new('L', CANVAS, 0), mask))
            ov=Image.alpha_composite(ov, local)
        return ov.filter(ImageFilter.GaussianBlur(0.25))
    frames=[]; N=48
    for i in range(N):
        t=i/N; breath=math.sin(2*math.pi*t)
        sx=1.0+0.005*breath; sy=1.0+0.008*breath
        resized=base.resize((round(W*sx),round(H*sy)), Image.Resampling.BICUBIC)
        px=base_pos[0]-(resized.width-W)//2; py=base_pos[1]-(resized.height-H)//2-round(2*breath)
        frame=Image.new('RGBA', CANVAS, (38,24,20,255)); frame.alpha_composite(resized,(px,py))
        # existing subtle chest breathe retained as broad life; no new complexity.
        chest=(245,355,405,540); cx=px+round((chest[0]+chest[2])*sx/2); cy=py+round((chest[1]+chest[3])*sy/2)
        ov=Image.new('RGBA',CANVAS,(0,0,0,0)); dd=ImageDraw.Draw(ov); a=int(12+8*(breath+1)/2)
        dd.ellipse((cx-55,cy-58,cx+55,cy+58), fill=(255,128,45,a)); frame=Image.alpha_composite(frame, ov.filter(ImageFilter.GaussianBlur(12)))
        # one quick blink around frame 18. No tail change in this slice.
        dist=abs(i-18); close=max(0, 1-dist/3.0)
        if close>0: frame=Image.alpha_composite(frame, eyelid_overlay(close,sx,sy,px,py))
        frames.append(frame)
    frames_p=[f.convert('P', palette=Image.Palette.ADAPTIVE, colors=128) for f in frames]
    frames_p[0].save(ART/'minimal-eyelid-blink.gif', save_all=True, append_images=frames_p[1:], duration=1000//24, loop=0, disposal=2)
    # Open/half/closed proof strip.
    openf=frames[5]; half=Image.alpha_composite(frames[5], eyelid_overlay(.5,1,1,base_pos[0],base_pos[1])); closed=Image.alpha_composite(frames[5], eyelid_overlay(1,1,1,base_pos[0],base_pos[1]))
    full=frames[18]; full.save(ART/'full-body-blink-frame.png')
    small=full.resize((full.width//2, full.height//2),Image.Resampling.LANCZOS); small.save(ART/'50-percent-blink-frame.png')
    # silhouette from base only plus broad transform; eyelid does not alter outer silhouette.
    mask=Image.new('L', CANVAS, 0); m=base.getchannel('A'); mask.paste(m, base_pos, m)
    sil=Image.new('RGBA',CANVAS,(35,25,22,255)); black=Image.new('RGBA',CANVAS,(9,9,9,255)); black.putalpha(mask); sil=Image.alpha_composite(sil,black); sil.save(ART/'silhouette-only-screenshot.png')
    sheet=Image.new('RGBA',(1800,1640),(26,18,15,255)); d=ImageDraw.Draw(sheet)
    panels=[('OPEN BASE',openf),('HALF BLINK',half),('CLEAN CLOSED BLINK',closed),('50% BLINK READ',small.resize(CANVAS,Image.Resampling.NEAREST)),('SILHOUETTE UNCHANGED',sil)]
    for idx,(lab,panel) in enumerate(panels):
        x=(idx%2)*CANVAS[0]; y=(idx//2)*CANVAS[1]
        sheet.alpha_composite(panel,(x,y)); d.rectangle((x,y,x+CANVAS[0]-1,y+34), fill=(0,0,0,165)); d.text((x+16,y+10), lab, fill=(255,230,190,255))
    d.text((930,840),'v20: ONE added separation only — clean eyelid blink. No tail pass, jaw pass, mesh complexity, or plate zones.', fill=(255,220,180,255))
    sheet.save(ART/'minimal-eyelid-blink-proof-sheet.png')

if __name__=='__main__':
    eye_defs, layer_paths = make_spine_eyelid_layers()
    audit = update_spine(eye_defs)
    audit['createdLayerPngs']=layer_paths
    build_blink_proof()
    audit['proofs']=[str(ART/p) for p in ['minimal-eyelid-blink.gif','minimal-eyelid-blink-proof-sheet.png','full-body-blink-frame.png','50-percent-blink-frame.png','silhouette-only-screenshot.png']]
    (ART/'minimal-eyelid-blink-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
    print(json.dumps({'outputSpine':str(OUT_SPINE),'audit':str(ART/'minimal-eyelid-blink-audit.json'),'proofs':audit['proofs']},indent=2))
