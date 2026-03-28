import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load E2E-specific env vars from tests/e2e/.env.e2e
// In CI, these are injected directly as environment variables instead
dotenv.config({ path: path.join(__dirname, 'tests/e2e/.env.e2e') });

export default defineConfig({
  // Where Playwright looks for test files
  testDir: './tests/e2e',

  // Only match spec files, not page objects or utilities
  testMatch: '**/*.spec.js',

  // Run tests sequentially — some tests depend on data created by earlier ones
  fullyParallel: false,

  // Retry a failed test once before marking it as failed
  retries: 1,

  use: {
    // Base URL read from .env.e2e locally, or injected by CI pipeline
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Capture a screenshot automatically when a test fails — useful for debugging
    screenshot: 'only-on-failure',

    // Record a trace on the first retry of a failed test
    // Open with: npx playwright show-report
    trace: 'on-first-retry',
  },

  // Only run tests in Chromium for now
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Runs once before all tests — creates the test user and saves auth state
  globalSetup: './tests/e2e/global-setup.js',

  // Runs once after all tests — deletes test notes and cleans up auth file
  globalTeardown: './tests/e2e/global-teardown.js',

  // Start both servers automatically before tests run
  webServer: [
    {
      // Backend API
      command: 'node server.js',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      cwd: '../backend',
      env: {
        NODE_ENV: 'test',
        PORT: '3000',
        JWT_SECRET: 'test-secret',
      },
    },
    {
      // Frontend Vite dev server
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
});
