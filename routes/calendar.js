const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Calendar = require('../models/Calendar');
const { protect, restrictTo } = require('../middleware/auth');
const s3 = require('../utils/s3');
const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'school-management-thisisshuraim',
    key: (req, file, cb) => {
      const filename = `calendar/${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    }
  })
});

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
      await s3.deleteObject({
        Bucket: 'school-management-thisisshuraim',
        Key: oldKey
      }).promise();

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