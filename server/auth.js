'use strict';

const jwt = require('jsonwebtoken');

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET environment variable is not set');
  return s;
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { algorithm: 'HS256', expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.member = { memberId: payload.memberId, email: payload.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { signToken, verifyToken, requireAuth };
