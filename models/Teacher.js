const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: { type: [String], default: [] },
  assignedClasses: { type: [String], default: [] },
  classTeacher: { type: Boolean, default: false },
  classTeacherClass: { type: String, default: '' },
  name: { type: String, required: true }
});

module.exports = mongoose.model('Teacher', teacherSchema);
