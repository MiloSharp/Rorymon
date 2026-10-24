from pathlib import Path
from PIL import Image
import colorsys

ROOT = Path(__file__).resolve().parents[1] / "assets" / "characters" / "artwork"
SOURCE = ROOT / "npcs"
OUTPUT = ROOT / "players"
OUTPUT.mkdir(parents=True, exist_ok=True)

HAIR = {
    "auburn": (0.035, 0.62, 1.00),
    "brown": (0.070, 0.43, 0.78),
    "black": (0.610, 0.16, 0.43),
    "blonde": (0.125, 0.58, 1.48),
}


def in_hair_region(body, x, y, r, g, b):
    value = max(r, g, b) / 255
    spread = max(r, g, b) - min(r, g, b)
    warm = r > g * 1.06 and r > b * 1.12 and spread > 14
    if body == "male":
        # Hair is beneath the hat and around the face; the value cap excludes skin.
        region = 275 <= x <= 675 and 100 <= y <= 350
        return region and warm and value < 0.69
    # Includes the bun, crown, and the two loose side strands.
    region = 330 <= x <= 690 and 15 <= y <= 385
    return region and warm and value < 0.57


def recolor(source, body, hair):
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    hue, saturation, brightness = HAIR[hair]
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if not a or not in_hair_region(body, x, y, r, g, b):
                continue
            _, old_s, old_v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if hair == "blonde":
                new_v = min(0.94, 0.40 + old_v * 0.82)
            else:
                new_v = max(0.08, min(0.88, old_v * brightness))
            new_s = max(0.10, min(0.82, saturation * (0.72 + old_s * 0.42)))
            nr, ng, nb = colorsys.hsv_to_rgb(hue, new_s, new_v)
            pixels[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
    image.save(OUTPUT / f"{body}-trainer-large-art-hair-{hair}-v1.png", optimize=True)


for body, filename in {
    "male": "young-trainer-large-art-v1.png",
    "female": "field-researcher-large-art-v1.png",
}.items():
    for hair in HAIR:
        recolor(SOURCE / filename, body, hair)

print(f"Created 8 player trainer portraits in {OUTPUT}")
