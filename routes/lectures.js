const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/auth');
const s3 = require('../utils/s3');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { capitalize } = require('../utils/formatter');

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'school-management-thisisshuraim',
    key: (req, file, cb) => {
      const filename = `lectures/${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    }
  })
});

router.use(protect);

// GET all lectures
router.get('/', async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    const userId = req.user.id;

    if (role === 'admin') {
      const lectures = await Lecture.find();
      return res.json(lectures);
    }

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

      const assignedClasses = teacher.assignedClasses.map(cls => cls.trim().toUpperCase());
      const subjects = teacher.subjects.map(s => s.trim().toLowerCase());

      const lectures = await Lecture.find({
        classSection: { $in: assignedClasses },
        subject: { $in: subjects }
      });
      return res.json(lectures);
    }

    if (role === 'student') {
      const student = await Student.findOne({ user: userId });
      if (!student) return res.status(404).json({ message: 'Student not found' });

      const lectures = await Lecture.find({
        classSection: student.classSection.trim().toUpperCase()
      });
      return res.json(lectures);
    }

    res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error('GET /lectures error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new lecture
router.post('/', upload.single('video'), async (req, res) => {
  const { classSection, title, subject } = req.body;

  if (!classSection || !title || !subject || !req.file) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const lecture = await Lecture.create({
    classSection: classSection.trim().toUpperCase(),
    title : capitalize(title),
    subject: capitalize(subject),
    videoUrl: decodeURIComponent(req.file.location),
    teacher: req.user.id
  });

  res.status(201).json(lecture);
});

// DELETE lecture
router.delete('/:id', async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    const query = role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, teacher: req.user.id };

    const record = await Lecture.findOne(query);
    if (!record) return res.status(404).json({ message: 'Lecture not found' });

    const key = new URL(record.videoUrl).pathname.slice(1);

    await s3.deleteObject({
      Bucket: 'school-management-thisisshuraim',
      Key: key
    }).promise();

    const deleted = await Lecture.findByIdAndDelete(record._id);
    res.json(deleted);
  } catch (err) {
    console.error('DELETE /lectures error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
