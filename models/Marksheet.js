const mongoose = require('mongoose');
const marksheetSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fileUrl: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Marksheet', marksheetSchema);