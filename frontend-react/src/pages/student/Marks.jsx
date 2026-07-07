import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function StudentMarks() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: me } = await API.get('/auth/me');
      const { data: marks } = await API.get(`/marks/student/${me.profile.id}`);
      setData(marks);
    }
    load();
  }, []);

  return (
    <div className="app">
      <Sidebar role="student" />
      <main className="content">
        <div className="topbar">
          <h1>Marks & Performance</h1>
          <p className="muted">Every exam, assignment and quiz score recorded for you.</p>
        </div>

        {data && (
          <>
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="stat-card"><div className="stat-value">{data.average}%</div><div className="stat-label">Overall Average</div></div>
              <div className="stat-card">
                <div className="stat-value">
                  <span className={`stamp ${data.status?.toLowerCase()}`}>{data.status}</span>
                </div>
                <div className="stat-label">Overall Result</div>
              </div>
            </div>

            <div className="card">
              <h3>All Marks</h3>
              <table className="table">
                <thead><tr><th>Subject</th><th>Exam</th><th className="num">Score</th><th className="num">%</th><th>Result</th></tr></thead>
                <tbody>
                  {data.records.length
                    ? data.records.map((r, i) => (
                      <tr key={i}>
                        <td>{r.subject}</td>
                        <td>{r.examType}</td>
                        <td className="num">{r.marksObtained} / {r.totalMarks}</td>
                        <td className="num">{r.percentage}%</td>
                        <td><span className={`stamp ${r.percentage >= 40 ? 'pass' : 'fail'}`}>{r.percentage >= 40 ? 'Pass' : 'Fail'}</span></td>
                      </tr>
                    ))
                    : <tr><td colSpan={5}><div className="empty-state">No marks recorded yet.</div></td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}