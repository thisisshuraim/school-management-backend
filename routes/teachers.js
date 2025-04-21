const express = require('express');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { protect, restrictTo } = require('../middleware/auth');
const { capitalize } = require('../utils/formatter');

const router = express.Router();
router.use(protect);

router.get('/me', restrictTo('teacher'), async (req, res) => {
  const teacher = await require('../models/Teacher').findOne({ user: req.user.id });
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  res.json(teacher);
});


router.get('/', restrictTo('admin'), async (req, res) => {
  const teachers = await Teacher.find().populate('user');
  res.json(teachers);
});

router.post('/', restrictTo('admin'), async (req, res) => {
  const { user, subjects, assignedClasses, classTeacher, classTeacherClass, name } = req.body;
  if (!user || !name) return res.status(400).json({ message: 'Missing required fields' });

  const teacher = await Teacher.create({
    user,
    subjects : subjects?.map(s => capitalize(s)),
    assignedClasses : assignedClasses?.map(c => c.toUpperCase()),
    classTeacher,
    classTeacherClass : classTeacherClass?.toUpperCase(),
    name : capitalize(name)
  });
  const populated = await teacher.populate('user');
  res.status(201).json(populated);
});

router.put('/:id', restrictTo('admin'), async (req, res) => {
  const reqBody = req?.body;
  const updatedReqBody = {
    ...reqBody,
    subjects : reqBody?.subjects?.map(s => capitalize(s)),
    assignedClasses : reqBody?.assignedClasses?.map(c => c.toUpperCase()),
    classTeacherClass : reqBody?.classTeacherClass?.toUpperCase(),
    name : capitalize(reqBody?.name)
  }
  const updated = await Teacher.findByIdAndUpdate(req.params.id, updatedReqBody, { new: true }).populate('user');
  res.json(updated);
});

router.delete('/:id', restrictTo('admin'), async (req, res) => {
  res.json(await Teacher.findByIdAndDelete(req.params.id));
});

router.get('/students', restrictTo('teacher'), async (req, res) => {
  const t = await Teacher.findOne({ user: req.user.id });
  res.json(await Student.find({ classSection: { $in: t.assignedClasses } }).populate('user'));
});

module.exports = router;
