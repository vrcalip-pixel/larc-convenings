#!/usr/bin/env python3
"""
Extract embedded base64 logos from the original convenings draft into assets/.

Run this once, from the repository root, if any logo in assets/ is missing or
you want the exact images used in the approved draft:

    python3 tools/extract-assets.py path/to/original-draft.html

The script matches images by their alt text, so the order of images in the
source file does not matter.
"""

import base64
import pathlib
import re
import sys

# alt-text fragment (lowercase)  ->  output filename in assets/
TARGETS = {
    "larc": "larc-logo.png",
    "long beach city college": "lbcc-logo.png",
    "ai literacy": "ailit-logo.png",
    "workforce": "cccc-workforce-emblem.png",
}

IMG_TAG = re.compile(r"<img[^>]*>", re.IGNORECASE)
SRC_B64 = re.compile(r'src="data:image/(png|jpe?g|webp);base64,([^"]+)"', re.IGNORECASE)
ALT_TXT = re.compile(r'alt="([^"]*)"', re.IGNORECASE)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1

    source = pathlib.Path(sys.argv[1])
    if not source.is_file():
        print(f"Source file not found: {source}")
        return 1

    assets = pathlib.Path(__file__).resolve().parent.parent / "assets"
    assets.mkdir(exist_ok=True)

    html = source.read_text(encoding="utf-8", errors="ignore")
    written = 0

    for tag in IMG_TAG.findall(html):
        src = SRC_B64.search(tag)
        alt = ALT_TXT.search(tag)
        if not src or not alt:
            continue

        alt_text = alt.group(1).lower()
        for fragment, filename in TARGETS.items():
            if fragment in alt_text:
                data = base64.b64decode(src.group(2))
                (assets / filename).write_bytes(data)
                print(f"Wrote assets/{filename}  ({len(data):,} bytes)")
                written += 1
                break

    if written == 0:
        print("No base64 images matched. Check that the source file is the "
              "original draft with embedded logos.")
        return 1

    missing = [f for f in TARGETS.values() if not (assets / f).is_file()]
    if missing:
        print("\nStill missing: " + ", ".join(missing))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
