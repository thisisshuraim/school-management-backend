const express = require('express');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadObject, deleteObject} = require('../utils/s3');

const router = express.Router();

const upload = uploadObject("timetables");

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

  res.json({ ...tt.toObject() });
});

router.use(protect, restrictTo('admin'));

router.get('/', async (req, res) => {
  const items = await Timetable.find();
  res.json(items);
});

router.post('/', upload.single('file'), async (req, res) => {
  const reqBody = req?.body;
  const updatedReqBody = {
    ...reqBody,
    classSection: reqBody?.classSection?.toUpperCase(),
    fileUrl: decodeURIComponent(req.file.location)
  };
  const t = await Timetable.create(updatedReqBody);
  res.status(201).json(t);
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await Timetable.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Timetable not found' });

    const key = new URL(record.fileUrl).pathname.slice(1);
    deleteObject(key);

    const deleted = await Timetable.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    console.error('Delete timetable error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;