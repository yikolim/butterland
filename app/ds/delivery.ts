// Pixel art and timing for the end-of-quest delivery: a Butterfly Post truck drives up the street,
// honks, drops a package on the sidewalk by the front gate, and drives off.

type G=CanvasRenderingContext2D;

const INK="#222d35";

// Cutscene timeline (seconds).
export const TRUCK={ARRIVE_START:.6,ARRIVE_END:3.1,HONK:3.2,DROP_START:3.6,DROP_END:4.3,LEAVE_START:4.9,LEAVE_END:6.7,END:7.3};

// Where the package lands, in outdoor scene percentages (the same units as Claire's position):
// on the sidewalk just outside the front gate.
export const PACKAGE_SPOT={x:44,y:88};

const r=(g:G,x:number,y:number,w:number,h:number,c:string)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};

// The truck, facing right, modelled on a small Japanese box truck: a tall white cargo box with a
// round yellow logo (a butterfly, for Butterfly Post) and a green stripe, a two-tone cab (cream top,
// teal bottom) and gold wheels. 150x80 px: clearly bigger than the Tesla, as a box truck on the
// street nearer the camera should be. (x,y) is the bottom-left corner on the road; `spin` turns the wheels.
export const TRUCK_LEN=150,TRUCK_HEIGHT=80;
export function drawTruck(g:G,x:number,y:number,spin:number,doorOpen:boolean){
 x=Math.round(x);y=Math.round(y);
 const L=TRUCK_LEN,H=TRUCK_HEIGHT,top=y-H;
 const X=(f:number)=>x+Math.round(f*L),Y=(f:number)=>top+Math.round(f*H);
 r(g,x+3,y-2,L-4,4,"rgba(20,40,30,.35)");                                   // shadow on the road
 // chassis under the box
 r(g,X(.04),Y(.76),Math.round(.7*L),Math.round(.1*H),"#2a2f36");
 // rear door end (seen just past the box) and the cargo box
 r(g,X(0),Y(0),Math.round(.1*L),Math.round(.78*H),INK);r(g,X(0)+1,Y(0)+1,Math.round(.1*L)-2,Math.round(.78*H)-2,"#e9ece6");
 r(g,X(.02),Y(.16),Math.round(.06*L),2,"#2f9c6a");                           // little green label
 r(g,X(.1),Y(0),Math.round(.64*L),Math.round(.78*H),INK);
 r(g,X(.1)+1,Y(0)+1,Math.round(.64*L)-2,Math.round(.78*H)-2,"#f6f7f3");
 r(g,X(.1)+1,Y(0)+1,Math.round(.64*L)-2,2,"#ffffff");
 r(g,X(.1)+1,Y(.7),Math.round(.64*L)-2,2,"#d9ddd6");                         // box bottom rail
 r(g,X(.43),Y(.06),1,Math.round(.62*H),"#d4d8d0");                           // panel seam
 // side door panel near the cab
 r(g,X(.6),Y(.36),Math.round(.13*L),Math.round(.36*H),"#c9cec6");r(g,X(.6)+1,Y(.36)+1,Math.round(.13*L)-2,Math.round(.36*H)-2,"#eef0eb");
 // logo: a yellow circle with a black butterfly
 const lx=X(.2),ly=Y(.22),lr=Math.round(.085*L);
 for(let dy=-lr+2;dy<=lr-2;dy++){const hw=Math.round(Math.sqrt(lr*lr-dy*dy*1.6));r(g,lx-hw,ly+dy,hw*2,1,"#f5c518")}
 r(g,lx-4,ly-3,3,3,"#1f1e2e");r(g,lx+1,ly-3,3,3,"#1f1e2e");r(g,lx-3,ly,2,2,"#1f1e2e");r(g,lx+1,ly,2,2,"#1f1e2e");r(g,lx,ly-3,1,6,"#1f1e2e");
 // stripe: a teal-outlined white tag then a green band with yellow lettering
 const sx=X(.33),sy=Y(.12),sh=Math.max(5,Math.round(.14*H));
 r(g,sx,sy,Math.round(.38*L),sh,"#2f9c95");r(g,sx+1,sy+1,Math.round(.12*L),sh-2,"#ffffff");
 r(g,sx+2,sy+2,Math.round(.09*L),1,"#3b8fd6");r(g,sx+2,sy+4,Math.round(.07*L),1,"#3b8fd6");
 r(g,sx+Math.round(.13*L),sy+1,Math.round(.24*L),sh-2,"#2e9e5e");
 for(let i=0;i<4;i++)r(g,sx+Math.round(.15*L)+i*5,sy+2,3,sh-4,"#ffe066");
 // back door swings open when the package comes out
 if(doorOpen){r(g,X(0)-7,Y(.04),7,Math.round(.7*H),INK);r(g,X(0)-6,Y(.04)+1,5,Math.round(.7*H)-2,"#dfe3dc")}
 // cab: cream top with the window, teal bottom, cream bumper
 const cx=X(.74),cw=L-Math.round(.74*L),ct=Y(.3);
 r(g,cx,ct,cw,y-ct-Math.round(.1*H),INK);
 r(g,cx+1,ct+1,cw-3,Math.round(.26*H),"#eadfc3");
 r(g,cx+3,ct+2,cw-8,Math.round(.2*H),"#3d4a58");r(g,cx+4,ct+3,cw-11,Math.round(.08*H),"#9fd6ef");   // window
 r(g,cx+1,ct+1+Math.round(.26*H),cw-3,y-ct-Math.round(.1*H)-Math.round(.26*H)-2,"#2f9c95");
 r(g,cx+1,ct+1+Math.round(.26*H),cw-3,1,"#57c2ba");
 r(g,x+L-3,Y(.62),3,Math.round(.08*H),"#fff1b8");                                   // headlight
 r(g,cx+1,y-Math.round(.12*H),cw,Math.round(.05*H)+1,"#eadfc3");                   // bumper
 // wheels: dark tyres, gold hubs
 for(const wf of [.36,.82]){
  const rad=Math.round(.07*L),hub=Math.round(rad*.5),wx=X(wf),wy=y-rad;
  for(let dy=-rad;dy<=rad;dy++){const hw=Math.round(Math.sqrt(rad*rad-dy*dy));r(g,wx-hw,wy+dy,hw*2,1,INK)}
  for(let dy=-hub;dy<=hub;dy++){const hw=Math.round(Math.sqrt(hub*hub-dy*dy));r(g,wx-hw,wy+dy,hw*2,1,"#c8a46a")}
  const s=Math.floor(spin)%2;r(g,wx-1+(s?1:-1),wy-1,2,2,"#8a6a3a");
 }
}

// A cardboard box with tape. (x,y) is its bottom centre.
export function drawPackage(g:G,x:number,y:number){
 x=Math.round(x);y=Math.round(y);
 r(g,x-8,y-1,16,3,"rgba(20,40,30,.35)");
 r(g,x-7,y-11,14,11,INK);r(g,x-6,y-10,12,9,"#c98a4a");r(g,x-6,y-10,12,2,"#e0a565");
 r(g,x-1,y-10,2,9,"#f3e2b8");r(g,x-6,y-6,12,1,"#a86e36");
}

// A small bobbing arrow pointing down at (x,y).
export function drawArrow(g:G,x:number,y:number,t:number){
 const b=Math.round(Math.sin(t*5)*2);x=Math.round(x);y=Math.round(y)+b;
 r(g,x-1,y-8,3,5,"#ff526f");r(g,x-4,y-3,9,2,"#ff526f");r(g,x-2,y-1,5,2,"#ff526f");r(g,x,y+1,1,1,"#ff526f");
}

// Doorbell, horn and engine sounds, synthesised.
export function makeDeliverySounds(getCtx:()=>AudioContext|null){
 const tone=(hz:number,start:number,len:number,type:OscillatorType,vol:number)=>{
  const ctx=getCtx();if(!ctx)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+start;
  osc.type=type;osc.frequency.value=hz;
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(vol,t+.02);gain.gain.exponentialRampToValueAtTime(.001,t+len);
  osc.connect(gain).connect(ctx.destination);osc.start(t);osc.stop(t+len+.02);
 };
 let engine:{osc:OscillatorNode;gain:GainNode}|null=null;
 return{
  doorbell(){tone(659.25,0,.55,"sine",.18);tone(523.25,.42,.8,"sine",.18)},
  notify(){tone(880,0,.18,"triangle",.1);tone(1174.66,.12,.32,"triangle",.1)},
  horn(){tone(392,0,.14,"square",.05);tone(392,.2,.18,"square",.05)},
  // The gadget reveal: a bright ~3.5 s fanfare (lead, harmony and a bass under it).
  fanfare(){
   const lead:[number,number,number][]=[[523.25,0,.16],[659.25,.16,.16],[783.99,.32,.16],[1046.5,.48,.5],[880,1.02,.16],[987.77,1.18,.16],[1046.5,1.34,.16],
    [1174.66,1.5,.5],[1046.5,2.04,.14],[1174.66,2.2,.14],[1318.51,2.36,1.1]];
   for(const [hz,at,len] of lead){tone(hz,at,len+.12,"square",.035);tone(hz/2,at,len+.1,"triangle",.05)}
   for(const [hz,at] of [[130.81,0],[174.61,1.02],[196,1.5],[261.63,2.36]] as const)tone(hz,at,.9,"triangle",.09);
   for(let i=0;i<8;i++)tone(2093+i*140,2.4+i*.07,.18,"sine",.03);   // sparkle run at the end
  },
  // Claire's happy dance: a bouncy ~3 s tune.
  danceTune(){
   const notes=[659.25,783.99,880,783.99,659.25,587.33,659.25,783.99,880,1046.5,880,783.99,659.25,783.99,1046.5,1318.51];
   notes.forEach((hz,i)=>tone(hz,i*.18,.16,"square",.03));
   for(let i=0;i<8;i++)tone(i%2?196:130.81,i*.36,.3,"triangle",.08);
   for(let i=0;i<16;i++)tone(4200,i*.18+.09,.03,"sine",.015);     // a soft tick on the off-beats
  },
  // A low rumble while the van moves; level 0 silences it.
  engine(level:number){
   const ctx=getCtx();if(!ctx)return;
   if(!engine&&level>0){
    const osc=ctx.createOscillator(),gain=ctx.createGain(),lp=ctx.createBiquadFilter();
    osc.type="sawtooth";osc.frequency.value=58;lp.type="lowpass";lp.frequency.value=220;gain.gain.value=0;
    osc.connect(lp).connect(gain).connect(ctx.destination);osc.start();engine={osc,gain};
   }
   if(engine){
    engine.gain.gain.setTargetAtTime(level*.05,ctx.currentTime,.08);
    engine.osc.frequency.setTargetAtTime(52+level*18,ctx.currentTime,.1);
    if(level<=0){const e=engine;engine=null;setTimeout(()=>{try{e.osc.stop()}catch{/* already stopped */}},400)}
   }
  }
 };
}
