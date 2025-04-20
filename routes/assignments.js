const express = require('express');
const multer = require('multer');
const Assignment = require('../models/Assignment');
const { protect } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
router.use(protect);
router.get('/', async (req, res) => res.json(await Assignment.find()));
router.post('/', upload.single('file'), async (req, res) => {
  const a = await Assignment.create({ ...req.body, fileUrl: req.file?.path, teacher: req.user.id });
  res.status(201).json(a);
});
router.put('/:id', async (req, res) => {
  const a = await Assignment.findOneAndUpdate({ _id: req.params.id, teacher: req.user.id }, req.body, { new: true });
  res.json(a);
});
router.delete('/:id', async (req, res) => {
  const result = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
  res.json(result);
});
module.exports = router;