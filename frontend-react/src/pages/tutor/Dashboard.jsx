import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function TutorDashboard() {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: meData } = await API.get('/auth/me');
      setMe(meData);
      const [studentsRes, notesRes, marksRes] = await Promise.all([
        API.get('/students'),
        API.get(`/notes?department=${meData.department}`),
        API.get(`/marks?department=${meData.department}`)
      ]);
      const myNotes = notesRes.data.filter((n) => n.uploadedBy === meData.id);
      const avg = marksRes.data.length
        ? Math.round(marksRes.data.reduce((sum, m) => sum + (m.marksObtained / m.totalMarks) * 100, 0) / marksRes.data.length)
        : null;
      setStudents(studentsRes.data);
      setStats({
        studentCount: studentsRes.data.length,
        subject: meData.profile?.subject || '-',
        notesCount: myNotes.length,
        avg
      });
    }
    load();
  }, []);

  return (
    <div className="app">
      <Sidebar role="tutor" />
      <main className="content">
        <div className="topbar">
          <h1>Welcome, {me?.name || 'Tutor'}</h1>
          <p className="muted">A quick look at your department.</p>
        </div>

        {stats && (
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-value">{stats.studentCount}</div><div className="stat-label">Students in Department</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: 18 }}>{stats.subject}</div><div className="stat-label">Subject Taught</div></div>
            <div className="stat-card"><div className="stat-value">{stats.notesCount}</div><div className="stat-label">Notes Uploaded</div></div>
            <div className="stat-card"><div className="stat-value">{stats.avg !== null ? stats.avg + '%' : '—'}</div><div className="stat-label">Department Avg. Score</div></div>
          </div>
        )}

        <div className="grid-2">
          <Link to="/tutor/attendance" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>✓ Mark Today's Attendance</h3>
            <p className="muted" style={{ margin: 0 }}>Open the class roster and mark each student present or absent.</p>
          </Link>
          <Link to="/tutor/marks" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>✎ Enter Exam Marks</h3>
            <p className="muted" style={{ margin: 0 }}>Record mid-term or final marks for your subject.</p>
          </Link>
        </div>

        <div className="card">
          <h3>Students in Your Department</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Roll No.</th><th>Year</th></tr></thead>
            <tbody>
              {students.length
                ? students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="num">{s.rollNo}</td>
                    <td>{s.year || '-'}</td>
                  </tr>
                ))
                : <tr><td colSpan={3}><div className="empty-state">No students in your department yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}