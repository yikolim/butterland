// Butterland as a Pocket Lite cartridge.
// Top screen (400x240): the world — Claire's front yard outside, her house inside.
// Bottom screen (256x192): the quest log, cat count, conversations and the action hint.
// Built by tools/build-pocket.sh into public/pocket/molar-cart.js and loaded by public/pocket/index.html,
// which is the Pocket Lite shell with its demo cartridge removed. The shell provides window.DS.

import {CATALOG,CATS,ENTRY,EXIT,FLOORS,T,type Dir,type Obj} from "../house/houseData";
import {buildFloor,loadImage,loadSheet,paintObject,type BuiltFloor} from "../house/houseDraw";
import {drawEffects,makeCats,makeMeow,petCat,spotRadius,tickEffects,updateCats,zoomOff,type Cat,type Effect} from "../house/cats";
import {arrivalPoint,CLAIRE_HW,free,stairsTarget,stepWithAssist} from "../house/motion";
import {createOpening,drawMeadow} from "./opening";
import {PACKAGE_SPOT,TRUCK,TRUCK_LEN,drawArrow,drawPackage,drawTruck,makeDeliverySounds} from "./delivery";
import {UNBOX,drawItemReveal,drawNotes,drawPhone,drawSparkles} from "./unbox";

type Touch={x:number;y:number;phase:"start"|"move"|"end"};
type DSApi={
 buttons:string[];
 isDown:(b:string)=>boolean;
 on:(type:"down"|"up"|"touch",fn:(v:never)=>void)=>()=>void;
 top:HTMLCanvasElement;bottom:HTMLCanvasElement;
 setGame:(g:{init?:()=>void;update?:(dt:number)=>void;draw?:(top:CanvasRenderingContext2D,bottom:CanvasRenderingContext2D)=>void})=>void;
};
declare global{interface Window{DS:DSApi}}

// Top screen is 3DS-sized (400x240) so the world gets most of the upper shell; the touch screen stays 256x192.
const W=400,H=240,BW=256,BH=192;
const PX='"Press Start 2P", ui-monospace, monospace';
const INK="#222d35",PAPER="#fffde6",VIOLET="#7457e6",GOLD="#ffe260",CORAL="#ff526f",MUTED="#8a93a0";

/* ---- outdoor world: the 1672x941 scene scaled to 512x288 so Claire keeps her 10% size ---- */
// Outdoors the whole town fits the screen height, like the web game, with a little side scroll.
const SCENE_W=1672,SCENE_H=941,WORLD_H=H,WORLD_W=Math.round(SCENE_W*WORLD_H/SCENE_H);
const OUT_CELL=Math.round(WORLD_W*.1);
function blockedAt(x:number,y:number){
 if(x<3||x>97||y<38||y>96)return true;
 if(x>36&&x<73&&y<60)return true;
 if(x>69&&x<89&&y>43&&y<68)return true;
 if(x<14&&y<58)return true;
 if(x>22&&x<36&&y<61)return true;
 if(x>80&&y<49)return true;
 if(x>52&&x<58&&y>64&&y<78)return true;
 return false;
}
function canMove(fromX:number,fromY:number,toX:number,toY:number){
 if(blockedAt(toX,toY))return false;
 const fenceY=76,crossesFence=(fromY<=fenceY&&toY>fenceY)||(fromY>=fenceY&&toY<fenceY);
 return !crossesFence||(toX>37&&toX<52);
}

/* ---- house: same tiles as the web game, framed for the 256x192 screen ---- */
const IN_CELL=40,IN_CAT_CELL=29,SPEED=5.4,STEP_FRAME=.09,frameOrder=[0,1,2,1];
const directionRow:Record<Dir,number>={down:0,left:1,right:2,up:3};
const DIRV:Record<Dir,{x:number;y:number}>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const TYPE_SPEED=42,ICON=20; // quest-log cat icon size

type Scene="title"|"outside"|"inside"|"delivery";
// After the cats: none -> doorbell (dialog) -> cutscene (the truck) -> waiting (package by the gate) -> done.
// ...then: unboxing (Claire opens it in the yard: the iPhone Duo, the banner, her dance) -> done (she has the phone).
type Delivery="none"|"doorbell"|"cutscene"|"waiting"|"unboxing"|"done";
type Drawable={bottom:number;draw:()=>void};
// `then` runs when the last page is closed (to chain a second speaker).
// `ask` turns the last page into a Yes / No question: A picks the highlighted answer, B means no.
type Ask={yes:()=>void;no:()=>void;sel:0|1};
type Dialog={name:string;pages:string[];page:number;shown:number;done:boolean;clock:number;then?:()=>void;ask?:Ask};

export function createMolarQuest(DS:DSApi){
 const reduceMotion=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 let scene:Scene="title",elapsed=0,fade=1,fadeDir=-1,busy=false;
 let dlg:Dialog|null=null,hint="",toast="",toastTtl=0;

 /* assets */
 let world:HTMLCanvasElement|null=null;            // outdoor scene pre-scaled to WORLD_W x WORLD_H
 let claireOut:HTMLCanvasElement|null=null,claireIn:HTMLCanvasElement|null=null;
 const catIn:Record<string,HTMLCanvasElement>={};
 const catIcon:Record<string,{on:HTMLCanvasElement;off:HTMLCanvasElement}>={};
 // Owner-supplied truck and package art (tools/characters/process_delivery.py); drawn pixels are the fallback.
 let truckImg:HTMLImageElement|null=null,pkgImg:HTMLImageElement|null=null,pkgIcon:HTMLImageElement|null=null;
 loadImage("/delivery/truck.png").then(i=>{truckImg=i}).catch(()=>{});
 loadImage("/delivery/package.png").then(i=>{pkgImg=i}).catch(()=>{});
 loadImage("/delivery/package-icon.png").then(i=>{pkgIcon=i}).catch(()=>{});
 // (x,y) = bottom centre
 const pkg=(g:CanvasRenderingContext2D,x:number,y:number,big=false)=>{
  const im=big?pkgIcon:pkgImg;
  if(im)g.drawImage(im,Math.round(x-im.width/2),Math.round(y-im.height));else drawPackage(g,x,y);
 };
 loadImage("/pearl-district-playable-bg-v2.png").then(img=>{
  const c=document.createElement("canvas");c.width=WORLD_W;c.height=WORLD_H;
  const g=c.getContext("2d")!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
  g.drawImage(img,0,0,WORLD_W,WORLD_H);world=c;
 }).catch(()=>{});
 loadSheet("/sprite-sheets/claire-walk-pixelated-v2.png",3,4,OUT_CELL).then(s=>{claireOut=s}).catch(()=>{});
 loadSheet("/sprite-sheets/claire-walk-pixelated-v2.png",3,4,IN_CELL).then(s=>{claireIn=s}).catch(()=>{});
 for(const src of new Set(CATS.map(c=>c.sheet)))loadSheet(src,4,3,IN_CAT_CELL).then(s=>{
  catIn[src]=s;
  // Quest-log icons: the sitting frame (row 2, col 1), plus a dark silhouette for cats not yet found.
  const on=document.createElement("canvas");on.width=on.height=ICON;
  const og=on.getContext("2d")!;og.imageSmoothingEnabled=true;og.imageSmoothingQuality="high";og.drawImage(s,IN_CAT_CELL,2*IN_CAT_CELL,IN_CAT_CELL,IN_CAT_CELL,0,0,ICON,ICON);
  const off=document.createElement("canvas");off.width=off.height=ICON;
  const fg=off.getContext("2d")!;fg.drawImage(on,0,0);fg.globalCompositeOperation="source-in";fg.fillStyle="#3b4451";fg.fillRect(0,0,ICON,ICON);
  catIcon[src]={on,off};
 }).catch(()=>{});

 /* audio — one toggle on the bottom screen mutes footsteps and meows; remembered between visits */
 let soundOn=true;
 try{soundOn=localStorage.getItem("molar-sound")!=="off"}catch{/* storage blocked */}
 // Background music ("Kuruma de DS", public/music/kuruma-de-ds.mp3), looped and quiet. Browsers only allow it after a button press
 // or tap, so it starts on the first input and follows the same sound toggle.
 const MUSIC=.245;   // music volume (30% under the first .35)
 const bgm=new Audio("/music/kuruma-de-ds.mp3");bgm.loop=true;bgm.volume=MUSIC;bgm.preload="auto";
 // Quieter music while the celebration plays over it.
 const bgmDuck=(on:boolean)=>{bgm.volume=on?MUSIC*.23:MUSIC};
 const syncMusic=()=>{if(soundOn)void bgm.play().catch(()=>{});else bgm.pause()};
 const setSound=(on:boolean)=>{soundOn=on;try{localStorage.setItem("molar-sound",on?"on":"off")}catch{/* storage blocked */}syncMusic()};
 const rawMeow=makeMeow();
 const meow:typeof rawMeow=(cat,happy,little)=>{if(soundOn)rawMeow(cat,happy,little)};
 let sfx:AudioContext|null=null,scuff:AudioBuffer|null=null;
 const footstep=()=>{
  if(!soundOn)return;
  try{
   sfx??=new AudioContext();
   if(sfx.state==="suspended")void sfx.resume();
   if(sfx.state!=="running")return;
   if(!scuff){
    const frames=Math.floor(sfx.sampleRate*.05),buffer=sfx.createBuffer(1,frames,sfx.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<frames;i++)samples[i]=(Math.random()*2-1)*Math.pow(1-i/frames,3);
    scuff=buffer;
   }
   const source=sfx.createBufferSource();source.buffer=scuff;
   // A quiet, low thud: band-pass around 110-150 Hz, then a low-pass to take any hiss off.
   const band=sfx.createBiquadFilter();band.type="bandpass";band.frequency.value=110+Math.random()*40;band.Q.value=.8;
   const soft=sfx.createBiquadFilter();soft.type="lowpass";soft.frequency.value=320;
   const level=sfx.createGain();level.gain.value=.32*(.85+Math.random()*.3);
   source.connect(band).connect(soft).connect(level).connect(sfx.destination);source.start();source.stop(sfx.currentTime+.06);
  }catch{/* no audio */}
 };

 /* outdoor state (scene percentages, like the web game) */
 const out={x:49.5,y:67,dir:"down" as Dir,frame:1,moving:false};
 const outCam={x:0,y:0};

 /* house state */
 const floors:BuiltFloor[]=FLOORS.map(def=>buildFloor(def));
 Promise.all(FLOORS.map(def=>def.art?loadImage(def.art).catch(()=>null):Promise.resolve(null))).then(images=>{
  images.forEach((img,i)=>{if(img)floors[i]=buildFloor(FLOORS[i],img)});
 });
 const cats:Cat[]=makeCats();
 const effects:Effect[]=[];
 let floorIndex=0;
 const claire={x:ENTRY.x,y:ENTRY.y,dir:"up" as Dir,frame:1,moving:false};
 const cam={x:0,y:0};
 let stepClock=0,lastStep=-1;
 const foundCats=new Set<string>();
 let countDone=false,delivery:Delivery="none",truckT=0,truckHold=false,unboxT=0,unboxHold=false; // truckHold: debug pause
 // A phone-style notification that slides down on the top screen.
 let notice:{title:string;lines:string[];t:number}|null=null;
 const NOTICE_LEN=5.5;

 const snapCamera=()=>{const f=floors[floorIndex];cam.x=Math.max(0,Math.min(f.w*T-W,claire.x*T-W/2));cam.y=Math.max(0,Math.min(f.h*T-H,claire.y*T-H/2))};

 /* haptics: navigator.vibrate where the browser has it (Android). iPhone Safari has no vibrate,
    but toggling a hidden switch-style checkbox gives a light tap there (iOS 18 and later), one per
    pulse. Phones that support neither simply stay still. */
 let tapSwitch:HTMLLabelElement|null=null;
 const iosTap=()=>{
  try{
   if(!tapSwitch){
    tapSwitch=document.createElement("label");tapSwitch.style.cssText="position:fixed;left:-99px;top:0;opacity:0;pointer-events:none";
    const box=document.createElement("input");box.type="checkbox";box.setAttribute("switch","");tapSwitch.appendChild(box);document.body.appendChild(tapSwitch);
   }
   tapSwitch.click();
  }catch{/* no haptics */}
 };
 const haptic=(pattern:number[])=>{
  if(typeof navigator.vibrate==="function"){try{navigator.vibrate(pattern);return}catch{/* fall through */}}
  let at=0;pattern.forEach((ms,i)=>{if(i%2===0)later(at,iosTap);at+=ms});
 };

 /* dialog */
 const openDialog=(name:string,pages:string[],then?:()=>void)=>{dlg={name,pages,page:0,shown:reduceMotion?pages[0].length:0,done:reduceMotion,clock:0,then};claire.moving=false;claire.frame=1;out.moving=false;out.frame=1};
 const advanceDialog=()=>{
  if(!dlg)return;
  if(!dlg.done){dlg.shown=dlg.pages[dlg.page].length;dlg.done=true}
  else if(dlg.page<dlg.pages.length-1){dlg.page++;dlg.shown=0;dlg.done=false;dlg.clock=0}
  else if(dlg.ask){const a=dlg.ask;dlg=null;(a.sel===0?a.yes:a.no)()}
  else{const next=dlg.then;dlg=null;next?.()}
 };
 const askDialog=(name:string,pages:string[],yes:()=>void,no:()=>void)=>{openDialog(name,pages);dlg!.ask={yes,no,sel:0}};
 const asking=()=>!!dlg?.ask&&dlg.done&&dlg.page===dlg.pages.length-1;
 const say=(text:string,ttl=2.5)=>{toast=text;toastTtl=ttl};

 /* scene changes */
 const timers:number[]=[];
 const later=(ms:number,fn:()=>void)=>{timers.push(window.setTimeout(fn,ms))};
 // Scene change: ease to black, swap, ease back (FADE seconds each way), on both screens.
 const FADE=.45;
 const fadeTo=(fn:()=>void)=>{busy=true;fadeDir=1;later(FADE*1000,()=>{fn();fadeDir=-1;later(FADE*1000,()=>{busy=false})})};
 // The cat quest is given the first time Claire steps inside; until then the touch screen just
 // points her at the front door.
 let questGiven=false;
 const enterHouse=()=>fadeTo(()=>{
  scene="inside";floorIndex=0;claire.x=ENTRY.x;claire.y=ENTRY.y;claire.dir="up";snapCamera();say(FLOORS[0].name);
  if(!questGiven){questGiven=true;later(600,()=>openDialog("CLAIRE",["•Where are the cats?"],()=>openDialog("",["•Michael, Sashi, Ollie and Aggu are hiding somewhere in the house.","•New quest: find all four cats!"])))}
 });
 const leaveHouse=()=>fadeTo(()=>{scene="outside";out.x=46;out.y=63.5;out.dir="down";out.frame=1;say("FRONT YARD")});
 let stairsLock=false,stairsReleased=true;
 const goFloor=(to:number,from:number)=>{stairsLock=true;stairsReleased=false;fadeTo(()=>{
  floorIndex=to;
  const f=floors[to];
  const landing=arrivalPoint(f,from);
  if(landing){claire.x=landing.x;claire.y=landing.y}
  claire.dir="down";claire.moving=false;claire.frame=1;snapCamera();say(f.def.name);
 });}
 /* save: progress is kept in this browser (localStorage) when Claire leaves for her flight */
 type Save={v:1;found:string[];questGiven:boolean;countDone:boolean;delivery:Delivery;x:number;y:number};
 const SAVE_KEY="butterland-save";
 const readSave=():Save|null=>{try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)??"null");return s?.v===1?s:null}catch{return null}};
 const writeSave=()=>{
  // Mid-delivery states resume from the step before them.
  const d:Delivery=delivery==="doorbell"||delivery==="cutscene"?"none":delivery==="unboxing"?"waiting":delivery;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,found:[...foundCats],questGiven,countDone,delivery:d,x:out.x,y:out.y} satisfies Save))}catch{/* storage blocked */}
 };
 const loadSave=(s:Save)=>{
  foundCats.clear();for(const n of s.found)foundCats.add(n);
  questGiven=s.questGiven;countDone=s.countDone;delivery=s.delivery;out.x=s.x;out.y=s.y;out.dir="down";
 };
 const startGame=(fresh=false)=>fadeTo(()=>{
  const s=fresh?null:readSave();
  if(fresh)try{localStorage.removeItem(SAVE_KEY)}catch{/* storage blocked */}
  if(s)loadSave(s);
  scene="outside";say(s?"WELCOME BACK!":"FRONT YARD",3);
 });
 // A short rising chime when the logo lands (only with sound on, and only once audio is allowed).
 const jingle=()=>{
  if(!soundOn)return;
  try{
   sfx??=new AudioContext();
   if(sfx.state==="suspended")void sfx.resume();
   const ctx=sfx,t0=ctx.currentTime;
   [523.25,659.25,783.99,1046.5].forEach((hz,i)=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain(),t=t0+i*.12;
    osc.type="triangle";osc.frequency.value=hz;
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.12,t+.02);gain.gain.exponentialRampToValueAtTime(.001,t+.5);
    osc.connect(gain).connect(ctx.destination);osc.start(t);osc.stop(t+.52);
   });
  }catch{/* no audio */}
 };
 const agguSheet=new Image();agguSheet.src="/sprite-sheets/white-cat-walk-concept.png";
 // Splash: a soft two-note chime and a little mew from Aggu. Browsers only let it sound once the
 // page has had a tap or key press, so on a first visit it may stay silent.
 const splashSfx=()=>{
  if(!soundOn)return;
  try{
   sfx??=new AudioContext();if(sfx.state==="suspended")void sfx.resume();
   if(sfx.state!=="running")return;
   const ctx=sfx,t0=ctx.currentTime;
   for(const [hz,at] of [[783.99,0],[1174.66,.16]] as const){
    const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";osc.frequency.value=hz;
    gain.gain.setValueAtTime(0,t0+at);gain.gain.linearRampToValueAtTime(.07,t0+at+.02);gain.gain.exponentialRampToValueAtTime(.001,t0+at+.7);
    osc.connect(gain).connect(ctx.destination);osc.start(t0+at);osc.stop(t0+at+.75);
   }
   const aggu=cats.find(c=>c.behavior==="zoomies");if(aggu)later(450,()=>meow(aggu,true,true));
  }catch{/* no audio */}
 };
 const opening=createOpening({W,H,BW,BH,world:()=>world,reduceMotion,jingle,cat:()=>agguSheet,splash:splashSfx,hasSave:()=>!!readSave()});
 const deliverySfx=makeDeliverySounds(()=>{
  if(!soundOn)return null;
  try{sfx??=new AudioContext();if(sfx.state==="suspended")void sfx.resume();return sfx}catch{return null}
 });
 const nearPackage=()=>delivery==="waiting"&&Math.hypot(out.x-PACKAGE_SPOT.x,(out.y-PACKAGE_SPOT.y)*.6)<5;
 // The package is Claire's new phone, already paired with the Tesla parked by the house.
 // Picking it up: Claire opens it right there in the yard (the unboxing runs in update()), and
 // when her dance ends she has the phone, already paired with the Tesla parked by the house.
 const pickUpPackage=()=>{
  out.dir="down";
  askDialog("CLAIRE",["•A package for me!","•What nice packaging... Open it here in the yard?"],
   ()=>{delivery="unboxing";unboxT=0},
   ()=>openDialog("CLAIRE",["•Maybe in a bit. I'll leave it by the gate for now."]));
 };
 const finishUnboxing=()=>{
  haptic([40,60,40,60,120]);   // quest complete: a new phone
  delivery="done";bgmDuck(false);out.dir="down";
  openDialog("CLAIRE",["•An iPhone Duo! It unfolds into two screens!","•It's already paired with the Tesla parked by the house.","•Let's walk over to the car and try it with the Tesla!"],
  );
 };
 const hasPhone=()=>delivery==="done";

 /* ---- Claire's phone: the Tesla app (public/phone), shown over the handheld ---- */
 // It runs in its own page so it can keep its own UI; it asks to close with a postMessage.
 let phoneOpen=false,phoneLayer:HTMLDivElement|null=null,phoneFrame:HTMLIFrameElement|null=null,placePhone=()=>{};
 // After the low-battery news, putting the phone away brings the flight reminder and an offer to save.
 let flightDue=false;
 const flightReminder=()=>{
  flightDue=false;
  notice={title:"FLIGHT",lines:["Time to catch a flight!","Boarding soon."],t:0};deliverySfx.notify();
  later(900,()=>askDialog("CLAIRE",["•Oh no, look at the time! I have a flight to catch.","•Save the game for now?"],
   ()=>{writeSave();openDialog("",["•Game saved. Have a good flight, Claire!"],()=>fadeTo(()=>{scene="title";dlg=null;opening.finish()}))},
   ()=>openDialog("CLAIRE",["•Okay, just a little longer..."])));
 };
 const closePhone=()=>{
  if(!phoneOpen||!phoneLayer||!phoneFrame)return;
  phoneOpen=false;
  if(flightDue)later(500,flightReminder);
  phoneLayer.style.opacity="0";phoneFrame.style.transform="translateY(24px)";
  const layer=phoneLayer;setTimeout(()=>{if(!phoneOpen)layer.style.display="none"},300);
  phoneFrame.blur();window.focus();
 };
 const openPhone=()=>{
  if(phoneOpen)return;
  if(!phoneLayer){
   phoneLayer=document.createElement("div");
   // The phone opens on the bottom screen, unfolded into a little landscape tablet (?duo), and
   // follows the screen as the shell resizes or folds.
   phoneLayer.style.cssText="position:fixed;z-index:100;overflow:hidden;background:rgba(18,13,20,.5);opacity:0;transition:opacity .28s ease;display:none";
   phoneFrame=document.createElement("iframe");
   phoneFrame.src="../phone/?embed&duo";phoneFrame.title="Claire's phone";
   phoneFrame.style.cssText="position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;color-scheme:normal;transform:translateY(24px);transition:transform .35s cubic-bezier(.2,.8,.2,1)";
   phoneLayer.appendChild(phoneFrame);document.body.appendChild(phoneLayer);
   addEventListener("message",e=>{
    const type=(e.data as {type?:string}|null)?.type;
    if(type==="phone-close")closePhone();
    // Claire pressed Navigate: the Tesla answers on the top screen.
    else if(type==="tesla-drive"){notice={title:"TESLA",lines:["Battery is at 1%.","Plug in to drive."],t:0};deliverySfx.notify();flightDue=true}
   });
   const place=()=>{
    const screen=document.getElementById("bottom");if(!screen||!phoneLayer)return;
    const b=screen.getBoundingClientRect(),st=phoneLayer.style;
    st.left=b.left+"px";st.top=b.top+"px";st.width=b.width+"px";st.height=b.height+"px";
   };
   addEventListener("resize",place);new ResizeObserver(place).observe(document.getElementById("bottom")??document.body);
   placePhone=place;
  }
  phoneOpen=true;
  const layer=phoneLayer,frame=phoneFrame!;
  layer.style.display="block";placePhone();
  // Keyboard focus stays with the game so B / Y still put the phone away; tap the screen to use it.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{layer.style.opacity="1";frame.style.transform="none"}));
 };
 const endCutscene=()=>{
  deliverySfx.engine(0);
  fadeTo(()=>{scene="inside";delivery="waiting";notice={title:"NEW PACKAGE!",lines:["Claire got a new package!","What is it?"],t:0};deliverySfx.notify()});
 };

 /* what is Claire facing inside? */
 const probe=():{kind:"cat";cat:Cat}|{kind:"obj";obj:Obj}|{kind:"exit"}|null=>{
  const f=floors[floorIndex],d=DIRV[claire.dir];
  const px=claire.x+d.x*.9,py=claire.y+d.y*.9;
  for(const cat of cats){if(cat.floor===floorIndex&&Math.abs(cat.x-px)<.9&&Math.abs(cat.y-py)<.9)return{kind:"cat",cat}}
  const tx=Math.floor(px),ty=Math.floor(py);
  for(const obj of f.def.objects){
   if(!obj.say)continue;
   const c=CATALOG[obj.t],w=obj.w??c.w,h=obj.h??c.h,slack=f.art?1:0;
   if(tx>=obj.x-slack&&tx<obj.x+w+slack&&ty>=obj.y-slack&&ty<obj.y+h+slack)return{kind:"obj",obj};
  }
  if(floorIndex===0&&claire.dir==="down"&&claire.y>31.6&&claire.x>=EXIT.x0&&claire.x<EXIT.x1)return{kind:"exit"};
  return null;
 };
 const nearDoor=()=>Math.hypot(out.x-46,out.y-61)<5;
 // Standing by the Tesla (its blocker is x 69-89, y 43-68) with the phone: A opens the Tesla app.
 const nearCar=()=>hasPhone()&&out.x>65&&out.x<93&&out.y>40&&out.y<72;

 const interact=()=>{
  if(busy)return;
  if(scene==="title"){const c=opening.choose();if(c==="play")startGame();else if(c==="new")startGame(true);return}
  if(dlg){advanceDialog();return}
  if(scene==="delivery"){truckT=Math.max(truckT,TRUCK.END);return}
  if(scene==="outside"){if(delivery==="unboxing")return;if(nearPackage())pickUpPackage();else if(nearCar())openPhone();else if(nearDoor())enterHouse();return}
  const target=probe();
  if(!target)return;
  if(target.kind==="cat"){
   // Aggu only counts once Claire catches her: the pet that finally lands finds her.
   const caught=chased(target.cat);
   const pet=petCat(target.cat,floors[floorIndex],free,claire.x,effects,caught);
   meow(target.cat,pet.likes,true);
   if(caught){foundCats.add(target.cat.name);say(`CAUGHT ${target.cat.name.toUpperCase()}!`);openDialog(pet.name,[`•Got you, ${target.cat.name}!`,...pet.pages])}
   else openDialog(pet.name,pet.pages);
  }else if(target.kind==="obj"&&target.obj.say)openDialog("",target.obj.say);
  else if(target.kind==="exit")leaveHouse();
 };

 /* movement */
 const held=()=>{
  const dx=(DS.isDown("RIGHT")?1:0)-(DS.isDown("LEFT")?1:0),dy=(DS.isDown("DOWN")?1:0)-(DS.isDown("UP")?1:0);
  return{dx,dy};
 };
 const walkCycle=(dt:number)=>{
  stepClock+=dt;
  const step=Math.floor(stepClock/STEP_FRAME)%frameOrder.length;
  if(step!==lastStep){lastStep=step;if(step===0)footstep()}   // one soft step per walk cycle
  return frameOrder[step];
 };
 const stopWalk=(who:{moving:boolean;frame:number})=>{if(who.moving){who.moving=false;who.frame=1;stepClock=0;lastStep=-1}};

 const updateOutside=(dt:number)=>{
  let {dx,dy}=held();
  if(!dx&&!dy){stopWalk(out);return}
  const length=Math.hypot(dx,dy);dx/=length;dy/=length;
  out.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
  out.frame=walkCycle(dt);out.moving=true;
  let nx=out.x+dx*12.75*dt,ny=out.y+dy*22.5*dt;
  if(!canMove(out.x,out.y,nx,out.y))nx=out.x;
  if(!canMove(nx,out.y,nx,ny))ny=out.y;
  out.x=nx;out.y=ny;
 };
 // Aggu's zoomies so far; she counts as found only when caught (petted) after being spotted.
 const zoomed=new Map<string,{n:number;at:number}>();
 const chased=(cat:Cat)=>cat.behavior==="zoomies"&&!foundCats.has(cat.name);
 // Cats are solid: Claire can walk up to one but not onto it. A step that ends inside a cat's
 // space and closer than before is undone (or kept on one axis so she can slide past).
 const CAT_R=.6;
 const catDist=(c:Cat,x:number,y:number)=>Math.hypot(c.x-x,(c.y-y)*1.3);
 const intoCat=(x:number,y:number,ox:number,oy:number)=>cats.some(c=>c.floor===floorIndex&&!c.ghost&&c.mode!=="hidden"&&catDist(c,x,y)<CAT_R&&catDist(c,x,y)<catDist(c,ox,oy));
 const updateInside=(dt:number)=>{
  const f=floors[floorIndex];
  let {dx,dy}=held();
  if(!dx&&!dy){stairsReleased=true;stopWalk(claire);return}
  const length=Math.hypot(dx,dy);dx/=length;dy/=length;
  claire.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
  claire.frame=walkCycle(dt);claire.moving=true;
  const ox=claire.x,oy=claire.y;
  stepWithAssist(f,claire,dx,dy,SPEED,dt);
  if(intoCat(claire.x,claire.y,ox,oy)){
   if(!intoCat(claire.x,oy,ox,oy)&&free(f,claire.x,oy,CLAIRE_HW))claire.y=oy;
   else if(!intoCat(ox,claire.y,ox,oy)&&free(f,ox,claire.y,CLAIRE_HW))claire.x=ox;
   else{claire.x=ox;claire.y=oy}
  }
  // After a floor change the stairs stay locked until the keys have been let go once and Claire
  // is off the stairs, so a key still held from the climb does not carry her straight back.
  const to=stairsTarget(f,claire.x,claire.y);
  if(to===undefined&&stairsReleased)stairsLock=false;
  if(to!==undefined&&!stairsLock){goFloor(to,floorIndex);return}
  if(floorIndex===0&&claire.y>=EXIT.y&&claire.x>=EXIT.x0&&claire.x<EXIT.x1)leaveHouse();
 };

 /* ---- drawing helpers ---- */
 // A tiny plane for the flight notice, centred on (x,y).
 const drawPlane=(g:CanvasRenderingContext2D,x:number,y:number)=>{
  const R=(rx:number,ry:number,w:number,h:number,c:string)=>{g.fillStyle=c;g.fillRect(x+rx,y+ry,w,h)};
  R(-13,-2,26,5,INK);R(-12,-1,24,3,"#e8f2ff");R(10,-1,3,3,"#7fb7ff");          // body and nose
  R(-4,-11,6,10,INK);R(-3,-10,4,9,"#cfe0f5");R(-4,3,6,9,INK);R(-3,3,4,8,"#cfe0f5");   // wings
  R(-14,-7,4,6,INK);R(-13,-6,2,5,"#ff8fb1");                                     // tail
  for(let i=0;i<3;i++)R(-6+i*5,0,2,1,"#5a7aa8");                                 // windows
 };
 const text=(g:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,color:string,align:CanvasTextAlign="left")=>{
  g.font=`${size}px ${PX}`;g.textAlign=align;g.textBaseline="top";g.fillStyle=color;g.fillText(s,x,y);
 };
 const wrap=(g:CanvasRenderingContext2D,s:string,size:number,maxW:number)=>{
  g.font=`${size}px ${PX}`;
  const words=s.split(" "),lines:string[]=[];let line="";
  for(const w of words){const test=line?line+" "+w:w;if(g.measureText(test).width>maxW&&line){lines.push(line);line=w}else line=test}
  if(line)lines.push(line);return lines;
 };
 const panel=(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill=PAPER)=>{
  g.fillStyle=INK;g.fillRect(x+2,y+2,w,h);g.fillRect(x,y,w,h);g.fillStyle=fill;g.fillRect(x+2,y+2,w-4,h-4);
 };
 const sprite=(g:CanvasRenderingContext2D,sheet:HTMLCanvasElement|null,cell:number,col:number,row:number,x:number,y:number)=>{
  if(sheet)g.drawImage(sheet,col*cell,row*cell,cell,cell,x,y,cell,cell);
  else{g.fillStyle="#fff";g.fillRect(x+cell/3,y+cell/3,cell/3,cell*2/3)}
 };

 const drawOutside=(g:CanvasRenderingContext2D)=>{
  const wx=out.x/100*WORLD_W,wy=out.y/100*WORLD_H;
  const tx=Math.max(0,Math.min(WORLD_W-W,wx-W/2)),ty=Math.max(0,Math.min(WORLD_H-H,wy-H/2));
  const k=scene==="title"?1:.15;outCam.x+=(tx-outCam.x)*k;outCam.y+=(ty-outCam.y)*k;
  const cx=Math.round(outCam.x),cy=Math.round(outCam.y);
  if(world)g.drawImage(world,cx,cy,W,H,0,0,W,H);else{g.fillStyle="#07e66e";g.fillRect(0,0,W,H)}
  if(scene==="title")return;
  const sx=Math.round(wx-cx-OUT_CELL/2),sy=Math.round(wy-cy-OUT_CELL*.86);
  const px=PACKAGE_SPOT.x/100*WORLD_W-cx,py=PACKAGE_SPOT.y/100*WORLD_H-cy,showPkg=delivery==="waiting";
  if(showPkg&&py<=wy-cy)pkg(g,px,py);
  // Unboxing: the box sits at Claire's side, shakes, opens, and the phone rises out of it.
  const u=unboxT,unboxing=delivery==="unboxing",bx=wx-cx+14,by=wy-cy+1;
  // Claire's happy dance: spin through the four directions with little hops.
  const dancing=unboxing&&u>=UNBOX.DANCE_START&&u<UNBOX.DANCE_END;
  const dir=dancing?(["down","left","up","right"] as const)[Math.floor((u-UNBOX.DANCE_START)*5)%4]:out.dir;
  const hop=dancing?-Math.round(Math.abs(Math.sin((u-UNBOX.DANCE_START)*10))*5):0;
  g.fillStyle="rgba(21,72,46,.45)";g.fillRect(sx+OUT_CELL*.3,sy+OUT_CELL*.82,OUT_CELL*.4,3);
  sprite(g,claireOut,OUT_CELL,dancing?1:out.frame,directionRow[dir],sx,sy+hop);
  if(showPkg&&py>wy-cy)pkg(g,px,py);
  if(showPkg&&!nearPackage())drawArrow(g,px,py-16,elapsed);
  if(unboxing){
   const shake=u<UNBOX.SHAKE_END?Math.round(Math.sin(u*40)*1.5):0;
   pkg(g,bx+shake,by);
   if(u>=UNBOX.OPEN_END){
    // lid flaps folded back, then the phone rises out with sparkles
    g.fillStyle="#c98a4a";g.fillRect(Math.round(bx-11),Math.round(by-17),6,3);g.fillRect(Math.round(bx+5),Math.round(by-17),6,3);
    const rise=Math.min(1,(u-UNBOX.OPEN_END)/(UNBOX.RISE_END-UNBOX.OPEN_END)),py2=by-18-rise*16;
    drawPhone(g,bx,py2,1,rise);drawSparkles(g,bx,py2,elapsed,12);
   }
   if(dancing)drawNotes(g,wx-cx,sy-4,u);
  }
 };

 // The delivery cutscene: a fixed view of the street in front of the house.
 const drawDelivery=(g:CanvasRenderingContext2D)=>{
  const cx=Math.round((WORLD_W-W)/2);
  if(world)g.drawImage(world,cx,0,W,H,0,0,W,H);else{g.fillStyle="#07e66e";g.fillRect(0,0,W,H)}
  const t=truckT,road=Math.round(H*.985),stop=PACKAGE_SPOT.x/100*WORLD_W-cx+10;
  const inK=Math.min(1,Math.max(0,(t-TRUCK.ARRIVE_START)/(TRUCK.ARRIVE_END-TRUCK.ARRIVE_START))),outK=Math.min(1,Math.max(0,(t-TRUCK.LEAVE_START)/(TRUCK.LEAVE_END-TRUCK.LEAVE_START)));
  const arrive=1-Math.pow(1-inK,3),leave=outK*outK;
  const tx=-80+(stop+80)*arrive+(W+100-stop)*leave;
  const moving=(inK>0&&inK<1)||(outK>0&&outK<1);
  // the package: rides in the van, slides out in an arc, then rests on the sidewalk
  const px=PACKAGE_SPOT.x/100*WORLD_W-cx,py=PACKAGE_SPOT.y/100*WORLD_H;
  const dropK=Math.min(1,Math.max(0,(t-TRUCK.DROP_START)/(TRUCK.DROP_END-TRUCK.DROP_START)));
  if(dropK>=1)pkg(g,px,py);
  if(truckImg){
   const bob=moving&&Math.floor(t*12)%2===0?1:0;
   g.fillStyle="rgba(20,40,30,.35)";g.fillRect(Math.round(tx+4),road-2,truckImg.width-8,4);
   g.drawImage(truckImg,Math.round(tx),road-truckImg.height+bob);
  }else drawTruck(g,tx,road,moving?t*10:0,t>=TRUCK.DROP_START-.2&&t<TRUCK.LEAVE_START);
  if(dropK>0&&dropK<1){
   const sx=stop-2,sy=road-28,ex=px,ey=py;
   pkg(g,sx+(ex-sx)*dropK,sy+(ey-sy)*dropK-Math.sin(dropK*Math.PI)*16);
  }
  if(t>=TRUCK.HONK&&t<TRUCK.HONK+.7){const bx=Math.round(tx+TRUCK_LEN-30);panel(g,bx,road-66,58,16);text(g,"BEEP BEEP",bx+4,road-61,5,INK)}
 };

 const drawInside=(g:CanvasRenderingContext2D)=>{
  const f=floors[floorIndex];
  const cx=Math.round(cam.x),cy=Math.round(cam.y);
  g.fillStyle="#120d14";g.fillRect(0,0,W,H);
  g.drawImage(f.bake,cx,cy,W,H,0,0,W,H);
  const list:Drawable[]=[];
  if(f.runs){
   // Walls and furniture, one 8px column strip at a time, sorted by the strip's bottom edge.
   const bake=f.bake;
   for(const r of f.runs){
    if(r.x+8<cx||r.x>cx+W||r.y1<cy||r.y0>cy+H)continue;
    const x=r.x-cx,y=r.y0-cy,h=r.y1-r.y0;
    list.push({bottom:r.y1-cy,draw:()=>g.drawImage(bake,r.x,r.y0,8,h,x,y,8,h)});
   }
  }else for(const o of f.standing){
   const c=CATALOG[o.t],w=(o.w??c.w)*T,h=(o.h??c.h)*T,x=o.x*T-cx,y=o.y*T-cy;
   if(x>W||y>H+16||x+w<0||y+h<-16)continue;
   list.push({bottom:y+h,draw:()=>paintObject(g,o.t,x,y,w,h,elapsed)});
  }
  for(const cat of cats){
   if(cat.floor!==floorIndex)continue;
   const px=cat.x*T-cx,py=cat.y*T-cy,row=cat.resting?2:cat.facing==="left"?1:0;
   list.push({bottom:py,draw:()=>sprite(g,catIn[cat.sheet]??null,IN_CAT_CELL,cat.frame,row,Math.round(px-IN_CAT_CELL/2),Math.round(py-IN_CAT_CELL+2))});
  }
  {
   const px=claire.x*T-cx,py=claire.y*T-cy;
   list.push({bottom:py+.01,draw:()=>sprite(g,claireIn,IN_CELL,claire.frame,directionRow[claire.dir],Math.round(px-IN_CELL/2),Math.round(py-IN_CELL*.94))});
  }
  list.sort((a,b)=>a.bottom-b.bottom);
  for(const item of list)item.draw();
  drawEffects(g,effects,cx,cy,T,IN_CAT_CELL);
 };

 const drawTop=(g:CanvasRenderingContext2D)=>{
  if(scene==="title")opening.drawTop(g);
  else if(scene==="inside")drawInside(g);
  else if(scene==="delivery")drawDelivery(g);
  else drawOutside(g);
  if(notice){
   const k=notice.t<.35?notice.t/.35:notice.t>NOTICE_LEN-.35?(NOTICE_LEN-notice.t)/.35:1,e=1-Math.pow(1-Math.max(0,k),3);
   const nw=230,nh=52,nx=Math.round(W/2-nw/2),ny=Math.round(-nh+(nh+10)*e);
   g.fillStyle="rgba(20,20,30,.35)";g.fillRect(nx+3,ny+4,nw,nh);
   g.fillStyle=INK;g.fillRect(nx,ny,nw,nh);g.fillStyle=PAPER;g.fillRect(nx+2,ny+2,nw-4,nh-4);
   g.fillStyle="#ffd84a";g.fillRect(nx+2,ny+2,nw-4,3);
   if(notice.title==='TESLA')drawPhone(g,nx+22,ny+28,2);else if(notice.title==='FLIGHT')drawPlane(g,nx+22,ny+27);else pkg(g,nx+22,ny+42,true);
   text(g,notice.title,nx+42,ny+10,7,"#c9851e");
   notice.lines.forEach((l,i)=>text(g,l,nx+42,ny+23+i*11,6,INK));
  }
  if(delivery==="unboxing"&&unboxT>=UNBOX.BANNER_START&&unboxT<UNBOX.BANNER_END){
   drawItemReveal(g,W,H,unboxT-UNBOX.BANNER_START,UNBOX.BANNER_END-UNBOX.BANNER_START,elapsed,(s2,x,y,size,color,align)=>text(g,s2,x,y,size,color,align));
  }
  if(toastTtl>0){
   const a=Math.min(1,toastTtl*2);
   g.globalAlpha=a;panel(g,6,6,12+toast.length*6,18);text(g,toast,10,11,6,INK);g.globalAlpha=1;
  }
  if(fade>0){g.fillStyle=`rgba(18,13,20,${fade*fade*(3-2*fade)})`;g.fillRect(0,0,W,H)}
 };

 /* ---- bottom screen: quest log, cat count, dialog ---- */
 // Sound toggle in the bottom-right corner of the touch screen: tap it, or press SELECT.
 const SOUND={x:BW-58,y:BH-20,w:52,h:16};
 const drawSoundButton=(g:CanvasRenderingContext2D)=>{
  const {x,y,w,h}=SOUND;
  g.fillStyle=INK;g.fillRect(x+1,y+1,w,h);
  g.fillStyle=soundOn?VIOLET:"#4a5560";g.fillRect(x,y,w,h);
  g.fillStyle=soundOn?"#9d86ff":"#5d6873";g.fillRect(x,y,w,1);
  // speaker glyph
  const sx=x+6,sy=y+5;
  g.fillStyle=PAPER;g.fillRect(sx,sy+2,2,3);g.fillRect(sx+2,sy+1,1,5);g.fillRect(sx+3,sy,1,7);
  if(soundOn){g.fillRect(sx+5,sy+2,1,3);g.fillRect(sx+7,sy+1,1,5)}
  else{for(let i=0;i<5;i++){g.fillRect(sx+5+i,sy+1+i,1,1);g.fillRect(sx+9-i,sy+1+i,1,1)}}
  text(g,soundOn?"ON":"OFF",x+w-8,y+5,6,PAPER,"right");
 };
 const inSound=(t:{x:number;y:number})=>t.x>=SOUND.x&&t.x<=SOUND.x+SOUND.w&&t.y>=SOUND.y&&t.y<=SOUND.y+SOUND.h;
 const QUEST={x:6,y:24,w:244,h:56},DIALOG={x:6,y:86,w:244,h:80};
  const drawBottom=(g:CanvasRenderingContext2D)=>{
  const W=BW,H=BH;
  if(scene==="title"){opening.drawBottom(g);drawSoundButton(g);return}
  drawMeadow(g,W,H);
  // header
  text(g,"BUTTERLAND",7,9,7,"#fffbe0");text(g,"BUTTERLAND",6,8,7,"#c9851e");
  text(g,scene==="inside"?FLOORS[floorIndex].name:"FRONT YARD",250,8,6,"#2a5a8a","right");
  if(!questGiven){
   // Before the quest: a welcome card pointing Claire at the front door.
   panel(g,QUEST.x,QUEST.y,QUEST.w,QUEST.h);
   text(g,"WELCOME HOME",QUEST.x+8,QUEST.y+7,6,VIOLET);
   text(g,"Claire's house is",QUEST.x+8,QUEST.y+21,7,INK);
   text(g,"right up the path.",QUEST.x+8,QUEST.y+33,7,INK);
   const bob=Math.round(Math.sin(elapsed*4)*2),ax=QUEST.x+QUEST.w-22,ay=QUEST.y+30+bob;
   g.fillStyle=CORAL;g.fillRect(ax-1,ay+4,4,8);g.fillRect(ax-5,ay+2,12,2);g.fillRect(ax-3,ay,8,2);g.fillRect(ax-1,ay-2,4,2);
  }else if(countDone&&delivery!=="none"){
   // After the cats: the package quest.
   panel(g,QUEST.x,QUEST.y,QUEST.w,QUEST.h);
   const done=delivery==="done";
   text(g,done?"QUEST COMPLETE":"NEW QUEST",QUEST.x+8,QUEST.y+7,6,done?"#c9851e":VIOLET);
   text(g,done?"A NEW PHONE!":delivery==="unboxing"?"OPEN THE PACKAGE":"PICK UP THE PACKAGE",QUEST.x+8,QUEST.y+20,7,INK);
   text(g,done?"walk to the Tesla":delivery==="unboxing"?"what's inside?":delivery==="waiting"?"it's by the front gate":"you hear a truck coming...",QUEST.x+8,QUEST.y+36,6,MUTED);
   if(done)drawPhone(g,QUEST.x+QUEST.w-22,QUEST.y+38,2);else pkg(g,QUEST.x+QUEST.w-22,QUEST.y+50,true);
  }else{
  // quest card
  panel(g,QUEST.x,QUEST.y,QUEST.w,QUEST.h);
  text(g,"QUEST",QUEST.x+8,QUEST.y+7,6,VIOLET);
  text(g,countDone?"ALL CATS FOUND!":"FIND ALL FOUR CATS",QUEST.x+8,QUEST.y+18,7,INK);
  text(g,`${foundCats.size}/${CATS.length}`,QUEST.x+QUEST.w-8,QUEST.y+7,8,countDone?GOLD:CORAL,"right");
  CATS.forEach((c,i)=>{
   const icon=catIcon[c.sheet],x=QUEST.x+8+i*58,y=QUEST.y+30;
   const got=foundCats.has(c.name);
   g.fillStyle=got?"#e8f6ff":"#d9d4c3";g.fillRect(x,y,ICON+2,ICON+2);
   if(icon)g.drawImage(got?icon.on:icon.off,x+1,y+1);
   text(g,got?c.name.toUpperCase():"???",x+ICON+6,y+7,5,got?INK:MUTED);
  });
  if(countDone)text(g,"everyone's home safe",QUEST.x+8,QUEST.y+QUEST.h-10,5,MUTED);
  }
  // dialog / hint box (Mother-style: dark box, light border)
  const d=DIALOG;
  g.fillStyle=PAPER;g.fillRect(d.x,d.y,d.w,d.h);g.fillStyle="#16141f";g.fillRect(d.x+2,d.y+2,d.w-4,d.h-4);
  if(dlg){
   let y=d.y+9;
   if(dlg.name){text(g,dlg.name.toUpperCase(),d.x+10,y,6,GOLD);y+=12}
   const page=dlg.pages[dlg.page].slice(0,dlg.shown);
   for(const line of wrap(g,page,7,d.w-24)){text(g,line,d.x+10,y,7,PAPER);y+=11}
   if(asking()){
    const sel=dlg.ask!.sel;
    ["YES","NO"].forEach((label,i)=>{const ox=d.x+24+i*56,oy=d.y+d.h-16;if(sel===i)text(g,"▶",ox-10,oy,7,GOLD);text(g,label,ox,oy,7,sel===i?GOLD:MUTED)});
   }else if(dlg.done&&Math.floor(elapsed*3)%2===0)text(g,dlg.page<dlg.pages.length-1?"▼":"■",d.x+d.w-16,d.y+d.h-14,7,PAPER);
  }else{
   const lines=hint?[hint]:scene==="delivery"?["A delivery truck is","pulling up outside!"]:scene==="outside"?(delivery==="waiting"?["The package is on the","sidewalk by the gate."]:delivery==="unboxing"?["Claire is opening","the package..."]:hasPhone()?["Walk over to the Tesla","to use the phone."]:["Walk up the path to","the front door."]):delivery==="waiting"?["A package is waiting","by the front gate."]:["Claire's home.","Walk with the D-pad."];
   let y=d.y+12;
   for(const line of lines){text(g,line,d.x+10,y,7,hint?GOLD:PAPER);y+=12}
   if(hint)text(g,"press A",d.x+10,y+2,6,MUTED);
  }
  const foot="A talk/pet  B close  START title";
  text(g,foot,9,H-12,5,"#2f5a36");text(g,foot,8,H-13,5,"#fffbe0");
  drawSoundButton(g);
 };

 // Test hook, only with ?debug in the URL: inspect state, mark every cat found, move Claire.
 if(typeof location!=="undefined"&&new URLSearchParams(location.search).has("debug")){
  (window as unknown as {__cart?:unknown}).__cart={
   state:()=>({scene,delivery,truckT,found:[...foundCats],questGiven,floor:floorIndex,out:{...out},claire:{x:claire.x,y:claire.y},dlg:dlg?dlg.pages[dlg.page]:null}),
   music:()=>({playing:!bgm.paused,time:bgm.currentTime}),
   cats:()=>cats.map(c=>({name:c.name,floor:c.floor,x:+c.x.toFixed(2),y:+c.y.toFixed(2),mode:c.mode,resting:c.resting})),
   place(x:number,y:number){claire.x=x;claire.y=y},
   findAll(){for(const c of cats)foundCats.add(c.name)},
   givePhone(){countDone=true;delivery="done"},
   outside(x:number,y:number){scene="outside";out.x=x;out.y=y},
   pkgReady(){scene="outside";delivery="waiting";countDone=true;questGiven=true;for(const c of cats)foundCats.add(c.name);out.x=46;out.y=84;dlg=null},
   unbox(at=0,hold=false){scene="outside";delivery="unboxing";unboxT=at;unboxHold=hold;dlg=null;countDone=true;questGiven=true},
   replay(at=0,hold=false){scene="delivery";delivery="cutscene";truckT=at;dlg=null;truckHold=hold}
  };
 }

 /* ---- game object for the shell ---- */
 const game={
  init(){
   DS.on("down",(b:never)=>{
    const btn=b as unknown as string;
    if(bgm.paused&&soundOn&&btn!=="SELECT")syncMusic();
    if(phoneOpen){if(btn==="Y"||btn==="B")closePhone();return}
    if(asking()&&(btn==="LEFT"||btn==="RIGHT"||btn==="UP"||btn==="DOWN")){dlg!.ask!.sel=dlg!.ask!.sel?0:1;return}
    if(asking()&&btn==="B"){const a=dlg!.ask!;dlg=null;a.no();return}
    if(scene==="title"&&(btn==="UP"||btn==="DOWN")){opening.move(btn==="UP"?-1:1);return}
    if(scene==="title"&&btn==="B"){if(opening.isHelp())opening.back();else opening.skip();return}
    if(btn==="A"||(btn==="START"&&scene==="title"))interact();
    else if(btn==="B"){if(dlg){const next=dlg.then;dlg=null;next?.()}}
    else if(btn==="SELECT")setSound(!soundOn);
    else if(btn==="START"&&scene==="delivery")interact();
    else if(btn==="START"&&scene!=="title"){if(!busy)fadeTo(()=>{scene="title";dlg=null;opening.finish()})}
   });
   DS.on("touch",(p:never)=>{
    const t=p as unknown as Touch;
    if(t.phase!=="start"||phoneOpen)return;
    if(bgm.paused&&soundOn&&!inSound(t))syncMusic();
    if(inSound(t)){setSound(!soundOn);return}
    if(scene==="title"){if(busy)return;const c=opening.touch(t.x,t.y);if(c==="play")startGame();else if(c==="new")startGame(true)}
    else if(t.x>=DIALOG.x&&t.x<=DIALOG.x+DIALOG.w&&t.y>=DIALOG.y&&t.y<=DIALOG.y+DIALOG.h){
     if(asking())dlg!.ask!.sel=t.x<DIALOG.x+DIALOG.w/2?0:1;   // tap YES or NO
     interact();
    }
   });
  },
  update(dt:number){
   elapsed+=dt;
   // The world waits while Claire looks at her phone; only the notice on the top screen keeps time.
   if(phoneOpen){if(notice){notice.t+=dt;if(notice.t>=NOTICE_LEN)notice=null}return}
   if(scene==="title")opening.update(dt);
   fade=Math.max(0,Math.min(1,fade+fadeDir*dt/FADE));
   if(toastTtl>0)toastTtl-=dt;
   if(scene==="outside"&&!busy&&!dlg&&delivery!=="unboxing")updateOutside(dt);
   if(delivery==="unboxing"&&!dlg){
    const before=unboxT;if(!unboxHold)unboxT+=dt;
    if(before<UNBOX.BANNER_START&&unboxT>=UNBOX.BANNER_START){bgmDuck(true);deliverySfx.fanfare();haptic([60,80,60,80,200])}
    if(before<UNBOX.DANCE_START&&unboxT>=UNBOX.DANCE_START){deliverySfx.danceTune();haptic(Array.from({length:16},(_,i)=>i%2?150:30))}   // a tap on every beat
    if(unboxT>=UNBOX.END)finishUnboxing();
   }
   // After the last cat: ring the doorbell, then run the van cutscene once the dialog is read.
   if(countDone&&delivery==="none"&&!dlg&&!busy&&scene==="inside"){
    // You hear it before you see it: a truck rumbling up the street.
    delivery="doorbell";deliverySfx.engine(.8);later(1800,()=>deliverySfx.engine(0));
    openDialog("",["•Rumble, rumble...","•You hear a delivery truck coming up the street."]);
   }else if(delivery==="doorbell"&&!dlg&&!busy){
    delivery="cutscene";truckT=0;fadeTo(()=>{scene="delivery"});
   }
   if(notice){notice.t+=dt;if(notice.t>=NOTICE_LEN)notice=null}
   if(scene==="delivery"&&!busy){
    const before=truckT;if(!truckHold)truckT+=dt;
    const moving=(truckT>TRUCK.ARRIVE_START&&truckT<TRUCK.ARRIVE_END)||(truckT>TRUCK.LEAVE_START&&truckT<TRUCK.LEAVE_END);
    deliverySfx.engine(moving?1:truckT<TRUCK.LEAVE_END?.35:0);
    if(before<TRUCK.HONK&&truckT>=TRUCK.HONK)deliverySfx.horn();
    if(truckT>=TRUCK.END)endCutscene();
   }
   if(scene==="inside"){
    if(!busy&&!dlg)updateInside(dt);
    if(!busy)updateCats(cats,floors[floorIndex],floorIndex,dt,free,reduceMotion);
    tickEffects(effects,dt);
    if(!countDone){
     for(const cat of cats){
      if(cat.floor!==floorIndex||foundCats.has(cat.name))continue;
      if(Math.hypot(cat.x-claire.x,cat.y-claire.y)>=spotRadius(cat))continue;
      if(cat.behavior==="zoomies"){
       // Spotted: Aggu does zoomies (twice at most, a few seconds apart), and Claire has to catch her.
       const z=zoomed.get(cat.name)??{n:0,at:-99};
       if(z.n<2&&elapsed-z.at>3){zoomed.set(cat.name,{n:z.n+1,at:elapsed});zoomOff(cat,floors[floorIndex],free,effects);meow(cat,false,true);say(z.n?`${cat.name.toUpperCase()} IS OFF AGAIN!`:`${cat.name.toUpperCase()} HAS THE ZOOMIES! CATCH HER!`,3)}
       continue;
      }
      foundCats.add(cat.name);say(`FOUND ${cat.name.toUpperCase()}!`);meow(cat,true,true)
     }
     if(foundCats.size===cats.length&&!dlg){countDone=true;haptic([40,60,40,60,120]);openDialog("",["•All four cats accounted for!","•Michael, Aggu, Ollie and Sashi. Nobody is stuck in the dryer."])}
    }
    const f=floors[floorIndex];
    const targetX=Math.max(0,Math.min(f.w*T-W,claire.x*T-W/2)),targetY=Math.max(0,Math.min(f.h*T-H,claire.y*T-H/2));
    const k=Math.min(1,dt*9);cam.x+=(targetX-cam.x)*k;cam.y+=(targetY-cam.y)*k;
   }
   if(dlg&&!dlg.done){
    dlg.clock+=dt;
    const page=dlg.pages[dlg.page],shown=Math.min(page.length,Math.floor(dlg.clock*TYPE_SPEED));
    if(shown!==dlg.shown){dlg.shown=shown;if(shown>=page.length)dlg.done=true}
   }
   // action hint for the bottom screen
   if(dlg||busy||scene==="title")hint="";
   else if(scene==="delivery")hint="";
   else if(scene==="outside")hint=delivery==="unboxing"?"":nearPackage()?"PICK UP PACKAGE":nearCar()?"USE THE TESLA":nearDoor()?"GO INSIDE":"";
   else{const t=probe();hint=t?.kind==="cat"?`PET ${t.cat.name.toUpperCase()}`:t?.kind==="obj"?"LOOK":t?.kind==="exit"?"GO OUTSIDE":""}
  },
  draw(top:CanvasRenderingContext2D,bottom:CanvasRenderingContext2D){
   top.imageSmoothingEnabled=false;bottom.imageSmoothingEnabled=false;
   drawTop(top);drawBottom(bottom);
   if(fade>0){bottom.fillStyle=`rgba(18,13,20,${fade*fade*(3-2*fade)})`;bottom.fillRect(0,0,BW,BH)}
  }
 };
 return game;
}

if(typeof window!=="undefined"&&window.DS)window.DS.setGame(createMolarQuest(window.DS));
