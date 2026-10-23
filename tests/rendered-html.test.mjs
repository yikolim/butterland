import assert from "node:assert/strict";
import {access,readFile,stat} from "node:fs/promises";
import test from "node:test";

async function render(){
 const workerUrl=new URL("../dist/server/index.js",import.meta.url);
 workerUrl.searchParams.set("test",`${process.pid}-${Date.now()}`);
 const {default:worker}=await import(workerUrl.href);
 return worker.fetch(new Request("http://localhost/",{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});
}

test("renders the Butterland game shell",async()=>{
 const response=await render();
 assert.equal(response.status,200);
 assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);
 const html=await response.text();
 assert.match(html,/BUTTERLAND/);
 assert.match(html,/FRONT YARD/);
 assert.match(html,/START WALKING/);
 assert.match(html,/bgm\.mp3/);
 assert.match(html,/pearl-district-playable-bg-v2\.png/);
});

test("keeps the active movement, collision, and sprite assets connected",async()=>{
 const [page,css,house,houseData,music]=await Promise.all([
  readFile(new URL("../app/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/globals.css",import.meta.url),"utf8"),
  readFile(new URL("../app/house/HouseInterior.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/house/houseData.ts",import.meta.url),"utf8"),
  stat(new URL("../public/bgm.mp3",import.meta.url))
 ]);
 assert.match(page,/function blockedAt/);
 assert.match(page,/function canMove/);
 assert.match(page,/const fenceY=76/);
 assert.match(page,/toX>37&&toX<52/);
 assert.match(page,/requestAnimationFrame/);
 assert.match(css,/claire-walk-pixelated-v2\.png/);
 // The four house cats each load their own sheet; the white cat is Aggu.
 assert.match(house,/loadSheet\(src,4,3,CAT_CELL\)/);
 for(const sheet of ["white-cat-walk-concept","michael-walk","sashi-walk","ollie-walk"])assert.match(houseData,new RegExp(`${sheet}\\.png`));
 assert.match(css,/image-rendering:pixelated/);
 assert.ok(music.size>100_000_000);
 await Promise.all([
  access(new URL("../public/pearl-district-playable-bg.png",import.meta.url)),
  access(new URL("../public/pearl-district-playable-bg-v2.png",import.meta.url)),
  access(new URL("../public/sprite-sheets/claire-walk-pixelated-v2.png",import.meta.url)),
  access(new URL("../public/sprite-sheets/white-cat-walk-concept.png",import.meta.url)),
  access(new URL("../public/sprite-sheets/michael-walk.png",import.meta.url)),
  access(new URL("../public/sprite-sheets/sashi-walk.png",import.meta.url)),
  access(new URL("../public/sprite-sheets/ollie-walk.png",import.meta.url)),
  access(new URL("../PROJECT_HANDOFF.md",import.meta.url)),
  access(new URL("../AGENTS.md",import.meta.url))
 ]);
});
