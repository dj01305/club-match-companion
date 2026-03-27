import { test as base, APIRequestContext, request } from '@playwright/test';
import fs from 'fs';
import { TOKEN_PATH } from './global-setup';

// This extends Playwright's built-in 'test' with two custom fixtures:
//
// - 'authenticatedRequest': attaches the Authorization header automatically
//   to every call, so test files don't need to repeat it.
//
// - 'unauthenticatedRequest': no token — used to verify that protected routes
//   correctly reject requests with no credentials.

type Fixtures = {
  authenticatedRequest: APIRequestContext;
  unauthenticatedRequest: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  authenticatedRequest: async ({}, use) => {
    const { token } = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

    const context = await request.newContext({
      baseURL: 'http://localhost:3000',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    await use(context);
    await context.dispose();
  },

  unauthenticatedRequest: async ({}, use) => {
    const context = await request.newContext({
      baseURL: 'http://localhost:3000',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
