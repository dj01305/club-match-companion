import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NoteCard from '../components/NoteCard';
import type { Note } from '../hooks/useNotes';

// A sample note we'll reuse across tests
const mockNote: Note = {
  id: 1,
  club: 'Arsenal',
  opponent: 'Chelsea',
  matchDate: '2024-03-10',
  competition: 'Premier League',
  noteTitle: 'North London Derby',
  noteBody: 'What a game!',
  watched: 1,
};

describe('NoteCard', () => {
  test('renders the note title', () => {
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('North London Derby')).toBeInTheDocument();
  });

  test('renders club vs opponent', () => {
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/Arsenal vs Chelsea/i)).toBeInTheDocument();
  });

  test('renders the competition and match date', () => {
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Premier League')).toBeInTheDocument();
    expect(screen.getByText('2024-03-10')).toBeInTheDocument();
  });

  test('renders the note body when provided', () => {
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('What a game!')).toBeInTheDocument();
  });

  test('does not render note body when it is empty', () => {
    const note = { ...mockNote, noteBody: null };
    render(<NoteCard note={note} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.queryByText('What a game!')).not.toBeInTheDocument();
  });

  test('calls onEdit with the note when edit button is clicked', async () => {
    const handleEdit = vi.fn();
    render(<NoteCard note={mockNote} onEdit={handleEdit} onDelete={() => {}} />);
    await userEvent.click(screen.getByTitle('Edit'));
    expect(handleEdit).toHaveBeenCalledWith(mockNote);
  });

  test('calls onDelete with the note id when delete button is clicked', async () => {
    const handleDelete = vi.fn();
    render(<NoteCard note={mockNote} onEdit={() => {}} onDelete={handleDelete} />);
    await userEvent.click(screen.getByTitle('Delete'));
    expect(handleDelete).toHaveBeenCalledWith(1);
  });
});
