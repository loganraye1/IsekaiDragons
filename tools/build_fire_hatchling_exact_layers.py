from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path.cwd()
SOURCE = ROOT / 'assets/dragons/fire-hatchling-cutout.png'
OUT = ROOT / 'assets/dragons/layers/fire-hatchling/manual'
W, H = 1536, 1024

# Full-canvas masks. This anchored workflow keeps BODY as the approved full cutout
# so the resting dragon exactly matches current art. Moving layers are exact-canvas
# overlays from the same cutout, used only for subtle life motion.
POLYGONS = {
    'wing-far': [(305, 255), (705, 205), (890, 390), (740, 625), (395, 610), (245, 430)],
    'tail': [(185, 505), (530, 545), (650, 710), (495, 890), (235, 880), (95, 700)],
    'wing-near': [(800, 235), (1215, 300), (1370, 575), (1090, 790), (805, 625)],
    'head': [(455, 35), (1035, 45), (1165, 390), (940, 615), (565, 575), (350, 290)],
}

ORDER = ['body', 'wing-far', 'tail', 'wing-near', 'head']


def make_mask(poly, blur=2, grow=6):
    mask = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(poly, fill=255)
    if grow:
        mask = mask.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return mask


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SOURCE).convert('RGBA')
    if src.size != (W, H):
        raise SystemExit(f'Unexpected source size {src.size}')
    alpha = src.getchannel('A')

    # Anchor/base: exact approved full cutout.
    src.save(OUT / 'body.png')
    print(f'wrote {(OUT / "body.png").relative_to(ROOT)} bbox={src.getbbox()}')

    for name, poly in POLYGONS.items():
        layer = src.copy()
        mask = ImageChops.multiply(make_mask(poly), alpha)
        layer.putalpha(mask)
        out = OUT / f'{name}.png'
        layer.save(out)
        print(f'wrote {out.relative_to(ROOT)} bbox={layer.getbbox()}')

    # Proof contact: individual overlays plus rest composite. Rest composite should match source.
    proof = Image.new('RGBA', (W * 2, H * 3), (36, 41, 54, 255))
    for i, name in enumerate(ORDER):
        cell = Image.new('RGBA', (W, H), (36, 41, 54, 255))
        cell.alpha_composite(Image.open(OUT / f'{name}.png').convert('RGBA'))
        x = (i % 2) * W
        y = (i // 2) * H
        proof.alpha_composite(cell, (x, y))
    composite = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for name in ORDER:
        composite.alpha_composite(Image.open(OUT / f'{name}.png').convert('RGBA'))
    proof.alpha_composite(composite, (W, H * 2))
    proof.save(OUT / 'manual-layer-contact-proof.png')
    composite.save(OUT / 'manual-rest-composite.png')
    print(f'wrote {(OUT / "manual-layer-contact-proof.png").relative_to(ROOT)}')
    print(f'wrote {(OUT / "manual-rest-composite.png").relative_to(ROOT)}')


if __name__ == '__main__':
    main()
