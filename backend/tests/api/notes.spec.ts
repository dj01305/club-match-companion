import { test, expect } from '../fixtures';
import { request } from '@playwright/test';

// These tests cover the full notes CRUD cycle and access control.
// authenticatedRequest   = logged in as the shared test user (from global-setup)
// unauthenticatedRequest = no token — verifies protected routes reject unauthenticated calls

let createdNoteId: number;

const NOTE_PAYLOAD = {
  club: 'Arsenal',
  opponent: 'Chelsea',
  matchDate: '2025-08-10',
  competition: 'Premier League',
  noteTitle: 'Playwright test note',
  noteBody: 'Created by automated API test',
  watched: true,
};

test.describe('GET /api/notes', () => {
  test('returns notes for the authenticated user', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.get('/api/notes');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('does not return notes belonging to another user', async ({ unauthenticatedRequest }) => {
    // Create a second user and give them a note
    const secondEmail = `isolation-${Date.now()}@test.dev`;
    await unauthenticatedRequest.post('/auth/register', {
      data: {
        name: 'Other User',
        email: secondEmail,
        password: 'Password123!',
        favoriteClub: 'Liverpool',
      },
    });
    const loginResponse = await unauthenticatedRequest.post('/auth/login', {
      data: { email: secondEmail, password: 'Password123!' },
    });
    const { token: secondToken } = await loginResponse.json();

    const secondUserContext = await request.newContext({
      baseURL: 'http://localhost:3000',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secondToken}`,
      },
    });

    // Create a note as the second user
    await secondUserContext.post('/api/notes', {
      data: {
        ...NOTE_PAYLOAD,
        noteTitle: 'Second user private note',
      },
    });

    // Now fetch notes as the second user and confirm only their own notes are returned
    const response = await secondUserContext.get('/api/notes');
    expect(response.status()).toBe(200);
    const body = await response.json();

    // Every note returned must belong to the second user — none should have a different title
    // that was created by the shared test user in other tests
    body.forEach((note: { noteTitle: string }) => {
      expect(note.noteTitle).not.toBe('Playwright test note');
    });

    await secondUserContext.dispose();
  });

  test('rejects unauthenticated request with 401', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.get('/api/notes');

    expect(response.status()).toBe(401);
  });
});

test.describe('POST /api/notes', () => {
  test('creates a note with all valid fields', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.post('/api/notes', { data: NOTE_PAYLOAD });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.noteTitle).toBe(NOTE_PAYLOAD.noteTitle);
    expect(body.club).toBe(NOTE_PAYLOAD.club);
    expect(body.id).toBeTruthy();

    // Save the id so update and delete tests can use it
    createdNoteId = body.id;
  });

  test('rejects note creation when required fields are missing', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.post('/api/notes', {
      data: {
        club: 'Arsenal',
        // opponent, matchDate, noteTitle missing
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('required');
  });

  test('rejects unauthenticated request with 401', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/api/notes', { data: NOTE_PAYLOAD });

    expect(response.status()).toBe(401);
  });
});

test.describe('PUT /api/notes/:id', () => {
  test('updates an existing note', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.put(`/api/notes/${createdNoteId}`, {
      data: { noteTitle: 'Updated by Playwright' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.noteTitle).toBe('Updated by Playwright');
  });

  test('returns 404 when note does not exist', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.put('/api/notes/999999', {
      data: { noteTitle: 'Ghost note' },
    });

    expect(response.status()).toBe(404);
  });

  test('cannot update another users note', async ({ unauthenticatedRequest }) => {
    // Register and log in as a second user
    const secondEmail = `second-${Date.now()}@test.dev`;
    await unauthenticatedRequest.post('/auth/register', {
      data: {
        name: 'Second User',
        email: secondEmail,
        password: 'Password123!',
        favoriteClub: 'Liverpool',
      },
    });
    const loginResponse = await unauthenticatedRequest.post('/auth/login', {
      data: { email: secondEmail, password: 'Password123!' },
    });
    const { token } = await loginResponse.json();

    // Attempt to update the first user's note using the second user's token
    const secondUserContext = await request.newContext({
      baseURL: 'http://localhost:3000',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await secondUserContext.put(`/api/notes/${createdNoteId}`, {
      data: { noteTitle: 'Hijacked' },
    });

    expect(response.status()).toBe(404); // not found for this user — not 403, by design
    await secondUserContext.dispose();
  });
});

test.describe('DELETE /api/notes/:id', () => {
  test('deletes an existing note', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.delete(`/api/notes/${createdNoteId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Note deleted.');
  });

  test('returns 404 when trying to delete a note that does not exist', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.delete(`/api/notes/${createdNoteId}`);

    expect(response.status()).toBe(404);
  });

  test('rejects unauthenticated request with 401', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.delete(`/api/notes/1`);

    expect(response.status()).toBe(401);
  });
});
