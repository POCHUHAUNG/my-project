process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long!!';

const { signToken, verifyToken, requireAuth } = require('../auth');

test('signToken returns a JWT string', () => {
  const token = signToken({ memberId: 'abc', email: 'x@y.com' });
  expect(typeof token).toBe('string');
  expect(token.split('.')).toHaveLength(3);
});

test('verifyToken round-trips the payload', () => {
  const token = signToken({ memberId: 'abc', email: 'x@y.com' });
  const payload = verifyToken(token);
  expect(payload.memberId).toBe('abc');
  expect(payload.email).toBe('x@y.com');
});

test('verifyToken throws on tampered token', () => {
  expect(() => verifyToken('bad.token.here')).toThrow();
});

test('requireAuth calls next and sets req.member for valid token', () => {
  const token = signToken({ memberId: 'xyz', email: 'a@b.com' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  requireAuth(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(req.member.memberId).toBe('xyz');
});

test('requireAuth returns 401 when no Authorization header', () => {
  const req = { headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  requireAuth(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

test('requireAuth returns 401 for expired token', () => {
  const jwt = require('jsonwebtoken');
  const expired = jwt.sign({ memberId: 'e', email: 'e@e.com' }, 'test-secret-at-least-32-characters-long!!', { expiresIn: -1 });
  const req = { headers: { authorization: `Bearer ${expired}` } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  requireAuth(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});
