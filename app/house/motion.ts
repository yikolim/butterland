// Walking inside the house, shared by the web house and the Pocket Lite cartridge.
// Claire's collision box is a little narrower than a tile, and when she bumps a doorframe
// she slides sideways into the opening instead of stopping dead, so one-tile doors are easy.

import {CATALOG} from "./houseData";
import type {BuiltFloor} from "./houseDraw";
import {stairsArrival} from "./paintedWalk";

// Claire's feet are a small box (0.4 x 0.12 tiles) so she fits the one-tile painted doorways.
export const CLAIRE_HW=.2;

export const walkable=(f:BuiltFloor,x:number,y:number)=>{
 if(x<0||y<0||x>=f.w||y>=f.h)return false;
 if(f.walk2){const cx=Math.floor(x*2),cy=Math.floor(y*2);return f.walk2[cy*f.w*2+cx]===1}
 return f.walk[Math.floor(y)*f.w+Math.floor(x)]===1;
};
export const free=(f:BuiltFloor,x:number,y:number,hw:number)=>walkable(f,x-hw,y-.1)&&walkable(f,x+hw,y-.1)&&walkable(f,x-hw,y+.02)&&walkable(f,x+hw,y+.02);

// Move `p` by (dx,dy)*speed*dt. Each axis is tried on its own; if it is blocked, look for an
// opening up to 0.7 tiles to either side and nudge toward it (door funnelling).
export function stepWithAssist(f:BuiltFloor,p:{x:number;y:number},dx:number,dy:number,speed:number,dt:number){
 const d=speed*dt;
 if(dx){
  const nx=p.x+dx*d;
  if(free(f,nx,p.y,CLAIRE_HW))p.x=nx;
  else funnel(f,p,nx,p.y,"y",d);
 }
 if(dy){
  const ny=p.y+dy*d;
  if(free(f,p.x,ny,CLAIRE_HW))p.y=ny;
  else funnel(f,p,p.x,ny,"x",d);
 }
}

function funnel(f:BuiltFloor,p:{x:number;y:number},nx:number,ny:number,axis:"x"|"y",d:number){
 for(const off of [.1,.2,.3,.4,.5,.6,.75]){
  for(const s of [-1,1]){
   const tx=axis==="x"?p.x+s*off:nx,ty=axis==="y"?p.y+s*off:ny;
   if(!free(f,tx,ty,CLAIRE_HW))continue;
   // Slide toward the opening at walking speed; once lined up the next frame goes through.
   if(axis==="x")p.x+=s*Math.min(off,d);else p.y+=s*Math.min(off,d);
   return;
  }
 }
}

// Which floor do the stairs under (x,y) lead to? Painted floors use their painted staircases,
// drawn floors the layout's stair trigger tiles.
export function stairsTarget(f:BuiltFloor,x:number,y:number):number|undefined{
 if(f.art){
  for(const s of f.stairs)if(x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h)return s.to;
  return undefined;
 }
 const tx=Math.floor(x),ty=Math.floor(y);
 if(tx<0||ty<0||tx>=f.w||ty>=f.h)return undefined;
 const i=f.trigger[ty*f.w+tx];
 return i>=0?f.def.objects[i].to:undefined;
}

// Where Claire stands after arriving on floor `f` from floor `from`.
export function arrivalPoint(f:BuiltFloor,from:number):{x:number;y:number}|null{
 if(f.art){const s=f.stairs.find(s=>s.to===from)??f.stairs[0];return s?stairsArrival(s):null}
 const landing=f.def.objects.find(o=>(o.t==="stairsUp"||o.t==="stairsDown")&&o.to===from)??f.def.objects.find(o=>o.t==="stairsUp"||o.t==="stairsDown");
 return landing?{x:landing.x+1,y:landing.y+CATALOG.stairsUp.h+.6}:null;
}

// Nearest spot to (x,y) where a box of half-width hw fits, searched outward in half-tile rings.
export function nearestFree(f:BuiltFloor,x:number,y:number,hw:number):{x:number;y:number}{
 if(free(f,x,y,hw))return{x,y};
 for(let r=1;r<40;r++){
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   const nx=Math.floor(x*2+dx)/2+.25,ny=Math.floor(y*2+dy)/2+.4;
   if(free(f,nx,ny,hw))return{x:nx,y:ny};
  }
 }
 return{x,y};
}
