const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Assignment = require('../models/Assignment');
const { protect } = require('../middleware/auth');
const s3 = require('../utils/s3');
const { capitalize } = require('../utils/formatter');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

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

router.get('/', async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) return res.status(404).json({ message: 'Student not found' });
      filter.classSection = student.classSection;

    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
      filter.classSection = { $in: teacher.assignedClasses };
    }

    const assignments = await Assignment.find(filter);
    res.json(assignments);

  } catch (err) {
    console.error('Fetch assignments error:', err);
    res.status(500).json({ message: 'Error fetching assignments', error: err.message });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  const { classSection, title, subject, deadline } = req.body;

  if (!classSection || !title || !subject || !deadline || !req.file) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const assignment = await Assignment.create({
    classSection : classSection.trim().toUpperCase(),
    title : capitalize(title),
    subject : capitalize(subject),
    deadline,
    fileUrl: decodeURIComponent(req.file.location),
    teacher: req.user.id
  });

  res.status(201).json(assignment);
});

router.put('/:id', async (req, res) => {
  const { title, subject, deadline } = req.body;

  const updated = await Assignment.findOneAndUpdate(
    { _id: req.params.id, teacher: req.user.id },
    { title : capitalize(title), subject : capitalize(subject), deadline },
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
