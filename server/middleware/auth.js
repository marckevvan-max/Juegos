const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE = 'jgd_token';
const isProd = process.env.NODE_ENV === 'production';

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('Falta la variable JWT_SECRET.');
  return process.env.JWT_SECRET;
}

function setSession(res, user) {
  const token = jwt.sign({ id: user._id.toString() }, secret(), { expiresIn: '30d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearSession(res) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: isProd });
}

async function loadUser(req) {
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, secret());
    return await User.findById(id);
  } catch (e) {
    return null;
  }
}

/** Exige sesión iniciada. */
async function requireAuth(req, res, next) {
  const user = await loadUser(req);
  if (!user) return res.status(401).json({ error: 'Inicia sesión primero.' });
  req.user = user;
  next();
}

module.exports = { setSession, clearSession, loadUser, requireAuth };
