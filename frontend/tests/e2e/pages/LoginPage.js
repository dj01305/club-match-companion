/**
 * LoginPage.js
 *
 * Page object for /login (the sign-in page).
 * Contains locators and actions for the login form.
 */

export class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.errorAlert = page.getByRole('alert');
    this.createAccountLink = page.getByRole('link', { name: 'Create one' });
  }

  // Navigate directly to the login page
  async goto() {
    await this.page.goto('/login');
  }

  // Fill in credentials and submit the form
  async login({ email, password }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
