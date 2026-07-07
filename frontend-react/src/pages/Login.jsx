import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-brand">🎓 CampusHub</div>
        <p className="auth-subtitle">College Management System</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@college.edu"
            autoComplete="email"
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create a student or tutor account</Link>
        </p>

        <div className="demo-creds">
          <strong>Demo logins</strong> · password for all: password123<br />
          admin@college.edu (Admin)<br />
          ramesh.tutor@college.edu (Tutor · CSE)<br />
          arjun.mehta@college.edu (Student · CSE)
        </div>
      </div>
    </div>
  );
}