#!/usr/bin/env python3
"""
Generate the installer artwork (BRAND_ASSETS.md section 12: "Ảnh mở đầu bản cài").

Source: assets/brand/tsudev-logo.png, the compact mark (owl only), an output
of the official tsudev brand pipeline (BRAND_ASSETS.md section 1). The image
wordmark is NOT used: it carries its own small owl, so pairing it with the mark
shows two owls, and cropping it would be the hand-cut BRAND_ASSETS forbids.
The installer's own text already names the product.

Outputs (24-bit BMP, the only format both NSIS and WiX accept):
  app/src-tauri/installer/nsis-header.bmp    150x57   NSIS page header
  app/src-tauri/installer/nsis-sidebar.bmp   164x314  NSIS welcome/finish
  app/src-tauri/installer/wix-banner.bmp     493x58   MSI top banner
  app/src-tauri/installer/wix-dialog.bmp     493x312  MSI welcome/finish

Downscaling only (LANCZOS), never upscaling. Re-run when the brand changes:
  python3 tools/gen_installer_images.py
"""
from __future__ import annotations

import pathlib
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  pip install Pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
MARK = ROOT / "assets" / "brand" / "tsudev-logo.png"
OUT = ROOT / "app" / "src-tauri" / "installer"

WHITE = (255, 255, 255)
# Token bg-subtle (light): a faint brand-blue panel behind the sidebar art.
PANEL = (238, 244, 251)


def fit(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    scale = min(max_w / im.width, max_h / im.height)
    if scale > 1:
        raise SystemExit(f"refusing to upscale {im.size} into {max_w}x{max_h}")
    size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
    return im.resize(size, Image.LANCZOS)


def paste(canvas: Image.Image, im: Image.Image, x: int, y: int) -> None:
    canvas.paste(im, (x, y), im)


def save(canvas: Image.Image, name: str) -> None:
    path = OUT / name
    canvas.convert("RGB").save(path, format="BMP")
    print(f"wrote {path.relative_to(ROOT)} {canvas.size}")


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    mark = Image.open(MARK).convert("RGBA")

    # NSIS header: mark on the right edge; NSIS draws the page title on the left.
    c = Image.new("RGBA", (150, 57), WHITE)
    m = fit(mark, 44, 49)
    paste(c, m, 150 - m.width - 8, (57 - m.height) // 2)
    save(c, "nsis-header.bmp")

    # NSIS sidebar: panel colour, mark centred.
    c = Image.new("RGBA", (164, 314), PANEL)
    m = fit(mark, 124, 152)
    paste(c, m, (164 - m.width) // 2, (314 - m.height) // 2)
    save(c, "nsis-sidebar.bmp")

    # WiX banner: MSI writes its title on the left of this strip.
    c = Image.new("RGBA", (493, 58), WHITE)
    m = fit(mark, 44, 48)
    paste(c, m, 493 - m.width - 10, (58 - m.height) // 2)
    save(c, "wix-banner.bmp")

    # WiX dialog: the left 164px are art; MSI puts its text over the rest.
    c = Image.new("RGBA", (493, 312), WHITE)
    c.paste(Image.new("RGBA", (164, 312), PANEL), (0, 0))
    m = fit(mark, 124, 152)
    paste(c, m, (164 - m.width) // 2, (312 - m.height) // 2)
    save(c, "wix-dialog.bmp")
    return 0


if __name__ == "__main__":
    sys.exit(main())
