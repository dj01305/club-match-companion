import { test, expect } from '../fixtures';
import { TEST_USER } from '../global-setup';

// Tests for GET /api/dashboard
// This endpoint returns the authenticated user's profile data.

test.describe('GET /api/dashboard', () => {
  test('returns the authenticated users profile', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.get('/api/dashboard');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user.email).toBe(TEST_USER.email);
    expect(body.user.name).toBe(TEST_USER.name);
    expect(body.user.favoriteClub).toBe(TEST_USER.favoriteClub);
    expect(body.user).not.toHaveProperty('passwordHash'); // sensitive field must never be exposed
  });

  test('rejects unauthenticated request with 401', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.get('/api/dashboard');

    expect(response.status()).toBe(401);
  });

  test('rejects request with an invalid token', async ({ unauthenticatedRequest }) => {
    const response = await unauthenticatedRequest.fetch('/api/dashboard', {
      headers: {
        Authorization: 'Bearer this.is.not.a.valid.token',
      },
    });

    expect(response.status()).toBe(401);
  });
});
