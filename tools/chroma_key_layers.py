from pathlib import Path
from PIL import Image

ROOT = Path('assets/dragons/layers/fire-hatchling')
FILES = ['body', 'head', 'wing-near', 'wing-far', 'tail']

def key_green(im: Image.Image) -> Image.Image:
    rgba = im.convert('RGBA')
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Remove chroma-green matte while preserving warm dragon colors.
            if g > 145 and g > r * 1.55 and g > b * 1.55:
                pixels[x, y] = (r, g, b, 0)
    return rgba

for name in FILES:
    src = ROOT / f'{name}-matte.png'
    out = ROOT / f'{name}.png'
    keyed = key_green(Image.open(src))
    keyed.save(out)
    bbox = keyed.getbbox()
    print(f'{name}: saved {out} bbox={bbox}')

# Build quick composite/contact proof over neutral slate.
bg = Image.new('RGBA', (1536 * 2, 1024 * 3), (38, 43, 56, 255))
labels = []
for idx, name in enumerate(FILES):
    im = Image.open(ROOT / f'{name}.png').convert('RGBA')
    x = (idx % 2) * 1536
    y = (idx // 2) * 1024
    bg.alpha_composite(im, (x, y))
# Composite all layers in expected z order in bottom-right cell.
composite = Image.new('RGBA', (1536, 1024), (38, 43, 56, 255))
for name in ['wing-far', 'tail', 'body', 'wing-near', 'head']:
    composite.alpha_composite(Image.open(ROOT / f'{name}.png').convert('RGBA'))
bg.alpha_composite(composite, (1536, 2048))
bg.convert('RGB').save(ROOT / 'layer-contact-proof.jpg', quality=90)
print('proof:', ROOT / 'layer-contact-proof.jpg')
