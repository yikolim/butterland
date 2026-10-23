// The four cats' brains, shared by the web house (HouseInterior.tsx) and the Pocket Lite
// cartridge (app/ds/cart.ts): wandering, Aggu's zoomies, Sashi and Ollie hiding, petting.

import {CATS,type CatBehavior,type CatRoom} from "./houseData";
import type {BuiltFloor,HideSpot} from "./houseDraw";
import {nearestFree} from "./motion";

// mode: wander = normal stroll, dash = Aggu's zoomies.
// Hiding: toHide walks on the floor to the spot behind the furniture, tuck steps into it (the
// furniture is depth-sorted in front, so only the head shows), hidden waits, unhide steps back out.
export type CatMode="wander"|"dash"|"toHide"|"tuck"|"hidden"|"unhide";
export type Cat={name:string;floor:number;x:number;y:number;tx:number;ty:number;facing:"left"|"right";frame:number;resting:boolean;rest:number;clock:number;lines:string[];
 sheet:string;bolt?:string;behavior:CatBehavior;mode:CatMode;dashes:number;hideAt:HideSpot|null;ghost:boolean;peek:number;placed:boolean;room?:CatRoom};
export type Effect={x:number;y:number;kind:"heart"|"alert";ttl:number;cat:Cat};
export type FreeFn=(f:BuiltFloor,x:number,y:number,hw:number)=>boolean;

// Per-behavior tuning: tiles per second and seconds per walk frame.
const PACE:Record<CatBehavior,{speed:number;frame:number;restMin:number;restMax:number}>={
 elegant:{speed:1.1,frame:.26,restMin:3,restMax:6},
 zoomies:{speed:2.6,frame:.14,restMin:1,restMax:2.5},
 hide:{speed:2,frame:.16,restMin:1.5,restMax:3}
};
const DASH_SPEED=5.5,DASH_FRAME=.1;
// Chance a cat enjoys being petted; otherwise it bolts.
const LIKES_PETS:Record<CatBehavior,number>={elegant:.9,hide:.5,zoomies:.3};
// Meow pitch per behavior: Michael low and slow, Sashi high and short, Aggu a squeak.
const MEOW:Record<CatBehavior,{hz:number;len:number}>={elegant:{hz:420,len:.42},hide:{hz:620,len:.3},zoomies:{hz:760,len:.22}};

export function makeCats():Cat[]{
 return CATS.map(c=>({...c,tx:c.x,ty:c.y,facing:"right",frame:1,resting:true,rest:1+Math.random()*2,clock:0,mode:"wander",dashes:0,hideAt:null,ghost:false,peek:0,placed:false}));
}

const pathFree=(f:BuiltFloor,cat:Cat,tx:number,ty:number,free:FreeFn)=>{
 const dx=tx-cat.x,dy=ty-cat.y,steps=Math.ceil(Math.hypot(dx,dy)/.3);
 if(steps<3)return false;
 for(let i=1;i<=steps;i++){if(!free(f,cat.x+dx*i/steps,cat.y+dy*i/steps,.3))return false}
 return true;
};
// Michael strolls in long straight lines; everyone else picks a spot nearby. Dashes reach far.
const inRoom=(cat:Cat,x:number,y:number)=>!cat.room||(x>=cat.room.x0&&x<=cat.room.x1&&y>=cat.room.y0&&y<=cat.room.y1);
const pickTarget=(cat:Cat,f:BuiltFloor,free:FreeFn,reach=1)=>{
 for(let attempt=0;attempt<10;attempt++){
  const wide=cat.behavior==="elegant"?{x:8,y:2}:{x:5,y:3};
  const tx=cat.x+(Math.random()*2-1)*wide.x*reach,ty=cat.y+(Math.random()*2-1)*wide.y*reach;
  if(inRoom(cat,tx,ty)&&pathFree(f,cat,tx,ty,free)){cat.tx=tx;cat.ty=ty;return true}
 }
 return false;
};
const startRest=(cat:Cat,min:number,max:number)=>{cat.resting=true;cat.rest=min+Math.random()*(max-min);cat.clock=0;cat.frame=1};
// Nearest painted hiding spot whose approach (the floor just behind the furniture) the cat can walk to.
const pickHide=(cat:Cat,f:BuiltFloor,free:FreeFn)=>{
 const spots=f.hides.filter(h=>h!==cat.hideAt&&inRoom(cat,h.x,h.ay)&&Math.hypot(h.x-cat.x,h.ay-cat.y)<14).sort((a,b)=>Math.hypot(a.x-cat.x,a.ay-cat.y)-Math.hypot(b.x-cat.x,b.ay-cat.y));
 for(const h of spots.slice(0,8)){
  if(!free(f,h.x,h.ay,.3)||!pathFree(f,cat,h.x,h.ay,free))continue;
  cat.hideAt=h;cat.tx=h.x;cat.ty=h.ay;cat.ghost=false;cat.mode="toHide";return true;
 }
 return false;
};
// Step back out to the approach spot behind the furniture.
const pickUnhide=(cat:Cat)=>{
 const h=cat.hideAt;if(!h)return false;
 cat.tx=h.x;cat.ty=h.ay;cat.ghost=true;cat.mode="unhide";return true;
};
const beginMove=(cat:Cat)=>{cat.resting=false;cat.clock=0};

export function updateCats(cats:Cat[],f:BuiltFloor,floorIndex:number,dt:number,free:FreeFn,reduceMotion:boolean){
 for(const cat of cats){
  if(cat.floor!==floorIndex)continue;
  // A cat's start spot comes from the layout; on a painted floor move it onto real floor once.
  if(!cat.placed&&f.art){cat.placed=true;if(!free(f,cat.x,cat.y,.3)){const p=nearestFree(f,cat.x,cat.y,.3);cat.x=cat.tx=p.x;cat.y=cat.ty=p.y}}
  cat.clock+=dt;
  const pace=PACE[cat.behavior];
  if(cat.resting){
   if(cat.mode==="hidden"){
    // Peek: look one way, then the other, from behind the furniture.
    cat.frame=1;
    if(!reduceMotion){
     cat.peek-=dt;
     if(cat.peek<=0){cat.peek=1.5+Math.random()*2.5;cat.facing=cat.facing==="left"?"right":"left"}
    }
   }else cat.frame=1+Math.floor(cat.clock/1.5)%3;
   if(reduceMotion)continue;
   cat.rest-=dt;
   if(cat.rest>0)continue;
   // Rest is over: decide what to do next by personality.
   if(cat.behavior==="zoomies"){
    if(cat.mode!=="dash"&&Math.random()<.35){cat.mode="dash";cat.dashes=3+Math.floor(Math.random()*3)}
    if(cat.mode==="dash"){
     if(cat.dashes>0&&pickTarget(cat,f,free,3)){cat.dashes--;beginMove(cat);continue}
     cat.mode="wander";
    }
    if(pickTarget(cat,f,free))beginMove(cat);else cat.rest=1;
   }else if(cat.behavior==="hide"){
    if(cat.mode==="hidden"){if(pickUnhide(cat))beginMove(cat);else cat.rest=2;continue}
    if(Math.random()<.8&&pickHide(cat,f,free)){beginMove(cat);continue}
    cat.mode="wander";
    if(pickTarget(cat,f,free))beginMove(cat);else cat.rest=1.5;
   }else{
    cat.mode="wander";
    if(pickTarget(cat,f,free))beginMove(cat);else cat.rest=1.5;
   }
   continue;
  }
  const dx=cat.tx-cat.x,dy=cat.ty-cat.y,distance=Math.hypot(dx,dy);
  const dashing=cat.mode==="dash";
  const tucking=cat.mode==="tuck"||cat.mode==="unhide";
  const speed=dashing?DASH_SPEED:tucking?.9:pace.speed,frameTime=dashing?DASH_FRAME:pace.frame;
  if(distance<.15){
   cat.x=cat.tx;cat.y=cat.ty;
   if(cat.mode==="toHide"&&cat.hideAt){cat.mode="tuck";cat.ghost=true;cat.ty=cat.hideAt.y;continue}
   if(cat.mode==="tuck"){cat.mode="hidden";cat.facing=Math.random()<.5?"left":"right";startRest(cat,8,15);cat.peek=1+Math.random()*2;continue}
   if(cat.mode==="unhide"){cat.mode="wander";cat.ghost=false;startRest(cat,.5,1.5);continue}
   if(dashing&&cat.dashes>0){startRest(cat,.1,.3);continue}
   startRest(cat,pace.restMin,pace.restMax);continue;
  }
  const move=Math.min(distance,speed*dt);
  const nx=cat.x+dx/distance*move,ny=cat.y+dy/distance*move;
  if(!cat.ghost&&!free(f,nx,ny,.3)){if(dashing)cat.dashes=0;if(cat.mode==="toHide")cat.mode="wander";startRest(cat,1,2);continue}
  cat.x=nx;cat.y=ny;cat.facing=dx<0?"left":"right";cat.frame=Math.floor(cat.clock/frameTime)%4;
 }
}

// A cat that has just noticed Claire runs off on a string of long dashes (Aggu's zoomies).
export function zoomOff(cat:Cat,f:BuiltFloor,free:FreeFn,effects:Effect[]){
 effects.push({x:cat.x,y:cat.y,kind:"alert",ttl:1,cat});
 cat.ghost=false;cat.hideAt=null;cat.mode="dash";cat.dashes=4;
 if(pickTarget(cat,f,free,3)||pickTarget(cat,f,free,2)||pickTarget(cat,f,free,1)){cat.resting=false;cat.clock=0}else startRest(cat,.1,.2);
}

// Claire pets a cat: it either leans in (heart, purr) or bolts (alert, dash). Returns the dialog.
// `caught` makes it lean in (a chased cat finally caught).
export function petCat(cat:Cat,f:BuiltFloor,free:FreeFn,claireX:number,effects:Effect[],caught=false):{likes:boolean;name:string;pages:string[]}{
 cat.facing=claireX<cat.x?"left":"right";
 const likes=caught||Math.random()<LIKES_PETS[cat.behavior];
 if(likes){
  if(cat.mode==="tuck"&&cat.hideAt){cat.mode="hidden";cat.x=cat.hideAt.x;cat.y=cat.hideAt.y}
  else if(cat.mode!=="hidden"){cat.ghost=false;cat.mode="wander"}
  startRest(cat,4,6);
  effects.push({x:cat.x,y:cat.y,kind:"heart",ttl:1.6,cat});
  return{likes,name:cat.name,pages:[`•${cat.name} leans into the pet and purrs.`,...cat.lines.slice(0,1)]};
 }
 // Bolt: a fast dash to somewhere far, then a long sulk. A hidden cat slips out first.
 effects.push({x:cat.x,y:cat.y,kind:"alert",ttl:1,cat});
 if((cat.mode==="hidden"||cat.mode==="tuck")&&pickUnhide(cat)){cat.resting=false;cat.clock=0}
 else{
  cat.ghost=false;cat.hideAt=null;cat.mode="dash";cat.dashes=0;
  if(pickTarget(cat,f,free,3)){cat.resting=false;cat.clock=0}else startRest(cat,2,3);
 }
 return{likes,name:"",pages:[cat.bolt??`•${cat.name} was not ready for that. ${cat.name} runs away!`]};
}

export function tickEffects(effects:Effect[],dt:number){
 for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.ttl-=dt;e.x=e.cat.x;e.y=e.cat.y;if(e.ttl<=0)effects.splice(i,1)}
}

// Hearts and alert marks float up over the cat. (cx,cy) is the camera, catCell the sprite size.
export function drawEffects(g:CanvasRenderingContext2D,effects:Effect[],cx:number,cy:number,T:number,catCell:number){
 for(const e of effects){
  const ex=Math.round(e.x*T-cx),ey=Math.round(e.y*T-cy-catCell-2);
  const lift=Math.round((e.kind==="heart"?1.6-e.ttl:1-e.ttl)*10);
  if(e.kind==="heart"){
   g.fillStyle="#ff5a8a";
   const hx=ex-3,hy=ey-lift;
   g.fillRect(hx,hy,2,2);g.fillRect(hx+4,hy,2,2);g.fillRect(hx-1,hy+1,8,2);g.fillRect(hx,hy+3,6,1);g.fillRect(hx+1,hy+4,4,1);g.fillRect(hx+2,hy+5,2,1);
  }else{
   g.fillStyle="#ffe260";g.fillRect(ex-1,ey-lift-6,2,5);g.fillRect(ex-1,ey-lift+1,2,2);
   g.fillStyle="#1f1e2e";g.fillRect(ex-2,ey-lift-7,4,1);
  }
 }
}

// A tiny synthesized meow: a triangle wave that slides down with a little vibrato.
export function makeMeow(){
 let audioCtx:AudioContext|null=null;
 // `little` is a short, higher, softer chirp (a cat being spotted or petted).
 return(cat:Cat,happy:boolean,little=false)=>{
  try{
   audioCtx??=new AudioContext();
   if(audioCtx.state==="suspended")void audioCtx.resume();
   const base=MEOW[cat.behavior],hz=base.hz*(little?1.3:1),len=base.len*(little?.55:1),vol=little?.1:.16,ctx=audioCtx,t=ctx.currentTime;
   const osc=ctx.createOscillator(),gain=ctx.createGain(),vib=ctx.createOscillator(),vibGain=ctx.createGain();
   osc.type="triangle";
   osc.frequency.setValueAtTime(hz*(happy?1:1.25),t);
   osc.frequency.exponentialRampToValueAtTime(hz*1.18,t+len*.3);
   osc.frequency.exponentialRampToValueAtTime(hz*(happy?.72:.95),t+len);
   vib.frequency.value=happy?7:14;vibGain.gain.value=hz*.03;
   vib.connect(vibGain);vibGain.connect(osc.frequency);
   gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(vol,t+.03);gain.gain.exponentialRampToValueAtTime(.001,t+len);
   osc.connect(gain);gain.connect(ctx.destination);
   osc.start(t);vib.start(t);osc.stop(t+len+.02);vib.stop(t+len+.02);
  }catch{/* no audio */}
 };
}

// How close Claire must be to spot a cat: right next to it, and closer still when it is hiding.
export const spotRadius=(cat:Cat)=>cat.mode==="hidden"||cat.mode==="tuck"?1.1:1.6;
