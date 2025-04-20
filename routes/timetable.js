const express = require('express');
const multer = require('multer');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/', async (req, res) => {
  const items = await Timetable.find();
  const host = `${req.protocol}://${req.get('host')}`;
  const enhanced = items.map((t) => ({
    ...t.toObject(),
    fileUrl: `${host}/${t.fileUrl}` // ensure full URL is returned
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
