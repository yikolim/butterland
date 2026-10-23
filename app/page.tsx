"use client";
/* eslint-disable jsx-a11y/media-has-caption -- looped background music has no spoken content */

import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import Image from "next/image";
import HouseInterior from "./house/HouseInterior";

type Direction="up"|"down"|"left"|"right";
type Player={x:number;y:number;direction:Direction;frame:number;moving:boolean};

const START:Player={x:49.5,y:67,direction:"down",frame:1,moving:false};
const frameOrder=[0,1,2,1];
const directionRow:Record<Direction,number>={down:0,left:1,right:2,up:3};

// Footsteps are synthesised so the scene needs no extra audio asset.
const STEP_FRAME=.09,STEP_GAIN=.6;

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

export default function Home(){
 const keys=useRef(new Set<string>()),touchDirection=useRef<Direction|null>(null),last=useRef(0),stepClock=useRef(0),audio=useRef<HTMLAudioElement>(null);
 const sfx=useRef<AudioContext|null>(null),scuff=useRef<AudioBuffer|null>(null),lastStep=useRef(-1);
 const [player,setPlayer]=useState<Player>(START),[showHelp,setShowHelp]=useState(true),[musicOn,setMusicOn]=useState(false);
 // Entering the front door swaps the outdoor scene for the house interior; the loops below idle while inside.
 const [scene,setScene]=useState<"outside"|"inside">("outside"),sceneRef=useRef<"outside"|"inside">("outside"),insideInteract=useRef<(()=>void)|null>(null);
 const nearDoor=useMemo(()=>Math.hypot(player.x-46,player.y-61)<5,[player.x,player.y]);

 // Browsers only allow audio after a gesture, so the context is built on first input.
 const ensureAudio=useCallback(()=>{
  if(!sfx.current){
   const Ctor=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
   if(!Ctor)return null;
   sfx.current=new Ctor();
  }
  if(sfx.current.state==="suspended")void sfx.current.resume();
  return sfx.current;
 },[]);

 const playFootstep=useCallback(()=>{
  const context=sfx.current;
  if(!context||context.state!=="running")return;
  if(!scuff.current){
   const frames=Math.floor(context.sampleRate*.05);
   const buffer=context.createBuffer(1,frames,context.sampleRate);
   const samples=buffer.getChannelData(0);
   for(let i=0;i<frames;i++)samples[i]=(Math.random()*2-1)*Math.pow(1-i/frames,3);
   scuff.current=buffer;
  }
  const source=context.createBufferSource();source.buffer=scuff.current;
  // A soft, low thud: band-pass around 260-360 Hz, then a low-pass to take the hiss off.
   const band=context.createBiquadFilter();band.type="bandpass";band.frequency.value=260+Math.random()*100;band.Q.value=.6;
   const soft=context.createBiquadFilter();soft.type="lowpass";soft.frequency.value=900;
  const level=context.createGain();level.gain.value=STEP_GAIN*(.8+Math.random()*.4);
  source.connect(band).connect(soft).connect(level).connect(context.destination);
  source.start();source.stop(context.currentTime+.06);
 },[]);

 const enterHouse=useCallback(()=>{
  setShowHelp(false);keys.current.clear();touchDirection.current=null;
  // Park Claire on the doorstep so she is standing there when she comes back out.
  setPlayer(current=>({...current,x:46,y:63.5,direction:"down",frame:1,moving:false}));
  sceneRef.current="inside";setScene("inside");
 },[]);
 const exitHouse=useCallback(()=>{
  keys.current.clear();touchDirection.current=null;
  setPlayer(current=>({...current,direction:"down",frame:1,moving:false}));
  sceneRef.current="outside";setScene("outside");
 },[]);
 const interact=useCallback(()=>{
  if(sceneRef.current==="inside"){insideInteract.current?.();return}
  if(nearDoor)enterHouse();else setShowHelp(v=>!v);
 },[nearDoor,enterHouse]);
 const setTouch=(direction:Direction|null)=>{if(direction)ensureAudio();touchDirection.current=direction};
 const toggleMusic=()=>{ensureAudio();const track=audio.current;if(!track)return;if(track.paused){track.volume=.28;void track.play().catch(()=>setMusicOn(false))}else track.pause()};
 const startWalking=()=>{setShowHelp(false);ensureAudio();const track=audio.current;if(track?.paused){track.volume=.28;void track.play().catch(()=>setMusicOn(false))}};

 useEffect(()=>{
  const down=(event:KeyboardEvent)=>{
   const key=event.key.toLowerCase();
   if(["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," ","enter"].includes(key))event.preventDefault();
   if(key===" "||key==="enter"){ensureAudio();interact();return}
   ensureAudio();keys.current.add(key);
  };
  const up=(event:KeyboardEvent)=>keys.current.delete(event.key.toLowerCase());
  const blur=()=>keys.current.clear();
  window.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",blur);
  return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);window.removeEventListener("blur",blur)};
 },[interact,ensureAudio]);

 useEffect(()=>{
  let animation=0;
  const move=(now:number)=>{
   const dt=Math.min(.04,(now-(last.current||now))/1000);last.current=now;
   if(sceneRef.current!=="outside"){animation=requestAnimationFrame(move);return}
   const pressed=keys.current,held=touchDirection.current;
   let dx=(pressed.has("arrowright")||pressed.has("d")||held==="right"?1:0)-(pressed.has("arrowleft")||pressed.has("a")||held==="left"?1:0);
   let dy=(pressed.has("arrowdown")||pressed.has("s")||held==="down"?1:0)-(pressed.has("arrowup")||pressed.has("w")||held==="up"?1:0);
   if(dx||dy){
    const length=Math.hypot(dx,dy);dx/=length;dy/=length;stepClock.current+=dt;
    // frameOrder is a contact-pass-contact-pass cycle, so even indexes are foot-down.
    const step=Math.floor(stepClock.current/STEP_FRAME)%frameOrder.length;
    if(step!==lastStep.current){lastStep.current=step;if(step%2===0)playFootstep()}
    setPlayer(current=>{
     const direction:Direction=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
     let nx=current.x+dx*12.75*dt,ny=current.y+dy*22.5*dt;
     if(!canMove(current.x,current.y,nx,current.y))nx=current.x;if(!canMove(nx,current.y,nx,ny))ny=current.y;
     return{x:nx,y:ny,direction,frame:frameOrder[step],moving:true};
    });
   }else{
    stepClock.current=0;lastStep.current=-1;
    setPlayer(current=>current.moving?{...current,frame:1,moving:false}:current);
   }
   animation=requestAnimationFrame(move);
  };
  animation=requestAnimationFrame(move);return()=>cancelAnimationFrame(animation);
 },[playFootstep]);

 const spriteStyle={
  left:`${player.x}%`,top:`${player.y}%`,
  backgroundPosition:`${player.frame*50}% ${directionRow[player.direction]*(100/3)}%`
 };

 return <main className="game-shell">
  <audio ref={audio} src="/bgm.mp3" loop preload="metadata" onPlay={()=>setMusicOn(true)} onPause={()=>setMusicOn(false)}/>
  <div className="game-topbar">
   <div className="game-title"><span className="tooth-mark">♥</span><span><b>BUTTERLAND</b><small>CLAIRE AND HER FOUR CATS</small></span></div>
   <div className="location"><i/> FRONT YARD</div>
   <div className="top-actions"><button className={`music-button ${musicOn?"playing":""}`} onClick={toggleMusic} aria-label={musicOn?"Pause background music":"Play background music"}>{musicOn?"♫":"♪"}</button><button className="help-button" onClick={()=>setShowHelp(v=>!v)} aria-label="Show controls">?</button></div>
  </div>

  <section className="world-frame" aria-label={scene==="inside"?"Inside Claire's home":"Claire's front yard"}>
   {scene==="outside"&&<>
   <Image className="world-art" src="/pearl-district-playable-bg-v2.png" alt="Pixel-art dental clinic with a purple roof, green lawn, trees, flowers, fence, car, sidewalk and street" fill priority sizes="100vw" draggable={false}/>
   <div className={`claire-sprite ${player.moving?"walking":""}`} style={spriteStyle} role="img" aria-label={`Claire facing ${player.direction}`}/>

   <div className={`interaction-hint ${nearDoor?"visible":""}`}>
    <kbd>SPACE</kbd><span>GO INSIDE</span>
   </div>
   </>}

   {scene==="inside"&&<HouseInterior keys={keys} touchDirection={touchDirection} interactRef={insideInteract} playFootstep={playFootstep} onExit={exitHouse}/>}

   {scene==="outside"&&showHelp&&<div className="welcome-card">
    <button onClick={()=>setShowHelp(false)} aria-label="Close instructions">×</button>
    <p>FRONT YARD</p>
    <h1>Welcome home</h1>
    <span>Claire&apos;s four cats are waiting inside. Walk up the path to the front door.</span>
    <div><kbd>WASD</kbd><kbd>ARROWS</kbd><b>TO MOVE</b></div>
    <button className="start-button" onClick={startWalking}>START WALKING <b>›</b></button>
   </div>}

   <div className="dpad" aria-label="Movement controls">
    <button onPointerDown={()=>setTouch("up")} onPointerUp={()=>setTouch(null)} onPointerCancel={()=>setTouch(null)} aria-label="Walk up">▲</button>
    <button onPointerDown={()=>setTouch("left")} onPointerUp={()=>setTouch(null)} onPointerCancel={()=>setTouch(null)} aria-label="Walk left">◀</button>
    <button className="dpad-center" onClick={interact} aria-label="Interact">A</button>
    <button onPointerDown={()=>setTouch("right")} onPointerUp={()=>setTouch(null)} onPointerCancel={()=>setTouch(null)} aria-label="Walk right">▶</button>
    <button onPointerDown={()=>setTouch("down")} onPointerUp={()=>setTouch(null)} onPointerCancel={()=>setTouch(null)} aria-label="Walk down">▼</button>
   </div>
  </section>

  <footer><span><kbd>WASD</kbd> OR <kbd>ARROWS</kbd> WALK</span><span><kbd>SPACE</kbd> INTERACT</span><em>Find the front door</em></footer>

  <div className="rotate-hint" role="note">
   <i aria-hidden="true"/>
   <b>TURN YOUR PHONE</b>
   <span>Butterland plays sideways.</span>
  </div>
 </main>;
}
