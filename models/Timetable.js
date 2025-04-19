const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  class: String,
  section: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileUrl: String
});

module.exports = mongoose.model("Timetable", timetableSchema);