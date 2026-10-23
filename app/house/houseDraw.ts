// Pixel painting for the house interior. Everything is built from filled rectangles
// at 16px tiles so it reads as chunky pixel art once the canvas is scaled up.

import {CATALOG,T,type FloorDef,type FloorKind,type Obj,type ObjType} from "./houseData";
import {stairsArrival,type PaintedStairs,type Rect} from "./paintedWalk";

type G=CanvasRenderingContext2D;

// Tile codes stored in the grid.
export const VOID=0,WOOD=1,TILE=2,CONC=3,CAP=4,PANEL=5,CAP_STONE=6,PANEL_STONE=7;
const FLOOR_CODE:Record<FloorKind,number>={wood:WOOD,tile:TILE,concrete:CONC};

// Warm log-cabin palette: tan planks, brown logs, cream and orange soft goods, and a
// dark-brown contour instead of black so the whole room stays warm.
const INK="#3a2314",WOOD_D="#7a4a26",WOOD_M="#b07a45",WOOD_L="#d9ab6e",CREAM="#f2dca6",CREAM_D="#d9bf88";
const RED="#c9412e",RED_D="#8e2a1c",BLUE="#5a78c8",BLUE_D="#3a4f8e",GREEN="#6aa84f",GREEN_D="#3f7a33";
const GOLD="#e8b84a",GRAY="#8f98ad",GRAY_D="#4f5c78",WHITE="#fff5dc",PINK="#e8a0a8",VIOLET="#8a6fd8",SKY="#b9d8e8";
const ORANGE="#e59440",ORANGE_D="#c9722c",LOG="#a06a40",LOG_L="#bf8656",LOG_D="#7e4f2c",SEAM="#5a3418";
// The back wall is this many log rows tall below the top edge.
export const WALL_H=3;

const r=(g:G,x:number,y:number,w:number,h:number,c:string)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
// Outlined box: 1px ink border with a fill.
const box=(g:G,x:number,y:number,w:number,h:number,fill:string,line=INK)=>{r(g,x,y,w,h,line);r(g,x+1,y+1,w-2,h-2,fill)};
const hash=(a:number,b:number)=>((a*73856093)^(b*19349663))>>>0;

export type BuiltFloor={
 def:FloorDef;w:number;h:number;
 grid:Uint8Array;walk:Uint8Array;trigger:Int16Array;
 standing:Obj[];bake:HTMLCanvasElement;
 // Drawn floors: `front` holds only the furniture tiles so the renderer can draw them back over
 // sprites that stand behind them; `furn` marks those tiles. Painted floors use `runs` instead.
 art:boolean;front:HTMLCanvasElement|null;furn:Uint8Array;
 // Painted floors (null/empty for drawn floors):
 //   walk2  — walkability at half-tile (8px) resolution, read from the picture (see buildFloor)
 //   runs   — vertical strips of blocked half-tiles, in px; each is depth-sorted by its bottom edge
 //            so walls and furniture hide whatever stands behind them
 //   hides  — spots where a cat can tuck in behind furniture: feet (x,y), approach from (x,ay)
 //   stairs — the painted staircases (tile units)
 walk2:Uint8Array|null;
 runs:Run[]|null;
 hides:HideSpot[];
 stairs:PaintedStairs[];
};
export type Run={x:number;y0:number;y1:number};
export type HideSpot={x:number;y:number;ay:number};

function footprint(o:Obj){const c=CATALOG[o.t];return{w:o.w??c.w,h:o.h??c.h,flat:!!c.flat}}

export function buildFloor(def:FloorDef,art?:HTMLImageElement|null):BuiltFloor{
 const {w,h}=def,grid=new Uint8Array(w*h),solid=new Uint8Array(w*h),trigger=new Int16Array(w*h).fill(-1);
 const at=(x:number,y:number)=>y*w+x;

 for(const room of def.rooms){
  const floor=FLOOR_CODE[room.floor],cap=room.stone?CAP_STONE:CAP,panel=room.stone?PANEL_STONE:PANEL;
  for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++){
   const inner=x>room.x&&x<room.x+room.w-1&&y>room.y+WALL_H&&y<room.y+room.h-1;
   const face=y>room.y&&y<=room.y+WALL_H&&x>room.x&&x<room.x+room.w-1;
   const i=at(x,y),current=grid[i];
   if(inner)grid[i]=floor;
   else if(face&&!(current===WOOD||current===TILE||current===CONC))grid[i]=panel;
   else if(current===VOID||current===CAP||current===CAP_STONE)grid[i]=cap;
  }
 }
 for(const door of def.doors){
  const code=FLOOR_CODE[door.floor??"wood"];
  for(let y=door.y;y<door.y+door.h;y++)for(let x=door.x;x<door.x+door.w;x++)grid[at(x,y)]=code;
 }

 const standing:Obj[]=[];
 def.objects.forEach((o,index)=>{
  const f=footprint(o);
  if(o.t==="stairsUp"||o.t==="stairsDown"){
   // The flight climbs into the wall; only the bottom step changes floors.
   for(let x=o.x;x<o.x+f.w;x++){for(let y=o.y;y<o.y+f.h-1;y++)solid[at(x,y)]=1;trigger[at(x,o.y+f.h-1)]=index}
   return;
  }
  if(f.flat)return;
  standing.push(o);
  // With painted art the furniture footprint comes from the pixels instead of these rects.
  if(art)return;
  for(let y=o.y;y<o.y+f.h;y++)for(let x=o.x;x<o.x+f.w;x++)solid[at(x,y)]=1;
 });

 const isFloor=(c:number)=>c===WOOD||c===TILE||c===CONC;
 const walk=new Uint8Array(w*h),furn=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++)walk[i]=isFloor(grid[i])&&!solid[i]?1:0;

 if(!art)return{def,w,h,grid,walk,trigger,standing,bake:bakeFloor(def,grid,w,h),art:false,front:null,furn,walk2:null,runs:null,hides:[],stairs:[]};

 // Painted floor: the picture is the bake and walkability is read from it (layout walls,
 // doors and stairs are ignored, they do not line up with the painting).
 const bake=document.createElement("canvas");bake.width=w*T;bake.height=h*T;
 const bg=bake.getContext("2d")!;bg.imageSmoothingEnabled=true;bg.drawImage(art,0,0,bake.width,bake.height);
 const pw=def.painted??{open:[],block:[],stairs:[],spawn:[]};
 const {walk2,runs,hides}=readPainting(bg.getImageData(0,0,bake.width,bake.height),pw.open,pw.block,pw.stairs,[...pw.spawn,...pw.stairs.map(stairsArrival)]);
 for(let ty=0;ty<h;ty++)for(let tx=0;tx<w;tx++){
  const c=(ty*2)*(w*2)+tx*2;
  walk[at(tx,ty)]=walk2[c]|walk2[c+1]|walk2[c+w*2]|walk2[c+w*2+1];
 }
 return{def,w,h,grid,walk,trigger,standing,bake,art:true,front:null,furn,walk2,runs,hides,stairs:pw.stairs};
}

// Ink: pixels darker than this are painted outlines. They are thickened by one pixel so the
// antialiased gaps in a 1px outline close, then they wall off furniture (table tops, beds) and rooms.
const INK_V=.42,H2=T/2;

// Reads a painted floor. Mirrored by tools/characters/walkmap.py, which renders the result.
//  1. Pixel flood fill from the seeds across every pixel that is not (thickened) ink.
//  2. A half-tile is walkable if at least 70% of its pixels were reached and read as floor.
//     Authored `open` and stair rects are always walkable, `block` rects never.
//  3. Only half-tiles still connected to a seed count, and pockets of floor showing under a table
//     or between furniture legs (blocked above, blocked within 1.5 tiles both sides) are filled.
function readPainting(img:ImageData,open:Rect[],block:Rect[],stairs:Rect[],seeds:{x:number;y:number}[]){
 const W=img.width,H=img.height,d=img.data,N=W*H;
 // A staircase is walkable from its rectangle down to its landing spot one tile below.
 stairs=stairs.map(r=>({...r,h:r.h+1}));
 const ink=new Uint8Array(N),floorpx=new Uint8Array(N),passable=new Uint8Array(N);
 for(let i=0;i<N;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];ink[i]=Math.max(r,g,b)/255<INK_V?1:0;floorpx[i]=floorish(r,g,b)?1:0}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  let hit=0;
  for(let dy=-1;dy<=1&&!hit;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx>=0&&xx<W&&ink[yy*W+xx]){hit=1;break}}}
  passable[y*W+x]=hit?0:1;
 }
 const pxRect=(r:Rect,fn:(i:number)=>void)=>{
  const x0=Math.max(0,Math.floor(r.x*T)),y0=Math.max(0,Math.floor(r.y*T)),x1=Math.min(W,Math.ceil((r.x+r.w)*T)),y1=Math.min(H,Math.ceil((r.y+r.h)*T));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)fn(y*W+x);
 };
 for(const r of [...open,...stairs])pxRect(r,i=>{passable[i]=1;floorpx[i]=1});
 for(const r of block)pxRect(r,i=>{passable[i]=0});
 // 1. pixel flood
 const reached=new Uint8Array(N),q=new Int32Array(N);let qh=0,qt=0;
 for(const s of seeds){const i=Math.floor(s.y*T)*W+Math.floor(s.x*T);if(i>=0&&i<N&&passable[i]&&!reached[i]){reached[i]=1;q[qt++]=i}}
 while(qh<qt){
  const i=q[qh++],x=i%W;
  if(x+1<W&&passable[i+1]&&!reached[i+1]){reached[i+1]=1;q[qt++]=i+1}
  if(x>0&&passable[i-1]&&!reached[i-1]){reached[i-1]=1;q[qt++]=i-1}
  if(i+W<N&&passable[i+W]&&!reached[i+W]){reached[i+W]=1;q[qt++]=i+W}
  if(i-W>=0&&passable[i-W]&&!reached[i-W]){reached[i-W]=1;q[qt++]=i-W}
 }
 // 2. half-tiles
 const w2=Math.floor(W/H2),h2=Math.floor(H/H2),M=w2*h2;
 let cell=new Uint8Array(M);const forced=new Uint8Array(M);
 for(let cy=0;cy<h2;cy++)for(let cx=0;cx<w2;cx++){
  let n=0;
  for(let y=cy*H2;y<cy*H2+H2;y++)for(let x=cx*H2;x<cx*H2+H2;x++){const i=y*W+x;if(reached[i]&&floorpx[i])n++}
  cell[cy*w2+cx]=n>=H2*H2*.7?1:0;
 }
 const cellRect=(r:Rect,fn:(c:number)=>void)=>{
  for(let cy=Math.floor(r.y*2);cy<Math.ceil((r.y+r.h)*2);cy++)for(let cx=Math.floor(r.x*2);cx<Math.ceil((r.x+r.w)*2);cx++)if(cx>=0&&cy>=0&&cx<w2&&cy<h2)fn(cy*w2+cx);
 };
 for(const r of [...open,...stairs])cellRect(r,c=>{cell[c]=1;forced[c]=1});
 // 3a. keep what is still connected to a seed
 const keep=new Uint8Array(M);qh=qt=0;
 for(const s of seeds){const c=Math.floor(s.y*2)*w2+Math.floor(s.x*2);if(c>=0&&c<M&&cell[c]&&!keep[c]){keep[c]=1;q[qt++]=c}}
 while(qh<qt){
  const c=q[qh++],x=c%w2;
  for(const n of [x+1<w2?c+1:-1,x>0?c-1:-1,c+w2<M?c+w2:-1,c-w2])if(n>=0&&cell[n]&&!keep[n]){keep[n]=1;q[qt++]=n}
 }
 cell=keep;
 // 3b. pockets
 for(let pass=0;pass<6;pass++){
  const mark:number[]=[];
  for(let cy=1;cy<h2;cy++)for(let cx=0;cx<w2;cx++){
   const c=cy*w2+cx;
   if(!cell[c]||forced[c]||cell[c-w2])continue;
   let left=false,right=false;
   for(let k=1;k<4;k++){if(cx-k>=0&&!cell[c-k])left=true;if(cx+k<w2&&!cell[c+k])right=true}
   if(left&&right)mark.push(c);
  }
  if(!mark.length)break;
  for(const c of mark)cell[c]=0;
 }
 // Depth runs: each column's vertical strips of blocked half-tiles.
 const runs:Run[]=[];
 for(let cx=0;cx<w2;cx++){
  let start=-1;
  for(let cy=0;cy<=h2;cy++){
   const blocked=cy<h2&&!cell[cy*w2+cx];
   if(blocked&&start<0)start=cy;
   else if(!blocked&&start>=0){runs.push({x:cx*H2,y0:start*H2,y1:cy*H2});start=-1}
  }
 }
 // Cat hiding spots: free-standing furniture with walkable floor right behind it. The cat's feet go
 // 2.5 half-tiles into the furniture (so it covers the body and the head peeks over the top), and
 // the three columns under the cat must all be furniture deep enough to cover it.
 const hides:HideSpot[]=[];
 const runAt=(cx:number,cy:number)=>runs.find(r=>r.x===cx*H2&&r.y0<=cy*H2&&r.y1>cy*H2);
 for(let cx=1;cx<w2-1;cx+=2){
  for(const r of runs){
   if(r.x!==cx*H2||r.y0===0)continue;
   const top=r.y0/H2;
   // 2-4 tiles deep: shallower cannot hide a cat, deeper is a wall seen from the room behind it.
   const depth=(r.y1-r.y0)/H2;
   // ...and furniture stands on the floor: there must be floor right in front of it too.
   const below=r.y1/H2;
   if(!cell[(top-1)*w2+cx]||depth<4||depth>8||below>=h2||!cell[below*w2+cx])continue;
   const feet=top+2.5;
   let ok=true;
   for(const nx of [cx-1,cx+1]){const n=runAt(nx,Math.floor(feet));if(!n||n.y0>(top+.5)*H2||n.y1<(feet+.5)*H2){ok=false;break}}
   if(ok)hides.push({x:(cx+.5)/2,y:feet/2,ay:(top-.5)/2});
  }
 }
 return{walk2:cell,runs,hides};
}

// Does a painted pixel read as floor (planks, tile, rugs, concrete, soft shadow) rather than furniture?
function floorish(r:number,g:number,b:number){
 const max=Math.max(r,g,b),min=Math.min(r,g,b),v=max/255,s=max?(max-min)/max:0;
 if(v<.38)return false;
 if(s<.12&&v>.9)return false;
 if(s<.18)return v>=.4&&v<=.95;   // includes cream bathroom tile
 let hue=0;
 if(max===r)hue=((g-b)/(max-min))*60;else if(max===g)hue=(2+(b-r)/(max-min))*60;else hue=(4+(r-g)/(max-min))*60;
 if(hue<0)hue+=360;
 return hue>=10&&hue<=52&&v>.5;
}

export function loadImage(src:string):Promise<HTMLImageElement>{
 return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
}

/* ---- terrain ------------------------------------------------------------ */

// Wall tiles are painted by what they face: a log row, a side post, or the bottom band.
const WALL_TOP=10,WALL_POST=11,WALL_BOTTOM=12;

function paintTile(g:G,code:number,tx:number,ty:number){
 const x=tx*T,y=ty*T,n=hash(tx,ty);
 switch(code){
  case WOOD:{
   // Long tan planks, one per row, with a sparse dark tick where boards meet.
   r(g,x,y,T,T,ty%2?"#d6a05f":"#dba866");r(g,x,y,T,1,"#e6bd7e");r(g,x,y+15,T,1,"#8a5a2e");
   if(n%5===0)r(g,x+2+((n>>4)%12),y+2,1,12,"#8a5a2e");
   break;
  }
  case TILE:{
   r(g,x,y,T,T,(tx+ty)%2?"#dccfae":"#e6dab8");r(g,x,y,T,1,"#a8946e");r(g,x,y,1,T,"#a8946e");
   break;
  }
  case CONC:{
   r(g,x,y,T,T,"#a69b8a");
   for(let i=0;i<3;i++)r(g,x+((n>>(i*5))&15),y+((n>>(i*5+3))&15),1,1,i?"#8d8273":"#b5aa98");
   if(tx%4===0)r(g,x,y,1,T,"#857a6a");if(ty%4===0)r(g,x,y,T,1,"#857a6a");
   break;
  }
  case PANEL:{
   // One stacked log per row: dark seam, rounded highlight, shaded underside.
   r(g,x,y,T,T,LOG);r(g,x,y,T,1,SEAM);r(g,x,y+1,T,2,LOG_L);r(g,x,y+12,T,3,LOG_D);r(g,x,y+15,T,1,SEAM);
   if(n%7===0)r(g,x+2+(n%9),y+6,3,1,SEAM);
   break;
  }
  case WALL_TOP:r(g,x,y,T,T,"#8a5a34");r(g,x,y,T,2,INK);r(g,x,y+2,T,2,LOG_L);r(g,x,y+12,T,3,LOG_D);r(g,x,y+15,T,1,SEAM);break;
  case WALL_POST:{
   // Vertical logs for the side walls.
   r(g,x,y,T,T,"#8f5e38");r(g,x,y,1,T,INK);r(g,x+6,y,1,T,SEAM);r(g,x+11,y,1,T,SEAM);r(g,x+15,y,1,T,INK);
   r(g,x+1,y,2,T,"#a8734a");r(g,x+7,y,2,T,"#a8734a");r(g,x+12,y,2,T,"#a8734a");
   if(n%5===0)r(g,x+2,y+(n%12),3,1,INK);
   break;
  }
  case WALL_BOTTOM:r(g,x,y,T,T,"#6b4428");r(g,x,y,T,1,INK);r(g,x,y+1,T,2,"#8f5e38");r(g,x,y+13,T,3,INK);r(g,x+3,y+6,1,5,INK);r(g,x+11,y+6,1,5,INK);break;
  case PANEL_STONE:{
   r(g,x,y,T,T,"#7d6f66");r(g,x,y,T,1,"#4e4039");r(g,x,y+8,T,1,"#4e4039");
   r(g,x+(ty%2?4:12),y,1,8,"#4e4039");r(g,x+(ty%2?12:4),y+8,1,8,"#4e4039");r(g,x+1,y+1,6,2,"#8e7f75");
   break;
  }
  case CAP_STONE:r(g,x,y,T,T,"#4a3f3a");r(g,x,y,T,2,"#66584f");r(g,x,y,1,T,INK);r(g,x+8,y,1,T,"#3a2f2a");break;
  default:r(g,x,y,T,T,"#141210");
 }
}

function bakeFloor(def:FloorDef,grid:Uint8Array,w:number,h:number){
 const c=document.createElement("canvas");c.width=w*T;c.height=h*T;
 const g=c.getContext("2d")!;
 const isFloor=(code:number)=>code===WOOD||code===TILE||code===CONC;
 const isPanel=(code:number)=>code===PANEL||code===PANEL_STONE;
 const isCap=(code:number)=>code===CAP||code===CAP_STONE;
 const codeAt=(tx:number,ty:number)=>tx<0||ty<0||tx>=w||ty>=h?VOID:grid[ty*w+tx];

 for(let ty=0;ty<h;ty++)for(let tx=0;tx<w;tx++){
  let code=grid[ty*w+tx];
  if(code===CAP){
   if(isPanel(codeAt(tx,ty+1)))code=WALL_TOP;
   else if(isFloor(codeAt(tx,ty-1)))code=WALL_BOTTOM;
   else code=WALL_POST;
  }
  paintTile(g,code,tx,ty);
 }

 // Cast shadows: under the back wall and along the left wall of each room.
 for(let ty=1;ty<h;ty++)for(let tx=1;tx<w;tx++){
  const code=grid[ty*w+tx];if(!isFloor(code))continue;
  if(isPanel(grid[(ty-1)*w+tx]))r(g,tx*T,ty*T,T,2,"rgba(58,35,20,.3)");
  if(isCap(grid[ty*w+tx-1]))r(g,tx*T,ty*T,2,T,"rgba(58,35,20,.2)");
 }

 // Door frames on north/south walls; thresholds on side walls.
 for(const d of def.doors){
  const x=d.x*T,y=d.y*T,dw=d.w*T,dh=d.h*T;
  if(d.w>=2){r(g,x-2,y,2,dh,INK);r(g,x+dw,y,2,dh,INK);r(g,x-2,y,dw+4,3,INK);r(g,x,y+3,dw,1,"#5c4238")}
  else{r(g,x,y-1,dw,1,INK);r(g,x,y+dh,dw,1,INK)}
 }

 for(const o of def.objects){const f=footprint(o);if(f.flat)paintObject(g,o.t,o.x*T,o.y*T,f.w*T,f.h*T,0)}
 return c;
}

/* ---- furniture ---------------------------------------------------------- */

function books(g:G,x:number,y:number,w:number,seed:number){
 const palette=[RED,BLUE,GREEN,GOLD,VIOLET,CREAM_D,RED_D,BLUE_D];
 let cx=x;let i=0;
 while(cx<x+w-2){const bw=2+((hash(seed,i)>>3)%2);const bh=7+((hash(seed,i)>>5)%3);r(g,cx,y+10-bh,bw,bh,palette[(seed+i*3)%palette.length]);cx+=bw+1;i++}
}

function plant(g:G,x:number,y:number){
 box(g,x+4,y+9,8,7,"#c0623a");r(g,x+5,y+10,6,1,"#e08a5a");
 r(g,x+2,y+4,12,5,GREEN);r(g,x+4,y+1,8,4,GREEN);r(g,x+6,y-1,4,3,GREEN);
 r(g,x+3,y+5,3,2,GREEN_D);r(g,x+9,y+3,3,2,GREEN_D);r(g,x+6,y+1,2,1,"#8fe08a");
}

function lampShade(g:G,x:number,y:number){box(g,x+2,y,12,8,GOLD);r(g,x+3,y+1,10,2,"#fff2b0");r(g,x+5,y+8,6,1,INK)}

function railing(g:G,x:number,y:number,w:number,h:number){
 r(g,x,y,3,h,WOOD_D);r(g,x+w-3,y,3,h,WOOD_D);r(g,x+1,y,1,h,WOOD_L);r(g,x+w-2,y,1,h,WOOD_L);
 r(g,x,y,w,2,INK);r(g,x,y+h-2,w,2,INK);
}

const painters:Record<ObjType,(g:G,x:number,y:number,w:number,h:number,t:number)=>void>={
 rug:(g,x,y,w,h)=>{box(g,x,y,w,h,ORANGE,ORANGE_D);r(g,x+3,y+3,w-6,h-6,ORANGE_D);r(g,x+4,y+4,w-8,h-8,ORANGE);for(let i=y+8;i<y+h-6;i+=6)r(g,x+6,i,w-12,1,"#f2b06a");r(g,x+w/2-4,y+h/2-3,8,6,CREAM_D);r(g,x+w/2-2,y+h/2-1,4,2,ORANGE_D)},
 rugS:(g,x,y,w,h)=>{box(g,x,y,w,h,ORANGE,ORANGE_D);r(g,x+3,y+3,w-6,h-6,ORANGE_D);r(g,x+4,y+4,w-8,h-8,ORANGE);r(g,x+w/2-3,y+h/2-2,6,4,CREAM_D)},
 runner:(g,x,y,w,h)=>{box(g,x,y,w,h,ORANGE_D,ORANGE_D);for(let i=2;i<h-2;i+=4)r(g,x+2,y+i,w-4,2,i%8?ORANGE:CREAM_D)},
 mat:(g,x,y,w,h)=>{box(g,x,y,w,h,"#8c6b3f","#5a4328");for(let i=2;i<w-2;i+=4)r(g,x+i,y+2,2,h-4,"#a8865a")},
 bathmat:(g,x,y,w,h)=>{box(g,x,y,w,h,PINK,"#d07a90");for(let i=2;i<w;i+=4)for(let j=2;j<h;j+=4)r(g,x+i,y+j,1,1,WHITE)},
 drain:(g,x,y)=>{box(g,x+3,y+3,10,10,GRAY_D);r(g,x+5,y+5,6,1,INK);r(g,x+5,y+8,6,1,INK);r(g,x+5,y+11,6,1,INK)},
 stairsUp:(g,x,y,w,h)=>{
  r(g,x,y,w,h,INK);
  for(let i=0;i<h/8;i++){const sy=y+h-8*(i+1);r(g,x+3,sy,w-6,8,i%2?"#d6a05f":"#dba866");r(g,x+3,sy,w-6,1,"#e6bd7e");r(g,x+3,sy+7,w-6,1,"#8a5a2e")}
  railing(g,x,y,w,h);
 },
 stairsDown:(g,x,y,w,h)=>{
  r(g,x,y,w,h,INK);
  for(let i=0;i<h/8;i++){const sy=y+h-8*(i+1),k=i/(h/8-1);r(g,x+3,sy,w-6,8,`rgb(${Math.round(219-170*k)},${Math.round(168-140*k)},${Math.round(102-85*k)})`);r(g,x+3,sy+7,w-6,1,"#2a1a10")}
  railing(g,x,y,w,h);
 },
 exitDoor:(g,x,y,w,h)=>{box(g,x,y-2,w,h+2,WOOD_M);r(g,x+3,y+1,w-6,h-4,WOOD_D);r(g,x+4,y+2,w-8,h-6,WOOD_L);r(g,x+w-6,y+h/2-1,2,2,GOLD)},
 window:(g,x,y,w,h)=>{
  // Wooden shutters, two per window, each with a pair of small inset panes.
  box(g,x,y,w,h,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);r(g,x+w/2-1,y+1,2,h-2,INK);
  for(const sx of[x+3,x+w/2+2])for(const sy of[y+4,y+h/2+2]){box(g,sx,sy,w/2-5,h/2-6,CREAM_D);r(g,sx+2,sy+2,w/2-9,h/2-10,CREAM)}
  r(g,x-1,y+h-3,w+2,3,WOOD_D);r(g,x-1,y+h-3,w+2,1,WOOD_L);
 },
 picture:(g,x,y)=>{box(g,x+2,y+2,12,11,GOLD);r(g,x+4,y+4,8,7,SKY);r(g,x+4,y+8,8,3,GREEN);r(g,x+9,y+5,2,2,GOLD)},
 mirror:(g,x,y,w,h)=>{r(g,x+7,y,2,3,INK);box(g,x+2,y+3,w-4,h-5,WOOD_M);r(g,x+4,y+5,w-8,h-9,SKY);r(g,x+5,y+7,2,h-14,WHITE);r(g,x+4,y+h-6,w-8,1,"#8fb4c4")},
 clock:(g,x,y)=>{box(g,x+3,y+2,10,10,CREAM);r(g,x+7,y+4,2,4,INK);r(g,x+8,y+7,3,1,INK)},
 cabinets:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);for(let i=0;i<w;i+=16){r(g,x+i,y,1,h,INK);r(g,x+i+11,y+8,2,2,GOLD)}},
 towels:(g,x,y,w)=>{r(g,x+1,y+2,w-2,2,GRAY);box(g,x+3,y+3,8,11,PINK);box(g,x+w-11,y+3,8,11,BLUE)},
 pegboard:(g,x,y,w,h)=>{box(g,x,y,w,h+1,CREAM_D);for(let i=3;i<w-2;i+=4)for(let j=3;j<h;j+=4)r(g,x+i,y+j,1,1,"#a89c80");r(g,x+5,y+3,2,9,GRAY_D);r(g,x+4,y+3,4,2,GRAY);r(g,x+w-9,y+4,6,2,GRAY);r(g,x+w-12,y+3,3,4,GRAY_D)},
 pipes:(g,x,y,w)=>{r(g,x,y+4,w,3,GRAY);r(g,x,y+4,w,1,"#c2c6cf");r(g,x+w-7,y+4,3,12,GRAY);r(g,x+8,y+10,w-16,2,GRAY_D)},
 fusebox:(g,x,y)=>{box(g,x+3,y+2,10,12,GRAY);r(g,x+5,y+4,6,6,INK);r(g,x+7,y+5,2,3,RED)},
 poster:(g,x,y)=>{box(g,x+2,y+1,12,14,VIOLET);r(g,x+5,y+4,6,5,WHITE);r(g,x+5,y+9,2,3,WHITE);r(g,x+9,y+9,2,3,WHITE)},
 bed:(g,x,y,w,h)=>{
  // Cream sheets, puffy pillow, orange blanket folded over, wooden footboard.
  box(g,x,y,w,h,CREAM);r(g,x+1,y+1,w-2,8,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);
  r(g,x+2,y+10,w-4,h-14,CREAM);box(g,x+4,y+11,w-8,11,WHITE,CREAM_D);r(g,x+6,y+13,w-12,2,"#fffbe8");
  r(g,x+2,y+25,w-4,h-30,ORANGE);r(g,x+2,y+25,w-4,3,ORANGE_D);r(g,x+2,y+28,w-4,1,"#f2b06a");for(let i=y+36;i<y+h-6;i+=8)r(g,x+2,i,w-4,1,ORANGE_D);
  r(g,x+1,y+h-5,w-2,4,WOOD_M);r(g,x,y+h-1,w,1,INK);r(g,x+2,y+h-1,3,1,WOOD_D);r(g,x+w-5,y+h-1,3,1,WOOD_D);
 },
 bedS:(g,x,y,w,h)=>{
  box(g,x,y,w,h,CREAM);r(g,x+1,y+1,w-2,8,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);
  r(g,x+2,y+10,w-4,h-14,CREAM);box(g,x+4,y+11,w-8,9,BLUE,BLUE_D);r(g,x+6,y+13,w-12,2,"#8aa4e8");
  r(g,x+2,y+22,w-4,h-27,CREAM_D);r(g,x+2,y+22,w-4,2,"#c2a56e");r(g,x+1,y+h-5,w-2,4,WOOD_M);r(g,x,y+h-1,w,1,INK);
 },
 wardrobe:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);r(g,x+w/2,y+3,1,h-4,INK);r(g,x+w/2-4,y+h/2,2,3,GOLD);r(g,x+w/2+2,y+h/2,2,3,GOLD)},
 dresser:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);for(let i=0;i<3;i++){r(g,x+2,y+5+i*9,w-4,1,INK);r(g,x+w/2-1,y+8+i*9,2,2,GOLD)}box(g,x+4,y-7,8,8,GOLD);r(g,x+6,y-5,4,4,SKY)},
 nightstand:(g,x,y,w,h)=>{box(g,x,y+3,w,h-3,WOOD_M);r(g,x+6,y+8,4,2,GOLD);lampShade(g,x,y-8);r(g,x+7,y,2,4,INK)},
 table:(g,x,y,w,h)=>{box(g,x,y,w,h-5,WOOD_L);r(g,x+1,y+1,w-2,2,"#e8c08a");r(g,x+2,y+h-5,3,5,WOOD_D);r(g,x+w-5,y+h-5,3,5,WOOD_D)},
 tableS:(g,x,y,w,h)=>{box(g,x+1,y+4,w-2,h-8,WOOD_L);r(g,x+4,y+h-4,2,4,WOOD_D);r(g,x+w-6,y+h-4,2,4,WOOD_D);box(g,x+6,y,4,5,BLUE);r(g,x+5,y-2,2,2,PINK);r(g,x+9,y-2,2,2,GOLD)},
 chair:(g,x,y,w,h)=>{box(g,x+3,y+1,w-6,5,WOOD_D);box(g,x+2,y+6,w-4,h-9,WOOD_M);r(g,x+3,y+h-3,2,3,WOOD_D);r(g,x+w-5,y+h-3,2,3,WOOD_D)},
 stool:(g,x,y,w,h)=>{box(g,x+3,y+5,w-6,7,WOOD_M);r(g,x+4,y+h-4,2,4,WOOD_D);r(g,x+w-6,y+h-4,2,4,WOOD_D)},
 sofa:(g,x,y,w,h)=>{box(g,x,y-4,w,h+4,BLUE,BLUE_D);r(g,x+1,y-3,w-2,3,BLUE_D);for(let i=1;i<w-1;i+=16){r(g,x+i+1,y+1,14,h-2,"#6a98e0");r(g,x+i+14,y+1,1,h-2,BLUE_D)}r(g,x,y,3,h,BLUE_D);r(g,x+w-3,y,3,h,BLUE_D)},
 armchair:(g,x,y,w,h)=>{box(g,x,y-4,w,h+4,BLUE,BLUE_D);r(g,x+1,y-3,w-2,3,BLUE_D);r(g,x+3,y+2,w-6,h-4,"#6a98e0");r(g,x,y,3,h,BLUE_D);r(g,x+w-3,y,3,h,BLUE_D)},
 tv:(g,x,y,w,h,t)=>{box(g,x+4,y+h-6,w-8,6,WOOD_D);box(g,x+1,y-9,w-2,14,INK);r(g,x+3,y-7,w-6,10,"#5fa8d8");const k=Math.floor(t*4)%3;r(g,x+4,y-6+k*3,w-8,1,"#bfe6ff");r(g,x+5,y-2,6,2,"#2e4f8e")},
 fireplace:(g,x,y,w,h,t)=>{
  box(g,x,y,w,h,"#b8623c","#7a3a22");
  for(let j=0;j<h;j+=5)for(let i=((j/5)%2)*6;i<w;i+=12)r(g,x+i+1,y+j+1,10,4,"#c9744a");
  r(g,x-1,y,w+2,3,WOOD_L);r(g,x-1,y+2,w+2,1,WOOD_D);
  r(g,x+10,y+10,w-20,h-12,INK);r(g,x+12,y+h-5,w-24,3,"#5a3a2a");
  const f=Math.floor(t*7)%3;r(g,x+15,y+h-13+f,w-30,8-f,RED);r(g,x+18,y+h-11+f,w-36,6-f,GOLD);r(g,x+21,y+h-9+f,w-42,3,"#fff2b0");
 },
 bookshelf:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);r(g,x+1,y+11,w-2,1,WOOD_D);r(g,x+1,y+21,w-2,1,WOOD_D);books(g,x+2,y+1,w-4,x+y);books(g,x+2,y+11,w-4,x*y+1);r(g,x+1,y+h-3,w-2,2,WOOD_D)},
 plant:(g,x,y)=>plant(g,x,y),
 counter:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x,y,w,6,INK);r(g,x+1,y+1,w-2,4,CREAM);r(g,x+w/2-1,y+10,2,2,GOLD)},
 sink:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x,y,w,6,INK);r(g,x+1,y+1,w-2,4,CREAM);box(g,x+3,y+1,w-6,5,GRAY);r(g,x+7,y-3,2,4,GRAY_D);r(g,x+w/2-1,y+10,2,2,GOLD)},
 stove:(g,x,y,w,h)=>{
  // Potbelly stove with a kettle on top.
  box(g,x+9,y-9,w-18,6,ORANGE_D);r(g,x+13,y-12,w-26,3,ORANGE_D);r(g,x+w-11,y-8,5,2,ORANGE_D);
  box(g,x+4,y-3,w-8,6,GRAY_D);r(g,x+6,y-2,w-12,2,GRAY);
  box(g,x+2,y+3,w-4,h-5,"#6f7f9f",GRAY_D);r(g,x+4,y+5,w-8,3,"#8fa0c0");r(g,x+3,y+h-9,w-6,2,GRAY_D);
  box(g,x+8,y+h-14,w-16,9,GRAY_D);r(g,x+11,y+h-11,w-22,3,INK);
  r(g,x+3,y+h-2,4,2,INK);r(g,x+w-7,y+h-2,4,2,INK);
 },
 fridge:(g,x,y,w,h)=>{box(g,x,y,w,h,WHITE,INK);r(g,x+1,y+1,w-2,2,CREAM_D);r(g,x+1,y+12,w-2,1,INK);r(g,x+w-4,y+6,2,4,GRAY_D);r(g,x+w-4,y+15,2,8,GRAY_D)},
 desk:(g,x,y,w,h)=>{box(g,x,y,w,h-4,WOOD_L);r(g,x+1,y+1,w-2,2,"#e8c08a");r(g,x+2,y+h-4,3,4,WOOD_D);r(g,x+w-5,y+h-4,3,4,WOOD_D);r(g,x+6,y+3,10,6,WHITE);r(g,x+7,y+5,8,1,GRAY);r(g,x+7,y+7,6,1,GRAY);box(g,x+w-12,y-6,8,6,GREEN_D);r(g,x+w-9,y,2,4,INK);r(g,x+20,y+3,6,5,WHITE);r(g,x+20,y+7,6,2,PINK)},
 catTree:(g,x,y,w,h)=>{box(g,x+5,y+4,w-10,h-4,WOOD_D);for(let i=y+6;i<y+h-2;i+=3)r(g,x+6,i,w-12,1,"#9c6a3a");box(g,x+1,y,w-2,5,CREAM_D);box(g,x+2,y+16,w-4,4,CREAM_D)},
 catBed:(g,x,y,w,h)=>{box(g,x+1,y+3,w-2,h-4,PINK,"#d07a90");r(g,x+4,y+6,w-8,h-9,CREAM)},
 bowls:(g,x,y)=>{box(g,x+1,y+8,6,5,BLUE);box(g,x+9,y+8,6,5,RED);r(g,x+2,y+9,4,1,"#8fb8f0");r(g,x+10,y+9,4,1,"#f08a7a")},
 tub:(g,x,y,w,h)=>{box(g,x,y+2,w,h-4,WHITE);r(g,x+1,y+3,w-2,2,CREAM_D);r(g,x+4,y+6,w-8,h-12,SKY);r(g,x+6,y+8,8,2,WHITE);r(g,x+w-9,y+3,3,5,GRAY);r(g,x+2,y+h-2,3,2,INK);r(g,x+w-5,y+h-2,3,2,INK)},
 toilet:(g,x,y,w,h)=>{box(g,x+3,y,w-6,6,WHITE);box(g,x+2,y+7,w-4,h-8,WHITE);r(g,x+4,y+9,w-8,4,SKY)},
 bathSink:(g,x,y,w,h)=>{box(g,x+2,y+2,w-4,7,WHITE);r(g,x+4,y+4,w-8,3,SKY);box(g,x+5,y+9,w-10,h-9,WHITE);r(g,x+7,y-1,2,3,GRAY)},
 box:(g,x,y,w,h)=>{box(g,x+1,y+2,w-2,h-2,"#c9955a","#6f4324");r(g,x+2,y+3,w-4,2,"#a87a44");r(g,x+w/2-1,y+3,2,h-4,"#e0c48c")},
 boxStack:(g,x,y,w,h)=>{box(g,x+1,y+h/2+1,w-2,h/2-1,"#c9955a","#6f4324");r(g,x+w/2-1,y+h/2+2,2,h/2-4,"#e0c48c");box(g,x+2,y+2,w-4,h/2-1,"#b8864c","#6f4324");r(g,x+3,y+3,w-6,2,"#a87a44")},
 barrel:(g,x,y,w,h)=>{box(g,x+2,y+1,w-4,h-1,WOOD_M,WOOD_D);r(g,x+2,y+4,w-4,2,GRAY_D);r(g,x+2,y+h-5,w-4,2,GRAY_D);r(g,x+4,y+2,2,h-3,WOOD_L)},
 washer:(g,x,y,w,h)=>{box(g,x,y,w,h,WHITE);r(g,x+1,y+1,w-2,3,CREAM_D);r(g,x+2,y+2,3,1,GREEN);box(g,x+4,y+5,8,8,GRAY);r(g,x+6,y+7,4,4,BLUE)},
 dryer:(g,x,y,w,h)=>{box(g,x,y,w,h,WHITE);r(g,x+1,y+1,w-2,3,CREAM_D);r(g,x+2,y+2,3,1,RED);box(g,x+4,y+5,8,8,GRAY);r(g,x+6,y+7,4,4,INK)},
 workbench:(g,x,y,w,h)=>{box(g,x,y+2,w,h-6,WOOD_M);r(g,x+1,y+3,w-2,2,WOOD_L);r(g,x+2,y+h-4,3,4,WOOD_D);r(g,x+w-5,y+h-4,3,4,WOOD_D);r(g,x+5,y+4,8,2,GRAY_D);r(g,x+11,y+3,3,4,GRAY);r(g,x+22,y+4,10,2,GOLD);r(g,x+36,y+3,6,4,RED)},
 labBench:(g,x,y,w,h)=>{box(g,x,y+2,w,h-6,CREAM);r(g,x+1,y+3,w-2,2,WHITE);r(g,x+2,y+h-4,3,4,GRAY_D);r(g,x+w-5,y+h-4,3,4,GRAY_D);for(let i=0;i<4;i++){r(g,x+5+i*9,y+4,6,4,WHITE);r(g,x+5+i*9,y+8,6,2,PINK)}lampShade(g,x+w-16,y-7)},
 shelfJars:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x+1,y+12,w-2,1,WOOD_D);for(let i=0;i<2;i++)for(let j=0;j<3;j++){box(g,x+3+j*9,y+4+i*12,7,7,"#cfe4e8");r(g,x+4+j*9,y+3+i*12,5,2,GRAY_D)}},
 heater:(g,x,y,w,h)=>{box(g,x+2,y+3,w-4,h-3,GRAY);r(g,x+2,y+8,w-4,2,GRAY_D);r(g,x+2,y+20,w-4,2,GRAY_D);r(g,x+6,y,3,4,GRAY_D);r(g,x+4,y+10,2,8,"#c2c6cf")},
 chest:(g,x,y,w,h)=>{box(g,x+1,y+3,w-2,h-3,WOOD_M,WOOD_D);r(g,x+1,y+8,w-2,1,WOOD_D);r(g,x+w/2-1,y+7,2,3,GOLD);r(g,x+2,y+4,w-4,1,WOOD_L)},
 coatRack:(g,x,y,w,h)=>{r(g,x+6,y+1,4,h-2,WOOD_D);r(g,x+7,y+1,1,h-2,WOOD_L);r(g,x+3,y+h-3,10,3,WOOD_D);r(g,x+2,y+3,12,2,WOOD_D);box(g,x+1,y+5,8,13,WHITE,CREAM_D);r(g,x+2,y+6,2,11,BLUE)},
 shoeShelf:(g,x,y,w,h)=>{box(g,x,y+5,w,h-5,WOOD_M);r(g,x+3,y+7,6,4,RED);r(g,x+11,y+7,6,4,WHITE);r(g,x+21,y+7,6,4,BLUE)},
 lamp:(g,x,y,w,h)=>{r(g,x+7,y+8,2,h-10,INK);r(g,x+4,y+h-2,8,2,INK);lampShade(g,x,y)},
 hallTable:(g,x,y,w,h)=>{box(g,x,y+5,w,h-5,WOOD_M);r(g,x+2,y+h-3,2,3,WOOD_D);r(g,x+w-4,y+h-3,2,3,WOOD_D);box(g,x+5,y-1,5,7,BLUE);r(g,x+4,y-4,2,3,PINK);r(g,x+9,y-4,2,3,GOLD);r(g,x+7,y-4,1,3,GREEN);r(g,x+18,y+1,8,5,WHITE);r(g,x+19,y+2,2,2,GRAY)},
 hutch:(g,x,y,w,h)=>{box(g,x,y,w,h,WOOD_M);r(g,x+1,y+1,w-2,2,WOOD_L);r(g,x+2,y+4,w-4,10,"#cfe4e8");for(let i=0;i<3;i++)box(g,x+4+i*9,y+6,6,6,WHITE,CREAM_D);r(g,x+1,y+16,w-2,1,INK);r(g,x+w/2-1,y+22,2,2,GOLD)},
 basket:(g,x,y,w,h)=>{box(g,x+2,y+6,w-4,h-6,"#d9b26a","#8c6b3f");for(let i=y+8;i<y+h-1;i+=3)r(g,x+3,i,w-6,1,"#b8924c");r(g,x+4,y+3,8,4,BLUE);r(g,x+6,y+1,4,3,BLUE_D)},
 fileCab:(g,x,y,w,h)=>{box(g,x+2,y,w-4,h,GRAY,GRAY_D);for(let i=0;i<3;i++){r(g,x+3,y+10*i+9,w-6,1,GRAY_D);r(g,x+6,y+10*i+4,4,2,INK)}}
};

export function paintObject(g:G,type:ObjType,x:number,y:number,w:number,h:number,t:number){painters[type](g,x,y,w,h,t)}

/* ---- sprites ------------------------------------------------------------ */

// The sheets are large; shrink them with smoothing, then snap alpha so edges stay crisp.
export function loadSheet(src:string,cols:number,rows:number,cell:number):Promise<HTMLCanvasElement>{
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{
   let source:CanvasImageSource=img,w=img.naturalWidth,h=img.naturalHeight;
   while(w/2>=cols*cell){
    const c=document.createElement("canvas");c.width=Math.floor(w/2);c.height=Math.floor(h/2);
    const g=c.getContext("2d")!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
    g.drawImage(source,0,0,c.width,c.height);source=c;w=c.width;h=c.height;
   }
   const out=document.createElement("canvas");out.width=cols*cell;out.height=rows*cell;
   const g=out.getContext("2d")!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
   g.drawImage(source,0,0,out.width,out.height);
   const data=g.getImageData(0,0,out.width,out.height);
   for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]<110?0:255;
   g.putImageData(data,0,0);
   resolve(out);
  };
  img.onerror=reject;
  img.src=src;
 });
}
