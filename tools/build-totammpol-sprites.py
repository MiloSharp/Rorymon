from itertools import permutations
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
CONCEPTS = ASSETS / "concepts"
ANIMALS = ("eagle", "bear", "moose", "goat")
CELL = 362
LOGICAL_WIDTH = 128
LOGICAL_PART_HEIGHT = 64
SCALE = 2
JOINT_OVERLAP = 3
UPPER_RAIL_TRIM = 8


def component(sheet: Image.Image, animal: str, position: int) -> Image.Image:
    column = ANIMALS.index(animal)
    crop = sheet.crop((column * CELL, position * CELL, (column + 1) * CELL, (position + 1) * CELL))
    # Every part is fitted into the same slot. This keeps all three wooden
    # connector bars on a shared centerline while retaining animal overhangs.
    resized = crop.resize((LOGICAL_WIDTH, LOGICAL_PART_HEIGHT), Image.Resampling.LANCZOS)
    bounds = resized.getbbox()
    if not bounds:
        return resized
    trimmed = resized.crop(bounds)
    # Some source modules contain fully transparent scanlines between their
    # connector rail and carved face. Remove those rows rather than displaying
    # checkerboard through what should be a continuous wooden stack.
    alpha = trimmed.getchannel("A")
    rows = [y for y in range(trimmed.height) if alpha.crop((0, y, trimmed.width, y + 1)).getbbox()]
    compact = Image.new("RGBA", (trimmed.width, len(rows)))
    for target_y, source_y in enumerate(rows):
        compact.paste(trimmed.crop((0, source_y, trimmed.width, source_y + 1)), (0, target_y))
    if position > 0 and compact.height > UPPER_RAIL_TRIM:
        compact = compact.crop((0, UPPER_RAIL_TRIM, compact.width, compact.height))
    return compact


def build(sheet_name: str, view: str) -> None:
    sheet = Image.open(CONCEPTS / sheet_name).convert("RGBA")
    for order in permutations(ANIMALS, 3):
        key = "-".join(order)
        if view == "front" and key == "eagle-bear-goat":
            continue
        parts = [component(sheet, animal, position) for position, animal in enumerate(order)]
        height = sum(part.height for part in parts) - JOINT_OVERLAP * 2
        canvas = Image.new("RGBA", (LOGICAL_WIDTH, height))
        y = 0
        for part in parts:
            canvas.alpha_composite(part, ((LOGICAL_WIDTH - part.width) // 2, y))
            y += part.height - JOINT_OVERLAP
        # Nearest-neighbour enlargement makes the final pixels deliberate and
        # keeps every variant equally sized in the editor and battle view.
        canvas = canvas.resize((canvas.width * SCALE, canvas.height * SCALE), Image.Resampling.NEAREST)
        if view == "rear" and key == "eagle-bear-goat":
            # Match the approved front's opaque-width-to-height ratio. The
            # modular rear is naturally broader even when perfectly aligned.
            matched = canvas.resize((round(canvas.width * 0.716), canvas.height), Image.Resampling.NEAREST)
            framed = Image.new("RGBA", canvas.size)
            framed.alpha_composite(matched, ((canvas.width - matched.width) // 2, 0))
            canvas = framed
        canvas.save(ASSETS / f"totammpol-{key}-sprite-{view}-transparent.png", optimize=True)
        if view == "rear" and key == "eagle-bear-goat":
            canvas.save(ASSETS / "totammpol-eagle-bear-goat-sprite-rear-aligned-transparent.png", optimize=True)


if __name__ == "__main__":
    build("totammpol-modular-components-concept-v3.png", "front")
    build("totammpol-modular-components-rear-v1.png", "rear")
