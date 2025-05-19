const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Calendar', calendarSchema);
