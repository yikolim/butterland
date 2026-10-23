/*
 * SWAPPABLE GAME CHANNEL
 * The shell only relies on mount(), input(name), and power(on).
 * Replace this file later to install your own game without rebuilding the console.
 */
(function(){
  const blooms=["✿","♥","✦"],names=["DAISY","TULIP","COSMO"];
  window.createPocketBloomCartridge=function({topScreen,touchScreen,onInteraction}){
    let powered=false,selected=3,seed=0,day=7;
    let plots=[{growth:3,flower:0},{growth:2,flower:1},{growth:1,flower:2},{growth:0,flower:0}];
    const plant=p=>`<span class="plant g${p.growth}"><i class="stem"></i><i class="leaf l1"></i><i class="leaf l2"></i>${p.growth>=3?`<b>${blooms[p.flower]}</b>`:""}</span>`;
    function render(){
      if(!powered){topScreen.innerHTML='<div class="screen-off">POCKET<br><b>BLOOM</b></div>';touchScreen.innerHTML='<div class="screen-off">TOUCH TO START</div>';return}
      const complete=plots.filter(p=>p.growth>=3).length,g=plots[selected].growth,msg=g===0?"A tiny seed is ready!":g<3?"A little water, please.":"What a lovely bloom!";
      topScreen.innerHTML=`<div class="garden"><div class="hud"><span>DAY ${String(day).padStart(2,"0")}</span><span>${complete}/4 BLOOMS</span></div><div class="sun"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="hill h1"></div><div class="hill h2"></div><div class="bed">${plots.map((p,i)=>`<div class="plot ${selected===i?"selected":""}">${plant(p)}</div>`).join("")}</div><div class="bubble">${msg}</div></div>`;
      touchScreen.innerHTML=`<div class="touch-ui"><div class="touch-title"><span>GARDEN MAP</span><span class="seed">SEED: ${names[seed]}</span></div><div class="plot-grid">${plots.map((p,i)=>`<button data-plot="${i}" class="${selected===i?"active":""}"><span>0${i+1}</span><i>${p.growth?blooms[p.flower]:"+"}</i><em>${!p.growth?"EMPTY":p.growth>=3?"BLOOM":"GROWING"}</em></button>`).join("")}</div><div class="hint"><b>A</b> water <b>X</b> seed <b>B</b> clear</div></div>`;
      touchScreen.querySelectorAll("[data-plot]").forEach(button=>button.onclick=e=>{e.stopPropagation();activate(Number(button.dataset.plot));onInteraction?.("touch")});
    }
    function activate(index){selected=index;const p=plots[index];plots[index]={growth:Math.min(3,p.growth+1),flower:p.growth===0?seed:p.flower};day++;render()}
    function input(name){if(!powered)return;if(name==="left")selected=(selected+3)%4;if(name==="right")selected=(selected+1)%4;if(name==="up"||name==="down")selected=(selected+2)%4;if(name==="a")activate(selected);if(name==="x")seed=(seed+1)%3;if(name==="b")plots[selected]={...plots[selected],growth:0};render()}
    function power(on){powered=on;render()}
    render();return{input,power,render};
  };
})();
