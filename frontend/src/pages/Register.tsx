import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    favoriteClub: '',
  });
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
      navigate('/login');
    } catch {
      setError('Network error. Please try again.');
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {(['name', 'email', 'password', 'favoriteClub'] as const).map(field => (
          <div key={field}>
            <label htmlFor={field}>{field}</label>
            <input
              id={field}
              name={field}
              type={field === 'password' ? 'password' : 'text'}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        {error && <p role="alert">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
