const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

// Admin sees all (optionally filtered by ?department=), tutor sees only
// their own department's students, a student sees only themself.
router.get('/', verifyToken, async (req, res) => {
  let students = await store.getAll('students');
  const { department } = req.query;

  if (req.user.role === 'student') {
    students = students.filter(s => s.userId === req.user.id);
  } else if (req.user.role === 'tutor') {
    students = students.filter(s => s.department === req.user.department);
  } else if (department) {
    students = students.filter(s => s.department === department);
  }

  res.json(students);
});

router.get('/:id', verifyToken, async (req, res) => {
  const student = await store.getById('students', req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  if (req.user.role === 'student' && student.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  if (req.user.role === 'tutor' && student.department !== req.user.department) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  res.json(student);
});

// Admin creates a student (this creates BOTH a login (users) record and a
// student profile record, linked by userId).
router.post('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, department, rollNo, phone, year } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: 'Name, email, password and department are required.' });
    }
    const exists = await store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ message: 'Email already in use.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await store.create('users', { name, email, password: hashedPassword, role: 'student', department });
    const student = await store.create('students', {
      userId: user.id,
      name,
      email,
      department,
      rollNo: rollNo || `STU${user.id}`,
      phone: phone || '',
      year: year || '1st Year'
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating student.' });
  }
});

router.put('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const student = await store.getById('students', req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found.' });

  const { name, department, rollNo, phone, year } = req.body;
  const updated = await store.update('students', req.params.id, { name, department, rollNo, phone, year });
  // Keep the linked login record's name/department in sync
  await store.update('users', student.userId, { name, department });
  res.json(updated);
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const student = await store.getById('students', req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  await store.remove('students', req.params.id);
  await store.remove('users', student.userId);
  res.json({ message: 'Student removed.' });
});

// Combined performance snapshot: attendance % + average marks % + grade.
// Used by the student dashboard and the tutor's "view performance" screen.
router.get('/:id/performance', verifyToken, async (req, res) => {
  const student = await store.getById('students', req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  if (req.user.role === 'student' && student.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const attendanceRecords = await store.find('attendance', a => a.studentId === student.id);
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const attendancePercentage = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;

  const marksRecords = await store.find('marks', m => m.studentId === student.id);
  const averageMarksPercentage = marksRecords.length
    ? Math.round(marksRecords.reduce((sum, m) => sum + (m.marksObtained / m.totalMarks) * 100, 0) / marksRecords.length)
    : 0;

  let grade = 'N/A';
  if (marksRecords.length) {
    if (averageMarksPercentage >= 75) grade = 'A';
    else if (averageMarksPercentage >= 60) grade = 'B';
    else if (averageMarksPercentage >= 40) grade = 'C';
    else grade = 'F';
  }

  res.json({
    student,
    attendancePercentage,
    totalClasses,
    presentCount,
    averageMarksPercentage,
    subjectsCount: new Set(marksRecords.map(m => m.subject)).size,
    grade
  });
});

module.exports = router;
