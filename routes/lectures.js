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
// routes/lectures.js
// routes/lectures.js
router.get('/', async (req, res) => {
    try {
      const user = req.user;

      if (user.role === 'Admin') {
        const allLectures = await Lecture.find().sort({ createdAt: -1 });
        return res.json(allLectures);
      }

      if (user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ user: user.userId });
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const lectures = await Lecture.find({
          subject: { $in: teacher.subjects },
          classSection: { $in: teacher.assignedClasses }
        }).sort({ createdAt: -1 });

        return res.json(lectures);
      }

      if (user.role === 'Student') {
        const student = await Student.findOne({ user: user.userId });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const lectures = await Lecture.find({
          classSection: student.classSection
        }).sort({ createdAt: -1 });

        return res.json(lectures);
      }

      return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
      console.error('Get lectures error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
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
