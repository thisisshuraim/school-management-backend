const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: String,
  subject: String,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  class: String,
  section: String,
  issueDate: Date,
  deadline: Date,
  fileUrl: String
});

module.exports = mongoose.model("Assignment", assignmentSchema);