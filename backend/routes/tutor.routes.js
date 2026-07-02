const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), async (req, res) => {
  res.json(await store.getAll('tutors'));
});

router.get('/:id', verifyToken, async (req, res) => {
  const tutor = await store.getById('tutors', req.params.id);
  if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });
  res.json(tutor);
});

router.post('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, department, subject, phone } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: 'Name, email, password and department are required.' });
    }
    const exists = await store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ message: 'Email already in use.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await store.create('users', { name, email, password: hashedPassword, role: 'tutor', department });
    const tutor = await store.create('tutors', {
      userId: user.id,
      name,
      email,
      department,
      subject: subject || 'General',
      phone: phone || ''
    });
    res.status(201).json(tutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating tutor.' });
  }
});

router.put('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const tutor = await store.getById('tutors', req.params.id);
  if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });

  const { name, department, subject, phone } = req.body;
  const updated = await store.update('tutors', req.params.id, { name, department, subject, phone });
  await store.update('users', tutor.userId, { name, department });
  res.json(updated);
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const tutor = await store.getById('tutors', req.params.id);
  if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });
  await store.remove('tutors', req.params.id);
  await store.remove('users', tutor.userId);
  res.json({ message: 'Tutor removed.' });
});

module.exports = router;
