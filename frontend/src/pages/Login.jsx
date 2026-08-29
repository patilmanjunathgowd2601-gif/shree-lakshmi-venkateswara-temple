import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

export default function Login() {
  const { login } = useUserAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section" style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h1>Devotee Login</h1>
      <form className="donate-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
