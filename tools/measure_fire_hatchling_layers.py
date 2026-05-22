from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT = Path.cwd()
SRC = ROOT / 'assets/dragons/fire-hatchling-cutout.png'
LAYER_DIR = ROOT / 'assets/dragons/layers/fire-hatchling/manual'
ORDER = ['body', 'wing-far', 'tail', 'wing-near', 'head']
OUT = LAYER_DIR / 'manual-rest-diff.png'
REPORT = LAYER_DIR / 'manual-layer-quality-report.txt'

src = Image.open(SRC).convert('RGBA')
comp = Image.new('RGBA', src.size, (0, 0, 0, 0))
for name in ORDER:
    comp.alpha_composite(Image.open(LAYER_DIR / f'{name}.png').convert('RGBA'))

# Alpha/visual diff. Amplify for visibility.
diff = ImageChops.difference(src, comp)
stat = ImageStat.Stat(diff)
mean = stat.mean
rms = stat.rms
bbox = diff.getbbox()
alpha_src = src.getchannel('A')
alpha_comp = comp.getchannel('A')
alpha_diff = ImageChops.difference(alpha_src, alpha_comp)
alpha_bbox = alpha_diff.getbbox()
alpha_stat = ImageStat.Stat(alpha_diff)

amp = diff.point(lambda p: min(255, p * 8))
checker = Image.new('RGBA', src.size, (34, 38, 50, 255))
checker.alpha_composite(amp)
checker.save(OUT)

lines = [
    'Fire hatchling manual layer quality report',
    f'source={SRC}',
    f'layer_dir={LAYER_DIR}',
    f'order={ORDER}',
    f'diff_bbox={bbox}',
    f'alpha_diff_bbox={alpha_bbox}',
    f'mean_rgba_diff={[round(v, 3) for v in mean]}',
    f'rms_rgba_diff={[round(v, 3) for v in rms]}',
    f'mean_alpha_diff={round(alpha_stat.mean[0], 3)}',
    f'rms_alpha_diff={round(alpha_stat.rms[0], 3)}',
]
for name in ORDER:
    im = Image.open(LAYER_DIR / f'{name}.png').convert('RGBA')
    lines.append(f'{name}_bbox={im.getbbox()}')
REPORT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('\n'.join(lines))
print(f'wrote {OUT.relative_to(ROOT)}')
print(f'wrote {REPORT.relative_to(ROOT)}')
