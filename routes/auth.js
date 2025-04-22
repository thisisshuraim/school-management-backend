const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username : username?.toLowerCase() });
  if (user && user?.isBlocked) return res.status(401).json({ message: 'User is blocked' });
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const isBlocked = req?.body?.isBlocked ? req?.body?.isBlocked : false;
  const hashed = bcrypt.hashSync(password, 10);
  const user = await User.create({ username : username?.toLowerCase(), password: hashed, role, isBlocked });
  res.status(201).json(user);
});

router.put('/:id', async (req, res) => {
  const { username, password, role } = req.body;
  const isBlocked = req?.body?.isBlocked ? req?.body?.isBlocked : false;
  const hashed = bcrypt.hashSync(password, 10);
  const updatedReqBody = { username : username?.toLowerCase(), password: hashed, role, isBlocked }
  res.json(await User.findByIdAndUpdate(req.params.id, updatedReqBody, { new: true }));
});

router.delete('/:id', async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted', id: req.params.id });
});

module.exports = router;