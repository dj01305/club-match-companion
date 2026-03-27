import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

// Helper: renders ProtectedRoute with a fake auth state
function renderWithAuth(token: string | null) {
  const fakeAuth = {
    token,
    user: null,
    login: () => {},
    logout: () => {},
  };

  return render(
    <AuthContext.Provider value={fakeAuth}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  test('renders children when user is logged in', () => {
    renderWithAuth('fake-jwt-token');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  test('redirects to /login when there is no token', () => {
    renderWithAuth(null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
