const express = require('express');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Marksheet = require('../models/Marksheet');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/me', restrictTo('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/marksheets', restrictTo('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marksheets = await Marksheet.find({ student: student._id });

    // attach full URL to fileUrl
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = marksheets.map(m => ({
      ...m.toObject(),
      fileUrl: m.fileUrl?.startsWith('http') ? m.fileUrl : `${host}/${m.fileUrl}`
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error loading student marksheets:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Populated user field here
router.get('/', restrictTo('admin'), async (req, res) =>
  res.json(await Student.find().populate('user'))
);

router.post('/', restrictTo('admin'), async (req, res) =>
  res.status(201).json(await Student.create(req.body))
);

router.put('/:id', restrictTo('admin'), async (req, res) =>
  res.json(await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }))
);

router.delete('/:id', restrictTo('admin'), async (req, res) =>
  res.json(await Student.findByIdAndDelete(req.params.id))
);

router.get('/timetable', restrictTo('student'), async (req, res) => {
  const s = await Student.findOne({ user: req.user.id });
  res.json(await Timetable.find({ classSection: s.classSection }));
});

router.get('/assignments', restrictTo('student'), async (req, res) => {
  const s = await Student.findOne({ user: req.user.id });
  res.json(await Assignment.find({ classSection: s.classSection }));
});

router.get('/marksheets', restrictTo('student'), async (req, res) => {
  const s = await Student.findOne({ user: req.user.id });
  res.json(await Marksheet.find({ student: s._id }));
});

module.exports = router;
