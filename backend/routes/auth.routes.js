const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Public signup - intentionally only allows Student or Tutor accounts.
 * Admin accounts are created via the seed script (see backend/seed.js),
 * mirroring how a real college would issue admin credentials internally
 * rather than letting anyone sign up as an administrator.
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, rollNo, subject } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: 'Name, email, password, role and department are required.' });
    }
    if (!['student', 'tutor'].includes(role)) {
      return res.status(400).json({ message: 'Signup is only available for Student or Tutor roles.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await store.create('users', { name, email, password: hashedPassword, role, department });

    if (role === 'student') {
      await store.create('students', {
        userId: user.id,
        name,
        email,
        department,
        rollNo: rollNo || `STU${user.id}`,
        phone: phone || '',
        year: '1st Year'
      });
    } else {
      await store.create('tutors', {
        userId: user.id,
        name,
        email,
        department,
        subject: subject || 'General',
        phone: phone || ''
      });
    }

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  const user = await store.getById('users', req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  let profile = null;
  if (user.role === 'student') profile = await store.findOne('students', s => s.userId === user.id);
  if (user.role === 'tutor') profile = await store.findOne('tutors', t => t.userId === user.id);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    profile
  });
});

module.exports = router;
