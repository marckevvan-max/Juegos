const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { setSession, clearSession, loadUser } = require('../middleware/auth');

const router = express.Router();

// Frena los intentos de adivinar contraseñas
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos.' },
});

const USER_RE = /^[\p{L}\p{N}_.-]{3,20}$/u;
const collation = { locale: 'es', strength: 2 };

router.post('/register', limiter, async (req, res) => {
  const username = String((req.body && req.body.username) || '').trim();
  const password = String((req.body && req.body.password) || '');
  if (!USER_RE.test(username)) {
    return res.status(400).json({ error: 'Usuario de 3 a 20 caracteres (letras, números, _ . -).' });
  }
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: 'Usuario de 3+ letras y contraseña de 6+.' });
  }
  if (await User.findOne({ username }).collation(collation)) {
    return res.status(409).json({ error: 'Ese usuario ya existe.' });
  }
  try {
    const user = await User.create({ username, passwordHash: await bcrypt.hash(password, 10) });
    setSession(res, user);
    res.status(201).json({ user: user.toPublic() });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Ese usuario ya existe.' });
    throw e;
  }
});

router.post('/login', limiter, async (req, res) => {
  const username = String((req.body && req.body.username) || '').trim();
  const password = String((req.body && req.body.password) || '');
  const user = await User.findOne({ username }).collation(collation);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  setSession(res, user);
  res.json({ user: user.toPublic() });
});

router.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const user = await loadUser(req);
  res.json({ user: user ? user.toPublic() : null });
});

module.exports = router;
