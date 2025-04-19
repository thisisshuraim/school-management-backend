const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getTeachers = async (req, res) => {
  const teachers = await User.find({ role: "teacher" });
  res.json(teachers);
};

const createTeacher = async (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const teacher = await User.create({ ...req.body, password: hashedPassword, role: "teacher" });
  res.json(teacher);
};

const updateTeacher = async (req, res) => {
  const teacher = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(teacher);
};

const deleteTeacher = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Teacher deleted" });
};

module.exports = { getTeachers, createTeacher, updateTeacher, deleteTeacher };