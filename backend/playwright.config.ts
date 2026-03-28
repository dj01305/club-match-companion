import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Where Playwright looks for test files
  testDir: './tests',

  // Run tests in a single file sequentially — important because some tests depend on created data
  fullyParallel: false,

  // Retry a failed test once before marking it as failed
  retries: 1,

  use: {
    // All requests will use this as the base — so tests just write e.g. '/auth/login'
    baseURL: 'http://localhost:3000',

    // Always include Content-Type so the API knows we're sending JSON
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },

  // Playwright will start the backend server automatically before running tests
  webServer: {
    command: 'node server.js',
    url: 'http://localhost:3000/health',
    reuseExistingServer: true,
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      JWT_SECRET: 'test-secret',
    },
  },

  // Runs once before all tests — registers the shared test user and saves the token
  globalSetup: './tests/global-setup.ts',

  // Runs once after all tests — deletes the test user account and cleans up the token file
  globalTeardown: './tests/global-teardown.ts',

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
});
