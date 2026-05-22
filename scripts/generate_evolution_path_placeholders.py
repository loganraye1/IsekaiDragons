#!/usr/bin/env python3
"""Generate deterministic placeholder art for Young Dragon / Dragon / Ancient paths.

These are intentionally rough, transparent UI placeholders for branch readability,
not final production art.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import math
import re
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets/dragons/placeholders/evolution-branches-2026-05-11"
OUT = BASE / "evolution-paths"
DOCS = ROOT / "docs"
SIZE = 512

ELEMENTS = {
    "fire": {"primary": (239, 82, 35), "accent": (255, 210, 56), "drakes": [
        ("flame", "Flame Drake", "Direct burn DPS", "sleek", ["flame mane", "breath flare", "ember crown"], ("Inferno", "Volcanic")),
        ("smoke", "Smoke Drake", "Evasion + blind", "serpentine", ["smoke veil", "dash streaks", "ash wisps"], ("Ashen", "Cinderfang")),
        ("magma", "Magma Drake", "Bruiser + molten armor", "heavy", ["lava cracks", "rock plates", "club tail"], ("Lava", "Obsidian")),
    ]},
    "water": {"primary": (42, 135, 232), "accent": (130, 236, 255), "drakes": [
        ("tide", "Tide Drake", "Sustain + soak", "smooth", ["wave fins", "water orbs", "flowing tail"], ("River", "Wavecrash")),
        ("frost", "Frost Drake", "Shield + slow", "angular", ["ice spikes", "frost aura", "crystal tail"], ("Glacier", "Hailstorm")),
        ("mist", "Mist Drake", "Dodge + healing utility", "wispy", ["mist clouds", "soft wings", "ghost tail"], ("Cloud", "Mirage")),
    ]},
    "earth": {"primary": (90, 128, 75), "accent": (198, 164, 90), "drakes": [
        ("stone", "Stone Drake", "Block tank", "chunky", ["stone plates", "square horns", "boulder tail"], ("Mountain", "Ironhide")),
        ("thorn", "Thorn Drake", "Retaliation + roots", "spiky", ["thorns", "vines", "barbed tail"], ("Briar", "Venomroot")),
        ("crystal", "Crystal Drake", "Reflect + crit", "prismatic", ["crystal spikes", "facets", "prism burst"], ("Gem", "Prism")),
    ]},
    "light": {"primary": (245, 205, 92), "accent": (255, 250, 205), "drakes": [
        ("dawn", "Dawn Drake", "Healing + safe progression", "gentle", ["halo", "soft rays", "rounded wings"], ("Solar", "Guardian")),
        ("stormlight", "Stormlight Drake", "Crit + speed", "aerial", ["lightning", "streamer wings", "fork tail"], ("Tempest", "Star")),
        ("sacred", "Sacred Drake", "Cleanse + boss resilience", "regal", ["crown horns", "rune ring", "banner wings"], ("Seraph", "Judgment")),
    ]},
    "dark": {"primary": (72, 52, 112), "accent": (170, 105, 255), "drakes": [
        ("shadow", "Shadow Drake", "Dodge + stealth crit", "blade", ["shadow blades", "crescent tail", "low profile"], ("Night", "Voidstep")),
        ("blood", "Blood Drake", "Lifesteal + risk", "predator", ["fangs", "blood orbs", "hook wings"], ("Vampiric", "Ravager")),
        ("curse", "Curse Drake", "Debuff + execute", "warlock", ["hex runes", "crooked horns", "curse smoke"], ("Hex", "Reaper")),
    ]},
}

DRAGON_SUFFIXES = {
    "intensify": ["Sovereign", "Avatar"],
    "hybrid": ["Warden", "Ravager"],
}
ANCIENT_PREFIXES = {
    "mastery": ["Ancient", "Elder"],
    "forbidden": ["Primordial", "Doom"],
}


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def font(size: int, bold: bool = False):
    path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

F_TITLE = font(28, True)
F_MED = font(16, True)
F_SMALL = font(12)


def darker(c, amt=.55): return tuple(max(0, int(v * amt)) for v in c)
def lighter(c, amt=.32): return tuple(min(255, int(v + (255 - v) * amt)) for v in c)
def rgba(c, a=255): return (*c, a)

@dataclass
class Branch:
    tier: str
    element: str
    drake_key: str
    parent_name: str
    name: str
    role: str
    silhouette: str
    motifs: list[str]
    primary: tuple[int, int, int]
    accent: tuple[int, int, int]
    lineage: str
    axis: str


def build_branches() -> list[Branch]:
    rows: list[Branch] = []
    for element, ed in ELEMENTS.items():
        for dkey, dname, role, silhouette, motifs, youngs in ed["drakes"]:
            for yi, y in enumerate(youngs):
                axis = "intensify" if yi == 0 else "hybrid"
                yname = f"{y} Young Dragon"
                ymotifs = motifs + (["larger wing sails", "first aura crown"] if axis == "intensify" else ["split motif", "trick tail"])
                rows.append(Branch("young", element, dkey, dname, yname, role, silhouette, ymotifs, ed["primary"], ed["accent"], f"{element}/{dkey}/{slug(y)}", axis))
                for di, dsuf in enumerate(DRAGON_SUFFIXES[axis]):
                    dname2 = f"{y} {dsuf} Dragon"
                    daxis = "mastery" if di == 0 else "forbidden"
                    dmotifs = ymotifs + (["city-scale wings", "dominant crest"] if daxis == "mastery" else ["broken halo", "danger glow"])
                    rows.append(Branch("dragon", element, dkey, yname, dname2, role, silhouette, dmotifs, ed["primary"], ed["accent"], f"{element}/{dkey}/{slug(y)}/{slug(dsuf)}", daxis))
                    for ai, aprefix in enumerate(ANCIENT_PREFIXES[daxis]):
                        aname = f"{aprefix} {y} {dsuf} Dragon"
                        amotifs = dmotifs + (["mythic aura", "colossal horns"] if ai == 0 else ["forbidden aura", "world-scar mark"])
                        rows.append(Branch("ancient", element, dkey, dname2, aname, role, silhouette, amotifs, ed["primary"], ed["accent"], f"{element}/{dkey}/{slug(y)}/{slug(dsuf)}/{slug(aprefix)}", daxis))
    return rows


def poly(d, pts, fill, outline=None, width=1):
    d.polygon(pts, fill=fill, outline=outline)
    if outline and width > 1:
        d.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


def line(d, pts, fill, width=6): d.line(pts, fill=fill, width=width, joint="curve")
def ellipse(d, box, fill, outline=None, width=1): d.ellipse(box, fill=fill, outline=outline, width=width)


def draw_symbol(d, motif: str, x: int, y: int, accent, primary, scale: float = 1.0):
    s = scale
    if any(k in motif for k in ["flame", "ember", "burn", "sun"]):
        poly(d, [(x, y+32*s), (x+14*s, y), (x+28*s, y+32*s)], rgba(accent, 210), rgba(darker(primary), 170), 2)
    elif any(k in motif for k in ["smoke", "mist", "cloud", "veil", "wisps"]):
        for dx, dy, r in [(0, 8, 16), (16, 0, 12), (30, 10, 14)]: ellipse(d, (x+dx-r, y+dy-r, x+dx+r, y+dy+r), rgba(lighter(accent), 92))
    elif any(k in motif for k in ["lava", "crack", "obsidian", "danger"]):
        line(d, [(x, y), (x+12*s, y+20*s), (x+5*s, y+40*s), (x+26*s, y+58*s)], rgba(accent, 220), max(3, int(5*s)))
    elif any(k in motif for k in ["wave", "water", "flow", "tide"]):
        d.arc((x, y, x+48*s, y+36*s), 180, 360, fill=rgba(accent, 200), width=max(3, int(5*s)))
        d.arc((x+18*s, y+8*s, x+66*s, y+44*s), 180, 360, fill=rgba(accent, 150), width=max(2, int(4*s)))
    elif any(k in motif for k in ["ice", "frost", "crystal", "prism", "facet", "shard"]):
        poly(d, [(x+18*s, y), (x+36*s, y+35*s), (x+17*s, y+62*s), (x, y+28*s)], rgba(accent, 185), rgba((255,255,255), 160), 2)
    elif any(k in motif for k in ["thorn", "vine", "root", "barbed", "briar"]):
        line(d, [(x, y+45*s), (x+16*s, y+25*s), (x+38*s, y+18*s), (x+58*s, y)], rgba((45, 150, 72), 205), max(3, int(5*s)))
        for px, py in [(16,25),(38,18)]: poly(d, [(x+px*s, y+py*s), (x+(px+10)*s, y+(py-18)*s), (x+(px+13)*s, y+(py+4)*s)], rgba(accent, 160))
    elif any(k in motif for k in ["halo", "rune", "sacred", "crown"]):
        d.ellipse((x, y, x+58*s, y+38*s), outline=rgba(accent, 220), width=max(3, int(5*s)))
    elif any(k in motif for k in ["lightning", "storm", "tempest"]):
        line(d, [(x+20*s, y), (x, y+34*s), (x+24*s, y+29*s), (x+2*s, y+68*s)], rgba(accent, 230), max(4, int(7*s)))
    elif any(k in motif for k in ["shadow", "blade", "crescent", "night"]):
        poly(d, [(x, y+35*s), (x+58*s, y), (x+30*s, y+58*s)], rgba(darker(primary, .42), 185), rgba(accent, 120), 2)
    elif any(k in motif for k in ["blood", "fang", "vamp", "predator"]):
        ellipse(d, (x, y, x+34*s, y+45*s), rgba((220, 24, 64), 200), rgba((255, 180, 190), 120), 2)
    elif any(k in motif for k in ["hex", "curse", "doom", "forbidden"]):
        d.regular_polygon((x+28*s, y+28*s, 28*s), 6, outline=rgba(accent, 210), width=max(3, int(4*s)))
    else:
        ellipse(d, (x, y, x+42*s, y+42*s), rgba(accent, 140))


def geometry(tier: str, silhouette: str):
    # Coordinates in final 512 space. Higher tiers become larger and more dramatic.
    mult = {"young": 1.00, "dragon": 1.14, "ancient": 1.27}[tier]
    low = silhouette in {"serpentine", "wispy", "blade"}
    heavy = silhouette in {"heavy", "chunky", "regal"}
    body_h = 96 * mult if not heavy else 118 * mult
    body_w = 210 * mult if not low else 190 * mult
    cx, cy = 258, 284 if tier == "young" else 274
    body = (cx-body_w/2, cy-body_h/2, cx+body_w/2, cy+body_h/2)
    head = (360, 160 if tier != "young" else 176, 448, 235 if tier != "young" else 246)
    if tier == "ancient": head = (350, 130, 462, 226)
    neck = [(322, 232), (378, head[1]+18), (418, head[1]+42), (350, 276)]
    tail = [(body[0]+18, cy+12), (72, cy-34 if low else cy-4), (35, cy+20), (body[0]+10, cy+45)]
    wing1 = [(232, 228), (136 if tier=="young" else 82, 98 if tier=="young" else 52), (306, 192)]
    wing2 = [(280, 228), (410 if tier=="young" else 456, 96 if tier=="young" else 48), (354, 216)]
    if heavy:
        wing1[1] = (156 if tier=="young" else 112, 112 if tier=="young" else 80)
        wing2[1] = (392 if tier=="young" else 430, 112 if tier=="young" else 80)
    return body, head, neck, tail, wing1, wing2


def draw_branch(b: Branch) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    d = ImageDraw.Draw(img, "RGBA")
    p, a, out = b.primary, b.accent, darker(b.primary, .38)
    # aura: small for young, large for ancient
    aura = {"young": [(175, 28), (115, 38)], "dragon": [(215, 30), (150, 42)], "ancient": [(245, 35), (180, 50), (112, 58)]}[b.tier]
    for r, alpha in aura:
        ellipse(d, (256-r, 256-r, 256+r, 256+r), rgba(a, alpha))
    ellipse(d, (70, 388, 454, 442), (0,0,0,55))

    body, head, neck, tail, wing1, wing2 = geometry(b.tier, b.silhouette)
    # wings behind
    poly(d, [(int(x),int(y)) for x,y in wing1], rgba(lighter(p,.12), 210), rgba(out, 230), 6)
    poly(d, [(int(x),int(y)) for x,y in wing2], rgba(lighter(p,.18), 210), rgba(out, 230), 6)
    for wing in (wing1, wing2):
        line(d, [wing[0], wing[1], wing[2]], rgba(darker(p,.68), 175), 4)
        if b.tier in {"dragon", "ancient"}:
            mid = ((wing[0][0]+wing[1][0])/2, (wing[0][1]+wing[1][1])/2)
            line(d, [mid, wing[2]], rgba(darker(p,.72), 150), 3)

    poly(d, [(int(x),int(y)) for x,y in tail], rgba(p, 242), rgba(out,255), 6)
    ellipse(d, tuple(int(v) for v in body), rgba(p, 248), rgba(out,255), 7)
    poly(d, [(int(x),int(y)) for x,y in neck], rgba(p,248), rgba(out,255), 6)
    ellipse(d, tuple(int(v) for v in head), rgba(lighter(p,.08),250), rgba(out,255), 7)
    # snout, eye, horns
    snout = [(head[2]-18, head[1]+32), (min(506, head[2]+42), head[1]+48), (head[2]-16, head[1]+65)]
    poly(d, snout, rgba(lighter(p,.12),250), rgba(out,255), 5)
    ellipse(d, (head[0]+48, head[1]+28, head[0]+66, head[1]+43), rgba(a,255), (20,20,20,255), 2)
    ellipse(d, (head[0]+56, head[1]+33, head[0]+62, head[1]+40), (0,0,0,255))

    horn_len = {"young": 45, "dragon": 68, "ancient": 92}[b.tier]
    horn_count = 3 if b.tier == "ancient" or b.silhouette == "regal" else 2
    for i in range(horn_count):
        hx = head[0] + 18 + i*24
        poly(d, [(hx, head[1]+18), (hx-18+i*7, head[1]+18-horn_len), (hx+24, head[1]+28)], rgba(a,238), rgba(out,210), 4)

    # legs, forearms, and claws. Keep exactly two readable grounded legs on
    # Young/Dragon placeholders and add a clear paired forearm read near the
    # chest so the evolution board does not look like it is missing limbs or
    # sprouting an extra arm from the wing/crest silhouette.
    hind_legs = [190, 288] + ([340] if b.tier == "ancient" else [])
    for lx in hind_legs:
        poly(d, [(lx, int(body[3])-22), (lx-22, 392), (lx+17, 392), (lx+26, int(body[3])-20)], rgba(darker(p,.75),245), rgba(out,255), 5)
        for dx in [-15, 0, 15]: poly(d, [(lx+dx-7,390),(lx+dx+5,404),(lx+dx+16,390)], rgba(a,230), rgba(out,180), 2)

    forearms = [
        [(318, int(body[3])-42), (330, 356), (352, 350), (338, int(body[3])-47)],
        [(372, int(body[3])-58), (390, 338), (410, 330), (388, int(body[3])-62)],
    ]
    if b.tier == "ancient":
        forearms[0] = [(330, int(body[3])-54), (344, 366), (370, 358), (352, int(body[3])-58)]
        forearms[1] = [(396, int(body[3])-72), (420, 342), (444, 332), (416, int(body[3])-76)]
    for arm in forearms:
        poly(d, arm, rgba(darker(p,.70),238), rgba(out,255), 5)
        claw_x, claw_y = arm[2]
        for dx in [-8, 5]:
            poly(d, [(claw_x+dx-6, claw_y-2), (claw_x+dx+2, claw_y+14), (claw_x+dx+12, claw_y-4)], rgba(a,225), rgba(out,170), 2)

    # tier escalators
    if b.tier in {"dragon", "ancient"}:
        for x in [185, 224, 264, 304, 342]:
            poly(d, [(x, 226), (x+14, 174 if b.tier=="dragon" else 142), (x+34, 229)], rgba(a,190), rgba(out,170), 3)
    if b.tier == "ancient":
        for ang in range(0, 360, 30):
            x = 256 + math.cos(math.radians(ang))*220
            y = 250 + math.sin(math.radians(ang))*190
            line(d, [(256,250),(x,y)], rgba(a,32), 3)
        d.ellipse((80, 72, 432, 424), outline=rgba(a, 80), width=5)

    # motifs along body / around sprite
    motif_positions = [(98,170),(130,250),(365,100),(415,280),(236,136),(330,330)]
    for motif, (x,y) in zip(b.motifs[:6], motif_positions):
        draw_symbol(d, motif, x, y, a, p, .78 if b.tier=="young" else .92)

    # Split identity overlays. These make sibling paths read differently even
    # before the final artist replaces the placeholder.
    if b.axis == "intensify":
        # Obvious/direct branch: taller crest and concentrated aura crown.
        for x in [214, 252, 290, 328]:
            poly(d, [(x, 215), (x+10, 160 if b.tier == "young" else 132), (x+28, 218)], rgba(a, 205), rgba(out, 160), 3)
        d.arc((176, 116, 356, 246), 200, 340, fill=rgba(a, 150), width=7)
    elif b.axis == "hybrid":
        # Hybrid branch: split-color markings and forked/trick tail.
        stripe = lighter(a, .25)
        for x in [190, 238, 286, 334]:
            line(d, [(x, 247), (x+28, 309)], rgba(stripe, 150), 8)
        poly(d, [(98, int(body[1])+45), (50, int(body[1])+12), (68, int(body[1])+58)], rgba(a, 185), rgba(out, 140), 3)
        poly(d, [(100, int(body[1])+58), (45, int(body[1])+90), (75, int(body[1])+95)], rgba(lighter(p,.18), 180), rgba(out, 140), 3)
    elif b.axis == "mastery":
        # Reliable Dragon/Ancient branch: stable crown/ring and clean mastery aura.
        d.ellipse((150, 96, 386, 352), outline=rgba(a, 78), width=8)
        for x in [214, 256, 298]:
            poly(d, [(x, 210), (x+16, 126), (x+36, 214)], rgba(a, 198), rgba(out, 150), 3)
    elif b.axis == "forbidden":
        # Risky/forbidden branch: broken halo, jagged glow, and darker scars.
        for seg in [(135, 165, 210, 238), (286, 145, 392, 220), (160, 350, 252, 390)]:
            d.arc(seg, 15, 150, fill=rgba(a, 130), width=8)
        for pts in [[(208,248),(226,282),(214,326)], [(304,230),(282,272),(316,312)], [(356,184),(334,224),(376,248)]]:
            line(d, pts, rgba(darker(p,.28), 210), 7)
            line(d, pts, rgba(a, 170), 3)

    # title plaque
    d.rounded_rectangle((28, 30, 484, 94), radius=18, fill=(12,18,26,168), outline=rgba(a,185), width=3)
    d.text((46, 39), b.name[:30], font=F_TITLE if len(b.name) < 25 else F_MED, fill=(255,255,255,248))
    d.text((48, 70), f"{b.tier.title()} • {b.role}", font=F_SMALL, fill=rgba(lighter(a,.55),245))
    return img


def branch_path(b: Branch) -> Path:
    return OUT / b.tier / f"{b.element}_{b.drake_key}_{slug(b.name)}_placeholder.png"


def make_contact_sheet(branches: list[Branch], tier: str) -> Path:
    rows = [b for b in branches if b.tier == tier]
    cols = 6 if tier != "ancient" else 8
    cell_w, cell_h = (280, 306) if tier != "ancient" else (240, 276)
    sheet = Image.new("RGBA", (cols*cell_w, math.ceil(len(rows)/cols)*cell_h), (17,22,32,255))
    d = ImageDraw.Draw(sheet, "RGBA")
    for i, b in enumerate(rows):
        x, y = (i % cols) * cell_w, (i // cols) * cell_h
        d.rectangle((x,y,x+cell_w,y+cell_h), fill=(18+(i//cols)*3,24+(i%cols)*3,34,255), outline=(70,82,100,255), width=2)
        im = Image.open(branch_path(b)).convert("RGBA").resize((210 if tier!="ancient" else 180, 210 if tier!="ancient" else 180), Image.Resampling.LANCZOS)
        sheet.alpha_composite(im, (x+(cell_w-im.width)//2, y+16))
        d.text((x+14, y+224 if tier!="ancient" else y+202), b.name[:26], font=font(15, True), fill=(255,255,255,245))
        d.text((x+14, y+246 if tier!="ancient" else y+224), f"{b.element.title()} / {b.drake_key.title()}", font=font(12), fill=rgba(lighter(b.accent),230))
        d.text((x+14, y+266 if tier!="ancient" else y+244), b.axis.title(), font=font(12), fill=(200,210,225,220))
    path = OUT / f"{tier}_path_contact_sheet.png"
    sheet.convert("RGB").save(path)
    return path


def make_tree_sheet(branches: list[Branch]) -> Path:
    W, H = 1800, 1350
    img = Image.new("RGBA", (W,H), (14,18,27,255))
    d = ImageDraw.Draw(img, "RGBA")
    d.text((48,34), "Full Evolution Placeholder Art Map", font=font(54, True), fill=(255,255,255,250))
    d.text((52,100), "Young Dragon → Dragon → Ancient paths. Contact sheets and transparent PNGs live under assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/", font=font(20), fill=(205,215,230,235))
    x0, y0 = 54, 170
    card_w, card_h = 332, 210
    idx = 0
    for element, ed in ELEMENTS.items():
        d.text((x0, y0+idx*(card_h+34)-38), element.title(), font=font(32, True), fill=rgba(lighter(ed["accent"]),245))
        for j, dr in enumerate(ed["drakes"]):
            dkey = dr[0]
            bx = x0 + j*(card_w+18)
            by = y0 + idx*(card_h+34)
            d.rounded_rectangle((bx,by,bx+card_w,by+card_h), radius=20, fill=(24,31,45,255), outline=rgba(ed["accent"],160), width=3)
            d.text((bx+18,by+14), dr[1], font=font(22, True), fill=(255,255,255,245))
            youngs = [b for b in branches if b.tier=="young" and b.element==element and b.drake_key==dkey]
            for k, yb in enumerate(youngs):
                d.text((bx+22, by+52+k*72), yb.name.replace(" Young Dragon", ""), font=font(16, True), fill=rgba(lighter(ed["accent"]),245))
                d.text((bx+38, by+76+k*72), "→ 2 Dragon forms → 4 Ancient capstones", font=font(13), fill=(205,215,230,230))
        idx += 1
    path = DOCS / "evolution_path_placeholder_map_2026-05-11.png"
    img.convert("RGB").save(path)
    return path


def write_docs(branches: list[Branch], contacts: dict[str, Path], tree: Path):
    doc = DOCS / "EVOLUTION_PATH_PLACEHOLDER_ART_2026-05-11.md"
    counts = {tier: sum(1 for b in branches if b.tier == tier) for tier in ["young", "dragon", "ancient"]}
    lines = [
        "# Evolution Path Placeholder Art — Young / Dragon / Ancient",
        "",
        "Date: 2026-05-11",
        "Status: Full placeholder-art coverage for post-Drake branch tiers",
        "",
        "## Outputs",
        "",
        f"- Young Dragon transparent PNGs: `{counts['young']}` in `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/`",
        f"- Dragon transparent PNGs: `{counts['dragon']}` in `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/`",
        f"- Ancient Dragon transparent PNGs: `{counts['ancient']}` in `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/`",
        f"- Young contact sheet: `{contacts['young'].relative_to(ROOT)}`",
        f"- Dragon contact sheet: `{contacts['dragon'].relative_to(ROOT)}`",
        f"- Ancient contact sheet: `{contacts['ancient'].relative_to(ROOT)}`",
        f"- Evolution map image: `{tree.relative_to(ROOT)}`",
        "",
        "## Count Contract",
        "",
        "The branch model is now visually represented through the full scalable tree:",
        "",
        "- 5 starter eggs",
        "- 15 Drake paths",
        "- 30 Young Dragon paths",
        "- 60 Dragon paths",
        "- 120 Ancient Dragon capstones",
        "",
        "This pass generated the missing 30 + 60 + 120 placeholders. They are intentionally rough, but every file is a unique transparent art target that UI and final art can replace one-for-one.",
        "",
        "## Naming / Split Pattern",
        "",
        "Each Drake still splits into the two Young Dragon names from the design doc. Each Young Dragon then receives two Dragon directions:",
        "",
        "- **Sovereign / Warden** style: safer mastery / reliable scaling.",
        "- **Avatar / Ravager** style: explosive, risky, forbidden, or specialized identity.",
        "",
        "Each Dragon then splits into two Ancient variants:",
        "",
        "- **Ancient / Elder**: majestic mastery.",
        "- **Primordial / Doom**: dangerous or forbidden legend.",
        "",
        "## Art Direction Rules",
        "",
        "- Preserve the Drake motif family through later stages so players recognize their lineage.",
        "- Increase silhouette scale by tier: Young = first big wings, Dragon = city-raid body/crest, Ancient = mythic aura/colossal horns.",
        "- Final art can rename or refine capstones, but should keep one-file-per-branch replacement compatibility.",
        "- Do not let late-stage branches collapse into recolors; a silhouette/motif difference must survive at phone scale.",
        "",
        "## Branch Inventory",
        "",
    ]
    for element, ed in ELEMENTS.items():
        lines.append(f"### {element.title()}")
        lines.append("")
        for dkey, dname, *_ in ed["drakes"]:
            lines.append(f"- **{dname}**")
            youngs = [b for b in branches if b.tier == "young" and b.element == element and b.drake_key == dkey]
            for yb in youngs:
                lines.append(f"  - {yb.name}")
                dragons = [b for b in branches if b.tier == "dragon" and b.lineage.startswith(yb.lineage + "/")]
                for db in dragons:
                    ancients = [b for b in branches if b.tier == "ancient" and b.lineage.startswith(db.lineage + "/")]
                    lines.append(f"    - {db.name} → {', '.join(a.name for a in ancients)}")
        lines.append("")
    doc.write_text("\n".join(lines), encoding="utf-8")

    readme = BASE / "README.md"
    text = readme.read_text(encoding="utf-8")
    add = """
## Young / Dragon / Ancient Path Placeholder Pass

Generated in `evolution-paths/`:

- `young/` — 30 Young Dragon branch placeholders.
- `dragon/` — 60 Dragon branch placeholders.
- `ancient/` — 120 Ancient Dragon capstone placeholders.
- `young_path_contact_sheet.png`, `dragon_path_contact_sheet.png`, and `ancient_path_contact_sheet.png` — tier review sheets.

Related doc:

- `docs/EVOLUTION_PATH_PLACEHOLDER_ART_2026-05-11.md`
- `docs/evolution_path_placeholder_map_2026-05-11.png`
"""
    if "## Young / Dragon / Ancient Path Placeholder Pass" not in text:
        readme.write_text(text.rstrip() + "\n" + add, encoding="utf-8")


def main():
    branches = build_branches()
    for tier in ["young", "dragon", "ancient"]:
        (OUT / tier).mkdir(parents=True, exist_ok=True)
    for b in branches:
        path = branch_path(b)
        path.parent.mkdir(parents=True, exist_ok=True)
        draw_branch(b).save(path)
    contacts = {tier: make_contact_sheet(branches, tier) for tier in ["young", "dragon", "ancient"]}
    tree = make_tree_sheet(branches)
    write_docs(branches, contacts, tree)
    print(f"generated {len(branches)} branch placeholders")
    for tier in ["young", "dragon", "ancient"]:
        print(tier, sum(1 for b in branches if b.tier == tier), contacts[tier])
    print("map", tree)

if __name__ == "__main__":
    main()
