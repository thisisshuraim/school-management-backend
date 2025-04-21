const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/auth');
const s3 = require('../utils/s3');

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

// GET lectures (role-based filter)
router.get('/', async (req, res) => {
  const { role, userId } = req.user;
  let filter = {};

  if (role === 'student') {
    const student = await require('../models/Student').findOne({ user: userId });
    if (!student) return res.status(403).json({ message: 'Not a student' });
    filter.classSection = student.classSection;
  } else if (role === 'teacher') {
    const teacher = await require('../models/Teacher').findOne({ user: userId });
    if (!teacher) return res.status(403).json({ message: 'Not a teacher' });
    filter.classSection = { $in: teacher.assignedClasses };
    filter.subject = { $in: teacher.subjects };
  }

  const lectures = await Lecture.find(filter).sort({ createdAt: -1 });
  res.json(lectures);
});

// POST upload lecture
router.post('/', upload.single('video'), async (req, res) => {
  const { title, subject, classSection } = req.body;

  if (!title || !subject || !classSection || !req.file) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const lecture = await Lecture.create({
    title,
    subject,
    classSection,
    videoUrl: decodeURIComponent(req.file.location),
    uploadedBy: req.user.id
  });

  res.status(201).json(lecture);
});

// DELETE lecture
router.delete('/:id', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = String(lecture.uploadedBy) === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const key = new URL(lecture.videoUrl).pathname.slice(1);
    await s3.deleteObject({
      Bucket: 'school-management-thisisshuraim',
      Key: key
    }).promise();

    await Lecture.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete lecture error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
