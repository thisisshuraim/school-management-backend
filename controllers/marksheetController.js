const Marksheet = require("../models/Marksheet");

const getMarksheets = async (req, res) => {
  const data = await Marksheet.find();
  res.json(data);
};

const uploadMarksheet = async (req, res) => {
  const { studentId } = req.body;
  const fileUrl = req.file.path;

  const newMarksheet = await Marksheet.create({
    studentId,
    fileUrl,
  });

  res.json(newMarksheet);
};

const deleteMarksheet = async (req, res) => {
  await Marksheet.findByIdAndDelete(req.params.id);
  res.json({ message: "Marksheet deleted" });
};

module.exports = { getMarksheets, uploadMarksheet, deleteMarksheet };