/* Interfaz de Logros: lista, progreso y qué hacer para desbloquear cada uno */
const M=$('#main');let filtro='todos';
function render(){const u=U();if(u)ensureStats(u);
 const L=ACH.map(a=>{const cur=u?prog(a,u):0;return{a:a,cur:cur,done:cur>=a.max}});
 const n=L.filter(x=>x.done).length,pct=Math.round(n/ACH.length*100);
 const vis=L.filter(x=>filtro==='todos'||(filtro==='hechos'?x.done:!x.done));
 M.innerHTML=(u?'':'<div class="aviso">Inicia sesión en <a href="/#cuenta">Cuenta</a> para guardar tu progreso y desbloquear logros.</div>')+
 `<div class="resumen"><b>${n} de ${ACH.length}</b> logros desbloqueados<div class="bar" style="margin-top:6px"><i style="width:${pct}%"></i></div></div>
 <div class="tabs">${[['todos','Todos'],['pend','En progreso'],['hechos','Desbloqueados']].map(t=>`<button data-f="${t[0]}"${filtro===t[0]?' class="on"':''}>${t[1]}</button>`).join('')}</div>`+
 (vis.length?vis.map(x=>`<div class="card ${x.done?'done':'lock'}"><div class="ic"><img src="/img/logros.png" alt=""></div><div class="tx"><h3>${x.a.n}</h3>
  <p class="how"><b>Qué hacer:</b> ${x.a.d}</p>
  <div class="bar"><i style="width:${Math.round(x.cur/x.a.max*100)}%"></i></div>
  <div class="st">${x.done?'✅ Desbloqueado':'🔒 Progreso: '+x.cur+' / '+x.a.max}</div></div></div>`).join(''):'<p>No hay logros en esta lista todavía.</p>');
 M.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filtro=b.dataset.f;render()})}
READY.then(render);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{location.href=b.dataset.href});
