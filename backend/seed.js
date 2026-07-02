/**
 * Wipes the Postgres database and fills it with realistic sample data so you
 * can test every role and every module immediately after setup.
 *
 * Run with: npm run seed   (from inside the backend/ folder)
 *
 * WARNING: this DELETES all existing data before re-seeding. Only run this
 * when you want a clean slate (e.g. first setup, or resetting a demo).
 */
require('dotenv').config();
const bcrypt  = require('bcryptjs');
const { initDB, clearAll } = require('./utils/db');
const store   = require('./utils/store');

async function seed() {
  console.log('\n🔧 Connecting to Postgres...');
  await initDB();          // ensure tables exist
  await clearAll();        // wipe everything
  console.log('   Tables ready. Seeding...\n');

  // --- Departments ---
  await store.create('departments', { name: 'Computer Science & Engineering', code: 'CSE' });
  await store.create('departments', { name: 'Electronics & Communication',    code: 'ECE' });
  await store.create('departments', { name: 'Civil Engineering',              code: 'CIVIL' });
  await store.create('departments', { name: 'Electrical & Electronics',       code: 'EEE' });

  const PASSWORD       = 'password123';
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // --- Admin ---
  await store.create('users', {
    name: 'Admin User', email: 'admin@college.edu',
    password: hashedPassword, role: 'admin', department: null
  });

  // --- Tutors ---
  const tutor1User = await store.create('users', {
    name: 'Dr. Ramesh Kumar', email: 'ramesh.tutor@college.edu',
    password: hashedPassword, role: 'tutor', department: 'CSE'
  });
  await store.create('tutors', {
    userId: tutor1User.id, name: tutor1User.name, email: tutor1User.email,
    department: 'CSE', subject: 'Data Structures', phone: '9876543210'
  });

  const tutor2User = await store.create('users', {
    name: 'Prof. Anita Sharma', email: 'anita.tutor@college.edu',
    password: hashedPassword, role: 'tutor', department: 'ECE'
  });
  await store.create('tutors', {
    userId: tutor2User.id, name: tutor2User.name, email: tutor2User.email,
    department: 'ECE', subject: 'Digital Electronics', phone: '9876543211'
  });

  // --- Students ---
  const studentSeed = [
    { name: 'Arjun Mehta',      dept: 'CSE',   roll: 'CSE001' },
    { name: 'Priya Nair',       dept: 'CSE',   roll: 'CSE002' },
    { name: 'Rahul Verma',      dept: 'CSE',   roll: 'CSE003' },
    { name: 'Sneha Iyer',       dept: 'ECE',   roll: 'ECE001' },
    { name: 'Karthik Raja',     dept: 'ECE',   roll: 'ECE002' },
    { name: 'Divya Krishnan',   dept: 'CIVIL', roll: 'CIV001' },
    { name: 'Mohammed Faizal',  dept: 'EEE',   roll: 'EEE001' }
  ];

  const studentRecords = [];
  for (const s of studentSeed) {
    const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@college.edu`;
    const user  = await store.create('users', {
      name: s.name, email, password: hashedPassword,
      role: 'student', department: s.dept
    });
    const student = await store.create('students', {
      userId: user.id, name: s.name, email,
      department: s.dept, rollNo: s.roll,
      phone: '9000000000', year: '2nd Year'
    });
    studentRecords.push(student);
  }

  // --- Attendance: last 10 days, CSE students, Data Structures ---
  const cseStudents = studentRecords.filter(s => s.department === 'CSE');
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    for (const [idx, s] of cseStudents.entries()) {
      const status = (Math.random() > 0.15 || idx === 0) ? 'present' : 'absent';
      await store.create('attendance', {
        studentId: s.id, subject: 'Data Structures',
        date: dateStr, status, markedBy: tutor1User.id
      });
    }
  }

  // --- Marks ---
  for (const [idx, s] of cseStudents.entries()) {
    await store.create('marks', { studentId: s.id, subject: 'Data Structures', examType: 'Mid Term', marksObtained: 60 + idx * 8,  totalMarks: 100, enteredBy: tutor1User.id });
    await store.create('marks', { studentId: s.id, subject: 'Data Structures', examType: 'Final',    marksObtained: 55 + idx * 9,  totalMarks: 100, enteredBy: tutor1User.id });
  }
  const eceStudents = studentRecords.filter(s => s.department === 'ECE');
  for (const [idx, s] of eceStudents.entries()) {
    await store.create('marks', { studentId: s.id, subject: 'Digital Electronics', examType: 'Mid Term', marksObtained: 50 + idx * 12, totalMarks: 100, enteredBy: tutor2User.id });
  }

  // --- Placement jobs ---
  await store.create('jobs', {
    title: 'Software Engineer Trainee', company: 'TechNova Solutions',
    description: 'Entry-level role for fresh graduates in web development.',
    eligibility: 'Minimum 60% aggregate, no active backlogs',
    department: 'CSE', deadline: '2026-08-15', postedBy: 1
  });
  await store.create('jobs', {
    title: 'Embedded Systems Engineer', company: 'CircuitWorks Pvt Ltd',
    description: 'Work on embedded firmware for IoT devices and sensor networks.',
    eligibility: 'ECE/EEE background preferred',
    department: 'ECE', deadline: '2026-07-30', postedBy: 1
  });

  console.log('✅ Sample data seeded successfully!\n');
  console.log('--------------------------------------------------');
  console.log(' LOGIN CREDENTIALS  (password for everyone: password123)');
  console.log('--------------------------------------------------');
  console.log(' Admin   ->', 'admin@college.edu');
  console.log(' Tutor   ->', 'ramesh.tutor@college.edu', '(CSE - Data Structures)');
  console.log(' Tutor   ->', 'anita.tutor@college.edu',  '(ECE - Digital Electronics)');
  studentRecords.forEach(s => console.log(' Student ->', s.email, `(${s.department})`));
  console.log('--------------------------------------------------\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
});
