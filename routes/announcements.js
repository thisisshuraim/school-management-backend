const express = require('express');
const Announcement = require('../models/Announcement');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { capitalize } = require('../utils/formatter');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const user = req.user;
  let classSections = [];

  if (user.role === 'admin') {
    const all = await Announcement.find().sort({ createdAt: -1 });
    return res.json(all);
  }

  if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: user.id });
    classSections = teacher?.assignedClasses || [];
  }

  if (user.role === 'student') {
    const student = await Student.findOne({ user: user.id });
    classSections = [student?.classSection];
  }

  const relevant = await Announcement.find({ classSection: { $in: classSections } })
    .sort({ createdAt: -1 });

  const annotated = relevant.map(a => ({
    ...a.toObject(),
    read: a.readBy?.includes(req.user._id)
  }));

  res.json(annotated);
});

router.post('/:id/read', protect, async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ message: 'Not found' });

  if (!announcement.readBy.includes(req.user.id)) {
    announcement.readBy.push(req.user.id);
    await announcement.save();
  }

  res.json({ success: true });
});

router.post('/admin', restrictTo('admin'), async (req, res) => {
  const { title, message, classSection } = req.body;
  if (!message || !classSection) {
    return res.status(400).json({ message: 'Message and class sections are required' });
  }

  const user = await User.findById(req.user.id);
  const createdByName = user.username;

  const classSections = classSection.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);

  const announcements = await Promise.all(
    classSections.map(cs =>
      Announcement.create({
        title: capitalize(title),
        message,
        classSection: cs,
        createdBy: user._id,
        createdByName
      })
    )
  );

  res.status(201).json({ success: true, created: announcements.length });
});

router.post('/teacher', restrictTo('teacher'), async (req, res) => {
  const { title, message, classSection } = req.body;
  const teacher = await Teacher.findOne({ user: req.user.id });

  if (!teacher || !teacher.assignedClasses.includes(classSection)) {
    return res.status(403).json({ message: 'Not allowed to post to this class' });
  }

  const createdByName = teacher.name;

  const announcement = await Announcement.create({
    title: capitalize(title),
    message,
    classSection: classSection.toUpperCase(),
    createdBy: req.user.id,
    createdByName
  });

  res.status(201).json(announcement);
});

router.delete('/:id', restrictTo('admin'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
