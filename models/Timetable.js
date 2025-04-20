const mongoose = require('mongoose');
const timetableSchema = new mongoose.Schema({
  classSection: { type: String, required: true },
  fileUrl: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Timetable', timetableSchema);