const express = require('express');
const multer = require('multer');
const Marksheet = require('../models/Marksheet');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();
router.use(protect, restrictTo('admin'));

router.get('/', async (req, res) => {
  const all = await Marksheet.find().populate('user');
  const withUsername = all.map(m => ({
    _id: m._id,
    fileUrl: m.fileUrl,
    createdAt: m.createdAt,
    username: m.user?.username || 'unknown'
  }));
  res.json(withUsername);
});

router.post('/', upload.single('file'), async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const m = await Marksheet.create({
    user: user._id,
    fileUrl: req.file?.path
  });

  res.status(201).json(m);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Marksheet.findByIdAndDelete(req.params.id);
  res.json(deleted);
});

module.exports = router;
