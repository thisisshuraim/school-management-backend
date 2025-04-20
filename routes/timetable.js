const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage });

router.use(protect, restrictTo('admin'));

router.get('/', async (req, res) => {
  const timetables = await Timetable.find();
  res.json(timetables);
});

router.post('/', upload.single('file'), async (req, res) => {
  const t = await Timetable.create({
    classSection: req.body.classSection,
    fileUrl: `uploads/${req.file.filename}`
  });
  res.status(201).json(t);
});

router.delete('/:id', async (req, res) => {
  const t = await Timetable.findByIdAndDelete(req.params.id);
  if (t?.fileUrl) {
    fs.unlink(path.join(__dirname, '..', t.fileUrl), (err) => {
      if (err) console.error('Failed to delete image file:', err);
    });
  }
  res.json(t);
});

module.exports = router;
