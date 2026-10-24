"""Remove disconnected semi-transparent debris from generated PNG artwork."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


def clean(path: Path, alpha_threshold: int) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = np.array(image)
    occupied = pixels[:, :, 3] > alpha_threshold
    height, width = occupied.shape

    points = np.argwhere(occupied)
    if not len(points):
        return
    center = np.array([height / 2, width / 2])
    seed_y, seed_x = points[np.argmin(np.sum((points - center) ** 2, axis=1))]

    keep = np.zeros_like(occupied, dtype=bool)
    keep[seed_y, seed_x] = True
    queue = deque([(int(seed_y), int(seed_x))])
    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < height and 0 <= nx < width and occupied[ny, nx] and not keep[ny, nx]:
                keep[ny, nx] = True
                queue.append((ny, nx))

    pixels[~keep, 3] = 0
    Image.fromarray(pixels, "RGBA").save(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--alpha-threshold", type=int, default=8)
    args = parser.parse_args()
    for path in args.paths:
        clean(path.resolve(), args.alpha_threshold)
        print(path)


if __name__ == "__main__":
    main()
