import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', subject: '', phone: '' });

  useEffect(() => {
    API.get('/departments').then(({ data }) => setDepartments(data));
    loadTutors();
  }, []);

  async function loadTutors() {
    const { data } = await API.get('/tutors');
    setTutors(data);
  }

  function handleChange(e) { setForm({ ...form, [e.target.id]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await API.put(`/tutors/${editId}`, { name: form.name, department: form.department, subject: form.subject, phone: form.phone });
      } else {
        await API.post('/tutors', form);
      }
      setForm({ name: '', email: '', password: '', department: '', subject: '', phone: '' });
      setEditId(null);
      loadTutors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    }
  }

  function startEdit(t) {
    setForm({ name: t.name, email: t.email, password: '', department: t.department, subject: t.subject, phone: t.phone || '' });
    setEditId(t.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Remove this tutor?')) return;
    await API.delete(`/tutors/${id}`);
    loadTutors();
  }

  return (
    <div className="app">
      <Sidebar role="admin" />
      <main className="content">
        <div className="topbar">
          <h1>Tutors</h1>
          <p className="muted">Manage tutor accounts and subject assignments.</p>
        </div>

        <div className="card">
          <h3>{editId ? 'Edit Tutor' : 'Add a Tutor'}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div>
                <label>Full name</label>
                <input type="text" id="name" value={form.name} onChange={handleChange} required />
                <label>Email</label>
                <input type="email" id="email" value={form.email} onChange={handleChange} required disabled={!!editId} />
                {!editId && (
                  <>
                    <label>Password</label>
                    <input type="password" id="password" value={form.password} onChange={handleChange} required minLength={6} />
                  </>
                )}
              </div>
              <div>
                <label>Department</label>
                <select id="department" value={form.department} onChange={handleChange} required>
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d.id} value={d.code}>{d.name} ({d.code})</option>)}
                </select>
                <label>Subject Taught</label>
                <input type="text" id="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Data Structures" required />
                <label>Phone</label>
                <input type="text" id="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Save Tutor</button>
              {editId && (
                <button type="button" className="btn btn-ghost"
                  onClick={() => { setEditId(null); setForm({ name: '', email: '', password: '', department: '', subject: '', phone: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <table className="table">
            <thead><tr><th>Name</th><th>Dept</th><th>Subject</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {tutors.length ? tutors.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td><span className="badge">{t.department}</span></td>
                  <td>{t.subject}</td>
                  <td className="muted">{t.email}</td>
                  <td>
                    <button className="btn-icon" onClick={() => startEdit(t)}>✎</button>
                    <button className="btn-icon" onClick={() => handleDelete(t.id)}>✕</button>
                  </td>
                </tr>
              )) : <tr><td colSpan={5}><div className="empty-state">No tutors yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}