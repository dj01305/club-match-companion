import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Login from '../pages/Login';

// Stub fetch so tests never hit a real server
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper: renders Login inside a router with a fake auth context
function renderLogin(loginFn = vi.fn()) {
  return render(
    <AuthContext.Provider value={{ token: null, user: null, login: loginFn, logout: vi.fn() }}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// Helper: renders Login as if redirected from a successful registration
function renderLoginAfterRegister() {
  return render(
    <AuthContext.Provider value={{ token: null, user: null, login: vi.fn(), logout: vi.fn() }}>
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { registered: true } }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('Login page', () => {
  test('renders the email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('calls login() and navigates to /dashboard on success', async () => {
    const loginFn = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc123', user: { email: 'user@example.com' } }),
    });

    renderLogin(loginFn);

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('abc123', { email: 'user@example.com' });
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  test('shows an error alert when the API returns a failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid email or password.' }),
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.');
    });
  });

  test('shows a network error message when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error. Please try again.');
    });
  });

  test('does not navigate away when login fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid email or password.' }),
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  test('shows a success banner when arriving from registration', () => {
    renderLoginAfterRegister();
    expect(screen.getByRole('status')).toHaveTextContent('Account created successfully. Please sign in.');
  });
});
