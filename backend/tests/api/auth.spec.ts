import { test, expect } from '../fixtures';

// These tests cover the two most critical endpoints in the app:
// POST /auth/register and POST /auth/login
//
// We use unauthenticatedRequest throughout because these are public endpoints —
// you can't be logged in before you've registered or logged in yet.

const UNIQUE_EMAIL = `pw-auth-${Date.now()}@test.dev`;

test.describe('POST /auth/register', () => {
  test('registers a new user successfully', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/register', {
      data: {
        name: 'New User',
        email: UNIQUE_EMAIL,
        password: 'Password123!',
        favoriteClub: 'Chelsea',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('Registration successful.');
    expect(body.userId).toBeTruthy();
  });

  test('rejects registration when a required field is missing', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/register', {
      data: {
        name: 'Incomplete User',
        email: 'incomplete@test.dev',
        // password and favoriteClub missing
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('All fields are required.');
  });

  test('rejects duplicate email with 409', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/register', {
      data: {
        name: 'Duplicate User',
        email: UNIQUE_EMAIL,
        password: 'Password123!',
        favoriteClub: 'Chelsea',
      },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBe('Email already registered.');
  });
});

test.describe('POST /auth/login', () => {
  test('logs in with valid credentials and returns a token', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/login', {
      data: {
        email: UNIQUE_EMAIL,
        password: 'Password123!',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe(UNIQUE_EMAIL);
    expect(body.user).not.toHaveProperty('passwordHash'); // never expose the hash
  });

  test('rejects login with wrong password', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/login', {
      data: {
        email: UNIQUE_EMAIL,
        password: 'WrongPassword!',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid email or password.');
  });

  test('rejects login with unknown email', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/login', {
      data: {
        email: 'nobody@nowhere.dev',
        password: 'Password123!',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid email or password.');
  });

  test('rejects login when fields are missing', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.post('/auth/login', {
      data: { email: UNIQUE_EMAIL },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Email and password are required.');
  });
});
