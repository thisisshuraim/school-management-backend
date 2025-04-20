const express = require('express');
const multer = require('multer');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Public route for students & class teachers (must come BEFORE admin middleware)
router.get('/my', protect, async (req, res) => {
  const user = req.user;
  let classSection = null;

  if (user.role === 'student') {
    const student = await require('../models/Student').findOne({ user: user.id });
    classSection = student?.classSection;
  } else if (user.role === 'teacher') {
    const teacher = await require('../models/Teacher').findOne({ user: user.id });
    if (teacher?.classTeacher) {
      classSection = teacher.classTeacherClass;
    } else {
      return res.status(403).json({ message: 'Not a class teacher' });
    }
  } else {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!classSection) return res.status(404).json({ message: 'Class section not found' });

  const tt = await Timetable.findOne({ classSection });
  if (!tt) return res.status(404).json({ message: 'Timetable not uploaded yet' });

  const host = `${req.protocol}://${req.get('host')}`;
  res.json({ ...tt.toObject(), fileUrl: `${host}/${tt.fileUrl}` });
});

// Admin-only routes
router.use(protect, restrictTo('admin'));

router.get('/', async (req, res) => {
  const items = await Timetable.find();
  const host = `${req.protocol}://${req.get('host')}`;
  const enhanced = items.map((t) => ({
    ...t.toObject(),
    fileUrl: `${host}/${t.fileUrl}`
  }));
  res.json(enhanced);
});

router.post('/', upload.single('file'), async (req, res) => {
  const fileUrl = `uploads/${req.file?.filename}`;
  const t = await Timetable.create({ ...req.body, fileUrl });
  res.status(201).json(t);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Timetable.findByIdAndDelete(req.params.id);
  res.json(deleted);
});

module.exports = router;
