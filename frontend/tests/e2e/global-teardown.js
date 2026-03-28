/**
 * global-teardown.js
 *
 * Runs once after the entire test suite finishes.
 * Cleans up all notes created by the test user during the run.
 *
 * Note: there is currently no DELETE /auth/user endpoint on the backend,
 * so the test user account itself is not deleted. Because the email is
 * timestamped (e.g. testuser_1748392847@test.com), it will never collide
 * with future runs. A delete-user endpoint can be added later for full cleanup.
 */

import { request } from '@playwright/test';
import fs from 'fs';
import { AUTH_FILE } from './global-setup.js';

export default async function globalTeardown() {
  // If global-setup never ran (e.g. it failed), there's nothing to clean up
  if (!fs.existsSync(AUTH_FILE)) return;

  const { token } = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));

  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch all notes belonging to the test user
  const notesRes = await context.get('/notes');
  if (notesRes.ok()) {
    const notes = await notesRes.json();

    // Delete each note individually
    for (const note of notes) {
      await context.delete(`/notes/${note.id}`);
    }
  }

  await context.dispose();

  // Remove the temp auth file — it's no longer needed
  fs.unlinkSync(AUTH_FILE);
}
