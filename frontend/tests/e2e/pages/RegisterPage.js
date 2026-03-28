/**
 * RegisterPage.js
 *
 * Page object for /register.
 * Contains locators and actions for the registration page.
 */

export class RegisterPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.nameInput = page.getByLabel('Full name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.favouriteClubInput = page.getByLabel('Favourite club');
    this.createAccountButton = page.getByRole('button', { name: 'Create account' });
    this.errorAlert = page.getByRole('alert');
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
  }

  // Navigate directly to the register page
  async goto() {
    await this.page.goto('/register');
  }

  // Fill in all fields and submit the form
  async register({ name, email, password, favoriteClub }) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Typing into the club field opens an autocomplete dropdown.
    // We click the first suggestion to select it and close the dropdown
    // before attempting to click the submit button.
    await this.favouriteClubInput.fill(favoriteClub);
    await this.page.locator('.autocomplete-item').first().click();

    await this.createAccountButton.click();
  }
}
