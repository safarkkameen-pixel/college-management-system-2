const express = require('express');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

// Public-ish read: needed on the signup page before a user is logged in,
// and used by every dashboard for department dropdowns/labels.
router.get('/', async (req, res) => {
  res.json(await store.getAll('departments'));
});

router.post('/', verifyToken, authorize('admin'), async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Department name and code are required.' });
  }
  const exists = await store.findOne('departments', d => d.code.toLowerCase() === code.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'A department with this code already exists.' });
  }
  const dept = await store.create('departments', { name, code: code.toUpperCase() });
  res.status(201).json(dept);
});

router.put('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const { name, code } = req.body;
  const updated = await store.update('departments', req.params.id, {
    name,
    code: code ? code.toUpperCase() : undefined
  });
  if (!updated) return res.status(404).json({ message: 'Department not found.' });
  res.json(updated);
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  const dept = await store.getById('departments', req.params.id);
  if (!dept) return res.status(404).json({ message: 'Department not found.' });

  const studentsInDept = await store.find('students', s => s.department === dept.code);
  if (studentsInDept.length > 0) {
    return res.status(400).json({ message: 'Cannot delete a department that still has students assigned to it.' });
  }

  await store.remove('departments', req.params.id);
  res.json({ message: 'Department deleted.' });
});

module.exports = router;
