from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path.cwd()
DEFAULT_ORA = ROOT / 'assets/dragons/layers/fire-hatchling/krita-workflow/fire-hatchling-layer-workflow.ora'
OUT = ROOT / 'assets/dragons/layers/fire-hatchling/manual'
CONTACT = OUT / 'manual-layer-contact-proof.png'
W, H = 1536, 1024

NAME_MAP = {
    'body': ['body'],
    'head': ['head'],
    'wing-near': ['near wing', 'wing_near', 'wing-near', 'near'],
    'wing-far': ['far wing', 'wing_far', 'wing-far', 'far'],
    'tail': ['tail'],
}


def layer_entries(stack_root):
    for layer in stack_root.iter('layer'):
        yield {
            'name': (layer.attrib.get('name') or '').lower(),
            'src': layer.attrib.get('src') or '',
            'visibility': layer.attrib.get('visibility', 'visible'),
        }


def pick_layers(entries):
    picks = {}
    for target, needles in NAME_MAP.items():
        for entry in entries:
            name = entry['name']
            if 'reference' in name or 'seam' in name or 'note' in name:
                continue
            if any(n in name for n in needles):
                picks[target] = entry
                break
    missing = [k for k in NAME_MAP if k not in picks]
    if missing:
        raise SystemExit(f'Missing expected layers in ORA: {missing}. Check layer names include body/head/near wing/far wing/tail.')
    return picks


def main():
    import sys
    ora_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ORA
    if not ora_path.exists():
        raise SystemExit(f'ORA not found: {ora_path}')
    OUT.mkdir(parents=True, exist_ok=True)

    with ZipFile(ora_path, 'r') as z:
        stack_xml = z.read('stack.xml')
        root = ET.fromstring(stack_xml)
        entries = list(layer_entries(root))
        picks = pick_layers(entries)
        for target, entry in picks.items():
            with z.open(entry['src']) as src:
                im = Image.open(src).convert('RGBA')
                if im.size != (W, H):
                    raise SystemExit(f'{target} has wrong size {im.size}; expected {(W, H)}')
                out = OUT / f'{target}.png'
                im.save(out)
                print(f'exported {target}: {out.relative_to(ROOT)}')

    contact = Image.new('RGBA', (W * 2, H * 3), (36, 41, 54, 255))
    for idx, target in enumerate(['body', 'head', 'wing-near', 'wing-far', 'tail']):
        im = Image.open(OUT / f'{target}.png').convert('RGBA')
        cell = Image.new('RGBA', (W, H), (36, 41, 54, 255))
        cell.alpha_composite(im)
        x = (idx % 2) * W
        y = (idx // 2) * H
        contact.alpha_composite(cell, (x, y))
    composite = Image.new('RGBA', (W, H), (36, 41, 54, 255))
    for target in ['wing-far', 'tail', 'body', 'wing-near', 'head']:
        composite.alpha_composite(Image.open(OUT / f'{target}.png').convert('RGBA'))
    contact.alpha_composite(composite, (W, H * 2))
    contact.save(CONTACT)
    print(f'wrote {CONTACT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
