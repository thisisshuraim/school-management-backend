const Assignment = require("../models/Assignment");

const getAssignments = async (req, res) => {
  const data = await Assignment.find().populate("issuedBy", "name");
  res.json(data);
};

const uploadAssignment = async (req, res) => {
  const { title, subject, class: className, section, deadline } = req.body;
  const fileUrl = req.file.path;

  const newAssignment = await Assignment.create({
    title,
    subject,
    class: className,
    section,
    deadline,
    issueDate: new Date(),
    fileUrl,
    issuedBy: req.user._id,
  });

  res.json(newAssignment);
};

const updateAssignment = async (req, res) => {
  const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteAssignment = async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: "Assignment deleted" });
};

module.exports = { getAssignments, uploadAssignment, updateAssignment, deleteAssignment };