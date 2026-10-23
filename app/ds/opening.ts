// Butterland opening, in the spirit of a cozy farm-game title: a short splash, then the camera
// pans down from a morning sky (drifting clouds, birds, butterflies, rolling hills) to the town,
// the BUTTERLAND logo drops in letter by letter, and a wooden menu rises on the touch screen.
// Any button or tap during the intro skips straight to the finished title.

type G=CanvasRenderingContext2D;
export type OpeningChoice="play"|"new"|"help"|null;

// The touch-screen backdrop shared by the title menu and the game: soft sky fading to green,
// with a strip of grass and a few flowers along the bottom.
export function drawMeadow(g:G,BW:number,BH:number){
 const grad=g.createLinearGradient(0,0,0,BH);grad.addColorStop(0,"#bfe2ff");grad.addColorStop(1,"#8fc98f");
 g.fillStyle=grad;g.fillRect(0,0,BW,BH);
 g.fillStyle="#6fbf7f";g.fillRect(0,BH-26,BW,26);g.fillStyle="#5aa86e";for(let x=0;x<BW;x+=6)g.fillRect(x,BH-27-((x/6)%3),3,3);
 for(let i=0;i<9;i++){const fx=(i*29+7)%BW;g.fillStyle=i%2?"#ffd84a":"#ffffff";g.fillRect(fx,BH-20+(i%3)*4,2,2)}
}

const PX='"Press Start 2P", ui-monospace, monospace';
const TITLE="BUTTERLAND";

// Timeline, in seconds. The splash fades in and out, a short beat of black, then the sky fades
// up while the camera eases down; the logo drops near the end and the menu rises after it.
const SPLASH_END=2.6,PAN_START=2.85,PAN_END=7.9,SKY_FADE=1.2,LOGO_START=6.1,LETTER_GAP=.09,LETTER_FALL=.55,MENU_AT=7.6,MENU_RISE=.7;
// Skipping fades to black, jumps to the finished title, and fades back.
const SKIP_OUT=.3,SKIP_IN=.5;
// How-to-play card: slide in/out and the page flip.
const CARD_IN=.35,CARD_OUT=.25,FLIP=.45;
// Virtual scene for the pan: sky from y=0 down to SKY_H, then the whole town picture scaled to
// the screen width (nothing cropped). The pan ends with the entire town in view.
const SKY_H=360;

type Cloud={x:number;y:number;w:number;speed:number;depth:number};
type Bird={x:number;y:number;speed:number;phase:number};
type Fly={x:number;y:number;phase:number;speed:number;hue:number};

export function createOpening(o:{
 W:number;H:number;BW:number;BH:number;
 world:()=>HTMLCanvasElement|null;   // the town picture, H tall (any width)
 reduceMotion:boolean;
 jingle:()=>void;                     // played once when the logo lands (caller decides on sound)
 cat:()=>HTMLImageElement|null;       // Aggu's walk sheet (4 x 3 cells, row 0 walks right) for the splash
 splash:()=>void;                     // played once as the splash fades in (caller decides on sound)
 hasSave:()=>boolean;                 // a saved game: the menu offers CONTINUE and NEW GAME
}){
 const {W,H,BW,BH}=o;
 // Town height once scaled to the screen width; the 1672x941 picture gives 400x225.
 const townH=()=>{const w=o.world();return w?Math.round(W*w.height/w.width):Math.round(W*941/1672)};
 const endCam=()=>SKY_H+townH()-H;    // final view: a strip of sky above the complete town
 let t=o.reduceMotion?99:0,jingled=o.reduceMotion,selected=0;
 // skip: 0 none, 1 fading out, 2 fading back in
 let skipPhase=0,skipClock=0;
 // help card: page -1 closed, 0 the "no instructions" page, 1 the real controls
 let page=-1,cardClock=0,closing=false,flipClock=-1;

 const clouds:Cloud[]=Array.from({length:9},(_,i)=>({x:(i*97)%(W+120)-60,y:30+((i*61)%280),w:46+((i*37)%50),speed:4+(i%3)*3,depth:.35+(i%3)*.25}));
 const birds:Bird[]=Array.from({length:5},(_,i)=>({x:-40-i*26,y:150+((i*23)%40),speed:24+(i%2)*6,phase:i*.7}));
 const flies:Fly[]=Array.from({length:6},(_,i)=>({x:(i*71)%W,y:SKY_H-30+((i*17)%40),phase:i*1.3,speed:.6+(i%3)*.25,hue:i%2}));

 const clamp=(x:number)=>Math.min(1,Math.max(0,x));
 const ease=(x:number)=>1-Math.pow(1-clamp(x),3);
 const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
 const inOut=(x:number)=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
 const camY=()=>endCam()*inOut((t-PAN_START)/(PAN_END-PAN_START));
 const skipVeil=()=>skipPhase===1?smooth(skipClock/SKIP_OUT):skipPhase===2?1-smooth(skipClock/SKIP_IN):0;
 const ready=()=>t>=MENU_AT;

 /* ---- pixel helpers ---- */
 const blob=(g:G,cx:number,cy:number,rx:number,ry:number,color:string)=>{
  g.fillStyle=color;
  for(let y=-ry;y<=ry;y++){const hw=Math.round(rx*Math.sqrt(1-(y*y)/(ry*ry)));g.fillRect(Math.round(cx-hw),Math.round(cy+y),hw*2,1)}
 };
 const cloud=(g:G,x:number,y:number,w:number)=>{
  const h=w*.28;
  blob(g,x+w*.5,y+h*.75,w*.5,h*.45,"#d7e6f4");
  blob(g,x+w*.3,y+h*.55,w*.24,h*.5,"#ffffff");blob(g,x+w*.6,y+h*.4,w*.28,h*.62,"#ffffff");blob(g,x+w*.82,y+h*.62,w*.17,h*.38,"#ffffff");
  g.fillStyle="#ffffff";g.fillRect(Math.round(x+w*.12),Math.round(y+h*.6),Math.round(w*.76),Math.round(h*.45));
 };
 const text=(g:G,s:string,x:number,y:number,size:number,color:string,align:CanvasTextAlign="center")=>{
  g.font=`${size}px ${PX}`;g.textAlign=align;g.textBaseline="top";g.fillStyle=color;g.fillText(s,x,y);
 };
 // A tiny butter-yellow butterfly; `flap` 0..1 closes the wings.
 const butterfly=(g:G,x:number,y:number,flap:number,hue:number)=>{
  const wing=hue?"#ffd84a":"#ffe98a",edge="#c98a1e",span=Math.max(1,Math.round(4*(1-flap)));
  x=Math.round(x);y=Math.round(y);
  g.fillStyle=edge;g.fillRect(x-span-1,y-2,span+1,4);g.fillRect(x+1,y-2,span+1,4);
  g.fillStyle=wing;g.fillRect(x-span,y-1,span,3);g.fillRect(x+1,y-1,span,3);
  g.fillStyle="#4a2a12";g.fillRect(x,y-2,1,5);
 };

 /* ---- top screen ---- */
 const drawSky=(g:G,cam:number)=>{
  const grad=g.createLinearGradient(0,-cam,0,SKY_H-cam+40);
  grad.addColorStop(0,"#2f62c9");grad.addColorStop(.55,"#7fb8f0");grad.addColorStop(.85,"#cfe9ff");grad.addColorStop(1,"#ffe7c2");
  g.fillStyle=grad;g.fillRect(0,0,W,H);
  // morning sun low on the horizon
  blob(g,W*.78,SKY_H-70-cam,22,22,"#fff1b8");blob(g,W*.78,SKY_H-70-cam,16,16,"#fff8dc");
  for(const c of clouds){
   const x=((c.x+t*c.speed)%(W+140))-70,y=c.y-cam*c.depth;
   if(y>-40&&y<H+10)cloud(g,x,y,c.w);
  }
 };
 const hills=(g:G,cam:number)=>{
  const layer=(base:number,amp:number,freq:number,color:string,trees:string|null,depth:number)=>{
   const off=cam*depth;
   for(let x=0;x<W;x+=2){
    const top=Math.round(base-off+Math.sin(x*freq+base)*amp+Math.sin(x*freq*2.3)*amp*.4);
    g.fillStyle=color;g.fillRect(x,top,2,H-top+40);
    if(trees&&(x/2)%9===0){blob(g,x,top-3,4,5,trees);g.fillStyle="#3b2a1a";g.fillRect(x,top+1,1,3)}
   }
  };
  layer(SKY_H-55,10,.018,"#9fd3a8",null,1);
  layer(SKY_H-30,8,.026,"#6fbf7f","#3f8f55",1);
 };
 const drawBirds=(g:G,cam:number)=>{
  for(const b of birds){
   const x=((b.x+t*b.speed)%(W+120))-20,y=b.y-cam*.7+Math.sin(t*2+b.phase)*3,up=Math.floor(t*6+b.phase)%2===0;
   if(y<-10||y>H)continue;
   g.fillStyle="#2a3548";
   if(up){g.fillRect(x-3,y-1,2,1);g.fillRect(x-1,y,1,1);g.fillRect(x,y-1,1,1);g.fillRect(x+1,y-1,2,1)}
   else{g.fillRect(x-3,y,2,1);g.fillRect(x-1,y,3,1);g.fillRect(x+2,y,2,1);g.fillRect(x-1,y+1,1,1)}
  }
 };
 const drawFlies=(g:G,cam:number)=>{
  for(const f of flies){
   const x=(f.x+Math.sin(t*f.speed+f.phase)*40+t*8)%W,y=f.y-cam+Math.sin(t*f.speed*2.2+f.phase)*10;
   if(y<-6||y>H+6)continue;
   butterfly(g,x,y,(Math.sin(t*14+f.phase)+1)/2,f.hue);
  }
 };
 const drawLogo=(g:G)=>{
  const size=26,y0=10;
  g.font=`${size}px ${PX}`;
  const widths=[...TITLE].map(ch=>g.measureText(ch).width),total=widths.reduce((a,b)=>a+b,0)+(TITLE.length-1)*2;
  let x=Math.round(W/2-total/2);
  [...TITLE].forEach((ch,i)=>{
   const start=LOGO_START+i*LETTER_GAP,k=(t-start)/LETTER_FALL;
   if(k<=0){x+=widths[i]+2;return}
   // drop from above with a little bounce, then a gentle wave
   const fall=k>=1?0:k<.7?-(1-k/.7)*90:Math.sin((k-.7)/.3*Math.PI)*-6;
   const wave=k>=1?Math.round(Math.sin(t*2.2+i*.6)*1.5):0;
   const y=Math.round(y0+fall+wave);
   g.textAlign="left";g.textBaseline="top";
   g.fillStyle="#4a2a12";
   for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2],[-2,-2],[2,-2],[-2,2],[2,2],[0,4],[2,4],[-2,4]])g.fillText(ch,x+dx,y+dy);
   g.fillStyle="#e08a1e";g.fillText(ch,x,y+2);
   const grad=g.createLinearGradient(0,y,0,y+size);grad.addColorStop(0,"#fff6b0");grad.addColorStop(.5,"#ffd84a");grad.addColorStop(1,"#f5b52e");
   g.fillStyle=grad;g.fillText(ch,x,y);
   g.fillStyle="#fffbe0";g.fillRect(x+3,y+3,4,2);
   x+=widths[i]+2;
  });
  const landed=t-(LOGO_START+(TITLE.length-1)*LETTER_GAP+LETTER_FALL);
  if(landed>0){
   // a butterfly perched on the last letter
   const bx=Math.round(W/2+total/2-6),by=y0-6+Math.round(Math.sin(t*1.5)*1);
   butterfly(g,bx,by,(Math.sin(t*3)+1)/4,0);
  }
 };
 const drawSplash=(g:G)=>{
  g.fillStyle="#120d14";g.fillRect(0,0,W,H);
  const a=smooth(Math.min(t/.8,(SPLASH_END-t)/.8));
  if(a<=0)return;
  g.globalAlpha=a;
  // Aggu trotting in place
  const cat=o.cat(),size=40,cx=Math.round(W/2-size/2),cy=Math.round(H/2-size+10);
  if(cat&&cat.complete&&cat.naturalWidth){
   const cell=cat.naturalWidth/4,frame=Math.floor(t*8)%4,bob=frame%2?-1:0;
   g.fillStyle="rgba(255,241,201,.12)";g.fillRect(cx+9,cy+size-3,size-18,2);
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
   g.drawImage(cat,frame*cell,0,cell,cell,cx,cy+bob,size,size);
   g.imageSmoothingEnabled=false;
  }
  text(g,"a cozy little game",W/2,H/2+22,7,"#fff1c9");
  text(g,"© mimi",W/2,H/2+38,7,"#b8a9b8");
  g.globalAlpha=1;
 };

 const veil=(g:G,w:number,h:number)=>{const a=skipVeil();if(a>0){g.fillStyle=`rgba(18,13,20,${a})`;g.fillRect(0,0,w,h)}};
 function drawTop(g:G){
  g.imageSmoothingEnabled=false;
  if(t<PAN_START){drawSplash(g);veil(g,W,H);return}
  const cam=camY();
  drawSky(g,cam);
  drawBirds(g,cam);
  hills(g,cam);
  const world=o.world(),wy=Math.round(SKY_H-cam),th=townH();
  if(world&&wy<H){
   g.imageSmoothingEnabled=true;g.drawImage(world,0,wy,W,th);g.imageSmoothingEnabled=false;
   // blend the front hill into the top of the town picture so there is no hard seam
   const seam=g.createLinearGradient(0,wy-2,0,wy+30);seam.addColorStop(0,"rgba(111,191,127,1)");seam.addColorStop(1,"rgba(111,191,127,0)");
   g.fillStyle=seam;g.fillRect(0,wy-2,W,32);
  }
  else if(wy<H){g.fillStyle="#07e66e";g.fillRect(0,wy,W,H-wy)}
  drawFlies(g,cam);
  drawLogo(g);
  // fade up from the splash
  const fin=smooth((t-PAN_START)/SKY_FADE);
  if(fin<1){g.fillStyle=`rgba(18,13,20,${1-fin})`;g.fillRect(0,0,W,H)}
  veil(g,W,H);
  if(!jingled&&t>=LOGO_START+(TITLE.length-1)*LETTER_GAP+LETTER_FALL*.7){jingled=true;o.jingle()}
 }

 /* ---- bottom screen ---- */
 // With a saved game the menu is CONTINUE / NEW GAME / HOW TO PLAY, otherwise PLAY / HOW TO PLAY.
 const PLAIN=[{label:"PLAY",y:62,pick:"play"},{label:"HOW TO PLAY",y:104,pick:"help"}] as const;
 const SAVED=[{label:"CONTINUE",y:44,pick:"play"},{label:"NEW GAME",y:84,pick:"new"},{label:"HOW TO PLAY",y:124,pick:"help"}] as const;
 const buttons=()=>o.hasSave()?SAVED:PLAIN;
 const BX=48,BWIDTH=160,BHEIGHT=32;
 const woodButton=(g:G,x:number,y:number,w:number,h:number,label:string,on:boolean)=>{
  g.fillStyle="#2b1a0e";g.fillRect(x+2,y+3,w,h);                 // drop shadow
  g.fillStyle="#4a2a12";g.fillRect(x,y,w,h);                     // dark rim
  g.fillStyle=on?"#c9853f":"#a8692f";g.fillRect(x+2,y+2,w-4,h-4); // plank
  g.fillStyle=on?"#e3a35b":"#c0803f";g.fillRect(x+2,y+2,w-4,2);   // top light
  g.fillStyle="#8a5426";g.fillRect(x+2,y+Math.round(h/2),w-4,1);  // plank seam
  g.fillStyle="#6b3e1c";for(const nx of [x+6,x+w-8])g.fillRect(nx,y+6,2,2); // nails
  text(g,label,x+w/2+1,y+h/2-4,8,"#3a2412");
  text(g,label,x+w/2,y+h/2-5,8,on?"#fffbe0":"#ffe9c2");
 };
 // A pixel devil face (the "evil" emoji), drawn from a grid so it matches the art.
 const DEVIL=[
  "..K..........K..",
  ".KPK........KPK.",
  ".KPPK.KKKK.KPPK.",
  "..KPPKLLLLKPPK..",
  "..KPLLLLLLLLPK..",
  ".KPLLLLLLLLLLPK.",
  ".KPKKLLLLLLKKPK.",
  "KPLLKELLLLEKLLPK",
  "KPLLEELLLLEELLPK",
  "KPLLLLLLLLLLLLPK",
  "KPKLLLLLLLLLLKPK",
  "KPLKWWWWWWWWKLPK",
  ".KPLKKKKKKKKLPK.",
  ".KPPLLLLLLLLPPK.",
  "..KKPPPPPPPPKK..",
  "....KKKKKKKK....",
 ];
 const DEVIL_COL:Record<string,string>={K:"#2a1236",P:"#7a35c4",L:"#a65fe6",E:"#1a0a22",W:"#fff6f0"};
 const devil=(g:G,x:number,y:number,scale:number)=>{
  DEVIL.forEach((row,ry)=>[...row].forEach((c,rx)=>{if(c==="."||!DEVIL_COL[c])return;g.fillStyle=DEVIL_COL[c];g.fillRect(x+rx*scale,y+ry*scale,scale,scale)}));
 };
 // A sheet of paper with a curled corner (it can be flipped over).
 const paper=(g:G,x:number,y:number,w:number,h:number)=>{
  g.fillStyle="#2b1a0e";g.fillRect(x+2,y+3,w,h);g.fillStyle="#4a2a12";g.fillRect(x,y,w,h);g.fillStyle="#fff1d6";g.fillRect(x+3,y+3,w-6,h-6);
  if(w>30){const c=12;g.fillStyle="#e0c9a2";for(let i=0;i<c;i++)g.fillRect(x+w-3-c+i,y+h-3-i,c-i,1);g.fillStyle="#4a2a12";for(let i=0;i<c;i++)g.fillRect(x+w-3-c+i,y+h-4-i,1,1)}
 };
 const drawCard=(g:G)=>{
  const x0=16,w0=BW-32,h0=136,y0=16;
  const open=closing?1-smooth(cardClock/CARD_OUT):smooth(cardClock/CARD_IN);
  const y=Math.round(y0+(1-open)*BH);
  // page flip: the card narrows to an edge, switches page, then widens again
  let shown=page,sx=1;
  if(flipClock>=0){const f=clamp(flipClock/FLIP);sx=Math.abs(Math.cos(f*Math.PI));shown=f<.5?0:1;sx=Math.max(.04,sx)}
  const w=Math.max(6,Math.round(w0*sx)),x=Math.round(x0+(w0-w)/2);
  paper(g,x,y,w,h0);
  if(sx<.6)return;
  g.save();g.beginPath();g.rect(x+3,y+3,w-6,h0-6);g.clip();
  if(shown===0){
   text(g,"NO INSTRUCTIONS",BW/2,y+14,9,"#3a2412");
   devil(g,BW/2-32,y+32+Math.round(Math.sin(t*3)*2),4);
   text(g,"psst... press A to",BW/2,y+104,6,"#8a6a4a");
   text(g,"flip the page",BW/2,y+116,6,"#8a6a4a");
  }else{
   text(g,"HOW TO PLAY",BW/2,y+12,8,"#3a2412");
   const lines=["D-PAD   walk","A       talk / pet","B       close","SELECT  sound","START   title"];
   lines.forEach((l,i)=>text(g,l,x0+16,y+30+i*13,6,"#3a2412","left"));
   text(g,"A / tap: close",BW/2,y+h0-16,5,"#8a6a4a");
  }
  g.restore();
 };
 function drawBottom(g:G){
  drawMeadow(g,BW,BH);
  // the bottom screen fades up with the sky
  const up=t<PAN_START?0:smooth((t-PAN_START)/SKY_FADE);
  if(up<1){g.fillStyle=`rgba(18,13,20,${1-up})`;g.fillRect(0,0,BW,BH)}
  if(!ready()){
   if(t>PAN_START+SKY_FADE){g.globalAlpha=.55+.45*Math.sin(t*3);text(g,"press A to skip",BW/2,BH/2-4,6,"#2a3548");g.globalAlpha=1}
   veil(g,BW,BH);
   return;
  }
  const r=ease((t-MENU_AT)/MENU_RISE),rise=(1-r)*40,cardUp=page>=0?smooth(closing?1-cardClock/CARD_OUT:cardClock/CARD_IN):0;
  g.globalAlpha=r*(1-cardUp*.85);
  buttons().forEach((b,i)=>{
   const bob=i===selected?Math.round(Math.sin(t*4)*1.5):0;
   woodButton(g,BX,Math.round(b.y+rise+bob),BWIDTH,BHEIGHT,b.label,i===selected);
   if(i===selected){const ax=BX-12+Math.round(Math.sin(t*6)*2),ay=Math.round(b.y+rise+BHEIGHT/2);g.fillStyle="#4a2a12";g.fillRect(ax,ay-4,2,8);g.fillRect(ax+2,ay-3,2,6);g.fillRect(ax+4,ay-2,2,4);g.fillRect(ax+6,ay-1,2,2)}
  });
  g.globalAlpha=1;
  if(page>=0)drawCard(g);
  veil(g,BW,BH);
 }

 const startSkip=()=>{if(skipPhase===0&&t<MENU_AT){skipPhase=1;skipClock=0}};
 const openCard=()=>{page=0;cardClock=0;closing=false;flipClock=-1};
 const closeCard=()=>{if(page>=0&&!closing){closing=true;cardClock=0}};
 const advanceCard=()=>{
  if(closing||flipClock>=0||cardClock<CARD_IN)return;
  if(page===0)flipClock=0;else closeCard();
 };
 return{
  update(dt:number){
   const before=t;t+=dt;
   if(before<.35&&t>=.35)o.splash();
   if(skipPhase===1){skipClock+=dt;if(skipClock>=SKIP_OUT){t=Math.max(t,MENU_AT);jingled=true;skipPhase=2;skipClock=0}}
   else if(skipPhase===2){skipClock+=dt;if(skipClock>=SKIP_IN)skipPhase=0}
   if(page>=0){
    cardClock+=dt;
    if(flipClock>=0){flipClock+=dt;if(flipClock>=FLIP/2&&page===0)page=1;if(flipClock>=FLIP)flipClock=-1}
    if(closing&&cardClock>=CARD_OUT){page=-1;closing=false}
   }
  },
  drawTop,drawBottom,
  ready,
  isHelp:()=>page>=0,
  skip:startSkip,
  back:closeCard,
  finish(){t=Math.max(t,99);jingled=true;page=-1;closing=false;flipClock=-1;skipPhase=0},
  move(dir:-1|1){if(page<0){const n=buttons().length;selected=(selected+dir+n)%n}},
  // A / START: returns what to do.
  choose():OpeningChoice{
   if(skipPhase)return null;
   if(!ready()){startSkip();return null}
   if(page>=0){advanceCard();return null}
   const pick=buttons()[Math.min(selected,buttons().length-1)].pick;
   if(pick==="help"){openCard();return "help"}
   return pick;
  },
  // Touch on the bottom screen.
  touch(x:number,y:number):OpeningChoice{
   if(skipPhase)return null;
   if(!ready()){startSkip();return null}
   if(page>=0){advanceCard();return null}
   const i=buttons().findIndex(b=>x>=BX&&x<=BX+BWIDTH&&y>=b.y&&y<=b.y+BHEIGHT);
   if(i<0)return null;
   selected=i;return this.choose();
  }
 };
}
