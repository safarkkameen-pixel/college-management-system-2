import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function StudentNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadNotes(); }, [filter]);

  async function loadNotes() {
    const query = `department=${user.department}${filter ? '&subject=' + encodeURIComponent(filter) : ''}`;
    const { data } = await API.get(`/notes?${query}`);
    setNotes(data);
  }

  async function handleDownload(noteId, filename) {
    const token = localStorage.getItem('cms_token');
    const res = await fetch(`http://localhost:5000/api/notes/${noteId}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    a.remove(); window.URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <Sidebar role="student" />
      <main className="content">
        <div className="topbar">
          <h1>Notes</h1>
          <p className="muted">Study material shared by your tutors.</p>
        </div>

        <div className="card">
          <div className="inline-form">
            <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by subject..." />
            <button className="btn btn-ghost" onClick={() => setFilter('')}>Clear</button>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead><tr><th>Title</th><th>Subject</th><th>Uploaded By</th><th>Size</th><th>Actions</th></tr></thead>
            <tbody>
              {notes.length ? notes.map((n) => (
                <tr key={n.id}>
                  <td>{n.title}</td>
                  <td><span className="badge">{n.subject}</span></td>
                  <td className="muted">{n.uploadedByName}</td>
                  <td className="num">{n.fileSizeKB} KB</td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px' }}
                      onClick={() => handleDownload(n.id, n.originalName)}>
                      ⭳ Download
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan={5}><div className="empty-state">No notes shared yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}