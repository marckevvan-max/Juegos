/* Interfaz de Recompensas: stickers, marcos y títulos que se canjean con puntos */
const M=$('#main');let cat='sticker';
const CATS=[['sticker','Stickers'],['marco','Marcos'],['titulo','Títulos']];
function preview(r){return r.cat==='sticker'?'<div class="pv">'+r.e+'</div>':r.cat==='marco'?'<span class="av" style="background:'+r.bg+'"><img src="/img/usuario.png" alt=""></span>':'<span class="pill">'+r.n+'</span>'}
function render(){const u=U();if(u)ensureStats(u);const pts=u?u.pts:0,nv=u?lvl(u):1;
 M.innerHTML=(u?'':'<div class="aviso">Inicia sesión en <a href="/#cuenta">Cuenta</a> para canjear recompensas con tus puntos.</div>')+
 `<div class="resumen"><b>⭐ ${pts}</b> puntos de juego · Nivel ${nv}<br><small>Juega para ganar puntos y canjéalos aquí.</small></div>
 <div class="tabs">${CATS.map(c=>`<button data-c="${c[0]}"${cat===c[0]?' class="on"':''}>${c[1]}</button>`).join('')}</div>`+
 REW.filter(r=>r.cat===cat).map(r=>{
  const own=u&&u.items.includes(r.id),eqp=u&&u.equip[r.cat]===r.id,okLv=nv>=r.lv,okPts=pts>=r.cost,pct=Math.min(100,Math.round(pts/r.cost*100));
  const falta=own?'':(!okPts?'Te faltan '+(r.cost-pts)+' puntos':'')+(!okPts&&!okLv?' y ':'')+(!okLv?'necesitas llegar al nivel '+r.lv:'');
  const btn=!u?'<button class="btn" disabled>Inicia sesión</button>':own?`<button class="btn ${eqp?'o':''}" data-e="${r.id}">${eqp?'Quitar':'Equipar'}</button>`:`<button class="btn" data-b="${r.id}"${okPts&&okLv?'':' disabled'}>Canjear por ${r.cost} pts</button>`;
  return `<div class="card ${own?'done':'lock'}"><div class="ic">${preview(r)}</div><div class="tx"><h3>${r.n}</h3><p>${r.d}</p>
  <p class="how"><b>Qué hacer:</b> junta ${r.cost} puntos jugando y llega al nivel ${r.lv}.</p>
  ${own?'':`<div class="bar"><i style="width:${pct}%"></i></div><div class="st">${pts} / ${r.cost} puntos${falta?' · '+falta:' · ¡Listo para canjear!'}</div>`}
  <div class="st">${own?(eqp?'✅ Equipado':'✅ Obtenido'):''}</div>${btn}</div></div>`}).join('');
 M.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{cat=b.dataset.c;render()});
 M.querySelectorAll('[data-b]').forEach(b=>b.onclick=async()=>{const r=rewById(b.dataset.b);b.disabled=true;try{setUser(await api('POST','/user/redeem',{id:r.id}));toast('🎁 Obtuviste: '+r.n)}catch(e){toast(e.message)}render()});
 M.querySelectorAll('[data-e]').forEach(b=>b.onclick=async()=>{try{setUser(await api('POST','/user/equip',{id:b.dataset.e}))}catch(e){toast(e.message)}render()})}
READY.then(render);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{location.href=b.dataset.href});
