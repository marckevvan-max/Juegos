/* Código compartido: menú y todas las páginas de juegos.
   Los datos del usuario viven en MongoDB; aquí solo se guarda una copia en memoria (CUR). */
const $=s=>document.querySelector(s);
let ONLINE=false;const GAME_ID=location.pathname.split('/').pop().replace('.html','');
let DIF=1; /* 0=Fácil 1=Media 2=Difícil */

/* ---------- Cliente de la API ---------- */
async function api(method,path,body){
 const r=await fetch('/api'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});
 let d={};try{d=await r.json()}catch(e){}
 if(!r.ok)throw new Error(d.error||'Error del servidor ('+r.status+')');
 return d}
let CUR=null;                       /* usuario con sesión iniciada (o null) */
const U=()=>CUR;
const setUser=r=>{CUR=r&&r.user||null;return r};
/* Las páginas esperan a READY antes de pintar datos del usuario */
const READY=api('GET','/auth/me').then(setUser).catch(()=>{CUR=null});
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
const avatarHTML=u=>{const f=u&&u.equip&&rewById(u.equip.marco);return '<span class="av" style="background:'+(f?f.bg:'#3f62c9')+'"><img src="/img/usuario.png" alt=""></span>'};
/* Suma puntos en el servidor y avisa de los logros nuevos */
async function award(p,meta){if(!U()){toast('Inicia sesión en Cuenta para guardar tus puntos');return}
 meta=meta||{};
 try{const r=setUser(await api('POST','/user/award',{points:p,game:meta.game,win:!!meta.win,dif:meta.dif,online:!!meta.online}));
  (r.unlocked||[]).forEach(n=>toast('🏅 Logro: '+n))}
 catch(e){toast('No se pudieron guardar tus puntos: '+e.message)}}

let tm=[],raf=0;
const later=(f,ms)=>{const i=setInterval(f,ms);tm.push(i);return i};
function clear(){tm.forEach(clearInterval);tm=[];cancelAnimationFrame(raf)}
const HUD=(st,html)=>{let h=st.querySelector('.hud');if(!h){h=document.createElement('div');h.className='hud';h.style.cssText='position:absolute;top:6px;left:8px;right:8px;display:flex;justify-content:space-between;font-weight:bold;z-index:2;pointer-events:none';st.appendChild(h)}h.innerHTML=html};
function finish(st,s,msg,win){clear();s=Math.round(Math.max(0,s)*[1,1.5,2][DIF]);st.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center';
 st.innerHTML=`<div style="font-size:3rem">${s>0?'🎉':'💪'}</div><b>${msg||''}</b><div>Puntos: ${s} · ${['Fácil','Media','Difícil'][DIF]}</div><button class="btn" onclick="location.reload()">Jugar otra vez</button>`;award(s,{game:GAME_ID,online:ONLINE,win:!!win,dif:DIF})}
function initGame(fn){
 const run=on=>{DIF=+$('#dif').value;$('#dif').disabled=true;const st=$('#st');st.style.cssText='';st.innerHTML='';$('#play').disabled=$('#online').disabled=true;ONLINE=!!on;fn(st,(s,m,w)=>finish(st,s,m,w),on)};
 $('#play').onclick=()=>run(false);
 $('#online').onclick=()=>fn.online?run(true):toast('Modo en línea próximamente');
 READY.then(()=>{if(!U())$('#aviso').hidden=false})}
