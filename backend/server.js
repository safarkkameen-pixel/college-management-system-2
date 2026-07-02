require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./utils/db');

const authRoutes       = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const studentRoutes    = require('./routes/student.routes');
const tutorRoutes      = require('./routes/tutor.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const marksRoutes      = require('./routes/marks.routes');
const notesRoutes      = require('./routes/notes.routes');
const jobRoutes        = require('./routes/job.routes');
const analyticsRoutes  = require('./routes/analytics.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/tutors',      tutorRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/marks',       marksRoutes);
app.use('/api/notes',       notesRoutes);
app.use('/api/jobs',        jobRoutes);
app.use('/api/analytics',   analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Management API is running.' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;

// Connect to Postgres and create tables BEFORE accepting any requests.
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🎓 College Management API running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   Database: Neon Postgres ✓\n`);
    });
  })
  .catch(err => {
    console.error('\n❌ Failed to connect to the database:', err.message);
    console.error('   Check DATABASE_URL in your .env file and make sure the Neon database is active.\n');
    process.exit(1);
  });
