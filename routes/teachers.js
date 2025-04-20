const express = require('express');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/', restrictTo('admin'), async (req, res) => res.json(await Teacher.find()));
router.post('/', restrictTo('admin'), async (req, res) => res.status(201).json(await Teacher.create(req.body)));
router.put('/:id', restrictTo('admin'), async (req, res) => res.json(await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', restrictTo('admin'), async (req, res) => res.json(await Teacher.findByIdAndDelete(req.params.id)));
router.get('/students', restrictTo('teacher'), async (req, res) => {
  const t = await Teacher.findOne({ user: req.user.id });
  res.json(await Student.find({ classSection: { $in: t.assignedClasses } }).populate('user'));
});
module.exports = router;