const express = require('express');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

// Tutor/admin enters marks. Re-submitting the same student+subject+examType
// updates the existing record instead of creating a duplicate, so a tutor
// can correct a typo without leaving stale rows behind.
router.post('/', verifyToken, authorize('tutor', 'admin'), async (req, res) => {
  const { studentId, subject, examType, marksObtained, totalMarks } = req.body;
  if (!studentId || !subject || !examType || marksObtained === undefined || !totalMarks) {
    return res.status(400).json({ message: 'studentId, subject, examType, marksObtained and totalMarks are required.' });
  }
  if (Number(marksObtained) > Number(totalMarks)) {
    return res.status(400).json({ message: 'Marks obtained cannot exceed total marks.' });
  }

  const existing = await store.findOne(
    'marks',
    m => m.studentId === Number(studentId) && m.subject === subject && m.examType === examType
  );

  if (existing) {
    const updated = await store.update('marks', existing.id, {
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks),
      enteredBy: req.user.id
    });
    return res.json(updated);
  }

  const record = await store.create('marks', {
    studentId: Number(studentId),
    subject,
    examType,
    marksObtained: Number(marksObtained),
    totalMarks: Number(totalMarks),
    enteredBy: req.user.id
  });
  res.status(201).json(record);
});

router.put('/:id', verifyToken, authorize('tutor', 'admin'), async (req, res) => {
  const { marksObtained, totalMarks } = req.body;
  const updated = await store.update('marks', req.params.id, {
    marksObtained: marksObtained !== undefined ? Number(marksObtained) : undefined,
    totalMarks: totalMarks !== undefined ? Number(totalMarks) : undefined
  });
  if (!updated) return res.status(404).json({ message: 'Marks record not found.' });
  res.json(updated);
});

// Tutor view of all marks for their department (optionally filtered by
// subject) - powers the marks entry / review screen.
router.get('/', verifyToken, authorize('tutor', 'admin'), async (req, res) => {
  const { department, subject } = req.query;
  const dept = department || req.user.department;
  const deptStudents = await store.find('students', s => s.department === dept);
  const studentIds = deptStudents.map(s => s.id);
  let marks = await store.find('marks', m => studentIds.includes(m.studentId));
  if (subject) marks = marks.filter(m => m.subject === subject);
  res.json(marks);
});

router.get('/student/:studentId', verifyToken, async (req, res) => {
  const student = await store.getById('students', req.params.studentId);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  if (req.user.role === 'student' && student.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const records = await store.find('marks', m => m.studentId === student.id);
  const withPercentage = records.map(r => ({
    ...r,
    percentage: Math.round((r.marksObtained / r.totalMarks) * 100)
  }));
  const average = records.length
    ? Math.round(records.reduce((sum, r) => sum + (r.marksObtained / r.totalMarks) * 100, 0) / records.length)
    : 0;

  res.json({ records: withPercentage, average, status: average >= 40 ? 'Pass' : 'Fail' });
});

module.exports = router;
