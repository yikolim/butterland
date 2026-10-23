export type Tool = "Mirror"|"Anesthetic"|"Drill"|"Etch"|"Composite"|"Impression"|"Crown"|"File"|"Irrigate"|"Gutta Percha"|"Forceps"|"Elevator"|"Implant Driver"|"Suture"|"Brackets"|"Archwire";
export type Patient = {id:string;name:string;condition:string;level:number;reward:number;color:string;greeting:string;hint:string;steps:Tool[]};
export type Direction="up"|"down"|"left"|"right";
export type AnimatedHero={x:number;y:number;direction:Direction;moving:boolean};

export const LAB_POS={x:15,y:13};
export const APPOINTMENT_SLOTS=[{x:22,y:11},{x:25,y:11}];
export const patients:Patient[]=[
 {id:"cavity",name:"Maya",condition:"Cavity",level:1,reward:80,color:"#f47772",greeting:"Cold drinks make this tooth zing. Can you help?",hint:"A small lesion on the chewing surface.",steps:["Mirror","Drill","Etch","Composite"]},
 {id:"crown",name:"Ben",condition:"Broken Crown",level:2,reward:130,color:"#efb94f",greeting:"My old crown cracked at lunch. I saved the other half…",hint:"The tooth is stable, but needs full coverage.",steps:["Mirror","Anesthetic","Impression","Crown"]},
 {id:"ortho",name:"Priya",condition:"Crowding",level:2,reward:150,color:"#b88ee9",greeting:"I keep biting my cheek. My teeth are throwing a house party.",hint:"Plan gentle, controlled movement.",steps:["Mirror","Impression","Brackets","Archwire"]},
 {id:"root",name:"Theo",condition:"Root Canal",level:4,reward:260,color:"#55cbd0",greeting:"It kept me awake. The pain has its own heartbeat.",hint:"Deep infection has reached the pulp.",steps:["Anesthetic","Drill","File","Irrigate","Gutta Percha","Crown"]},
 {id:"extract",name:"Rosa",condition:"Extraction",level:4,reward:240,color:"#ff9965",greeting:"This wisdom tooth chose violence. Please evict it, Dr. Claire.",hint:"The impacted tooth cannot be restored.",steps:["Mirror","Anesthetic","Elevator","Forceps","Suture"]},
 {id:"implant",name:"Omar",condition:"Dental Implant",level:5,reward:400,color:"#68cd88",greeting:"I’m ready to replace my missing tooth. I hear you’re the dentist to see.",hint:"A precision restoration for the final challenge.",steps:["Mirror","Anesthetic","Drill","Implant Driver","Suture","Impression","Crown"]}
];
const all:Tool[]=["Mirror","Anesthetic","Drill","Etch","Composite","Impression","Crown","File","Irrigate","Gutta Percha","Forceps","Elevator","Implant Driver","Suture","Brackets","Archwire"];
export const tray=(p:Patient)=>[...p.steps,...all.filter(t=>!p.steps.includes(t)).slice(p.level,p.level+3)].sort((a,b)=>a.localeCompare(b));
export const icon:Record<Tool,string>={Mirror:"◉—",Anesthetic:"▱",Drill:"⚙",Etch:"◇",Composite:"▰",Impression:"∩",Crown:"♜",File:"≋",Irrigate:"◒","Gutta Percha":"▲",Forceps:"⋔",Elevator:"⌟","Implant Driver":"⊕",Suture:"〰",Brackets:"▦",Archwire:"⌒"};
export const blocked=(x:number,y:number)=>{const r=(a:number,b:number,c:number,d:number)=>x>=a&&x<=c&&y>=b&&y<=d;return x<1||y<1||x>28||y>16||r(2,2,8,4)||r(11,2,17,3)||r(3,13,9,16)||r(20,13,27,16)||r(12,14,17,16)||(x===18&&y>=2&&y<=6)||(x===LAB_POS.x&&y===LAB_POS.y)};

type Accessory="none"|"hat"|"apron"|"backpack"|"cane";
type CharacterStyle={shirt:string;skin?:string;hair?:string;claire?:boolean;accessory?:Accessory};
const rect=(c:CanvasRenderingContext2D,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)};

function drawCharacter(c:CanvasRenderingContext2D,gx:number,gy:number,style:CharacterStyle,direction:Direction,frame=1){
 const x=Math.round(gx*16),y=Math.round(gy*16)-5,bob=frame===1?1:0;
 const ink="#222d35",skin=style.skin||"#c98562",hair=style.hair||"#27313a",shirt=style.shirt;
 const side=direction==="left"||direction==="right";
 rect(c,"#12654788",x+2,y+21,13,3);c.save();
 if(direction==="left"){c.translate(x+16,0);c.scale(-1,1);c.translate(-x,0)}
 if(side){
  rect(c,hair,x+3,y+bob,10,11);rect(c,hair,x+1,y+4+bob,6,8);rect(c,skin,x+5,y+4+bob,7,7);rect(c,ink,x+10,y+6+bob,1,2);
  rect(c,ink,x+4,y+11,9,8);rect(c,shirt,x+5,y+11,7,6);const swing=frame===0?-1:frame===2?1:0;rect(c,skin,x+11+swing,y+12,3,5);rect(c,ink,x+11+swing,y+16,3,2);
  if(style.claire){rect(c,"#fffdf0",x+3,y+11,3,7);rect(c,"#fffdf0",x+10,y+11,3,7);rect(c,"#56bde0",x+6,y+11,4,6)}
  const front=frame===0?1:frame===2?-1:0;rect(c,ink,x+4-front,y+18,5,3);rect(c,ink,x+9+front,y+18,5,3);
 }else{
  rect(c,hair,x+3,y+bob,11,11);rect(c,hair,x+1,y+4+bob,4,9);rect(c,hair,x+12,y+4+bob,4,9);rect(c,skin,x+5,y+4+bob,7,7);
  if(direction==="down"){rect(c,ink,x+6,y+6+bob,1,1);rect(c,ink,x+10,y+6+bob,1,1);rect(c,"#773b37",x+8,y+9+bob,2,1)}else{rect(c,hair,x+5,y+3+bob,7,8);rect(c,"#643b35",x+6,y+3+bob,2,2);rect(c,"#643b35",x+10,y+5+bob,2,2)}
  rect(c,ink,x+3,y+11,11,8);rect(c,shirt,x+5,y+11,7,6);const swing=frame===0?1:frame===2?-1:0;rect(c,skin,x+1,y+12+swing,3,4);rect(c,skin,x+13,y+12-swing,3,4);
  if(style.claire){rect(c,"#fffdf0",x+3,y+11,3,7);rect(c,"#fffdf0",x+11,y+11,3,7);rect(c,"#56bde0",x+7,y+11,3,6)}
  const spread=frame===1?0:1;rect(c,ink,x+4-spread,y+18,5,3);rect(c,ink,x+9+spread,y+18,5,3);
 }
 if(style.accessory==="hat"){rect(c,"#222d35",x+1,y-1+bob,14,3);rect(c,"#f4c965",x+2,y-2+bob,12,3);rect(c,"#33845d",x+5,y-3+bob,7,2)}
 if(style.accessory==="apron"){rect(c,"#ff6b6b",x+5,y+12,7,6);rect(c,"#fff3d2",x+6,y+13,5,2)}
 if(style.accessory==="backpack"&&side){rect(c,"#222d35",x+1,y+11,5,8);rect(c,"#805de6",x+1,y+12,4,6)}
 if(style.accessory==="cane"&&side){rect(c,"#6b3e32",x+14,y+14,2,8);rect(c,"#6b3e32",x+12,y+13,4,2)}
 c.restore();
}

function walkFrame(tick:number,moving=true,reducedMotion=false){if(!moving||reducedMotion)return 1;return [0,1,2,1][Math.floor(tick/6)%4]}
function walkingPosition(tick:number,index:number){const span=25,phase=(tick/(7+index%3)+index*11)%(span*2),out=phase<=span;return{x:2+(out?phase:span*2-phase),y:7+(index%4),direction:(out?"right":"left") as Direction}}
const villagers:CharacterStyle[]=[
 {shirt:"#347d52",skin:"#e0a273",hair:"#d8d1bd",accessory:"hat"},
 {shirt:"#fff0cf",skin:"#8f563d",hair:"#563438",accessory:"apron"},
 {shirt:"#f0f3e9",skin:"#d49366",hair:"#4b3536",accessory:"backpack"},
 {shirt:"#dba62e",skin:"#925c45",hair:"#b8b4aa",accessory:"cane"}
];

function drawCat(c:CanvasRenderingContext2D,tick:number,reducedMotion:boolean){
 const phase=reducedMotion?270:tick%720,y=6.25;let x=8,facing:Direction="right",state:"walk"|"sit"|"groom"|"stretch"="walk";
 if(phase<240)x=8+phase/40;else if(phase<330){x=14;state=phase<285?"sit":"groom"}else if(phase<570){x=14-(phase-330)/40;facing="left"}else{x=8;state=phase<645?"sit":"stretch"}
 const px=Math.round(x*16),py=Math.round(y*16),ink="#25375a",white="#fffdf4",shade="#c8dcf4",blue="#1688e8";c.save();if(facing==="left"){c.translate(px+17,0);c.scale(-1,1);c.translate(-px,0)}rect(c,"#12654766",px+1,py+11,17,2);
 if(state==="sit"||state==="groom"){
  rect(c,ink,px+5,py+1,8,11);rect(c,white,px+6,py+2,6,9);rect(c,ink,px+6,py-1,3,4);rect(c,ink,px+10,py-1,3,4);rect(c,white,px+7,py,2,3);rect(c,white,px+10,py,2,3);rect(c,blue,px+8,py+4,1,2);rect(c,blue,px+11,py+4,1,2);rect(c,shade,px+10,py+7,3,3);
  rect(c,ink,px,py+2,7,9);rect(c,white,px+1,py+1,6,9);rect(c,shade,px+1,py+3,3,5);if(state==="groom"&&Math.floor(tick/12)%2)rect(c,white,px+12,py+9,4,2);
 }else{
  const step=walkFrame(tick,true,reducedMotion),leg=step===0?-1:step===2?1:0;rect(c,ink,px+3,py+4,11,7);rect(c,white,px+4,py+5,9,5);rect(c,shade,px+4,py+8,5,2);rect(c,ink,px+11,py+1,5,8);rect(c,white,px+12,py+2,3,6);rect(c,blue,px+14,py+4,1,2);rect(c,ink,px+12,py-1,2,4);rect(c,ink,px+15,py-1,2,4);rect(c,white,px+13,py,1,3);rect(c,white,px+15,py,1,3);
  rect(c,ink,px,py-1,6,9);rect(c,white,px+1,py,5,7);rect(c,shade,px+1,py+3,3,4);if(state==="stretch"){rect(c,white,px+2,py+6,9,4);rect(c,ink,px+10,py+7,7,4)}else{rect(c,ink,px+3-leg,py+9,3,3);rect(c,ink,px+10+leg,py+9,3,3)}
 }
 c.restore();
}

function drawCar(c:CanvasRenderingContext2D,tick:number,reducedMotion:boolean){
 const x=reducedMotion?430:Math.round((tick*.72)%560)-42,y=275,bounce=reducedMotion?0:Math.floor(tick/8)%2,ink="#222d35",green="#087b48",light="#10bd69",glass="#27374b";
 rect(c,"#1c5f4655",x+2,y+8,31,4);rect(c,ink,x,y+2-bounce,34,10);rect(c,green,x+1,y+3-bounce,32,8);rect(c,ink,x+7,y-3-bounce,18,7);rect(c,glass,x+9,y-2-bounce,14,5);rect(c,"#698092",x+17,y-1-bounce,1,3);rect(c,light,x+3,y+4-bounce,19,3);rect(c,"#dff9d1",x+29,y+4-bounce,4,2);rect(c,"#ff5d67",x+1,y+4-bounce,2,2);
 const wheel=Math.floor(tick/4)%2;for(const wx of [7,27]){rect(c,ink,x+wx-3,y+8,6,6);rect(c,"#80909b",x+wx-1,y+9+wheel,2,3-wheel);rect(c,"#d1dbd8",x+wx,y+10-wheel,1,1+wheel)}
}

export function drawWorld(c:CanvasRenderingContext2D,tick:number,hero:AnimatedHero,done:string[],today:Patient[],reducedMotion=false){
 c.imageSmoothingEnabled=false;c.fillStyle="#07e66e";c.fillRect(0,0,480,288);
 for(let y=0;y<18;y++)for(let x=0;x<30;x++){const path=(y>=7&&y<=10)||(x>=18&&x<=21);if(path){c.fillStyle="#fff7c9";c.fillRect(x*16,y*16,16,16);c.fillStyle="#d6ddb1";c.fillRect(x*16,y*16,1,16);c.fillRect(x*16,y*16,16,1)}else if((x*7+y*11)%13===0){c.fillStyle="#02b95c";c.fillRect(x*16+5,y*16+8,2,5);c.fillRect(x*16+2,y*16+9,3,2);c.fillRect(x*16+7,y*16+9,3,2)}}
 rect(c,"#b9ddc2",0,271,480,17);rect(c,"#eef6ce",0,272,480,2);for(let x=6;x<480;x+=32)rect(c,"#fff8ca",x,282,20,2);
 c.fillStyle="#fffbd9";for(let x=2;x<28;x+=3)c.fillRect(x*16,142,19,3);c.fillStyle="#c7d3a0";for(let y=1;y<17;y+=3)c.fillRect(311,y*16,3,19);
 const building=(x:number,y:number,w:number,h:number,roof:string,label:string)=>{c.fillStyle="#253039";c.fillRect(x*16-3,y*16-3,w*16+6,h*16+6);c.fillStyle="#fff9c7";c.fillRect(x*16,y*16,w*16,h*16);c.fillStyle="#e6e3ac";for(let row=y+1;row<y+h;row++)c.fillRect(x*16,row*16,w*16,2);c.fillStyle=roof;c.fillRect(x*16-2,y*16-4,w*16+4,13);c.fillStyle="#5847c9";c.fillRect(x*16-2,y*16-4,w*16+4,3);c.fillStyle="#fffef0";c.fillRect((x+1)*16,y*16+8,(w-2)*16,12);c.strokeStyle="#2a2c37";c.lineWidth=2;c.strokeRect((x+1)*16,y*16+8,(w-2)*16,12);c.fillStyle="#6554db";c.font="bold 7px monospace";c.textAlign="center";c.fillText(label,(x+w/2)*16,y*16+17);c.fillStyle="#b8def2";for(let i=1;i<w-1;i+=2){c.fillRect((x+i)*16,(y+1.55)*16,10,8);c.fillStyle="#28424b";c.fillRect((x+i)*16+4,(y+1.55)*16,2,8);c.fillStyle="#b8def2"}c.fillStyle="#7252cc";c.fillRect((x+w/2)*16-7,(y+h)*16-20,14,20)};
 building(2,2,7,3,"#7657e7","BYTE CAFE");building(11,2,7,2,"#8b6cf4","APOTHECARY");building(3,13,7,4,"#7657e7","MOLAR MART");building(12,14,6,3,"#8b6cf4","LAB");building(20,13,8,4,"#7657e7","DENTIST");
 const tree=(x:number,y:number)=>{c.fillStyle="#2b353d";c.fillRect(x*16+5,y*16+8,7,9);c.fillStyle="#9a573f";c.fillRect(x*16+7,y*16+9,4,7);c.fillStyle="#263840";c.fillRect(x*16,y*16+2,16,11);c.fillRect(x*16+3,y*16-2,11,16);c.fillStyle="#10ad60";c.fillRect(x*16+2,y*16+2,12,8);c.fillRect(x*16+5,y*16,7,12);c.fillStyle="#50f08d";c.fillRect(x*16+3,y*16+2,3,3)};tree(1,12);tree(28,2);tree(11,13);tree(28,11);tree(9,5);
 const flower=(x:number,y:number,color:string)=>{c.fillStyle="#087746";c.fillRect(x*16+7,y*16+6,2,9);c.fillStyle=color;c.fillRect(x*16+4,y*16+3,4,4);c.fillRect(x*16+9,y*16+3,4,4);c.fillRect(x*16+7,y*16+1,3,4);c.fillStyle="#fff6b5";c.fillRect(x*16+7,y*16+4,3,3)};flower(2,6,"#ff4467");flower(6,6,"#fffdf0");flower(17,12,"#ff4467");flower(27,12,"#fffdf0");flower(10,11,"#ff4467");
 c.fillStyle="#7f3f50";for(let x=20;x<29;x++){c.fillRect(x*16,12*16+10,3,13);c.fillRect(x*16+8,12*16+10,3,13);c.fillRect(x*16,12*16+15,12,3)}
 drawCharacter(c,LAB_POS.x,LAB_POS.y,{shirt:"#5f7dc9"},"down",walkFrame(tick+10,true,reducedMotion));rect(c,"#fff0c5",LAB_POS.x*16+11,LAB_POS.y*16-8,7,7);rect(c,"#355884",LAB_POS.x*16+13,LAB_POS.y*16-7,3,1);
 today.forEach((p,i)=>drawCharacter(c,APPOINTMENT_SLOTS[i].x,APPOINTMENT_SLOTS[i].y,{shirt:p.color},"down",walkFrame(tick+i*11,true,reducedMotion)));
 villagers.forEach((style,i)=>{const walk=walkingPosition(reducedMotion?0:tick,i);drawCharacter(c,walk.x,walk.y,style,walk.direction,walkFrame(tick+i*7,true,reducedMotion))});
 patients.filter(p=>done.includes(p.id)).forEach((p,i)=>{const walk=walkingPosition(reducedMotion?0:tick,i+villagers.length);drawCharacter(c,walk.x,walk.y,{shirt:p.color,skin:i%2?"#8f5b46":"#d39a70",hair:i%3?"#41343b":"#744434"},walk.direction,walkFrame(tick+i*13,true,reducedMotion))});
 drawCat(c,tick,reducedMotion);drawCharacter(c,hero.x,hero.y,{shirt:"#fff",skin:"#efb08c",hair:"#3b2930",claire:true},hero.direction,walkFrame(tick,hero.moving,reducedMotion));drawCar(c,tick,reducedMotion);
}
