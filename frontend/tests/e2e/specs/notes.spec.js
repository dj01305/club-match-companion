/**
 * notes.spec.js
 *
 * E2E tests for note management:
 * - Creating a new note and verifying it appears on the dashboard
 * - Deleting a note and verifying it is removed
 *
 * These tests use the authenticatedPage fixture, which injects a valid
 * login session directly into the browser — no need to go through the
 * login form for every test.
 */

import { test, expect } from '../fixtures.js';
import { DashboardPage } from '../pages/DashboardPage.js';

const TEST_NOTE = {
  noteTitle: 'E2E Test Note',
  club: 'Arsenal',
  opponent: 'Chelsea',
  matchDate: '2025-01-15',
  competition: 'Premier League',
  noteBody: 'Great match, solid performance.',
};

test.describe('Notes', () => {
  test('user can create a note and it appears on the dashboard', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.goto();
    await dashboard.openNoteForm();

    // The club field uses an autocomplete dropdown — fill it then select the first suggestion
    await dashboard.noteTitleInput.fill(TEST_NOTE.noteTitle);
    await dashboard.clubInput.fill(TEST_NOTE.club);
    await authenticatedPage.locator('.autocomplete-item').first().click();
    await dashboard.opponentInput.fill(TEST_NOTE.opponent);
    await dashboard.matchDateInput.fill(TEST_NOTE.matchDate);
    await dashboard.competitionInput.fill(TEST_NOTE.competition);
    await dashboard.noteBodyInput.fill(TEST_NOTE.noteBody);
    await dashboard.saveNoteButton.click();

    // The note card should now be visible on the dashboard
    await expect(dashboard.getNoteCard(TEST_NOTE.noteTitle)).toBeVisible();
  });

  test('user can delete a note and it is removed from the dashboard', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.goto();

    // The note created in the previous test should still be there
    await expect(dashboard.getNoteCard(TEST_NOTE.noteTitle)).toBeVisible();

    await dashboard.deleteNote(TEST_NOTE.noteTitle);

    // The note card should no longer be visible
    await expect(dashboard.getNoteCard(TEST_NOTE.noteTitle)).not.toBeVisible();
  });
});
