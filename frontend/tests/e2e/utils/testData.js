/**
 * testData.js
 *
 * Utility functions for generating test data.
 * No Playwright imports here — just plain JavaScript.
 * Can be used by global-setup, fixtures, or any spec file.
 */

/**
 * Generates a unique user object each time it's called.
 * The timestamp in the email ensures no two runs ever collide,
 * which matters when tests run repeatedly in a CI pipeline.
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    name: 'Test User',
    email: `testuser_${timestamp}@test.com`,
    password: 'TestPassword123!',
    favoriteClub: 'Arsenal',
  };
}
