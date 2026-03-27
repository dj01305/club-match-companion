process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth.middleware');

const SECRET = 'test-secret';

// Helper: builds a fake req, res, and next so we can call the middleware
// directly without needing a real HTTP server running
function makeReqResNext(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status(code) { this._status = code; return this; },
    json(body)   { this._body = body;   return this; },
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authenticateToken middleware', () => {
  test('returns 401 when no Authorization header is provided', () => {
    const { req, res, next } = makeReqResNext(undefined);
    authenticateToken(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error).toMatch(/no token/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token is invalid', () => {
    const { req, res, next } = makeReqResNext('Bearer this.is.garbage');
    authenticateToken(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error).toMatch(/invalid or expired/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token is expired', () => {
    const expired = jwt.sign({ id: 1, email: 'a@b.com' }, SECRET, { expiresIn: -1 });
    const { req, res, next } = makeReqResNext(`Bearer ${expired}`);
    authenticateToken(req, res, next);
    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() and attaches user to req when token is valid', () => {
    const token = jwt.sign({ id: 42, email: 'user@test.com' }, SECRET);
    const { req, res, next } = makeReqResNext(`Bearer ${token}`);
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 42, email: 'user@test.com' });
  });
});
