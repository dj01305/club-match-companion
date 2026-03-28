process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { createApp } = require('../app');

let app;

beforeAll(async () => {
  app = await createApp();
});

describe('POST /auth/register', () => {
  test('registers a new user successfully', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      favoriteClub: 'Arsenal',
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registration successful/i);
    expect(res.body.userId).toBeDefined();
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'missing@example.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('returns 409 when email is already registered', async () => {
    const user = {
      name: 'Duplicate',
      email: 'dupe@example.com',
      password: 'pass',
      favoriteClub: 'Chelsea',
    };
    await request(app).post('/auth/register').send(user);
    const res = await request(app).post('/auth/register').send(user);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });
});

describe('POST /auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'correctpassword',
      favoriteClub: 'Liverpool',
    });
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'login@example.com',
      password: 'correctpassword',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@example.com');
  });

  test('returns 401 with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  test('returns 401 with unknown email', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'nobody@example.com',
      password: 'whatever',
    });
    expect(res.status).toBe(401);
  });

  test('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

describe('DELETE /auth/user', () => {
  let token;

  beforeAll(async () => {
    await request(app).post('/auth/register').send({
      name: 'Delete Me',
      email: 'deleteme@example.com',
      password: 'password123',
      favoriteClub: 'Fulham',
    });

    const res = await request(app).post('/auth/login').send({
      email: 'deleteme@example.com',
      password: 'password123',
    });
    token = res.body.token;
  });

  test('deletes the authenticated user successfully', async () => {
    const res = await request(app)
      .delete('/auth/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).delete('/auth/user');
    expect(res.status).toBe(401);
  });

  test('returns 404 when user no longer exists', async () => {
    // token is still valid but the user was already deleted above
    const res = await request(app)
      .delete('/auth/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
