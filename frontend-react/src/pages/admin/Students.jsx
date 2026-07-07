import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', rollNo: '', year: '1st Year', phone: '' });

  useEffect(() => {
    API.get('/departments').then(({ data }) => setDepartments(data));
    loadStudents();
  }, []);

  async function loadStudents() {
    const { data } = await API.get(`/students${filterDept ? '?department=' + filterDept : ''}`);
    setStudents(data);
  }

  useEffect(() => { loadStudents(); }, [filterDept]);

  function handleChange(e) { setForm({ ...form, [e.target.id]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await API.put(`/students/${editId}`, { name: form.name, department: form.department, rollNo: form.rollNo, year: form.year, phone: form.phone });
      } else {
        await API.post('/students', form);
      }
      setForm({ name: '', email: '', password: '', department: '', rollNo: '', year: '1st Year', phone: '' });
      setEditId(null);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    }
  }

  function startEdit(s) {
    setForm({ name: s.name, email: s.email, password: '', department: s.department, rollNo: s.rollNo || '', year: s.year || '1st Year', phone: s.phone || '' });
    setEditId(s.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Remove this student?')) return;
    await API.delete(`/students/${id}`);
    loadStudents();
  }

  return (
    <div className="app">
      <Sidebar role="admin" />
      <main className="content">
        <div className="topbar">
          <h1>Students</h1>
          <p className="muted">Manage student accounts and department assignments.</p>
        </div>

        <div className="card">
          <h3>{editId ? 'Edit Student' : 'Add a Student'}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div>
                <label>Full name</label>
                <input type="text" id="name" value={form.name} onChange={handleChange} required />
                <label>Email</label>
                <input type="email" id="email" value={form.email} onChange={handleChange} required disabled={!!editId} />
                {!editId && <><label>Password</label><input type="password" id="password" value={form.password} onChange={handleChange} required minLength={6} /></>}
              </div>
              <div>
                <label>Department</label>
                <select id="department" value={form.department} onChange={handleChange} required>
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d.id} value={d.code}>{d.name} ({d.code})</option>)}
                </select>
                <label>Roll Number</label>
                <input type="text" id="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. CSE010" />
                <label>Year</label>
                <select id="year" value={form.year} onChange={handleChange}>
                  {['1st Year','2nd Year','3rd Year','4th Year'].map((y) => <option key={y}>{y}</option>)}
                </select>
                <label>Phone</label>
                <input type="text" id="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Save Student</button>
              {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm({ name: '', email: '', password: '', department: '', rollNo: '', year: '1st Year', phone: '' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ maxWidth: 220 }}>
              <option value="">All departments</option>
              {departments.map((d) => <option key={d.id} value={d.code}>{d.name}</option>)}
            </select>
          </div>
          <table className="table">
            <thead><tr><th>Name</th><th>Roll No.</th><th>Dept</th><th>Year</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {students.length ? students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="num">{s.rollNo}</td>
                  <td><span className="badge">{s.department}</span></td>
                  <td>{s.year || '-'}</td>
                  <td className="muted">{s.email}</td>
                  <td>
                    <button className="btn-icon" onClick={() => startEdit(s)}>✎</button>
                    <button className="btn-icon" onClick={() => handleDelete(s.id)}>✕</button>
                  </td>
                </tr>
              )) : <tr><td colSpan={6}><div className="empty-state">No students found.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}