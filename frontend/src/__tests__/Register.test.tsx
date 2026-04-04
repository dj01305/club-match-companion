import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from '../pages/Register';

// We mock ClubAutocomplete so Register tests don't depend on club search logic
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

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('Register page', () => {
  test('renders all four fields', () => {
    renderRegister();
    expect(screen.getByLabelText('Full name', { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText('Email', { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText('Favourite club', { exact: false })).toBeInTheDocument();
  });

  test('navigates to /login after successful registration', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Registration successful.', userId: 1 }),
    });

    renderRegister();

    await userEvent.type(screen.getByLabelText('Full name', { exact: false }), 'Jane Smith');
    await userEvent.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password', { exact: false }), 'Password123!');
    await userEvent.type(screen.getByLabelText('Favourite club', { exact: false }), 'Arsenal');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument();
    });
  });

  test('shows an error when the API rejects (e.g. duplicate email)', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email already registered.' }),
    });

    renderRegister();

    await userEvent.type(screen.getByLabelText('Full name', { exact: false }), 'Jane Smith');
    await userEvent.type(screen.getByLabelText('Email', { exact: false }), 'existing@example.com');
    await userEvent.type(screen.getByLabelText('Password', { exact: false }), 'Password123!');
    await userEvent.type(screen.getByLabelText('Favourite club', { exact: false }), 'Arsenal');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already registered.');
    });
  });

  test('shows a network error message when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    renderRegister();

    await userEvent.type(screen.getByLabelText('Full name', { exact: false }), 'Jane Smith');
    await userEvent.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password', { exact: false }), 'Password123!');
    await userEvent.type(screen.getByLabelText('Favourite club', { exact: false }), 'Arsenal');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error. Please try again.');
    });
  });

  test('does not navigate away when registration fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email already registered.' }),
    });

    renderRegister();

    await userEvent.type(screen.getByLabelText('Full name', { exact: false }), 'Jane Smith');
    await userEvent.type(screen.getByLabelText('Email', { exact: false }), 'existing@example.com');
    await userEvent.type(screen.getByLabelText('Password', { exact: false }), 'Password123!');
    await userEvent.type(screen.getByLabelText('Favourite club', { exact: false }), 'Arsenal');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    });
  });
});

describe('Register page — inline validation', () => {
  test('shows field errors when submitting an empty form', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Club name is required.')).toBeInTheDocument();
  });

  test('clears a field error when the user starts typing', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Full name is required.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Full name', { exact: false }), 'Jane');
    expect(screen.queryByText('Full name is required.')).not.toBeInTheDocument();
  });

  test('shows a field error when email format is invalid', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText('Full name', { exact: false }), 'Jane Smith');
    await userEvent.type(screen.getByLabelText('Email', { exact: false }), 'notanemail');
    await userEvent.type(screen.getByLabelText('Password', { exact: false }), 'Password123!');
    await userEvent.type(screen.getByLabelText('Favourite club', { exact: false }), 'Arsenal');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('does not call fetch when fields are empty', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
