const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const store = require('../utils/store');
const { verifyToken, authorize } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip', '.xlsx'];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type.'));
    }
  }
});

router.post('/', verifyToken, authorize('tutor', 'admin'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'A file is required.' });

  const { title, subject, department } = req.body;
  if (!title || !subject || !department) {
    return res.status(400).json({ message: 'Title, subject and department are required.' });
  }

  const note = await store.create('notes', {
    title,
    subject,
    department,
    filename: req.file.filename,
    originalName: req.file.originalname,
    fileSizeKB: Math.round(req.file.size / 1024),
    uploadedBy: req.user.id,
    uploadedByName: req.user.name
  });
  res.status(201).json(note);
});

router.get('/', verifyToken, async (req, res) => {
  let notes = await store.getAll('notes');
  const { department, subject } = req.query;
  if (department) notes = notes.filter(n => n.department === department);
  if (subject) notes = notes.filter(n => n.subject.toLowerCase().includes(subject.toLowerCase()));
  res.json(notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.get('/:id/download', verifyToken, async (req, res) => {
  const note = await store.getById('notes', req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found.' });
  const filePath = path.join(UPLOAD_DIR, note.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File is missing on the server.' });
  res.download(filePath, note.originalName);
});

router.delete('/:id', verifyToken, authorize('tutor', 'admin'), async (req, res) => {
  const note = await store.getById('notes', req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found.' });
  if (req.user.role === 'tutor' && note.uploadedBy !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete notes you uploaded yourself.' });
  }
  const filePath = path.join(UPLOAD_DIR, note.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await store.remove('notes', req.params.id);
  res.json({ message: 'Note deleted.' });
});

module.exports = router;
