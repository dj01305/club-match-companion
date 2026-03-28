import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NoteForm from '../components/NoteForm';

// Mock ClubAutocomplete so we can interact with it as a plain input
vi.mock('../components/ClubAutocomplete', () => ({
  default: ({ id, name, value, onChange, placeholder }: {
    id: string; name: string; value: string;
    onChange: (v: string) => void; placeholder?: string;
  }) => (
    <input
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  ),
}));

const onSubmit = vi.fn().mockResolvedValue(undefined);
const onCancel = vi.fn();

function renderForm() {
  return render(<NoteForm onSubmit={onSubmit} onCancel={onCancel} />);
}

beforeEach(() => {
  onSubmit.mockClear();
  onCancel.mockClear();
});

describe('NoteForm — inline validation', () => {
  test('shows field errors when submitting an empty form', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(await screen.findByText('Note title is required.')).toBeInTheDocument();
    expect(screen.getByText('Your club is required.')).toBeInTheDocument();
    expect(screen.getByText('Opponent is required.')).toBeInTheDocument();
    expect(screen.getByText('Match date is required.')).toBeInTheDocument();
  });

  test('does not call onSubmit when fields are empty', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('clears the note title error when the user starts typing', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));
    expect(await screen.findByText('Note title is required.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Note title', { exact: false }), 'Derby day');
    expect(screen.queryByText('Note title is required.')).not.toBeInTheDocument();
  });

  test('calls onSubmit when all required fields are filled', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText('Note title', { exact: false }), 'Derby day');
    await userEvent.type(screen.getByLabelText('Your club', { exact: false }), 'Arsenal');
    await userEvent.type(screen.getByLabelText('Opponent', { exact: false }), 'Chelsea');
    await userEvent.type(screen.getByLabelText('Match date', { exact: false }), '2025-03-01');
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
