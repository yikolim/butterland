# Butterland

A cozy little pixel game about Claire and her four cats (Michael, Sashi, Ollie and Aggu), played on a pink handheld with two screens. Find the cats, pick up a delivery, unbox an iPhone Duo and try it with the Tesla.

**Play:** https://yikolim.github.io/butterland/ (works on phones, tablets and computers; add `?classic` for the plain DS Lite layout).

The handheld edition lives in `app/ds/`. Build it with `sh tools/build-pocket.sh`, or build the static site for GitHub Pages with `sh tools/build-pages.sh` (output in `site/`, published to the `gh-pages` branch).

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Validation:

```bash
npm run build
npm run lint
npm test
```

## Controls

- `WASD` or arrow keys: walk
- `Space` or `Enter`: interact
- On-screen D-pad: touch/pointer movement
- `♪` button: play or pause background music
- `?` button: show instructions

Music starts after a user presses **Start Walking** because browsers block automatic audio before user interaction.

## Key files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Active game loop, Claire movement, collisions, interaction, music state, and UI |
| `app/globals.css` | Scene layout, sprite-sheet cropping, cat animation, HUD, responsive controls |
| `app/layout.tsx` | Site metadata and global layout |
| `public/pearl-district-playable-bg.png` | Active 1672×941 scene background with the original stationary Claire removed |
| `public/sprite-sheets/claire-walk-pixelated-v2.png` | Active 3×4 Claire directional walk sheet |
| `public/sprite-sheets/white-cat-walk-concept.png` | Active 4×3 white-cat animation sheet |
| `public/bgm.mp3` | Active looping background music; large file (~115 MB) |
| `app/dental/game.ts` | Earlier canvas-based prototype; currently not imported by the active page |
| `MOTHER_STYLE_GAME_SPEC.md` | Detailed art and game-direction document |
| `STORYLINE.md` | Narrative and character direction |
| `PROJECT_HANDOFF.md` | Technical continuation notes and file structure |
| `AGENTS.md` | Working instructions for future coding agents |

See `PROJECT_HANDOFF.md` before making structural or gameplay changes.
