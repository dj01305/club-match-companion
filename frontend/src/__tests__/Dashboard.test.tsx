import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const mockUser = {
  id: 1,
  name: 'Jane Smith',
  email: 'jane@example.com',
  favoriteClub: 'Arsenal',
};

const mockNote = {
  id: 1,
  club: 'Arsenal',
  opponent: 'Chelsea',
  matchDate: '2025-03-10',
  competition: 'Premier League',
  noteTitle: 'North London Derby',
  noteBody: 'Great result.',
  watched: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Renders Dashboard with a logged-in user inside the minimum required providers
function renderDashboard() {
  return render(
    <AuthContext.Provider value={{ token: 'fake-token', user: mockUser, login: vi.fn(), logout: vi.fn() }}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Dashboard integration', () => {
  test('shows a loading spinner while notes are being fetched', async () => {
    // fetch never resolves — keeps the component in the loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getByText('Loading notes…')).toBeInTheDocument();
  });

  test('shows an error banner when the API returns a failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Internal server error' }),
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch notes')).toBeInTheDocument();
    });
  });

  test('renders note cards once notes have loaded', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [mockNote],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('North London Derby')).toBeInTheDocument();
    });
  });

  test('shows the empty state when the user has no notes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No notes yet. Add your first match note above.')).toBeInTheDocument();
    });
  });

  test('shows the confirm modal when delete is clicked — does not delete immediately', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [mockNote],
    });

    renderDashboard();

    // Wait for the note card to appear
    await waitFor(() => {
      expect(screen.getByText('North London Derby')).toBeInTheDocument();
    });

    // Click the delete button on the note card
    await userEvent.click(screen.getByTitle('Delete'));

    // The confirmation modal should now be visible
    expect(screen.getByText('Delete this note?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

    // The note card should still be there — nothing deleted yet
    expect(screen.getByText('North London Derby')).toBeInTheDocument();
  });

  test('dismisses the confirm modal when Cancel is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [mockNote],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('North London Derby')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTitle('Delete'));
    expect(screen.getByText('Delete this note?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Delete this note?')).not.toBeInTheDocument();
    expect(screen.getByText('North London Derby')).toBeInTheDocument();
  });
});
