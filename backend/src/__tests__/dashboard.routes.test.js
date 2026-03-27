process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { createApp } = require('../app');
const jwt = require('jsonwebtoken');

let app;

beforeAll(async () => {
  app = await createApp();
});

// Helper: register a user and return a valid JWT token for them
async function registerAndGetToken() {
  const res = await request(app).post('/auth/register').send({
    name: 'Dashboard User',
    email: 'dashboard@example.com',
    password: 'password123',
    favoriteClub: 'Arsenal',
  });
  return jwt.sign(
    { id: res.body.userId, email: 'dashboard@example.com' },
    process.env.JWT_SECRET
  );
}

describe('GET /api/dashboard', () => {
  test('returns user profile when authenticated', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('dashboard@example.com');
    expect(res.body.user.favoriteClub).toBe('Arsenal');
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });

  test('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('returns 404 when user does not exist in the database', async () => {
    // Sign a token for a user ID that was never registered
    const token = jwt.sign({ id: 9999, email: 'ghost@example.com' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/user not found/i);
  });
});
