import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ClubAutocomplete from '../components/ClubAutocomplete';

const FIELD_LABELS: Record<string, string> = {
  name: 'Full name',
  email: 'Email',
  password: 'Password',
  favoriteClub: 'Favourite club',
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  name: 'John Smith',
  email: 'you@example.com',
  password: '••••••••',
  favoriteClub: 'e.g. Arsenal, Man City, Barcelona…',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', favoriteClub: '' });
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }
      navigate('/login', { state: { registered: true } });
    } catch {
      setError('Network error. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">⚽</span>
          <h1>Club Match Companion</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {(['name', 'email', 'password'] as const).map(field => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>{FIELD_LABELS[field]}<span className="required-indicator" aria-hidden="true">*</span></label>
              <input
                id={field}
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                value={form[field]}
                onChange={handleChange}
                placeholder={FIELD_PLACEHOLDERS[field]}
                required
              />
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="favoriteClub">{FIELD_LABELS.favoriteClub}<span className="required-indicator" aria-hidden="true">*</span></label>
            <ClubAutocomplete
              id="favoriteClub"
              name="favoriteClub"
              value={form.favoriteClub}
              placeholder={FIELD_PLACEHOLDERS.favoriteClub}
              required
              onChange={val => setForm(prev => ({ ...prev, favoriteClub: val }))}
            />
          </div>
          <button type="submit" className="btn btn-primary">Create account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
