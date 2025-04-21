const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/auth');
const s3 = require('../utils/s3');
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

// GET all lectures
router.get('/', async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    const userId = req.user._id;

    if (role === 'admin') {
      const lectures = await Lecture.find().sort({ createdAt: -1 });
      return res.json(lectures);
    }

    if (role === 'teacher') {
        const teacher = await Teacher.findOne({ user: userId }).lean();

        // Don't crash, just return empty list if profile not found
        if (!teacher || !teacher.subjects?.length || !teacher.assignedClasses?.length) {
            return res.json([]);
        }

        const lectures = await Lecture.find({
            subject: { $in: teacher.subjects },
            classSection: { $in: teacher.assignedClasses }
        }).sort({ createdAt: -1 });

        return res.json(lectures);
        }


    if (role === 'student') {
      const student = await Student.findOne({ user: userId }).lean();
      if (!student) return res.status(404).json({ message: 'Student profile not found' });

      const lectures = await Lecture.find({
        classSection: student.classSection
      }).sort({ createdAt: -1 });

      return res.json(lectures);
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error('GET /lectures error:', err);
    res.status(500).json({ message: 'Failed to fetch lectures', error: err.message });
  }
});

// POST new lecture
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { classSection, title, subject } = req.body;

    if (!classSection || !title || !subject || !req.file) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lecture = await Lecture.create({
      classSection,
      title,
      subject,
      videoUrl: decodeURIComponent(req.file.location),
      teacher: req.user.id
    });

    res.status(201).json(lecture);
  } catch (err) {
    console.error('POST /lectures error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// DELETE lecture (only if teacher uploaded it or admin)
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
