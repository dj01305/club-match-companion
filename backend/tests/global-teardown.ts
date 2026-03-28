import { request } from '@playwright/test';
import fs from 'fs';
import { TOKEN_PATH } from './global-setup';

// This file runs once after all E2E tests have finished.
// It uses the saved token to delete the test user account,
// so the database is left clean after every test run.

export default async function globalTeardown() {
  if (!fs.existsSync(TOKEN_PATH)) return;

  const { token } = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  await context.delete('/auth/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Clean up the saved token file
  fs.unlinkSync(TOKEN_PATH);

  await context.dispose();
}
