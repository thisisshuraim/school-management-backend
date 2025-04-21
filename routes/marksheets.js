// routes/marksheets.js
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Marksheet = require('../models/Marksheet');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const s3 = require('../utils/s3');
const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'school-management-thisisshuraim',
    key: (req, file, cb) => {
      const filename = `marksheets/${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    }
  })
});

router.use(protect, restrictTo('admin'));

router.get('/', async (req, res) => {
  try {
    const all = await Marksheet.find().populate('user');
    const mapped = all.map(m => ({
      _id: m._id,
      fileUrl: m.fileUrl,
      createdAt: m.createdAt,
      username: m.user?.username || 'unknown'
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Fetch marksheets error:', err);
    res.status(500).json({ message: 'Error fetching marksheets', error: err.message });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const m = await Marksheet.create({
      user: user._id,
      fileUrl: decodeURIComponent(req.file.location)
    });

    res.status(201).json(m);
  } catch (err) {
    console.error('Upload marksheet error:', err);
    res.status(500).json({ message: 'Marksheet upload failed', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await Marksheet.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Marksheet not found' });

    const key = new URL(record.fileUrl).pathname.slice(1);

    await s3.deleteObject({
      Bucket: 'school-management-thisisshuraim',
      Key: key
    }).promise();

    const deleted = await Marksheet.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    console.error('Delete marksheet error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
