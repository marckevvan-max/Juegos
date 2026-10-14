/* Catálogo compartido de logros y recompensas.
   Se usa en el navegador (script normal) y en el servidor (require). */
(function (root) {
const lvl=u=>Math.floor(u.exp/100)+1;
const ACH=[
{n:'Primer juego',d:'Termina tu primera partida en cualquier juego.',max:1,p:(u,S)=>S.played},
{n:'Jugador constante',d:'Termina 10 partidas.',max:10,p:(u,S)=>S.played},
{n:'Maratonista de la plaza',d:'Termina 25 partidas.',max:25,p:(u,S)=>S.played},
{n:'Alcancía',d:'Gana 100 puntos en total jugando.',max:100,p:(u,S)=>S.earned},
{n:'Tesoro del pueblo',d:'Gana 500 puntos en total jugando.',max:500,p:(u,S)=>S.earned},
{n:'Explorador de juegos',d:'Juega los 7 juegos al menos una vez.',max:7,p:(u,S)=>Object.values(S.per).filter(x=>x.played>0).length},
{n:'Reto aceptado',d:'Termina 3 partidas en dificultad Difícil.',max:3,p:(u,S)=>S.hard},
{n:'Jugador en línea',d:'Termina 3 partidas en modo «Jugar en línea».',max:3,p:(u,S)=>S.online},
{n:'Ganador',d:'Gana 5 partidas en cualquier juego.',max:5,p:(u,S)=>S.wins},
{n:'Gran puntuación',d:'Consigue 30 puntos en una sola partida.',max:30,p:(u,S)=>S.best},
{n:'Subiendo de nivel',d:'Llega al nivel 3.',max:3,p:u=>lvl(u)},
{n:'Doña Lotería',d:'Gana 3 partidas de Lotería completando tu tabla primero.',max:3,p:(u,S)=>(S.per.loteria||{}).wins||0},
{n:'Puntería de oro',d:'Consigue 40 puntos o más en una partida de Canicas.',max:1,p:(u,S)=>Math.min(1,(S.per.canicas||{}).wins||0)},
{n:'Cazador experto',d:'Encuentra a los 4 jugadores en una partida de Escondidas.',max:1,p:(u,S)=>Math.min(1,(S.per.escondidas||{}).wins||0)},
{n:'Ojo de lince',d:'Consigue 12 puntos o más en una partida de Vasos.',max:1,p:(u,S)=>Math.min(1,(S.per.vasos||{}).wins||0)},
{n:'Mano de balero',d:'Atrapa 7 o más pelotas en una partida de Balero.',max:1,p:(u,S)=>Math.min(1,(S.per.balero||{}).wins||0)},
{n:'Rey del trompo',d:'Gana una batalla de trompos (llega a 5 derrotas).',max:1,p:(u,S)=>Math.min(1,(S.per.trompo||{}).wins||0)},
{n:'La última silla',d:'Gana el juego de las sillas quedando de último jugador.',max:1,p:(u,S)=>Math.min(1,(S.per.sillas||{}).wins||0)}];
const REW=[
{id:'st1',cat:'sticker',n:'Bien hecho',e:'👍',d:'Un sticker para presumir tu buen juego.',cost:5,lv:1},
{id:'st2',cat:'sticker',n:'Gallo valiente',e:'🐓',d:'El gallo de la lotería te acompaña.',cost:15,lv:1},
{id:'st3',cat:'sticker',n:'Alebrije',e:'🦄',d:'Un alebrije colorido para tu perfil.',cost:40,lv:2},
{id:'st4',cat:'sticker',n:'Piñata',e:'🪅',d:'¡A romper la piñata!',cost:80,lv:3},
{id:'mc1',cat:'marco',n:'Marco de madera',d:'Un marco sencillo para tu foto de perfil.',cost:30,lv:1,bg:'linear-gradient(135deg,#c89a6a,#8b5e3c)'},
{id:'mc2',cat:'marco',n:'Marco tricolor',d:'Con los colores de la bandera de México.',cost:120,lv:3,bg:'linear-gradient(135deg,#006847 0 33%,#fff 33% 66%,#ce1126 66%)'},
{id:'mc3',cat:'marco',n:'Marco de oro',d:'Brilla como un campeón.',cost:300,lv:4,bg:'linear-gradient(135deg,#fff0a8,#e8b923,#b8860b)'},
{id:'mc4',cat:'marco',n:'Marco de diamante',d:'El marco más difícil de conseguir.',cost:1000,lv:6,bg:'linear-gradient(135deg,#e8fbff,#7fd6ff,#bdeeff)'},
{id:'ti1',cat:'titulo',n:'Tirador maestro',d:'Para quienes nunca fallan un tiro.',cost:20,lv:1},
{id:'ti2',cat:'titulo',n:'Rey de la lotería',d:'Nadie completa su tabla más rápido que tú.',cost:80,lv:2},
{id:'ti3',cat:'titulo',n:'Trompo imbatible',d:'El campeón de la arena.',cost:150,lv:3},
{id:'ti4',cat:'titulo',n:'Leyenda de la plaza',d:'Solo para los jugadores más constantes.',cost:500,lv:5}];
function ensureStats(u){u.stats=u.stats||{played:u.played||0,wins:0,earned:u.pts||0,best:0,hard:0,online:0,per:{}};u.stats.per=u.stats.per||{};u.items=u.items||[];u.equip=u.equip||{};u.logros=u.logros||[];return u.stats}
const prog=(a,u)=>Math.min(a.max,a.p(u,ensureStats(u)));
/* Marca como desbloqueados los logros cumplidos y devuelve los nombres nuevos */
function checkAch(u){const nuevos=[];ACH.forEach(a=>{if(prog(a,u)>=a.max&&!u.logros.includes(a.n)){u.logros.push(a.n);nuevos.push(a.n)}});return nuevos}
const rewById=id=>REW.find(r=>r.id===id);
const GAME_IDS=['loteria','canicas','escondidas','vasos','balero','trompo','sillas'];
const api={lvl,ACH,REW,ensureStats,prog,checkAch,rewById,GAME_IDS};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
