import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NoteForm from '../components/NoteForm';
import type { Note, NotePayload } from '../hooks/useNotes';

// We mock ClubAutocomplete so these tests focus purely on NoteForm logic.
// ClubAutocomplete has its own dedicated test file.
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

const mockNote: Note = {
  id: 1,
  club: 'Arsenal',
  opponent: 'Chelsea',
  matchDate: '2025-01-15',
  competition: 'Premier League',
  noteTitle: 'Derby day',
  noteBody: 'Great match.',
  watched: 1,
};

describe('NoteForm', () => {
  describe('new note mode (no initial prop)', () => {
    test('renders the "New Match Note" heading', () => {
      render(<NoteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByText('📝 New Match Note')).toBeInTheDocument();
    });

    test('all fields start empty', () => {
      render(<NoteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByLabelText('Note title *')).toHaveValue('');
      expect(screen.getByLabelText('Match date *')).toHaveValue('');
    });
  });

  describe('edit note mode (initial prop provided)', () => {
    test('renders the "Edit Note" heading', () => {
      render(<NoteForm initial={mockNote} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByText('✏️ Edit Note')).toBeInTheDocument();
    });

    test('pre-fills fields with the existing note values', () => {
      render(<NoteForm initial={mockNote} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByLabelText('Note title *')).toHaveValue('Derby day');
      expect(screen.getByLabelText('Match date *')).toHaveValue('2025-01-15');
      expect(screen.getByLabelText('Competition')).toHaveValue('Premier League');
    });
  });

  describe('submission', () => {
    test('calls onSubmit with the form values when saved', async () => {
      const handleSubmit: (payload: NotePayload) => Promise<void> = vi.fn().mockResolvedValue(undefined as void);
      render(<NoteForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText('Note title *'), 'My new note');
      await userEvent.type(screen.getByLabelText(/your club/i), 'Arsenal');
      await userEvent.type(screen.getByLabelText(/opponent/i), 'Chelsea');
      await userEvent.type(screen.getByLabelText('Match date *'), '2025-06-01');

      await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce();
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ noteTitle: 'My new note', club: 'Arsenal' })
        );
      });
    });

    test('disables the save button while submitting', async () => {
      // onSubmit never resolves — simulates a slow network
      const handleSubmit: (payload: NotePayload) => Promise<void> = vi.fn(() => new Promise<void>(() => {}));
      render(<NoteForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText('Note title *'), 'Test');
      await userEvent.type(screen.getByLabelText(/your club/i), 'Arsenal');
      await userEvent.type(screen.getByLabelText(/opponent/i), 'Chelsea');
      await userEvent.type(screen.getByLabelText('Match date *'), '2025-06-01');

      await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

      expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    });

    test('shows an error message when onSubmit throws', async () => {
      const handleSubmit: (payload: NotePayload) => Promise<void> = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<NoteForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText('Note title *'), 'Test');
      await userEvent.type(screen.getByLabelText(/your club/i), 'Arsenal');
      await userEvent.type(screen.getByLabelText(/opponent/i), 'Chelsea');
      await userEvent.type(screen.getByLabelText('Match date *'), '2025-06-01');

      await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    test('re-enables the save button after a failed submission', async () => {
      const handleSubmit: (payload: NotePayload) => Promise<void> = vi.fn().mockRejectedValue(new Error('fail'));
      render(<NoteForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText('Note title *'), 'Test');
      await userEvent.type(screen.getByLabelText(/your club/i), 'Arsenal');
      await userEvent.type(screen.getByLabelText(/opponent/i), 'Chelsea');
      await userEvent.type(screen.getByLabelText('Match date *'), '2025-06-01');

      await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save note' })).not.toBeDisabled();
      });
    });
  });

  describe('cancel', () => {
    test('calls onCancel when the cancel button is clicked', async () => {
      const handleCancel = vi.fn();
      render(<NoteForm onSubmit={vi.fn()} onCancel={handleCancel} />);
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleCancel).toHaveBeenCalledOnce();
    });
  });

  describe('watched toggle', () => {
    test('defaults to "Yes" watched in new note mode', () => {
      render(<NoteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
      // The "Yes" box should show a checkmark, "No" should be empty
      const buttons = screen.getAllByRole('button', { name: /^✓?$/ });
      // Yes button (index 0) has the checkmark when watched=1
      expect(buttons[0]).toHaveClass('checked');
      expect(buttons[1]).not.toHaveClass('checked');
    });

    test('clicking "No" switches the watched state', async () => {
      render(<NoteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
      const [yesBtn, noBtn] = screen.getAllByRole('button', { name: /^✓?$/ });

      await userEvent.click(noBtn);

      expect(noBtn).toHaveClass('checked');
      expect(yesBtn).not.toHaveClass('checked');
    });
  });
});
