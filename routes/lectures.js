// routes/lectures.js
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../utils/s3');
const { protect } = require('../middleware/auth');

const Lecture = require('../models/Lecture');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

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

// GET lectures
router.get('/', async (req, res) => {
  try {
    const { role, _id } = req.user;

    if (role === 'admin') {
      const all = await Lecture.find().sort({ createdAt: -1 });
      return res.json(all);
    }

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ user: _id });
      if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

      const subjects = (teacher.subjects || []).map(s => s.toLowerCase());
      const classes = (teacher.assignedClasses || []).map(c => c.toUpperCase());

      const lectures = await Lecture.find({
        subject: { $in: subjects },
        classSection: { $in: classes }
      }).sort({ createdAt: -1 });

      return res.json(lectures);
    }

    if (role === 'student') {
      const student = await Student.findOne({ user: _id });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });

      const lectures = await Lecture.find({
        classSection: student.classSection.toUpperCase()
      }).sort({ createdAt: -1 });

      return res.json(lectures);
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error('GET /lectures error:', err);
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
});

// POST lecture
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { title, classSection, subject } = req.body;

    if (!title || !classSection || !subject || !req.file) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lecture = await Lecture.create({
      title,
      classSection: classSection.trim().toUpperCase(),
      subject: subject.trim().toLowerCase(),
      videoUrl: decodeURIComponent(req.file.location),
      teacher: req.user.id
    });

    res.status(201).json(lecture);
  } catch (err) {
    console.error('POST /lectures error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// DELETE lecture
router.delete('/:id', async (req, res) => {
  try {
    const { role, id } = req.user;

    const match = role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, teacher: id };

    const lecture = await Lecture.findOne(match);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    const key = new URL(lecture.videoUrl).pathname.slice(1);
    await s3.deleteObject({ Bucket: 'school-management-thisisshuraim', Key: key }).promise();

    const deleted = await Lecture.findByIdAndDelete(lecture._id);
    res.json(deleted);
  } catch (err) {
    console.error('DELETE /lectures error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
