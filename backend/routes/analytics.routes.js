const express = require('express');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/overview', verifyToken, authorize('admin'), async (req, res) => {
  const students = await store.getAll('students');
  const tutors = await store.getAll('tutors');
  const departments = await store.getAll('departments');
  const marks = await store.getAll('marks');
  const attendance = await store.getAll('attendance');

  const departmentWise = departments.map(d => ({
    department: d.code,
    name: d.name,
    count: students.filter(s => s.department === d.code).length
  }));

  // Average attendance % across the most recent dates that have any records.
  const dates = [...new Set(attendance.map(a => a.date))].sort().slice(-7);
  const attendanceTrend = dates.map(date => {
    const dayRecords = attendance.filter(a => a.date === date);
    const present = dayRecords.filter(a => a.status === 'present').length;
    return { date, percentage: dayRecords.length ? Math.round((present / dayRecords.length) * 100) : 0 };
  });

  const studentPerformance = students.map(s => {
    const sMarks = marks.filter(m => m.studentId === s.id);
    const average = sMarks.length
      ? sMarks.reduce((sum, m) => sum + (m.marksObtained / m.totalMarks) * 100, 0) / sMarks.length
      : 0;
    return { student: s, average: Math.round(average), examsTaken: sMarks.length };
  });

  const evaluated = studentPerformance.filter(s => s.examsTaken > 0);
  const topPerformers = [...evaluated].sort((a, b) => b.average - a.average).slice(0, 5);
  const passCount = evaluated.filter(s => s.average >= 40).length;
  const failCount = evaluated.length - passCount;

  res.json({
    totalStudents: students.length,
    totalTutors: tutors.length,
    totalDepartments: departments.length,
    departmentWise,
    attendanceTrend,
    topPerformers,
    passFailRatio: { pass: passCount, fail: failCount }
  });
});

module.exports = router;
