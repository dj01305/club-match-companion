import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', favoriteClub: 'Arsenal' };

// A small helper component that calls useAuth and displays the values on screen
// so we can assert against them in tests
function TestConsumer() {
  const { user, token, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <button onClick={() => login('abc123', mockUser)}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('AuthContext', () => {
  test('starts with null token and user when localStorage is empty', () => {
    renderWithProvider();
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  test('reads existing token and user from localStorage on load', () => {
    localStorage.setItem('token', 'saved-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    renderWithProvider();
    expect(screen.getByTestId('token').textContent).toBe('saved-token');
    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
  });

  test('login saves token and user to state and localStorage', () => {
    renderWithProvider();
    act(() => screen.getByText('Login').click());
    expect(screen.getByTestId('token').textContent).toBe('abc123');
    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  test('logout clears token and user from state and localStorage', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify(mockUser));
    renderWithProvider();
    act(() => screen.getByText('Logout').click());
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('useAuth throws when used outside of AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });
});
