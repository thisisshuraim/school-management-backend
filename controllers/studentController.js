const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getStudents = async (req, res) => {
  const students = await User.find({ role: "student" });
  res.json(students);
};

const createStudent = async (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const student = await User.create({ ...req.body, password: hashedPassword, role: "student" });
  res.json(student);
};

const updateStudent = async (req, res) => {
  const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(student);
};

const deleteStudent = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };