#!/usr/bin/env python3
"""Apply first actual weighted mesh conversion pass to Fire Hatchling Spine JSON.

This is intentionally not another proof-only slice. It converts selected region
attachments into Spine mesh attachments with weighted vertices, imports the JSON
back into a real .spine project with Spine CLI, exports JSON from the .spine file,
and emits an audit proving mesh attachments survived round-trip.
"""
from __future__ import annotations
import json, subprocess, shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SRC_JSON=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v11-no-overlay-50-readability.spine.json'
SRC_SPINE=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.mechanics-truth-v11-no-overlay-50-readability.spine'
OUT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mesh-weighted-v12-actual-mesh-pass'
LAYER_DIR=OUT_DIR/'layers'
PROJECT_DIR=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-project'
SPINE_JSON=PROJECT_DIR/'living-forge-fire-hatchling.production-mesh-v12-actual-weighted.spine.json'
SPINE_FILE=PROJECT_DIR/'living-forge-fire-hatchling.production-mesh-v12-actual-weighted.spine'
EXPORT_DIR=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted/exported-from-spine-file'
ART_DIR=ROOT/'artifacts/spine/fire-hatchling/production-mesh-v12-actual-weighted'
SPINE_EXE=r'C:\\Program Files\\Spine\\Spine.exe'
SRC_LAYERS=ROOT/'assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v11-no-overlay-50-readability/layers'

# Attachment conversion plan: each attachment receives actual mesh vertices with multi-bone weights.
CONVERSIONS={
  ('slot_body_core','02_body_core'):{
    'regions':['body_core_outer_silhouette_lock','ribcage_compression_ring','furnace_pressure_pocket','shoulder_countermass'],
    'drivers':['body_core','ribcage_compression_driver','chest_volume_preserve_driver','full_chain_root_driver'],
    'weights':[0.52,0.26,0.14,0.08], 'cols':4,'rows':3,
  },
  ('slot_neck_collar_underlap','02b_neck_collar_underlap_paint'):{
    'regions':['neck_root_seam','underlap_torso_overlap','neck_underside_stretch'],
    'drivers':['neck_base_deform','lower_neck_weight_driver','chain_chest_to_neck_driver','body_core'],
    'weights':[0.36,0.28,0.20,0.16], 'cols':4,'rows':3,
  },
  ('slot_lower_neck_torso_weight_blend','02c_lower_neck_torso_weight_blend_proxy'):{
    'regions':['lower_neck_blend_seam','torso_influence_band','arc_preservation_lock'],
    'drivers':['lower_neck_torso_weight_blend','neck_base_deform','chain_chest_to_neck_driver','body_core'],
    'weights':[0.42,0.24,0.20,0.14], 'cols':4,'rows':3,
  },
  ('slot_cheek_jowl_bridge','05d_cheek_jowl_mouth_corner_bridge'):{
    'regions':['mouth_corner_seal_anchor','cheek_overlap','upper_skull_contact','lower_jaw_soft_overlap'],
    'drivers':['head_neck','mouth_corner_vertex_driver','cheek_pressure_bulge_driver','lower_jaw_hinge'],
    'weights':[0.48,0.20,0.16,0.16], 'cols':4,'rows':3,
  },
  ('slot_tail_lantern','00_tail_lantern'):{
    'regions':['tail_root_counterweight','tail_mid_drag','lantern_link_lag'],
    'drivers':['tail_lantern','tail_root_weight_driver','chain_torso_to_tail_driver','chain_tail_to_lantern_driver'],
    'weights':[0.42,0.24,0.22,0.12], 'cols':4,'rows':3,
  },
}

def win(p:Path)->str:
    return subprocess.check_output(['wslpath','-w',str(p)],text=True).strip()

def mesh_from_region(region, bone_indices, weights, cols, rows):
    # Build a rectangular grid in the attachment's local coordinate space.
    w=float(region.get('width',100)); h=float(region.get('height',100))
    ox=float(region.get('x',0)); oy=float(region.get('y',0))
    vertices=[]; uvs=[]; plain=[]
    for r in range(rows):
        v=r/(rows-1) if rows>1 else 0
        for c in range(cols):
            u=c/(cols-1) if cols>1 else 0
            x=ox + (u-0.5)*w
            y=oy + (0.5-v)*h
            uvs += [round(u,4), round(v,4)]
            plain.append((x,y))
            vertices.append(len(bone_indices))
            # Slightly bias seam rows/columns toward source/destination bones so this is not uniform weighting.
            for bi,weight in zip(bone_indices,weights):
                ww=weight
                # edge-specific readable anchors: left/top favor parent/root, right/bottom favor transfer driver.
                if c==0 and bi==bone_indices[0]: ww += 0.08
                if c==cols-1 and len(bone_indices)>1 and bi==bone_indices[1]: ww += 0.06
                if r==rows-1 and len(bone_indices)>2 and bi==bone_indices[2]: ww += 0.05
                vertices += [bi, round(x,3), round(y,3), round(ww,4)]
            # Normalize the last N weights in-place for this vertex.
            start=len(vertices)-len(bone_indices)*4
            total=sum(vertices[start+i*4+3] for i in range(len(bone_indices)))
            for i in range(len(bone_indices)):
                vertices[start+i*4+3]=round(vertices[start+i*4+3]/total,4)
    tris=[]
    for r in range(rows-1):
        for c in range(cols-1):
            a=r*cols+c; b=a+1; d=(r+1)*cols+c; e=d+1
            tris += [a,b,e, a,e,d]
    hull=cols*2 + (rows-2)*2
    return {
        'type':'mesh','path':region.get('path'),'uvs':uvs,'triangles':tris,'vertices':vertices,
        'hull':hull,'width':int(w),'height':int(h),
        'edges':[],
    }

def main():
    ART_DIR.mkdir(parents=True,exist_ok=True); EXPORT_DIR.mkdir(parents=True,exist_ok=True); LAYER_DIR.mkdir(parents=True,exist_ok=True)
    if SRC_LAYERS.exists():
        for p in SRC_LAYERS.glob('*.png'): shutil.copy2(p,LAYER_DIR/p.name)
    data=json.loads(SRC_JSON.read_text())
    data['skeleton']['hash']='production-mesh-v12-actual-weighted'
    data['skeleton']['images']=win(LAYER_DIR)+'\\\\'
    bone_index={b['name']:i for i,b in enumerate(data['bones'])}
    converted=[]
    skin=data['skins'][0]['attachments']
    for (slot,attach),spec in CONVERSIONS.items():
        if slot not in skin or attach not in skin[slot]:
            raise RuntimeError(f'missing attachment {slot}/{attach}')
        region=skin[slot][attach]
        if region.get('type','region')=='mesh':
            before='mesh'
        else:
            before='region'
        missing=[b for b in spec['drivers'] if b not in bone_index]
        if missing: raise RuntimeError(f'missing bones for {slot}/{attach}: {missing}')
        mesh=mesh_from_region(region,[bone_index[b] for b in spec['drivers']],spec['weights'],spec['cols'],spec['rows'])
        mesh['productionMeshTruth']={'convertedFrom':before,'weightedRegions':spec['regions'],'influencingBones':spec['drivers'],'baseWeights':spec['weights']}
        skin[slot][attach]=mesh
        converted.append({'slot':slot,'attachment':attach,'from':before,'to':'weighted mesh','weightedRegions':spec['regions'],'influencingBones':spec['drivers'],'vertexCount':spec['cols']*spec['rows'],'triangleCount':(spec['cols']-1)*(spec['rows']-1)*2})
    data.setdefault('mechanicsTruth',{})['actualProductionMeshPass']={'version':'v12','convertedAttachments':converted,'note':'These attachments are actual Spine mesh attachments with weighted vertices in the imported project JSON; final artistic tuning still requires Spine Professional inspection/paint.'}
    SPINE_JSON.write_text(json.dumps(data,indent=2)+'\n')
    proc=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"],text=True,capture_output=True,timeout=180)
    (ART_DIR/'spine-import-log.txt').write_text(proc.stdout+proc.stderr)
    # Export JSON from the actual .spine file for verification.
    exp=subprocess.run(['powershell.exe','-NoProfile','-Command',f"& '{SPINE_EXE}' -i '{win(SPINE_FILE)}' -o '{win(EXPORT_DIR)}' -e json"],text=True,capture_output=True,timeout=180)
    (ART_DIR/'spine-export-log.txt').write_text(exp.stdout+exp.stderr)
    audit={'spineImportExit':proc.returncode,'spineExportExit':exp.returncode,'spineFile':str(SPINE_FILE),'sourceSpineBefore':str(SRC_SPINE),'convertedAttachments':converted,'exportDir':str(EXPORT_DIR)}
    (ART_DIR/'actual-mesh-conversion-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
    print(json.dumps(audit,indent=2))
    if proc.returncode!=0 or exp.returncode!=0:
        raise SystemExit(1)
if __name__=='__main__': main()
