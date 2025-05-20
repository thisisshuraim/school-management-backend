const express = require('express');
const Calendar = require('../models/Calendar');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadObject, deleteObject} = require('../utils/s3');
const router = express.Router();

const upload = uploadObject("calendar");

router.get('/', async (req, res) => {
  try {
    const c = await Calendar.findOne();
    res.json(c);
  } catch (err) {
    console.error('Get calendar error:', err);
    res.status(500).json({ message: 'Failed to load calendar', error: err.message });
  }
});

router.post('/', protect, restrictTo('admin'), upload.single('file'), async (req, res) => {
  try {
    const existing = await Calendar.findOne();
    if (existing) {
      const oldKey = new URL(existing.fileUrl).pathname.slice(1);
      await deleteObject(oldKey);

      await Calendar.findByIdAndDelete(existing._id);
    }

    const c = await Calendar.create({
      fileUrl: decodeURIComponent(req.file.location)
    });

    res.status(201).json(c);
  } catch (err) {
    console.error('Upload calendar error:', err);
    res.status(500).json({ message: 'Calendar upload failed', error: err.message });
  }
});

module.exports = router;