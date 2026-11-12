#!/usr/bin/env python3
"""
Generate the cwico APPLICATION icon set from the product logo master.

Source: assets/brand/app/icon-1024.png - square, transparent, produced by
website/scripts/brand-assets.mjs from assets/brand/source/logo-cwico.png (the one
original; change the logo there, run that script, then this one).

Outputs:
  app/src-tauri/icons/*        -> Tauri bundler (MSI / NSIS / MSIX / Linux / macOS)

ui/public/brand/ is NOT touched: the Brand component there is the tsudev maker mark
(tsudev logo + "tsudev" wordmark), not the product logo.

Run:  python3 tools/gen_icons.py
"""
from __future__ import annotations

import pathlib
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  pip install Pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "brand" / "app" / "icon-1024.png"

TAURI_ICONS = ROOT / "app" / "src-tauri" / "icons"
UI_BRAND = ROOT / "ui" / "public" / "brand"
BRAND = ROOT / "assets" / "brand"

# Tauri's standard icon set.
PNG_SIZES = [32, 128, 256, 512]
# MSIX / Microsoft Store tile assets (square, transparent).
STORE_TILES = {
    "Square30x30Logo.png": 30,
    "Square44x44Logo.png": 44,
    "Square71x71Logo.png": 71,
    "Square89x89Logo.png": 89,
    "Square107x107Logo.png": 107,
    "Square142x142Logo.png": 142,
    "Square150x150Logo.png": 150,
    "Square284x284Logo.png": 284,
    "Square310x310Logo.png": 310,
    "StoreLogo.png": 50,
}
ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]


def squarify(im: Image.Image, pad_ratio: float = 0.06) -> Image.Image:
    """Centre the logo on a transparent square canvas with a little breathing room."""
    w, h = im.size
    side = int(max(w, h) * (1 + pad_ratio * 2))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
    return canvas


def resize(sq: Image.Image, size: int) -> Image.Image:
    return sq.resize((size, size), Image.LANCZOS)


def main() -> int:
    if not SRC.exists():
        sys.exit(f"missing source logo: {SRC}")

    # The master is already square with breathing room (brand-assets.mjs).
    square = squarify(Image.open(SRC).convert("RGBA"), pad_ratio=0)
    TAURI_ICONS.mkdir(parents=True, exist_ok=True)
    written = 0

    # --- Tauri PNG set -------------------------------------------------------
    for size in PNG_SIZES:
        resize(square, size).save(TAURI_ICONS / f"{size}x{size}.png")
        written += 1
    resize(square, 256).save(TAURI_ICONS / "128x128@2x.png")
    resize(square, 512).save(TAURI_ICONS / "icon.png")
    written += 2

    # --- Windows .ico (multi-resolution) -------------------------------------
    resize(square, 256).save(
        TAURI_ICONS / "icon.ico",
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
    )
    written += 1

    # --- MSIX / Microsoft Store tiles ----------------------------------------
    for name, size in STORE_TILES.items():
        resize(square, size).save(TAURI_ICONS / name)
        written += 1

    print(f"generated {written} icon files from {SRC.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
