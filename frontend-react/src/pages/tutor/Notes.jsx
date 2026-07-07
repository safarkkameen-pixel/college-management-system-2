import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function TutorNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes() {
    const { data } = await API.get(`/notes?department=${user.department}`);
    setNotes(data);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('department', user.department);
    formData.append('file', file);
    try {
      await API.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle(''); setSubject(''); setFile(null);
      e.target.reset();
      loadNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return;
    await API.delete(`/notes/${id}`);
    loadNotes();
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
      <Sidebar role="tutor" />
      <main className="content">
        <div className="topbar">
          <h1>Notes</h1>
          <p className="muted">Upload study material for your students.</p>
        </div>

        <div className="card">
          <h3>Upload a Note</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleUpload}>
            <div className="grid-2">
              <div>
                <label>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Unit 3 - Linked Lists" />
                <label>Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Data Structures" />
              </div>
              <div>
                <label>File (PDF, DOC, PPT, ZIP)</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} required accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.xlsx" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Department Notes</h3>
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
                    <button className="btn-icon" onClick={() => handleDownload(n.id, n.originalName)}>⭳</button>
                    {n.uploadedBy === user.id && (
                      <button className="btn-icon" onClick={() => handleDelete(n.id)}>✕</button>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan={5}><div className="empty-state">No notes uploaded yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}