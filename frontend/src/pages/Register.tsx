import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ClubAutocomplete from '../components/ClubAutocomplete';
import { validateClubName } from '../utils/clubSchema';

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
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '', favoriteClub: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = {
      name: form.name.trim() ? '' : 'Full name is required.',
      email: !form.email.trim() ? 'Email is required.' : !emailRegex.test(form.email) ? 'Please enter a valid email address.' : '',
      password: form.password.trim() ? '' : 'Password is required.',
      favoriteClub: validateClubName(form.favoriteClub) ?? '',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

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

        <form onSubmit={handleSubmit} noValidate>
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
                aria-describedby={fieldErrors[field] ? `${field}-error` : undefined}
              />
              {fieldErrors[field] && <p className="field-error" id={`${field}-error`} role="alert">{fieldErrors[field]}</p>}
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="favoriteClub">{FIELD_LABELS.favoriteClub}<span className="required-indicator" aria-hidden="true">*</span></label>
            <ClubAutocomplete
              id="favoriteClub"
              name="favoriteClub"
              value={form.favoriteClub}
              placeholder={FIELD_PLACEHOLDERS.favoriteClub}
              onChange={val => {
                setForm(prev => ({ ...prev, favoriteClub: val }));
                if (fieldErrors.favoriteClub) setFieldErrors(prev => ({ ...prev, favoriteClub: '' }));
              }}
            />
            {fieldErrors.favoriteClub && <p className="field-error" id="favoriteClub-error" role="alert">{fieldErrors.favoriteClub}</p>}
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
