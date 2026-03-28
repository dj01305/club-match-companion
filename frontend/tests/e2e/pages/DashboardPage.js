/**
 * DashboardPage.js
 *
 * Page object for /dashboard.
 * Contains locators and actions for the main app page —
 * the navbar, the note form, and the notes list.
 */

export class DashboardPage {
  constructor(page) {
    this.page = page;

    // Navbar
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });

    // Note list
    this.addMatchNoteButton = page.getByRole('button', { name: '+ Add Match Note' });

    // Note form — only visible when the form is open
    this.noteTitleInput = page.getByLabel('Note title *');
    this.clubInput = page.getByLabel('Your club *');
    this.opponentInput = page.getByLabel('Opponent *');
    this.matchDateInput = page.getByLabel('Match date *');
    this.competitionInput = page.getByLabel('Competition');
    this.noteBodyInput = page.getByLabel('Your notes');
    this.saveNoteButton = page.getByRole('button', { name: 'Save note' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  // Navigate directly to the dashboard
  async goto() {
    await this.page.goto('/dashboard');
  }

  // Open the new note form
  async openNoteForm() {
    await this.addMatchNoteButton.click();
  }

  // Fill in and submit the note form
  async createNote({ noteTitle, club, opponent, matchDate, competition = '', noteBody = '' }) {
    await this.noteTitleInput.fill(noteTitle);
    await this.clubInput.fill(club);
    await this.opponentInput.fill(opponent);
    await this.matchDateInput.fill(matchDate);
    if (competition) await this.competitionInput.fill(competition);
    if (noteBody) await this.noteBodyInput.fill(noteBody);
    await this.saveNoteButton.click();
  }

  // Click the edit button on a note card by its title
  async editNote(noteTitle) {
    await this.page
      .getByText(noteTitle)
      .locator('..')
      .getByTitle('Edit')
      .click();
  }

  // Click the delete button on a note card by its title,
  // then confirm using the in-app modal.
  async deleteNote(noteTitle) {
    await this.page
      .getByText(noteTitle)
      .locator('..')
      .getByTitle('Delete')
      .click();

    // Click the confirm button in the in-app modal
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  // Returns a locator for a note card by its title — useful for assertions
  getNoteCard(noteTitle) {
    return this.page.getByText(noteTitle);
  }
}
