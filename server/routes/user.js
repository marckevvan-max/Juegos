const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const C = require('../../public/js/catalog.js'); // mismo catálogo que usa el navegador

const router = express.Router();
router.use(requireAuth);

const MAX_POINTS = 250; // tope por partida (el máximo real es 200 en Canicas Difícil)

/** Guarda en Mongo solo los campos del juego. */
const persist = (u, f) =>
  User.updateOne({ _id: u._id }, { $set: f });

/** Termina una partida: suma puntos, estadísticas y revisa logros. */
router.post('/award', async (req, res) => {
  const b = req.body || {};
  const p = Math.round(Number(b.points));
  if (!Number.isFinite(p) || p < 0 || p > MAX_POINTS) return res.status(400).json({ error: 'Puntos inválidos.' });
  if (!C.GAME_IDS.includes(b.game)) return res.status(400).json({ error: 'Juego inválido.' });

  const doc = req.user;
  const u = { exp: doc.exp, pts: doc.pts, played: doc.played, logros: [...doc.logros], items: [...doc.items], equip: { ...(doc.equip || {}) }, stats: JSON.parse(JSON.stringify(doc.stats || null)) };
  const S = C.ensureStats(u);

  u.pts += p;
  u.exp += p * 3;
  u.played += 1;
  S.played++;
  S.earned += p;
  S.best = Math.max(S.best, p);
  if (b.win) S.wins++;
  if (Number(b.dif) === 2) S.hard++;
  if (b.online) S.online++;
  const g = (S.per[b.game] = S.per[b.game] || { played: 0, wins: 0 });
  g.played++;
  if (b.win) g.wins++;

  const unlocked = C.checkAch(u);
  await persist(doc, { exp: u.exp, pts: u.pts, played: u.played, logros: u.logros, stats: u.stats });
  const fresh = await User.findById(doc._id);
  res.json({ user: fresh.toPublic(), unlocked });
});

/** Canjea una recompensa (valida costo y nivel en el servidor). */
router.post('/redeem', async (req, res) => {
  const r = C.rewById(String((req.body && req.body.id) || ''));
  if (!r) return res.status(400).json({ error: 'Recompensa inexistente.' });
  const doc = req.user;
  if (doc.items.includes(r.id)) return res.status(409).json({ error: 'Ya tienes esta recompensa.' });
  if (C.lvl(doc) < r.lv) return res.status(403).json({ error: 'Necesitas llegar al nivel ' + r.lv + '.' });
  // Condición en la consulta: evita gastar dos veces los mismos puntos
  const done = await User.updateOne(
    { _id: doc._id, pts: { $gte: r.cost }, items: { $ne: r.id } },
    { $inc: { pts: -r.cost }, $push: { items: r.id } }
  );
  if (!done.modifiedCount) return res.status(403).json({ error: 'No tienes puntos suficientes.' });
  const fresh = await User.findById(doc._id);
  res.json({ user: fresh.toPublic() });
});

/** Equipa o quita (si ya estaba equipada) una recompensa obtenida. */
router.post('/equip', async (req, res) => {
  const r = C.rewById(String((req.body && req.body.id) || ''));
  const doc = req.user;
  if (!r || !doc.items.includes(r.id)) return res.status(403).json({ error: 'Aún no tienes esa recompensa.' });
  const equip = { ...(doc.equip || {}) };
  if (equip[r.cat] === r.id) delete equip[r.cat];
  else equip[r.cat] = r.id;
  await persist(doc, { equip });
  const fresh = await User.findById(doc._id);
  res.json({ user: fresh.toPublic() });
});

/** Reinicia puntos, logros y recompensas. */
router.post('/reset', async (req, res) => {
  await persist(req.user, {
    exp: 0, pts: 0, played: 0, logros: [], items: [], equip: {},
    stats: { played: 0, wins: 0, earned: 0, best: 0, hard: 0, online: 0, per: {} },
  });
  const fresh = await User.findById(req.user._id);
  res.json({ user: fresh.toPublic() });
});

module.exports = router;
