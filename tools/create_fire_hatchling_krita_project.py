from pathlib import Path
from zipfile import ZipFile, ZIP_STORED, ZIP_DEFLATED
from xml.sax.saxutils import escape
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path.cwd()
SOURCE = ROOT / 'assets/dragons/fire-hatchling-cutout.png'
OUT_DIR = ROOT / 'assets/dragons/layers/fire-hatchling/krita-workflow'
ORA_PATH = OUT_DIR / 'fire-hatchling-layer-workflow.ora'
CONTACT_PATH = OUT_DIR / 'fire-hatchling-layer-workflow-contact.png'
W, H = 1536, 1024

LAYER_ORDER = [
    ('reference_locked_do_not_edit', 'Reference - approved cutout (do not edit)', None),
    ('body_paint_here', 'BODY paint here', [(470, 360), (1015, 340), (1135, 730), (880, 900), (485, 805), (365, 570)]),
    ('head_paint_here', 'HEAD + HORNS paint here', [(535, 65), (990, 80), (1095, 405), (940, 590), (600, 545), (420, 310)]),
    ('wing_far_paint_here', 'FAR WING paint here', [(410, 285), (740, 245), (875, 430), (710, 635), (440, 595), (315, 430)]),
    ('tail_paint_here', 'TAIL paint here', [(285, 520), (555, 560), (600, 785), (335, 895), (175, 755)]),
    ('wing_near_paint_here', 'NEAR WING paint here', [(830, 265), (1190, 330), (1310, 590), (1055, 760), (835, 585)]),
    ('seam_notes_red', 'RED seam notes / hidden-area paint needs', None),
]


def ensure_rgba(path: Path) -> Image.Image:
    im = Image.open(path).convert('RGBA')
    if im.size != (W, H):
        raise SystemExit(f'Expected {W}x{H}, got {im.size} for {path}')
    return im


def masked_seed(reference: Image.Image, polygon):
    mask = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(10))
    # Preserve exact canvas registration. This is a guide seed, not final art.
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    seed = reference.copy()
    alpha = Image.composite(mask, Image.new('L', (W, H), 0), reference.getchannel('A'))
    seed.putalpha(alpha)
    out.alpha_composite(seed)
    return out


def seam_notes():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    red = (255, 40, 40, 180)
    # Approximate joints that need painted overlap cleanup.
    for box in [(565, 390, 760, 560), (820, 420, 1030, 610), (500, 560, 670, 720), (705, 650, 900, 830)]:
        draw.ellipse(box, outline=red, width=7)
    draw.text((60, 60), 'Paint hidden overlap at circled joints before exporting final layers.', fill=red)
    return im


def make_contact(layers):
    bg = Image.new('RGBA', (W * 2, H * 4), (36, 41, 54, 255))
    for i, (_, name, im) in enumerate(layers):
        x = (i % 2) * W
        y = (i // 2) * H
        cell = Image.new('RGBA', (W, H), (36, 41, 54, 255))
        cell.alpha_composite(im)
        d = ImageDraw.Draw(cell)
        d.rectangle((20, 20, 760, 80), fill=(0, 0, 0, 150))
        d.text((36, 38), name, fill=(255, 255, 255, 255))
        bg.alpha_composite(cell, (x, y))
    bg.convert('RGB').save(CONTACT_PATH)


def ora_stack_xml(layers):
    layer_tags = []
    # OpenRaster draws top-to-bottom in many apps; keep note/reference visible, editable seeds available.
    for filename, name, _ in reversed(layers):
        layer_tags.append(
            f'      <layer name="{escape(name)}" src="data/{filename}.png" x="0" y="0" opacity="1.0" visibility="visible" composite-op="svg:src-over"/>'
        )
    return '\n'.join([
        f'<image w="{W}" h="{H}" version="0.0.3">',
        '  <stack name="root">',
        *layer_tags,
        '  </stack>',
        '</image>',
        ''
    ])


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ref = ensure_rgba(SOURCE)
    layers = []
    for filename, name, polygon in LAYER_ORDER:
        if filename == 'reference_locked_do_not_edit':
            im = ref
        elif filename == 'seam_notes_red':
            im = seam_notes()
        else:
            im = masked_seed(ref, polygon)
        out = OUT_DIR / f'{filename}.png'
        im.save(out)
        layers.append((filename, name, im))
        print(f'wrote {out.relative_to(ROOT)}')

    merged = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    # Contact/preview should show reference faintly plus paint seeds.
    preview_ref = ref.copy()
    preview_ref.putalpha(90)
    merged.alpha_composite(preview_ref)
    for filename, _, im in layers:
        if filename not in ('reference_locked_do_not_edit', 'seam_notes_red'):
            merged.alpha_composite(im)
    merged_path = OUT_DIR / 'mergedimage.png'
    merged.save(merged_path)
    thumb = merged.copy()
    thumb.thumbnail((256, 171))
    thumb_path = OUT_DIR / 'thumbnail.png'
    thumb.save(thumb_path)
    make_contact(layers)

    stack_xml = ora_stack_xml(layers)
    stack_path = OUT_DIR / 'stack.xml'
    stack_path.write_text(stack_xml, encoding='utf-8')

    with ZipFile(ORA_PATH, 'w') as z:
        z.writestr('mimetype', 'image/openraster', compress_type=ZIP_STORED)
        z.write(stack_path, 'stack.xml', compress_type=ZIP_DEFLATED)
        z.write(merged_path, 'mergedimage.png', compress_type=ZIP_DEFLATED)
        z.write(thumb_path, 'Thumbnails/thumbnail.png', compress_type=ZIP_DEFLATED)
        for filename, _, _ in layers:
            z.write(OUT_DIR / f'{filename}.png', f'data/{filename}.png', compress_type=ZIP_DEFLATED)

    print(f'wrote {ORA_PATH.relative_to(ROOT)}')
    print(f'wrote {CONTACT_PATH.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
