#!/bin/sh
# Builds the Pocket Lite (2DS) edition of Butterland into public/pocket/:
#   molar-cart.js  — app/ds/cart.ts + the house modules, bundled by esbuild
#   index.html     — the Pocket Lite shell (app/ds/pocket-lite-shell.html) with its demo
#                    cartridge removed and molar-cart.js loaded instead
# Serve public/ (or run the dev server) and open /pocket/.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/pocket
node_modules/.bin/esbuild app/ds/cart.ts --bundle --format=iife --target=es2020 --outfile=public/pocket/molar-cart.js --log-level=warning
python3 - <<'PY'
src=open("app/ds/pocket-lite-shell.html").read()
start=src.index("<script>\n/* =====================================================================\n   Demo cartridge")
end=src.index("</script>",start)+len("</script>")
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Butterland">
<meta name="theme-color" content="#efc3c3">
<link rel="icon" type="image/png" sizes="512x512" href="../icons/claire-512.png">
<link rel="icon" type="image/png" sizes="32x32" href="../icons/claire-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="../icons/claire-180.png">
<style>html,body{margin:0;overscroll-behavior:none}</style>
</head>
<body>
'''
body=src[:start]+'<script src="./molar-cart.js"></script>'+src[end:]
open("public/pocket/index.html","w").write(head+body+"</body></html>\n")
print("public/pocket/index.html")
PY
ls -la public/pocket
