const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  classSection: { type: String, required: true },
  title: { type: String, required: true },
  fileUrl: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true }, // ✅ ADD THIS
  deadline: { type: String, required: true }, // ✅ ADD THIS
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
