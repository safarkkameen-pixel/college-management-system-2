import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const [me, setMe] = useState(null);
  const [perf, setPerf] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: meData } = await API.get('/auth/me');
      setMe(meData);
      const studentId = meData.profile?.id;
      if (!studentId) return;
      const [perfRes, marksRes] = await Promise.all([
        API.get(`/students/${studentId}/performance`),
        API.get(`/marks/student/${studentId}`)
      ]);
      setPerf(perfRes.data);
      const bySubject = {};
      marksRes.data.records.forEach((r) => {
        if (!bySubject[r.subject]) bySubject[r.subject] = [];
        bySubject[r.subject].push(r.percentage);
      });
      setChartData(Object.entries(bySubject).map(([subject, percs]) => ({
        subject,
        average: Math.round(percs.reduce((a, b) => a + b, 0) / percs.length)
      })));
    }
    load();
  }, []);

  function getInsight() {
    if (!perf) return '';
    if (perf.attendancePercentage < 75 && perf.totalClasses > 0)
      return `Your attendance is ${perf.attendancePercentage}%, below the usual 75% requirement. Try to attend more classes.`;
    if (perf.averageMarksPercentage && perf.averageMarksPercentage < 40)
      return `Your average score is ${perf.averageMarksPercentage}%, below the passing mark. Review your notes for weaker subjects.`;
    if (perf.averageMarksPercentage >= 75)
      return `Great work — you're averaging ${perf.averageMarksPercentage}% across ${perf.subjectsCount} subject(s) with ${perf.attendancePercentage}% attendance!`;
    if (perf.totalClasses === 0 && perf.subjectsCount === 0)
      return 'No attendance or marks recorded yet. Check back after your first class.';
    return `You're averaging ${perf.averageMarksPercentage}% across ${perf.subjectsCount} subject(s) with ${perf.attendancePercentage}% attendance. Keep it up!`;
  }

  return (
    <div className="app">
      <Sidebar role="student" />
      <main className="content">
        <div className="topbar">
          <h1>Welcome, {me?.name || 'Student'}</h1>
          <p className="muted">Your attendance, marks and overall performance at a glance.</p>
        </div>

        {perf && (
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-value">{perf.attendancePercentage}%</div><div className="stat-label">Attendance ({perf.presentCount}/{perf.totalClasses})</div></div>
            <div className="stat-card"><div className="stat-value">{perf.averageMarksPercentage}%</div><div className="stat-label">Average Marks</div></div>
            <div className="stat-card"><div className="stat-value">{perf.grade}</div><div className="stat-label">Grade</div></div>
            <div className="stat-card"><div className="stat-value">{perf.subjectsCount}</div><div className="stat-label">Subjects Graded</div></div>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <h3>Marks by Subject</h3>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#D9A435" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="empty-state">No marks recorded yet.</p>}
          </div>
          <div className="card">
            <h3>Performance Insight</h3>
            <p className="muted">{getInsight()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}