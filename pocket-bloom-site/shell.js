(function(){
  const view=document.getElementById("experience"),sound=document.getElementById("sound");let open=false,powered=false,muted=false,audio;
  const cartridge=window.createPocketBloomCartridge({topScreen:document.getElementById("game-top"),touchScreen:document.getElementById("game-touch"),onInteraction:()=>beep(600)});
  function beep(f=420){if(muted)return;const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;audio||=new Context();const o=audio.createOscillator(),g=audio.createGain();o.type="square";o.frequency.value=f;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.08);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.08)}
  function power(value){powered=value;cartridge.power(value);beep(value?660:240)}
  function openConsole(){if(open)return;open=true;view.className="experience is-open";beep(360);setTimeout(()=>power(true),850)}
  function closeConsole(){power(false);setTimeout(()=>{open=false;view.className="experience is-closed"},120)}
  function input(name){cartridge.input(name);beep(name==="a"?620:name==="b"?280:420)}
  document.querySelectorAll(".open-trigger").forEach(b=>b.onclick=openConsole);
  document.querySelectorAll("[data-input]").forEach(b=>b.onclick=()=>input(b.dataset.input));
  document.getElementById("close").onclick=closeConsole;document.getElementById("power").onclick=()=>power(!powered);
  sound.onclick=()=>{muted=!muted;sound.querySelector("span").textContent=muted?"SOUND OFF":"SOUND ON";sound.querySelector("i").textContent=muted?"×":"♪"};
  const keys={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",Enter:"a",a:"a",b:"b",x:"x",y:"y"};
  addEventListener("keydown",e=>{if(e.key==="Escape"&&open)return closeConsole();if(!open||!keys[e.key])return;e.preventDefault();input(keys[e.key])});
})();
