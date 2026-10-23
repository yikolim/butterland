"use client";

import {useEffect,useRef,useState,type MutableRefObject} from "react";
import {CATALOG,CATS,ENTRY,EXIT,FLOORS,T,VIEW_H,VIEW_W,type Dir,type Obj} from "./houseData";
import {drawEffects,makeCats,makeMeow,petCat,spotRadius,tickEffects,updateCats,type Cat,type Effect} from "./cats";
import {CLAIRE_HW,arrivalPoint,free,stairsTarget,stepWithAssist} from "./motion";
import {buildFloor,loadImage,loadSheet,paintObject,type BuiltFloor} from "./houseDraw";

type Props={
 keys:MutableRefObject<Set<string>>;
 touchDirection:MutableRefObject<Dir|null>;
 interactRef:MutableRefObject<(()=>void)|null>;
 playFootstep:()=>void;
 onExit:()=>void;
};

type Dialog={name:string;text:string;done:boolean;more:boolean};
type Drawable={bottom:number;draw:()=>void};

const SPEED=5.4,STEP_FRAME=.09,frameOrder=[0,1,2,1];
const directionRow:Record<Dir,number>={down:0,left:1,right:2,up:3};
const DIRV:Record<Dir,{x:number;y:number}>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const CLAIRE_CELL=40,CAT_CELL=29,TYPE_SPEED=42; // cat = 7.28% of view width, as outdoors

export default function HouseInterior(props:Props){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const latest=useRef(props);
 useEffect(()=>{latest.current=props});

 const [dialog,setDialog]=useState<Dialog|null>(null);
 const [floorLabel,setFloorLabel]=useState({name:FLOORS[0].name,key:0});
 const [hint,setHint]=useState("");
 const [fade,setFade]=useState(true);
 const [found,setFound]=useState(0);

 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const g=canvas.getContext("2d");if(!g)return;
  g.imageSmoothingEnabled=false;

  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alive=true;
  const floors:BuiltFloor[]=FLOORS.map(def=>buildFloor(def));
  Promise.all(FLOORS.map(def=>def.art?loadImage(def.art).catch(()=>null):Promise.resolve(null))).then(images=>{
   if(!alive)return;
   images.forEach((img,i)=>{if(img)floors[i]=buildFloor(FLOORS[i],img)});
  });
  const cats:Cat[]=makeCats();
  let claireSheet:HTMLCanvasElement|null=null;
  const catSheets:Record<string,HTMLCanvasElement>={};
  loadSheet("/sprite-sheets/claire-walk-pixelated-v2.png",3,4,CLAIRE_CELL).then(s=>{claireSheet=s}).catch(()=>{});
  for(const src of new Set(CATS.map(c=>c.sheet)))loadSheet(src,4,3,CAT_CELL).then(s=>{catSheets[src]=s}).catch(()=>{});

  let floorIndex=0;
  const claire={x:ENTRY.x,y:ENTRY.y,dir:"up" as Dir,frame:1,moving:false};
  let stepClock=0,lastStep=-1,last=0,busy=false,animation=0,elapsed=0;
  const cam={x:0,y:0};
  let dlg:{name:string;pages:string[];page:number;shown:number;done:boolean;clock:number}|null=null;
  let lastHint="";
  const effects:Effect[]=[];
  const foundCats=new Set<string>();
  let countDone=false;
  const meow=makeMeow();
  const timers:number[]=[];
  const later=(ms:number,fn:()=>void)=>{timers.push(window.setTimeout(fn,ms))};


  /* ---- camera ---- */
  const snapCamera=()=>{
   const f=floors[floorIndex];
   cam.x=Math.max(0,Math.min(f.w*T-VIEW_W,claire.x*T-VIEW_W/2));
   cam.y=Math.max(0,Math.min(f.h*T-VIEW_H,claire.y*T-VIEW_H/2));
  };
  snapCamera();

  /* ---- dialog ---- */
  const pushDialog=()=>{
   if(!dlg){setDialog(null);return}
   const page=dlg.pages[dlg.page];
   setDialog({name:dlg.name,text:page.slice(0,dlg.shown),done:dlg.done,more:dlg.page<dlg.pages.length-1});
  };
  const openDialog=(name:string,pages:string[])=>{
   dlg={name,pages,page:0,shown:reduceMotion?pages[0].length:0,done:reduceMotion,clock:0};
   claire.moving=false;claire.frame=1;pushDialog();
  };

  /* ---- what is Claire facing? ---- */
  const probe=():{kind:"cat";cat:Cat}|{kind:"obj";obj:Obj}|{kind:"exit"}|null=>{
   const f=floors[floorIndex],d=DIRV[claire.dir];
   const px=claire.x+d.x*.9,py=claire.y+d.y*.9;
   for(const cat of cats){
    if(cat.floor!==floorIndex)continue;
    if(Math.abs(cat.x-px)<.9&&Math.abs(cat.y-py)<.9)return{kind:"cat",cat};
   }
   const tx=Math.floor(px),ty=Math.floor(py);
   for(const obj of f.def.objects){
    if(!obj.say)continue;
    const c=CATALOG[obj.t],w=obj.w??c.w,h=obj.h??c.h,slack=f.art?1:0;
    if(tx>=obj.x-slack&&tx<obj.x+w+slack&&ty>=obj.y-slack&&ty<obj.y+h+slack)return{kind:"obj",obj};
   }
   if(floorIndex===0&&claire.dir==="down"&&claire.y>31.6&&claire.x>=EXIT.x0&&claire.x<EXIT.x1)return{kind:"exit"};
   return null;
  };

  const interact=()=>{
   if(busy)return;
   if(dlg){
    if(!dlg.done){dlg.shown=dlg.pages[dlg.page].length;dlg.done=true;pushDialog()}
    else if(dlg.page<dlg.pages.length-1){dlg.page++;dlg.shown=0;dlg.done=false;dlg.clock=0;pushDialog()}
    else{dlg=null;setDialog(null)}
    return;
   }
   const target=probe();
   if(!target)return;
   if(target.kind==="cat"){
    const pet=petCat(target.cat,floors[floorIndex],free,claire.x,effects);
    meow(target.cat,pet.likes);
    openDialog(pet.name,pet.pages);
   }else if(target.kind==="obj"&&target.obj.say)openDialog("",target.obj.say);
  };
  latest.current.interactRef.current=interact;

  /* ---- floor changes and leaving ---- */
  let stairsLock=false,stairsReleased=true;
  const goFloor=(to:number,from:number)=>{
   busy=true;setFade(true);stairsLock=true;stairsReleased=false;
   later(230,()=>{
    floorIndex=to;
    const f=floors[to];
    const landing=arrivalPoint(f,from);
    if(landing){claire.x=landing.x;claire.y=landing.y}
    claire.dir="down";claire.moving=false;claire.frame=1;
    snapCamera();
    setFloorLabel(current=>({name:f.def.name,key:current.key+1}));
    later(240,()=>{setFade(false);busy=false});
   });
  };
  const leave=()=>{busy=true;setFade(true);later(260,()=>latest.current.onExit())};
  later(60,()=>setFade(false));

  /* ---- Claire ---- */
  const updateClaire=(dt:number)=>{
   const f=floors[floorIndex],{keys,touchDirection,playFootstep}=latest.current;
   const pressed=keys.current,held=touchDirection.current;
   let dx=(pressed.has("arrowright")||pressed.has("d")||held==="right"?1:0)-(pressed.has("arrowleft")||pressed.has("a")||held==="left"?1:0);
   let dy=(pressed.has("arrowdown")||pressed.has("s")||held==="down"?1:0)-(pressed.has("arrowup")||pressed.has("w")||held==="up"?1:0);
   if(!dx&&!dy){
    stairsReleased=true;
    if(claire.moving){claire.moving=false;claire.frame=1;stepClock=0;lastStep=-1}
    return;
   }
   const length=Math.hypot(dx,dy);dx/=length;dy/=length;stepClock+=dt;
   const step=Math.floor(stepClock/STEP_FRAME)%frameOrder.length;
   if(step!==lastStep){lastStep=step;if(step%2===0)playFootstep()}
   claire.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
   claire.frame=frameOrder[step];claire.moving=true;
   stepWithAssist(f,claire,dx,dy,SPEED,dt);

   // After a floor change the stairs stay locked until the keys have been let go once and Claire
   // is off the stairs, so a key still held from the climb does not carry her straight back.
   const to=stairsTarget(f,claire.x,claire.y);
   if(to===undefined&&stairsReleased)stairsLock=false;
   if(to!==undefined&&!stairsLock){goFloor(to,floorIndex);return}
   if(floorIndex===0&&claire.y>=EXIT.y&&claire.x>=EXIT.x0&&claire.x<EXIT.x1)leave();
  };

  /* ---- drawing ---- */
  const drawSprite=(sheet:HTMLCanvasElement|null,cell:number,col:number,row:number,x:number,y:number,fallback:string)=>{
   if(sheet)g.drawImage(sheet,col*cell,row*cell,cell,cell,x,y,cell,cell);
   else{g.fillStyle=fallback;g.fillRect(x+cell/3,y+cell/3,cell/3,cell*2/3)}
  };

  const render=(t:number)=>{
   const f=floors[floorIndex];
   const cx=Math.round(cam.x),cy=Math.round(cam.y);
   g.fillStyle="#120d14";g.fillRect(0,0,VIEW_W,VIEW_H);
   g.drawImage(f.bake,cx,cy,VIEW_W,VIEW_H,0,0,VIEW_W,VIEW_H);

   const list:Drawable[]=[];
   if(f.runs){
    // Walls and furniture, one 8px column strip at a time, sorted by the strip's bottom edge.
    const bake=f.bake;
    for(const r of f.runs){
     if(r.x+8<cx||r.x>cx+VIEW_W||r.y1<cy||r.y0>cy+VIEW_H)continue;
     const x=r.x-cx,y=r.y0-cy,h=r.y1-r.y0;
     list.push({bottom:r.y1-cy,draw:()=>g.drawImage(bake,r.x,r.y0,8,h,x,y,8,h)});
    }
   }else for(const o of f.standing){
    const c=CATALOG[o.t],w=(o.w??c.w)*T,h=(o.h??c.h)*T,x=o.x*T-cx,y=o.y*T-cy;
    if(x>VIEW_W||y>VIEW_H+16||x+w<0||y+h<-16)continue;
    list.push({bottom:y+h,draw:()=>paintObject(g,o.t,x,y,w,h,t)});
   }
   for(const cat of cats){
    if(cat.floor!==floorIndex)continue;
    const px=cat.x*T-cx,py=cat.y*T-cy;
    const row=cat.resting?2:cat.facing==="left"?1:0;
    list.push({bottom:py,draw:()=>drawSprite(catSheets[cat.sheet]??null,CAT_CELL,cat.frame,row,Math.round(px-CAT_CELL/2),Math.round(py-CAT_CELL+2),"#ffffff")});
   }
   {
    const px=claire.x*T-cx,py=claire.y*T-cy;
    list.push({bottom:py+.01,draw:()=>drawSprite(claireSheet,CLAIRE_CELL,claire.frame,directionRow[claire.dir],Math.round(px-CLAIRE_CELL/2),Math.round(py-CLAIRE_CELL*.94),"#ffffff")});
   }
   list.sort((a,b)=>a.bottom-b.bottom);
   for(const item of list)item.draw();
   drawEffects(g,effects,cx,cy,T,CAT_CELL);
  };

  /* ---- main loop ---- */
  const tick=(now:number)=>{
   if(!alive)return;
   const dt=Math.min(.04,(now-(last||now))/1000);last=now;elapsed+=dt;
   if(!busy&&!dlg)updateClaire(dt);
   if(!busy)updateCats(cats,floors[floorIndex],floorIndex,dt,free,reduceMotion);
   tickEffects(effects,dt);
   // Cat count: a cat is found once Claire gets close to it on the same floor.
   if(!countDone){
    for(const cat of cats){
     if(cat.floor!==floorIndex||foundCats.has(cat.name))continue;
     if(Math.hypot(cat.x-claire.x,cat.y-claire.y)<spotRadius(cat)){foundCats.add(cat.name);setFound(foundCats.size)}
    }
    if(foundCats.size===cats.length&&!dlg){countDone=true;openDialog("",["•All four cats accounted for!","•Michael, Aggu, Ollie and Sashi. Nobody is stuck in the dryer."])}
   }

   if(dlg&&!dlg.done){
    dlg.clock+=dt;
    const page=dlg.pages[dlg.page],shown=Math.min(page.length,Math.floor(dlg.clock*TYPE_SPEED));
    if(shown!==dlg.shown){dlg.shown=shown;if(shown>=page.length)dlg.done=true;pushDialog()}
   }

   const f=floors[floorIndex];
   const targetX=Math.max(0,Math.min(f.w*T-VIEW_W,claire.x*T-VIEW_W/2)),targetY=Math.max(0,Math.min(f.h*T-VIEW_H,claire.y*T-VIEW_H/2));
   const k=Math.min(1,dt*9);cam.x+=(targetX-cam.x)*k;cam.y+=(targetY-cam.y)*k;

   render(elapsed);

   if(!dlg&&!busy){
    const target=probe();
    const next=target?.kind==="cat"?"PET":target?.kind==="obj"?"LOOK":target?.kind==="exit"?"GO OUTSIDE":"";
    if(next!==lastHint){lastHint=next;setHint(next)}
   }else if(lastHint){lastHint="";setHint("")}

   animation=requestAnimationFrame(tick);
  };
  animation=requestAnimationFrame(tick);

  // Dev-only handle for poking at the interior from the console.
  const devWindow=window as unknown as {__house?:unknown};
  if(typeof process!=="undefined"&&process.env.NODE_ENV!=="production"){
   devWindow.__house={
    get state(){return{floor:floorIndex,x:claire.x,y:claire.y,dir:claire.dir,busy,cam:{...cam},cats:cats.map(c=>({name:c.name,floor:c.floor,x:c.x,y:c.y,mode:c.mode,resting:c.resting}))}},
    teleport(floor:number,x:number,y:number){floorIndex=floor;claire.x=x;claire.y=y;snapCamera();setFloorLabel(current=>({name:floors[floor].def.name,key:current.key+1}))},
    // Full render of one floor at 1x, used to export the house map.
    snapshot(floor:number){
     const f=floors[floor],c=document.createElement("canvas");c.width=f.w*T;c.height=f.h*T;
     const sg=c.getContext("2d");if(!sg)return"";
     sg.imageSmoothingEnabled=false;sg.drawImage(f.bake,0,0);
     const items:Drawable[]=f.art?[]:f.standing.map(o=>{const k=CATALOG[o.t],w=(o.w??k.w)*T,h=(o.h??k.h)*T;return{bottom:o.y*T+h,draw:()=>paintObject(sg,o.t,o.x*T,o.y*T,w,h,0)}});
     for(const cat of cats)if(cat.floor===floor){const row=cat.resting?2:cat.facing==="left"?1:0;const catSheet=catSheets[cat.sheet];items.push({bottom:cat.y*T,draw:()=>{if(catSheet)sg.drawImage(catSheet,cat.frame*CAT_CELL,row*CAT_CELL,CAT_CELL,CAT_CELL,Math.round(cat.x*T-CAT_CELL/2),Math.round(cat.y*T-CAT_CELL+2),CAT_CELL,CAT_CELL)}})}
     items.sort((a,b)=>a.bottom-b.bottom);for(const item of items)item.draw();
     return c.toDataURL("image/png");
    },
    tile(x:number,y:number){const f=floors[floorIndex],i=Math.floor(y)*f.w+Math.floor(x);return{code:f.grid[i],walk:f.walk[i],free:free(f,x,y,CLAIRE_HW)}},
    hides(floor:number){return floors[floor].hides.map(h=>[h.x,h.y,h.ay])},
    // Text dump of the half-tile walk grid for a tile range (painted floors only): '.' open, 'X' blocked.
    walkText(x0:number,y0:number,x1:number,y1:number){
     const f=floors[floorIndex];if(!f.walk2)return"";
     const rows:string[]=[];
     for(let cy=y0*2;cy<y1*2;cy++){let line=(cy/2).toFixed(1).padStart(5)+" ";for(let cx=x0*2;cx<x1*2;cx++)line+=f.walk2[cy*f.w*2+cx]?".":"X";rows.push(line)}
     return rows.join("\n");
    },
    // Walkability overlay over the floor picture: red = blocked floor tile, blue = doorway.
    walkmap(floor:number){
     const f=floors[floor],c=document.createElement("canvas");c.width=f.w*T;c.height=f.h*T;
     const sg=c.getContext("2d");if(!sg)return"";
     sg.drawImage(f.bake,0,0);
     sg.fillStyle="rgba(255,40,40,.45)";
     if(f.walk2){for(let cy=0;cy<f.h*2;cy++)for(let cx=0;cx<f.w*2;cx++)if(!f.walk2[cy*f.w*2+cx])sg.fillRect(cx*T/2,cy*T/2,T/2,T/2)}
     else for(let ty=0;ty<f.h;ty++)for(let tx=0;tx<f.w;tx++){const i=ty*f.w+tx,code=f.grid[i];if((code===1||code===2||code===3)&&!f.walk[i])sg.fillRect(tx*T,ty*T,T,T)}
     for(const d of f.def.doors){sg.strokeStyle="#4af";sg.lineWidth=2;sg.strokeRect(d.x*T+1,d.y*T+1,d.w*T-2,d.h*T-2)}
     return c.toDataURL("image/png");
    }
   };
  }

  return()=>{
   delete devWindow.__house;
   alive=false;cancelAnimationFrame(animation);
   for(const id of timers)clearTimeout(id);
   if(latest.current.interactRef.current===interact)latest.current.interactRef.current=null;
  };
 },[]);

 return <div className="house">
  <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="house-canvas" role="img" aria-label="Inside Claire's home"/>
  <div className="house-floor" key={floorLabel.key}>{floorLabel.name}</div>
  <div className="cat-count" aria-live="polite">CATS {found}/{CATS.length}</div>
  {hint&&!dialog&&<div className="interaction-hint visible house-hint"><kbd>SPACE</kbd><span>{hint}</span></div>}
  {dialog&&<div className="mother-box" role="dialog" aria-live="polite">
   {dialog.name&&<b className="mother-name">{dialog.name}</b>}
   <p>{dialog.text}</p>
   {dialog.done&&<i className="mother-cursor" aria-hidden="true"/>}
  </div>}
  <div className={`house-fade ${fade?"on":""}`} aria-hidden="true"/>
 </div>;
}
