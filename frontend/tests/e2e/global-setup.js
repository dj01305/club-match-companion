/**
 * global-setup.js
 *
 * Runs once before the entire test suite.
 * Registers a fresh test user via the API and saves their credentials
 * to a temp file so fixtures.js can log in and reuse the session.
 */

import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTestUser } from './utils/testData.js';

// __dirname isn't available in ES modules, so we derive it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Where we save the test user's credentials between global-setup and the tests
export const AUTH_FILE = path.join(__dirname, '.auth.json');

export default async function globalSetup() {
  const testUser = generateTestUser();

  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  // Register the test user
  const registerRes = await context.post('/auth/register', { data: testUser });
  if (!registerRes.ok()) {
    throw new Error(`global-setup: registration failed — ${registerRes.status()} ${await registerRes.text()}`);
  }

  // Log in and grab the token
  const loginRes = await context.post('/auth/login', {
    data: {
      email: testUser.email,
      password: testUser.password,
    },
  });
  if (!loginRes.ok()) {
    throw new Error(`global-setup: login failed — ${loginRes.status()} ${await loginRes.text()}`);
  }

  const { token, user } = await loginRes.json();

  // Save credentials to disk so fixtures.js and global-teardown.js can read them
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ token, user, credentials: testUser }));

  await context.dispose();
}
