import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';

// Swap ClubAutocomplete for a plain input so form tests don't have to
// interact with the dropdown — that behaviour is covered in ClubAutocomplete.test.tsx
vi.mock('../components/ClubAutocomplete', () => ({
  default: ({ id, name, value, onChange, placeholder, required }: {
    id: string; name: string; value: string; onChange: (v: string) => void;
    placeholder?: string; required?: boolean;
  }) => (
    <input
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={e => onChange(e.target.value)}
    />
  ),
}));

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

  test('creates a note and shows it in the list', async () => {
    const newNote = { ...mockNote, id: 2, noteTitle: 'New Derby' };

    // First call: initial fetch returns empty list
    // Second call: POST create returns the new note
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => newNote });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No notes yet. Add your first match note above.')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '+ Add Match Note' }));

    await userEvent.type(screen.getByLabelText('Note title *'), 'New Derby');
    await userEvent.type(screen.getByLabelText(/your club/i), 'Arsenal');
    await userEvent.type(screen.getByLabelText(/opponent/i), 'Chelsea');
    await userEvent.type(screen.getByLabelText('Match date *'), '2025-05-01');

    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() => {
      expect(screen.getByText('New Derby')).toBeInTheDocument();
    });
  });

  test('opens the form pre-filled when edit is clicked on a note', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [mockNote],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('North London Derby')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTitle('Edit'));

    // Form should be visible in edit mode with the note's title pre-filled
    expect(screen.getByText('✏️ Edit Note')).toBeInTheDocument();
    expect(screen.getByLabelText('Note title *')).toHaveValue('North London Derby');
  });

  test('deletes a note and removes it from the list', async () => {
    // GET notes, then DELETE succeeds
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [mockNote] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Note deleted.' }) });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('North London Derby')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTitle('Delete'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('North London Derby')).not.toBeInTheDocument();
    });
  });
});
