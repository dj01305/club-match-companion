process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { createApp } = require('../app');

let app;
let token;
let otherToken;

// Helper to register + login and return a JWT
async function getToken(email, name = 'User') {
  await request(app).post('/auth/register').send({
    name,
    email,
    password: 'password123',
    favoriteClub: 'Arsenal',
  });
  const res = await request(app).post('/auth/login').send({
    email,
    password: 'password123',
  });
  return res.body.token;
}

beforeAll(async () => {
  app = await createApp();
  token = await getToken('notes@example.com', 'Notes User');
  otherToken = await getToken('other@example.com', 'Other User');
});

// Helper to create a note for the authenticated user
async function createNote(authToken, overrides = {}) {
  const res = await request(app)
    .post('/api/notes')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      club: 'Arsenal',
      opponent: 'Chelsea',
      matchDate: '2024-01-15',
      noteTitle: 'Great match',
      ...overrides,
    });
  return res;
}

describe('GET /api/notes', () => {
  test('returns empty array when user has no notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('returns 401 without a token', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/notes', () => {
  test('creates a note with all required fields', async () => {
    const res = await createNote(token);
    expect(res.status).toBe(201);
    expect(res.body.noteTitle).toBe('Great match');
    expect(res.body.club).toBe('Arsenal');
    expect(res.body.id).toBeDefined();
  });

  test('creates a note with optional fields', async () => {
    const res = await createNote(token, {
      competition: 'Premier League',
      noteBody: 'Incredible atmosphere',
      watched: false,
    });
    expect(res.status).toBe(201);
    expect(res.body.competition).toBe('Premier League');
    expect(res.body.noteBody).toBe('Incredible atmosphere');
    expect(res.body.watched).toBe(0);
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ club: 'Arsenal' }); // missing opponent, matchDate, noteTitle
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('returns 401 without a token', async () => {
    const res = await request(app).post('/api/notes').send({
      club: 'Arsenal', opponent: 'Chelsea', matchDate: '2024-01-15', noteTitle: 'Test',
    });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/notes/:id', () => {
  let noteId;

  beforeAll(async () => {
    const res = await createNote(token, { noteTitle: 'Before update' });
    noteId = res.body.id;
  });

  test('updates a note successfully', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ noteTitle: 'After update' });
    expect(res.status).toBe(200);
    expect(res.body.noteTitle).toBe('After update');
  });

  test('returns 404 when note does not belong to the user', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ noteTitle: 'Hacked' });
    expect(res.status).toBe(404);
  });

  test('returns 401 without a token', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ noteTitle: 'No auth' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/notes/:id', () => {
  let noteId;

  beforeAll(async () => {
    const res = await createNote(token, { noteTitle: 'To be deleted' });
    noteId = res.body.id;
  });

  test('deletes a note successfully', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('returns 404 after note is already deleted', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('returns 404 when note belongs to another user', async () => {
    const createRes = await createNote(token, { noteTitle: 'Owned by user 1' });
    const res = await request(app)
      .delete(`/api/notes/${createRes.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
});
