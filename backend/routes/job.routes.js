const express = require('express');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

router.post('/', verifyToken, authorize('admin'), async (req, res) => {
  const { title, company, description, eligibility, department, deadline } = req.body;
  if (!title || !company || !deadline) {
    return res.status(400).json({ message: 'Title, company and deadline are required.' });
  }
  const job = await store.create('jobs', {
    title,
    company,
    description: description || '',
    eligibility: eligibility || 'All departments',
    department: department || 'All',
    deadline,
    postedBy: req.user.id
  });
  res.status(201).json(job);
});

router.get('/', verifyToken, async (req, res) => {
  res.json(await store.getAll('jobs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Specific routes are declared before the "/:id" routes below so that
// "/applications/my" is never mistaken for a job id.
router.get('/applications/my', verifyToken, authorize('student'), async (req, res) => {
  const student = await store.findOne('students', s => s.userId === req.user.id);
  if (!student) return res.json([]);
  const apps = await store.find('applications', a => a.studentId === student.id);
  const withJob = await Promise.all(apps.map(async a => ({ ...a, job: await store.getById('jobs', a.jobId) })));
  res.json(withJob);
});

router.put('/applications/:id', verifyToken, authorize('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['applied', 'shortlisted', 'rejected', 'selected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }
  const updated = await store.update('applications', req.params.id, { status });
  if (!updated) return res.status(404).json({ message: 'Application not found.' });
  res.json(updated);
});

router.put('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const updated = await store.update('jobs', req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Job not found.' });
  res.json(updated);
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const removed = await store.remove('jobs', req.params.id);
  if (!removed) return res.status(404).json({ message: 'Job not found.' });
  const orphanedApps = await store.find('applications', a => a.jobId === Number(req.params.id));
  await Promise.all(orphanedApps.map(a => store.remove('applications', a.id)));
  res.json({ message: 'Job deleted.' });
});

router.post('/:id/apply', verifyToken, authorize('student'), async (req, res) => {
  const job = await store.getById('jobs', req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });

  const student = await store.findOne('students', s => s.userId === req.user.id);
  if (!student) return res.status(404).json({ message: 'Student profile not found.' });

  const already = await store.findOne('applications', a => a.jobId === job.id && a.studentId === student.id);
  if (already) return res.status(409).json({ message: 'You have already applied to this job.' });

  const application = await store.create('applications', { jobId: job.id, studentId: student.id, status: 'applied' });
  res.status(201).json(application);
});

router.get('/:id/applications', verifyToken, authorize('admin'), async (req, res) => {
  const apps = await store.find('applications', a => a.jobId === Number(req.params.id));
  const withStudent = await Promise.all(apps.map(async a => ({ ...a, student: await store.getById('students', a.studentId) })));
  res.json(withStudent);
});

module.exports = router;
