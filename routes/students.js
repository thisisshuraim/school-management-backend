const express = require('express');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Marksheet = require('../models/Marksheet');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');
const { capitalize } = require('../utils/formatter');
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

router.get('/my', protect, restrictTo('student'), async (req, res) => {
  const ms = await Marksheet.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(ms);
});

// ✅ Populated user field here
router.get('/', restrictTo('admin'), async (req, res) =>
  res.json(await Student.find().populate('user'))
);

router.post('/', restrictTo('admin'), async (req, res) => {
  const reqBody = req?.body;
  const updatedReqBody = {
    ...reqBody,
    name : capitalize(reqBody?.name),
    classSection : reqBody?.classSection?.toUpperCase()
  };
  res.status(201).json(await Student.create(updatedReqBody));
});

router.put('/:id', restrictTo('admin'), async (req, res) => {
  const reqBody = req?.body;
  const updatedReqBody = {
    ...reqBody,
    name : capitalize(reqBody?.name),
    classSection : reqBody?.classSection?.toUpperCase()
  };
  res.json(await Student.findByIdAndUpdate(req.params.id, updatedReqBody, { new: true }))
});

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

module.exports = router;
