const express = require('express');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

// Tutor/admin marks attendance for one student on one subject/date.
// If a record already exists for that student+subject+date, it is updated
// instead of duplicated (so re-marking a class is safe).
router.post('/', verifyToken, authorize('tutor', 'admin'), async (req, res) => {
  const { studentId, subject, date, status } = req.body;
  if (!studentId || !subject || !date || !status) {
    return res.status(400).json({ message: 'studentId, subject, date and status are required.' });
  }
  if (!['present', 'absent'].includes(status)) {
    return res.status(400).json({ message: "status must be 'present' or 'absent'." });
  }

  const existing = await store.findOne(
    'attendance',
    a => a.studentId === Number(studentId) && a.subject === subject && a.date === date
  );

  if (existing) {
    const updated = await store.update('attendance', existing.id, { status, markedBy: req.user.id });
    return res.json(updated);
  }

  const record = await store.create('attendance', {
    studentId: Number(studentId),
    subject,
    date,
    status,
    markedBy: req.user.id
  });
  res.status(201).json(record);
});

// Roster for a tutor's class on a given subject/date - returns every student
// in the department plus their attendance status for that day (or null if
// not yet marked). Powers the "mark attendance" screen.
router.get('/class', verifyToken, authorize('tutor', 'admin'), async (req, res) => {
  const { department, subject, date } = req.query;
  const dept = department || req.user.department;
  const students = await store.find('students', s => s.department === dept);

  const roster = await Promise.all(students.map(async s => {
    const record = subject && date
      ? await store.findOne('attendance', a => a.studentId === s.id && a.subject === subject && a.date === date)
      : null;
    return { student: s, status: record ? record.status : null };
  }));

  res.json(roster);
});

// Attendance history + computed percentages for one student.
router.get('/student/:studentId', verifyToken, async (req, res) => {
  const student = await store.getById('students', req.params.studentId);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  if (req.user.role === 'student' && student.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const records = store
    .find('attendance', a => a.studentId === student.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const subjects = [...new Set(records.map(r => r.subject))];
  const bySubject = subjects.map(subject => {
    const subRecords = records.filter(r => r.subject === subject);
    const present = subRecords.filter(r => r.status === 'present').length;
    return {
      subject,
      total: subRecords.length,
      present,
      percentage: subRecords.length ? Math.round((present / subRecords.length) * 100) : 0
    };
  });

  const totalPresent = records.filter(r => r.status === 'present').length;
  const overallPercentage = records.length ? Math.round((totalPresent / records.length) * 100) : 0;

  res.json({ records, bySubject, overallPercentage, totalClasses: records.length });
});

module.exports = router;
