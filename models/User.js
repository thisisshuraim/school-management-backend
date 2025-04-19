const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "teacher", "admin"], required: true },
  class: String,
  section: String,
  subjects: [String],
  assignedClasses: [String],
  isClassTeacher: Boolean
});

module.exports = mongoose.model("User", userSchema);