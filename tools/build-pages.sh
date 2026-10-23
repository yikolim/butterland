#!/bin/sh
# Builds the handheld (Pocket Lite) edition of Butterland as a static site in site/, ready for
# GitHub Pages at https://<user>.github.io/butterland/ (or any static host, at any sub-path).
#   index.html, molar-cart.js — from tools/build-pocket.sh, with every "/asset" path made relative
#   phone/                     — Claire's phone (the Tesla app), opened from the game
#   the art and music the game loads (nothing from the web edition)
set -e
cd "$(dirname "$0")/.."
sh tools/build-pocket.sh >/dev/null
rm -rf site && mkdir -p site
python3 - <<'PY'
import re, shutil, os
cart = open("public/pocket/molar-cart.js").read()
# Absolute asset paths ("/house/floor-0-v2.png") become relative so the site works under /butterland/.
assets = sorted(set(re.findall(r'"/((?:delivery|house|music|sprite-sheets)/[^"]+|[a-z0-9-]+\.png)"', cart)))
for a in assets:
    cart = cart.replace(f'"/{a}"', f'"./{a}"')
    os.makedirs(os.path.dirname(f"site/{a}") or "site", exist_ok=True)
    shutil.copy(f"public/{a}", f"site/{a}")
cart = cart.replace('"../phone/?embed&duo"', '"./phone/?embed&duo"')
open("site/molar-cart.js", "w").write(cart)
page = open("public/pocket/index.html").read().replace('"../icons/', '"./icons/').replace('"../phone/claire-head.png"', '"./phone/claire-head.png"')
open("site/index.html", "w").write(page)
shutil.copytree("public/icons", "site/icons")
os.makedirs("site/phone")
for f in ("index.html", "claire-head.png"):
    shutil.copy(f"public/phone/{f}", f"site/phone/{f}")
open("site/.nojekyll", "w").close()
print("\n".join(["site/index.html", "site/molar-cart.js", "site/phone/"] + [f"site/{a}" for a in assets]))
PY
