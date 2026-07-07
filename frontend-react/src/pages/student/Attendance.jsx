import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function StudentAttendance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: me } = await API.get('/auth/me');
      const { data: att } = await API.get(`/attendance/student/${me.profile.id}`);
      setData(att);
    }
    load();
  }, []);

  return (
    <div className="app">
      <Sidebar role="student" />
      <main className="content">
        <div className="topbar">
          <h1>My Attendance</h1>
          <p className="muted">Most colleges require at least 75% attendance to sit final exams.</p>
        </div>

        {data && (
          <>
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="stat-card"><div className="stat-value">{data.overallPercentage}%</div><div className="stat-label">Overall Attendance</div></div>
              <div className="stat-card"><div className="stat-value">{data.totalClasses}</div><div className="stat-label">Total Classes Recorded</div></div>
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>By Subject</h3>
                <table className="table">
                  <thead><tr><th>Subject</th><th className="num">Present</th><th className="num">Total</th><th className="num">%</th></tr></thead>
                  <tbody>
                    {data.bySubject.length
                      ? data.bySubject.map((s, i) => (
                        <tr key={i}>
                          <td>{s.subject}</td>
                          <td className="num">{s.present}</td>
                          <td className="num">{s.total}</td>
                          <td className="num">{s.percentage}%</td>
                        </tr>
                      ))
                      : <tr><td colSpan={4} className="muted">No records yet.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h3>Full History</h3>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  <table className="table">
                    <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.records.length
                        ? data.records.map((r, i) => (
                          <tr key={i}>
                            <td className="num">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td>{r.subject}</td>
                            <td><span className={`stamp ${r.status}`}>{r.status}</span></td>
                          </tr>
                        ))
                        : <tr><td colSpan={3}><div className="empty-state">No attendance marked yet.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}