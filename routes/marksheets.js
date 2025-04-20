const express = require('express');
const multer = require('multer');
const Marksheet = require('../models/Marksheet');
const { protect, restrictTo } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
router.use(protect, restrictTo('admin'));
router.get('/', async (req, res) => res.json(await Marksheet.find()));
router.post('/', upload.single('file'), async (req, res) => {
  const m = await Marksheet.create({ ...req.body, fileUrl: req.file?.path });
  res.status(201).json(m);
});
router.delete('/:id', async (req, res) => res.json(await Marksheet.findByIdAndDelete(req.params.id)));
module.exports = router;