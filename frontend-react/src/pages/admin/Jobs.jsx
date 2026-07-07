import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

const STATUS_OPTIONS = ['applied', 'shortlisted', 'selected', 'rejected'];

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', company: '', department: 'All', deadline: '', eligibility: '', description: '' });

  useEffect(() => {
    API.get('/departments').then(({ data }) => setDepartments(data));
    loadJobs();
  }, []);

  async function loadJobs() {
    const { data } = await API.get('/jobs');
    setJobs(data);
  }

  function handleChange(e) { setForm({ ...form, [e.target.id]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await API.post('/jobs', form);
      setForm({ title: '', company: '', department: 'All', deadline: '', eligibility: '', description: '' });
      loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job posting?')) return;
    await API.delete(`/jobs/${id}`);
    setSelectedJob(null);
    setApplicants([]);
    loadJobs();
  }

  async function viewApplicants(job) {
    const { data } = await API.get(`/jobs/${job.id}/applications`);
    setSelectedJob(job);
    setApplicants(data);
  }

  async function updateStatus(appId, status) {
    await API.put(`/jobs/applications/${appId}`, { status });
    viewApplicants(selectedJob);
  }

  return (
    <div className="app">
      <Sidebar role="admin" />
      <main className="content">
        <div className="topbar">
          <h1>Placement Jobs</h1>
          <p className="muted">Post openings and track applicants.</p>
        </div>

        <div className="card">
          <h3>Post a New Job</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div>
                <label>Job Title</label>
                <input type="text" id="title" value={form.title} onChange={handleChange} required />
                <label>Company</label>
                <input type="text" id="company" value={form.company} onChange={handleChange} required />
                <label>Department Eligibility</label>
                <select id="department" value={form.department} onChange={handleChange}>
                  <option value="All">All Departments</option>
                  {departments.map((d) => <option key={d.id} value={d.code}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              <div>
                <label>Deadline</label>
                <input type="date" id="deadline" value={form.deadline} onChange={handleChange} required />
                <label>Eligibility Criteria</label>
                <input type="text" id="eligibility" value={form.eligibility} onChange={handleChange} placeholder="e.g. Minimum 60% aggregate" />
                <label>Description</label>
                <textarea id="description" value={form.description} onChange={handleChange} rows={2} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }}>Post Job</button>
          </form>
        </div>

        <div className="card">
          <h3>Open Positions</h3>
          <table className="table">
            <thead><tr><th>Title</th><th>Company</th><th>Dept</th><th>Deadline</th><th>Applicants</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.length ? jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td>{j.company}</td>
                  <td><span className="badge">{j.department}</span></td>
                  <td className="num">{new Date(j.deadline).toLocaleDateString('en-IN')}</td>
                  <td><button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => viewApplicants(j)}>View</button></td>
                  <td><button className="btn-icon" onClick={() => handleDelete(j.id)}>✕</button></td>
                </tr>
              )) : <tr><td colSpan={6}><div className="empty-state">No jobs posted yet.</div></td></tr>}
            </tbody>
          </table>
        </div>

        {selectedJob && (
          <div className="card">
            <h3>Applicants — {selectedJob.title} at {selectedJob.company}</h3>
            <table className="table">
              <thead><tr><th>Student</th><th>Roll No.</th><th>Dept</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>
                {applicants.length ? applicants.map((a) => (
                  <tr key={a.id}>
                    <td>{a.student?.name}</td>
                    <td className="num">{a.student?.rollNo}</td>
                    <td><span className="badge">{a.student?.department}</span></td>
                    <td><span className={`stamp ${a.status}`}>{a.status}</span></td>
                    <td>
                      <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5} className="muted">No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}