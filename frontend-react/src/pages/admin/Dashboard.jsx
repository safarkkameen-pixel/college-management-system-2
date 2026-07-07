import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3F8F5C', '#C0533F', '#D9A435', '#4A90D9'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/analytics/overview')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics.'));
  }, []);

  if (error) return <div className="app"><Sidebar role="admin" /><main className="content"><p className="alert alert-error">{error}</p></main></div>;
  if (!data) return <div className="app"><Sidebar role="admin" /><main className="content"><p className="muted">Loading...</p></main></div>;

  const totalGraded = data.passFailRatio.pass + data.passFailRatio.fail;
  const passPercent = totalGraded ? Math.round((data.passFailRatio.pass / totalGraded) * 100) : 0;

  return (
    <div className="app">
      <Sidebar role="admin" />
      <main className="content">
        <div className="topbar">
          <h1>Admin Dashboard</h1>
          <p className="muted">A full picture of the college, updated live.</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="stat-value">{data.totalStudents}</div><div className="stat-label">Total Students</div></div>
          <div className="stat-card"><div className="stat-value">{data.totalTutors}</div><div className="stat-label">Total Tutors</div></div>
          <div className="stat-card"><div className="stat-value">{data.totalDepartments}</div><div className="stat-label">Departments</div></div>
          <div className="stat-card"><div className="stat-value">{totalGraded ? passPercent + '%' : '—'}</div><div className="stat-label">Passing This Term</div></div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>Department-wise Students</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.departmentWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#D9A435" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Attendance Trend</h3>
            {data.attendanceTrend.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#3F8F5C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="empty-state">No attendance marked yet.</p>}
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>🏆 Top Performers</h3>
            <table className="table">
              <thead><tr><th>Student</th><th>Dept</th><th className="num">Average</th></tr></thead>
              <tbody>
                {data.topPerformers.length
                  ? data.topPerformers.map((p, i) => (
                    <tr key={i}>
                      <td>{p.student.name}</td>
                      <td><span className="badge">{p.student.department}</span></td>
                      <td className="num">{p.average}%</td>
                    </tr>
                  ))
                  : <tr><td colSpan={3} className="muted">No marks recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Pass / Fail Ratio</h3>
            {totalGraded ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[
                    { name: 'Pass', value: data.passFailRatio.pass },
                    { name: 'Fail', value: data.passFailRatio.fail }
                  ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="empty-state">No graded exams yet.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}