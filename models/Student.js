const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classSection: { type: String, required: true }
});
module.exports = mongoose.model('Student', studentSchema);