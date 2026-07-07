import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function TutorAttendance() {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [marks, setMarks] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/auth/me').then(({ data }) => {
      if (data.profile?.subject) setSubject(data.profile.subject);
    });
  }, []);

  async function loadRoster(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await API.get(`/attendance/class?subject=${encodeURIComponent(subject)}&date=${date}`);
      const initialMarks = {};
      data.forEach((r) => { if (r.status) initialMarks[r.student.id] = r.status; });
      setMarks(initialMarks);
      setRoster(data);
      setLoaded(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roster.');
    }
  }

  function setStatus(studentId, status) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAttendance() {
    const entries = Object.entries(marks);
    if (!entries.length) { alert('Mark at least one student first.'); return; }
    setSaveStatus('Saving...');
    try {
      for (const [studentId, status] of entries) {
        await API.post('/attendance', { studentId: Number(studentId), subject, date, status });
      }
      setSaveStatus(`Saved ${entries.length} record(s) ✓`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('');
      alert(err.response?.data?.message || 'Failed to save.');
    }
  }

  return (
    <div className="app">
      <Sidebar role="tutor" />
      <main className="content">
        <div className="topbar">
          <h1>Mark Attendance</h1>
          <p className="muted">Pick a subject and date, then mark each student.</p>
        </div>

        <div className="card">
          <form onSubmit={loadRoster} className="inline-form">
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Load Roster</button>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loaded && (
          <div className="card">
            <h3>{subject} · {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {roster.length} students</h3>
            {roster.map((r) => (
              <div key={r.student.id} className="roster-row">
                <div>
                  <div className="roster-name">{r.student.name}</div>
                  <div className="roster-meta">{r.student.rollNo}</div>
                </div>
                <div className="toggle-group">
                  <button type="button"
                    className={`toggle-btn present${marks[r.student.id] === 'present' ? ' active' : ''}`}
                    onClick={() => setStatus(r.student.id, 'present')}>Present</button>
                  <button type="button"
                    className={`toggle-btn absent${marks[r.student.id] === 'absent' ? ' active' : ''}`}
                    onClick={() => setStatus(r.student.id, 'absent')}>Absent</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-primary" onClick={saveAttendance}>Save Attendance</button>
              {saveStatus && <span className="muted">{saveStatus}</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}