/**
 * auth.spec.js
 *
 * E2E tests for the authentication flows:
 * - Registering a new user via the UI form
 * - Logging in as a registered user via the UI form
 *
 * These tests use a plain `page` (not the authenticatedPage fixture) because
 * we are specifically testing the login and register forms themselves.
 * Each test generates its own unique user so they are fully independent.
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { generateTestUser } from './utils/testData.js';

test.describe('Registration', () => {
  test('a new user can register and is redirected to the login screen', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = generateTestUser();

    await registerPage.goto();
    await registerPage.register({
      name: user.name,
      email: user.email,
      password: user.password,
      favoriteClub: user.favoriteClub,
    });

    // After successful registration the app redirects to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Login', () => {
  // Register a fresh user once before the login tests run,
  // so we have a known account to log in with.
  let registeredUser;

  test.beforeAll(async ({ request }) => {
    registeredUser = generateTestUser();
    const response = await request.post('http://localhost:3000/auth/register', {
      data: registeredUser,
    });
    if (!response.ok()) {
      throw new Error(`auth.spec beforeAll: registration failed — ${response.status()}`);
    }
  });

  test('a registered user can log in and is redirected to the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login({
      email: registeredUser.email,
      password: registeredUser.password,
    });

    await expect(page).toHaveURL('/dashboard');
  });

  test('login fails with wrong password and shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login({
      email: registeredUser.email,
      password: 'WrongPassword999!',
    });

    await expect(page).toHaveURL('/login');
    await expect(loginPage.errorAlert).toBeVisible();
  });
});
