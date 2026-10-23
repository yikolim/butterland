// The unboxing in the yard: pixel helpers and timing. Claire opens the package next to her, an
// iPhone Duo (a foldable that opens into a little tablet) rises out of it, a full-screen gadget
// reveal shows it off, and she does a happy dance. The phone then opens the Tesla app (public/phone) with Y.

type G=CanvasRenderingContext2D;
const r=(g:G,x:number,y:number,w:number,h:number,c:string)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};

// Unboxing timeline (seconds from the moment Claire starts opening): the box shakes and opens, the
// phone rises out of it, the full-screen gadget reveal plays, then Claire dances.
export const UNBOX={SHAKE_END:.8,OPEN_END:1.3,RISE_END:2,BANNER_START:2.1,BANNER_END:5.6,DANCE_START:5.8,DANCE_END:8.8,END:9};

// A rounded rectangle built from pixel rows, so corners stay crisp.
function rrect(g:G,x:number,y:number,w:number,h:number,rad:number,c:string){
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);rad=Math.max(0,Math.min(Math.round(rad),Math.floor(Math.min(w,h)/2)));
 g.fillStyle=c;
 for(let i=0;i<h;i++){
  const d=i<rad?rad-i:i>=h-rad?i-(h-rad-1):0;
  const inset=d>0?Math.round(rad-Math.sqrt(Math.max(0,rad*rad-d*d))):0;
  g.fillRect(x+inset,y+i,w-inset*2,1);
 }
}

// The iPhone Duo, unfolded: a landscape, nearly square foldable with a thin dark edge and a light
// home screen (a plant photo widget, a weather card, small cards and a grid of app icons).
// (cx,cy) is its centre and w its width; small sizes drop the detail.
export function drawDuo(g:G,cx:number,cy:number,w:number){
 const h=Math.round(w*.76),x=Math.round(cx-w/2),y=Math.round(cy-h/2);
 const edge=Math.max(1,Math.round(w*.025)),rad=Math.max(1,Math.round(w*.08));
 rrect(g,x,y,w,h,rad,"#26282e");                                        // body
 rrect(g,x+edge,y+edge,w-edge*2,h-edge*2,Math.max(1,rad-edge),"#0f1014"); // bezel
 const sx=x+edge*2,sy=y+edge*2,sw=w-edge*4,sh=h-edge*4;
 rrect(g,sx,sy,sw,sh,Math.max(1,rad-edge*2),"#eef1f5");                  // screen
 const X=(f:number)=>sx+f*sw,Y=(f:number)=>sy+f*sh;
 if(w<26){
  r(g,X(.08),Y(.12),sw*.36,sh*.5,"#7cc7f0");r(g,X(.12),Y(.32),sw*.1,sh*.3,"#3f9a4f");r(g,X(.26),Y(.26),sw*.1,sh*.36,"#3f9a4f");
  r(g,X(.52),Y(.14),sw*.2,sh*.18,"#bfe3ff");
  for(let i=0;i<3;i++)r(g,X(.52+i*.15),Y(.66),Math.max(1,sw*.1),Math.max(1,sh*.12),["#ff8fb1","#5aa0ff","#2a2c33"][i]);
  r(g,X(.5),sy+1,1,sh-2,"#d9dde4");
  return;
 }
 // plant photo widget: sky, cacti, sand
 const pr=Math.max(1,Math.round(w*.03));
 rrect(g,X(.05),Y(.08),sw*.36,sh*.56,pr,"#8fd3f5");
 r(g,X(.05),Y(.5),sw*.36,sh*.14,"#d9c38a");
 for(const [fx,fw,fh] of [[.1,.06,.34],[.19,.08,.42],[.3,.06,.28]] as const){
  rrect(g,X(fx),Y(.5-fh),sw*fw,sh*fh+sh*.02,Math.max(1,Math.round(sw*fw/2)),"#3f9a4f");
  r(g,X(fx)+sw*fw*.35,Y(.5-fh)+sh*.04,Math.max(1,sw*fw*.2),sh*fh*.7,"#5fbf6a");
 }
 // weather card with a little sun
 rrect(g,X(.45),Y(.08),sw*.2,sh*.25,pr,"#cfe8ff");
 r(g,X(.47),Y(.12),sw*.08,Math.max(1,sh*.03),"#7a8aa0");r(g,X(.47),Y(.18),sw*.12,Math.max(1,sh*.03),"#9aa8bb");
 rrect(g,X(.58),Y(.2),sw*.05,sw*.05,Math.round(sw*.025),"#ffd84a");
 // two small cards and a round profile button
 rrect(g,X(.45),Y(.37),sw*.09,sh*.13,pr,"#dde2ea");rrect(g,X(.56),Y(.37),sw*.09,sh*.13,pr,"#dde2ea");
 rrect(g,X(.86),Y(.1),sw*.07,sw*.07,Math.round(sw*.035),"#3a3d45");
 // status bar
 for(let i=0;i<3;i++)r(g,X(.84+i*.035),Y(.03),Math.max(1,sw*.02),Math.max(1,sh*.02),"#5d6270");
 // app icons: a row on the right, and a dock row
 const icons=["#2a2c33","#ff8fb1","#5aa0ff","#2a2c33","#3fbf8a","#ffb44a","#9a7bff","#2a2c33"];
 const isz=Math.max(2,Math.round(sw*.065));
 for(let i=0;i<4;i++)rrect(g,X(.7+i*.075),Y(.4),isz,isz,Math.round(isz*.3),icons[i]);
 for(let i=0;i<5;i++)rrect(g,X(.45+i*.1),Y(.76),isz,isz,Math.round(isz*.3),icons[3+i]);
 // home bar and the faint fold down the middle
 rrect(g,X(.42),Y(.93),sw*.16,Math.max(1,sh*.015),1,"#9aa0ab");
 g.globalAlpha=.35;r(g,X(.5),sy+2,1,sh-4,"#c5cad3");g.globalAlpha=1;
}

// Small phone used on the box, quest card and notification. (x,y) is its centre; s scales it
// (1 = 16 px wide).
export function drawPhone(g:G,x:number,y:number,s=1,glow=0){
 const w=16*s;
 if(glow>0){g.globalAlpha=glow*.35;rrect(g,x-w/2-4*s,y-w*.38-4*s,w+8*s,w*.76+8*s,4*s,"#fff6b0");g.globalAlpha=1}
 drawDuo(g,x,y,w);
}

// Twinkling 4-point sparkles around (x,y).
export function drawSparkles(g:G,x:number,y:number,t:number,radius=14){
 for(let i=0;i<6;i++){
  const a=t*2+i*Math.PI/3,d=radius*(.7+.3*Math.sin(t*5+i)),sx=Math.round(x+Math.cos(a)*d),sy=Math.round(y+Math.sin(a)*d*.7);
  const big=(Math.floor(t*8)+i)%3===0;
  r(g,sx,sy-(big?2:1),1,big?5:3,"#fff6b0");r(g,sx-(big?2:1),sy,big?5:3,1,"#fff6b0");
 }
}

// Music notes floating up while Claire dances.
export function drawNotes(g:G,x:number,y:number,t:number){
 for(let i=0;i<3;i++){
  const k=(t*.8+i/3)%1,nx=Math.round(x+(i-1)*12+Math.sin(t*3+i)*3),ny=Math.round(y-k*22);
  g.globalAlpha=1-k;
  const c=i%2?"#ff6fa5":"#7457e6";
  r(g,nx,ny,2,2,c);r(g,nx+2,ny-5,1,6,c);r(g,nx+2,ny-5,3,1,c);
  g.globalAlpha=1;
 }
}

// The gadget reveal: the whole top screen turns into a pink burst with turning rays and sparkles,
// the iPhone Duo zooms in and floats in the middle, and its name drops in below.
// lt = seconds since the reveal started, dur = its length, t = a running clock for the shimmer.
export function drawItemReveal(g:G,W:number,H:number,lt:number,dur:number,t:number,text:(s:string,x:number,y:number,size:number,color:string,align?:CanvasTextAlign)=>void){
 const a=Math.max(0,Math.min(1,lt/.25,(dur-lt)/.3));
 if(a<=0)return;
 g.save();g.globalAlpha=a;
 const cx=W/2,cy=H*.44;
 const bg=g.createRadialGradient(cx,cy,10,cx,cy,Math.max(W,H)*.75);
 bg.addColorStop(0,"#fff2fb");bg.addColorStop(.3,"#ffb3e3");bg.addColorStop(.65,"#e27ad8");bg.addColorStop(1,"#8f5be6");
 g.fillStyle=bg;g.fillRect(0,0,W,H);
 // turning rays
 const rays=14,spin=t*.25;
 g.globalAlpha=a*.16;g.fillStyle="#ffffff";
 for(let i=0;i<rays;i++){
  const a0=spin+i*Math.PI*2/rays,a1=a0+Math.PI/rays*.55;
  g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a0)*W,cy+Math.sin(a0)*W);g.lineTo(cx+Math.cos(a1)*W,cy+Math.sin(a1)*W);g.closePath();g.fill();
 }
 g.globalAlpha=a;
 // twinkles scattered over the burst
 for(let i=0;i<18;i++){
  const sx=Math.round((i*97+31)%W),sy=Math.round((i*53+17)%(H-40)+6),tw=(Math.sin(t*4+i*1.7)+1)/2;
  if(tw<.35)continue;
  const big=tw>.8;
  r(g,sx,sy-(big?3:1),1,big?7:3,"#ffffff");r(g,sx-(big?3:1),sy,big?7:3,1,"#ffffff");
 }
 // the phone: zooms in with a little overshoot, then floats
 const k=Math.max(0,Math.min(1,(lt-.12)/.5)),c1=1.7,c3=c1+1;
 const zoom=k>=1?1:1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2);
 const pw=Math.round(170*Math.max(.05,zoom)),bob=Math.round(Math.sin(t*2.4)*3);
 g.globalAlpha=a*.5;rrect(g,cx-pw/2-10,cy+bob-pw*.38-10,pw+20,pw*.76+20,18,"#ffffff");g.globalAlpha=a;
 drawDuo(g,cx,cy+bob,pw);
 drawSparkles(g,cx+pw*.46,cy+bob-pw*.32,t,10);
 // the name
 const tk=Math.max(0,Math.min(1,(lt-.55)/.35)),ty=Math.round(H-44+(1-tk)*30);
 if(tk>0){
  g.globalAlpha=a*tk;
  for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2],[0,3]])text("IPHONE DUO!",cx+dx,ty+dy,16,"#4a1f5a","center");
  text("IPHONE DUO!",cx,ty,16,"#ffe066","center");
  text("a phone that unfolds into a little tablet",cx+1,ty+24,6,"#4a1f5a","center");
  text("a phone that unfolds into a little tablet",cx,ty+23,6,"#ffffff","center");
 }
 g.restore();
}
