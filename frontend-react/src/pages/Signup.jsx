import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'student', department: '', subject: '', rollNo: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', form);
      login(data.token, data.user);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-brand">🎓 CampusHub</div>
        <p className="auth-subtitle">Create a student or tutor account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input type="text" id="name" value={form.name} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" id="email" value={form.email} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" id="password" value={form.password} onChange={handleChange} required minLength={6} />

          <label>I am a</label>
          <select id="role" value={form.role} onChange={handleChange} required>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>

          <label>Department</label>
          <select id="department" value={form.department} onChange={handleChange} required>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
            ))}
          </select>

          {form.role === 'tutor' && (
            <>
              <label>Subject you teach</label>
              <input type="text" id="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Data Structures" />
            </>
          )}

          {form.role === 'student' && (
            <>
              <label>Roll number (optional)</label>
              <input type="text" id="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. CSE004" />
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}