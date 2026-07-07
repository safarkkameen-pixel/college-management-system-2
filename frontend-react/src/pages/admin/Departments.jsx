import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', code: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [d, s] = await Promise.all([API.get('/departments'), API.get('/students')]);
    setDepartments(d.data);
    setStudents(s.data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await API.put(`/departments/${editId}`, form);
      else await API.post('/departments', { ...form, code: form.code.toUpperCase() });
      setForm({ name: '', code: '' });
      setEditId(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this department?')) return;
    try {
      await API.delete(`/departments/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  }

  function startEdit(d) {
    setForm({ name: d.name, code: d.code });
    setEditId(d.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      <Sidebar role="admin" />
      <main className="content">
        <div className="topbar">
          <h1>Departments</h1>
          <p className="muted">Add the departments your college offers.</p>
        </div>

        <div className="card">
          <h3>{editId ? 'Edit Department' : 'Add a Department'}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="inline-form">
            <input type="text" placeholder="Department name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="text" placeholder="Code (e.g. MECH)" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={10} />
            <button type="submit" className="btn btn-primary">Save</button>
            {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm({ name: '', code: '' }); }}>Cancel</button>}
          </form>
        </div>

        <div className="card">
          <table className="table">
            <thead><tr><th>Name</th><th>Code</th><th className="num">Students</th><th>Actions</th></tr></thead>
            <tbody>
              {departments.length ? departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td><span className="badge">{d.code}</span></td>
                  <td className="num">{students.filter((s) => s.department === d.code).length}</td>
                  <td>
                    <button className="btn-icon" onClick={() => startEdit(d)}>✎</button>
                    <button className="btn-icon" onClick={() => handleDelete(d.id)}>✕</button>
                  </td>
                </tr>
              )) : <tr><td colSpan={4}><div className="empty-state">No departments yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}