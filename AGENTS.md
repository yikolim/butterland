# Agent instructions

Read `PROJECT_HANDOFF.md` before editing this project.

## Current product contract

- Preserve the supplied bright pixel-art dental-clinic scene as the visual baseline. The active file is `public/pearl-district-playable-bg-v2.png` (sign removed); the original stays as a sibling.
- Claire must remain freely controllable with keyboard and touch input.
- Claire exits the fenced lawn through the center-bottom gate and can then move horizontally across the sidewalk/street edge.
- The cats are small white long-haired cats with blue eyes and large furry tails, and they live indoors only; keep them visually subordinate to Claire.
- Background music comes from `public/bgm.mp3`; playback must remain user-controlled because browser autoplay is restricted.
- Honor `prefers-reduced-motion` for cosmetic animation.

## Active implementation

- `app/page.tsx` is the active game. Movement uses percentages of the 1672×941 scene, not a tile grid.
- `app/globals.css` controls sprite-sheet scaling/cropping, scene presentation, HUD, D-pad, and responsive layout.
- The three indoor floors are painted pictures in `public/house/floor-*.png`; collision is read from their pixels (see `PROJECT_HANDOFF.md`). To change the inside of the house, repaint the picture — do not expect `objects` edits in `houseData.ts` to show visually while a floor has `art` set.
- `app/house/` is the indoor map shown after entering the clinic door: `houseData.ts` holds the room/furniture/cat layout, `houseDraw.ts` paints tiles and furniture, `HouseInterior.tsx` runs the canvas loop, camera, cats, stairs and dialog. Interior visuals follow the Mother 3 log-cabin references described in `PROJECT_HANDOFF.md`.
- The three indoor cats are Mickey, Eggies (ground floor) and Sasha (upstairs); their lines live in `houseData.ts`.
- `app/dental/game.ts` is a legacy canvas prototype and is not used by the current page. Do not edit it expecting visible changes unless you deliberately reconnect it.

## Change discipline

- Preserve `package-lock.json` and the existing Vinext/Sites architecture.
- Do not commit or package `node_modules`, `.next`, `.vinext`, `.wrangler`, or `dist`.
- Do not overwrite the hard visual reference in `docs/visual-references/`.
- Keep the current active background non-destructive; create a versioned sibling for major art changes.
- If collision geometry changes, verify lawn movement, the fence gate crossing, sidewalk movement, the clinic door approach, and the car/building blockers.
- If sprite sheets change, keep `image-rendering: pixelated` and verify every background-position row/frame.

## Required checks

Run these before handoff:

```bash
npm run build
npm run lint
npm test
```
