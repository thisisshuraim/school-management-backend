const express = require('express');
const multer = require('multer');
const Timetable = require('../models/Timetable');
const { protect, restrictTo } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
router.use(protect, restrictTo('admin'));
router.get('/', async (req, res) => res.json(await Timetable.find()));
router.post('/', upload.single('file'), async (req, res) => {
  const t = await Timetable.create({ ...req.body, fileUrl: req.file?.path });
  res.status(201).json(t);
});
router.delete('/:id', async (req, res) => res.json(await Timetable.findByIdAndDelete(req.params.id)));
module.exports = router;