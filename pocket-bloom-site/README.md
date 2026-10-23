# Pocket Bloom

Open `index.html` through any static web server. The console shell and the game are intentionally separate:

- `index.html` — console markup and accessible controls
- `style.css` — pink clamshell, opening animation, responsive layout
- `shell.js` — console controls, keyboard input, power, and sound
- `game-cartridge.js` — replaceable game content channel

To add the real game later, replace `createPocketBloomCartridge()` in `game-cartridge.js`. Its public contract is:

```js
const cartridge = createPocketBloomCartridge({ topScreen, touchScreen, onInteraction });
cartridge.input("up" | "down" | "left" | "right" | "a" | "b" | "x" | "y" | "start" | "select");
cartridge.power(true | false);
```
