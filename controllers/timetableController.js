const Timetable = require("../models/Timetable");

const getTimetables = async (req, res) => {
  const data = await Timetable.find();
  res.json(data);
};

const uploadTimetable = async (req, res) => {
  const { class: className, section } = req.body;
  const fileUrl = req.file.path;

  const newTimetable = await Timetable.create({
    class: className,
    section,
    fileUrl,
    uploadedBy: req.user._id,
  });

  res.json(newTimetable);
};

const updateTimetable = async (req, res) => {
  const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteTimetable = async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({ message: "Timetable deleted" });
};

module.exports = { getTimetables, uploadTimetable, updateTimetable, deleteTimetable };