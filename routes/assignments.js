// routes/assignments.js
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Assignment = require('../models/Assignment');
const { protect } = require('../middleware/auth');
const s3 = require('../utils/s3');

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'school-management-thisisshuraim',
    key: (req, file, cb) => {
      const filename = `assignments/${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    }
  })
});

router.use(protect);

// GET all assignments
router.get('/', async (req, res) => {
  const assignments = await Assignment.find();
  res.json(assignments);
});

// POST a new assignment
router.post('/', upload.single('file'), async (req, res) => {
  const { classSection, title, subject, deadline } = req.body;

  if (!classSection || !title || !subject || !deadline || !req.file) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const assignment = await Assignment.create({
    classSection,
    title,
    subject,
    deadline,
    fileUrl: decodeURIComponent(req.file.location),
    teacher: req.user.id
  });

  res.status(201).json(assignment);
});

// PUT update assignment
router.put('/:id', async (req, res) => {
  const { title, subject, deadline } = req.body;

  const updated = await Assignment.findOneAndUpdate(
    { _id: req.params.id, teacher: req.user.id },
    { title, subject, deadline },
    { new: true }
  );

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await Assignment.findOne({ _id: req.params.id, teacher: req.user.id });
    if (!record) return res.status(404).json({ message: 'Assignment not found' });

    const key = new URL(record.fileUrl).pathname.slice(1);

    await s3.deleteObject({
      Bucket: 'school-management-thisisshuraim',
      Key: key
    }).promise();

    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
