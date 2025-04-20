// routes/assignments.js

const express = require('express');
const multer = require('multer');
const Assignment = require('../models/Assignment');
const { protect } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use(protect);

// GET all assignments
router.get('/', async (req, res) => {
  const assignments = await Assignment.find();
  res.json(assignments);
});

// POST a new assignment
router.post('/', upload.single('file'), async (req, res) => {
  const { classSection, title, subject, deadline } = req.body;

  if (!classSection || !title || !subject || !deadline) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const assignment = await Assignment.create({
    classSection,
    title,
    subject,
    deadline,
    fileUrl: req.file?.path,
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

// DELETE an assignment
router.delete('/:id', async (req, res) => {
  const result = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
  res.json(result);
});

module.exports = router;
