const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: [String],
  assignedClasses: [String]
});
module.exports = mongoose.model('Teacher', teacherSchema);