/**
 * fixtures.js
 *
 * Extends Playwright's built-in test with a custom fixture: authenticatedPage.
 * Any test that uses this fixture gets a browser page that is already logged in,
 * without needing to go through the login form every time.
 *
 * Import { test, expect } from this file instead of '@playwright/test'
 * in any spec that needs an authenticated session.
 */

import { test as base } from '@playwright/test';
import fs from 'fs';
import { AUTH_FILE } from './global-setup.js';

export const test = base.extend({
  // authenticatedPage: a browser page with the test user already logged in.
  // Playwright sets this up before the test and tears it down after.
  authenticatedPage: async ({ page }, use) => {
    const { token, user } = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));

    // Inject the token and user into localStorage before the app loads.
    // This is exactly what the app does after a real login (see AuthContext.tsx).
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token, user });

    // Hand the page to the test
    await use(page);

    // Clean up localStorage after the test so sessions don't bleed between tests
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
  },
});

export { expect } from '@playwright/test';
