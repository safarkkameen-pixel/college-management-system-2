import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [jobsRes, appsRes] = await Promise.all([
      API.get('/jobs'),
      API.get('/jobs/applications/my')
    ]);
    setJobs(jobsRes.data);
    setMyApps(appsRes.data);
  }

  async function apply(jobId) {
    try {
      await API.post(`/jobs/${jobId}/apply`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply.');
    }
  }

  const appliedJobIds = new Set(myApps.map((a) => a.jobId));

  return (
    <div className="app">
      <Sidebar role="student" />
      <main className="content">
        <div className="topbar">
          <h1>Placements</h1>
          <p className="muted">Open job postings from companies visiting your college.</p>
        </div>

        <div className="card">
          <h3>Open Positions</h3>
          <table className="table">
            <thead><tr><th>Title</th><th>Company</th><th>Eligibility</th><th>Deadline</th><th>Action</th></tr></thead>
            <tbody>
              {jobs.length ? jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td>{j.company}</td>
                  <td className="muted">{j.eligibility}</td>
                  <td className="num">{new Date(j.deadline).toLocaleDateString('en-IN')}</td>
                  <td>
                    {appliedJobIds.has(j.id)
                      ? <span className="stamp applied">Applied</span>
                      : <button className="btn btn-primary" style={{ padding: '6px 14px' }} onClick={() => apply(j.id)}>Apply</button>}
                  </td>
                </tr>
              )) : <tr><td colSpan={5}><div className="empty-state">No jobs posted yet.</div></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>My Applications</h3>
          <table className="table">
            <thead><tr><th>Job</th><th>Company</th><th>Applied On</th><th>Status</th></tr></thead>
            <tbody>
              {myApps.length ? myApps.map((a) => (
                <tr key={a.id}>
                  <td>{a.job?.title || 'Job removed'}</td>
                  <td>{a.job?.company || '-'}</td>
                  <td className="num">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`stamp ${a.status}`}>{a.status}</span></td>
                </tr>
              )) : <tr><td colSpan={4} className="muted">No applications yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}