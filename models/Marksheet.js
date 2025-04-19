const mongoose = require("mongoose");

const marksheetSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileUrl: String
});

module.exports = mongoose.model("Marksheet", marksheetSchema);