import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// This file runs once before any test file.
// It registers a shared test user and saves the JWT token to a temp file
// so all test files can reuse it without logging in again.

export const TEST_USER = {
  name: 'Test User',
  email: 'testuser@playwright.dev',
  password: 'TestPassword123!',
  favoriteClub: 'Arsenal',
};

// Where the token gets saved between global-setup and the tests
export const TOKEN_PATH = path.join(__dirname, '.auth-token.json');

export default async function globalSetup() {
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  // Register the test user — ignore 409 (already exists) so re-runs don't fail
  await context.post('/auth/register', { data: TEST_USER });

  // Log in and grab the token
  const loginRes = await context.post('/auth/login', {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
    },
  });

  if (!loginRes.ok()) {
    throw new Error(`Global setup login failed: ${loginRes.status()} ${await loginRes.text()}`);
  }

  const { token } = await loginRes.json();

  // Save token to disk so fixtures.ts can read it
  fs.writeFileSync(TOKEN_PATH, JSON.stringify({ token }));

  await context.dispose();
}
